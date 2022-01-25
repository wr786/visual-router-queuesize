import React, { useEffect } from "react";
import Graphin, {
  Utils,
  GraphinContext,
  GraphinData,
  Behaviors,
} from "@antv/graphin";
import G6 from '@antv/g6';  
import { Row, Col, Card, Button, Input } from "antd";
import { PlayCircleOutlined, PauseOutlined } from "@ant-design/icons";
import outputData from './data.json';
const { DragCanvas, ZoomCanvas, DragNode, ActivateRelations } = Behaviors;

const sep = "                                            ";

const grayNode = {
  size: 20,
  fill: "#ddd",
  stroke: "#000",
};

const whiteNode = {
  size: 20,
  fill: "#fff",
  stroke: "#000",
};

const pinkNode = {
  size: 20,
  fill: "#e799b0",
  stroke: "#e799b0",
};

const redNode = {
  size: 20,
  fill: "#F00",
  stroke: "#F00",
};

const blackArrow = {
  path: 'M 0,0 L 8,4 L 8,-4 Z',
  fill: '#545872'
};

const pinkArrow = {
  path: 'M 0,0 L 8,4 L 8,-4 Z',
  fill: '#e799b0'
};

const redArrow = {
  path: 'M 0,0 L 8,4 L 8,-4 Z',
  fill: '#F00'
}

const defaultNode = {
  type: "graphin-circle",
  style: {
    keyshape: whiteNode,
    label: {
      visible: false,
    },
  },
};

const update = (data, type = "node") => {
  const items = data[`${type}s`];
  return {
    set: (id, model) => {
      const newItems = [];
      items.forEach((item) => {
        if (item.id === id) {
          const mergedItem = Utils.deepMix({}, item, model);
          newItems.push(mergedItem);
        } else {
          newItems.push(item);
        }
      });
      return {
        ...data,
        [`${type}s`]: newItems,
      };
    },
  };
};

class Graph extends React.Component {
  constructor(props) {
    super(props);
    
    let tmpEdges = []
    for (let i = 0; i < outputData.edges.length; i++) {
      tmpEdges.push({
        source: outputData.edges[i].source,
        target: outputData.edges[i].target,
        style: {
          label: {
            value: outputData.edges[i].sTimeline[0][1] + sep + outputData.edges[i].tTimeline[0][1],
            fontSize: 8
          },
          keyshape: {
            startArrow: blackArrow,
            endArrow: blackArrow
          },
        }
      })
    }

    this.state = {
      isPlaying: false,
      lowerBound: 33, // 控制顔色對應queuesize上下限
      upperBound: 66,
      timer: 0,
      time: 0,
      timeLimit: outputData.timeLimit,
      data: {
        nodes: outputData.nodes,
        edges: tmpEdges
      },
    };
  }

  beforeUpdateNode(data, nodeID) {
    const newData = update(data, "node").set(nodeID, {
      style: {
        keyshape: grayNode,
      },
    });
    return newData;
  }

  updateNode(data, nodeID) {
    // const queueSum = Math.round(Math.random() * 100); // 应该换成读取
    let queueSum = 0;
    // for(let i = 0; i < data.edges.length; i++) {
    //   if(data.edges[i].target === nodeID) {
    //     queueSum += parseInt(data.edges[i].style.label.value.split(sep)[1])
    //   }
    // }
    let keyShape = whiteNode;
    if (queueSum >= this.state.upperBound) {
      keyShape = redNode;
    } else if (queueSum >= this.state.lowerBound) {
      keyShape = pinkNode;
    }
    const newData = update(data, "node").set(nodeID, {
      style: {
        keyshape: keyShape,
        // badges: [
        //   {
        //     position: "RT",
        //     type: "text",
        //     value: queueSum,
        //     size: [15, 15],
        //     color: "#fff",
        //     fill: "red",
        //   },
        // ],
      },
    });
    return newData;
  }

  lowerBoundOnChange(i) {
    const newState = this.state;
    newState.lowerBound = i;
    console.log(newState);
    this.setState(newState);
  }

  upperBoundOnChange(i) {
    const newState = this.state;
    newState.upperBound = i;
    console.log(newState);
    this.setState(newState);
  }

  update() {
    if (this.state.isPlaying === false) return;
    let newData = this.state.data;
    let time = (this.state.time + 1) % this.state.timeLimit;
    for (let i = 0; i < newData.edges.length; i++) {
      for (let j = 0; j < outputData.edges.length; j++) {
        if(newData.edges[i].source === outputData.edges[j].source && newData.edges[i].target === outputData.edges[j].target) {
          newData.edges[i].style.label.value = outputData.edges[j].sTimeline[time][1] + sep + outputData.edges[j].tTimeline[time][1]
          const inFlow = parseInt(outputData.edges[j].sTimeline[time][1]);
          const outFlow = parseInt(outputData.edges[j].tTimeline[time][1]);
          if(inFlow > this.state.upperBound) {
            newData.edges[i].style.keyshape.startArrow = redArrow;
          } else if (inFlow > this.state.lowerBound) {
            newData.edges[i].style.keyshape.startArrow = pinkArrow;
          } else {
            newData.edges[i].style.keyshape.startArrow = blackArrow;
          }
          if(outFlow > this.state.upperBound) {
            newData.edges[i].style.keyshape.endArrow = redArrow;
          } else if (outFlow > this.state.lowerBound) {
            newData.edges[i].style.keyshape.endArrow = pinkArrow;
          } else {
            newData.edges[i].style.keyshape.endArrow = blackArrow;
          }
          break;
        }
      }
    }
    const newState = this.state;
    newState.data = newData;
    newState.time = time;
    this.setState(newState);
    for (let i = 0; i < newData.nodes.length; i++) {
      newData = this.beforeUpdateNode(newData, newData.nodes[i].id);
    }
    newState.data = newData;
    this.setState(newState);
    for (let i = 0; i < newData.nodes.length; i++) {
      newData = this.updateNode(newData, newData.nodes[i].id);
    }
    newState.data = newData;
    this.setState(newState);
    console.log(newState);

  }

  startDisplaying() {
    const newState = this.state;
    if (!(this.state.isPlaying || this.state.timer !== 0)) {
      newState.timer = setInterval(() => {
        this.update();
      }, 1000);
    }
    newState.isPlaying = true;
    this.setState(newState);
  }

  endDisplaying() {
    const newState = this.state;
    newState.isPlaying = false;
    this.setState(newState);
  }

  render() {
    return (
      <>
        <Card>
          <Graphin
            data={this.state.data}
            defaultNode={defaultNode}
            layout={{ type: "radial" }}
          >
            <ZoomCanvas />
          </Graphin>
        </Card>
        <div>
          <span>白粉分界QueueSize：</span>
          <Input
            style={{ width: 100 }}
            defaultValue="33"
            onChange={(event) => {
              this.lowerBoundOnChange(event.target.value);
            }}
          ></Input>
        </div>
        <div>
          <span>粉红分界QueueSize：</span>
          <Input
            style={{ width: 100 }}
            defaultValue="66"
            onChange={(event) => {
              this.upperBoundOnChange(event.target.value);
            }}
          ></Input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => this.startDisplaying()}
          />
          <Button
            type="primary"
            icon={<PauseOutlined />}
            onClick={() => this.endDisplaying()}
          />
        </div>
      </>
    );
  }
}

export default Graph;
