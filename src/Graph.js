import React, { useEffect } from "react";
import Graphin, {
  Utils,
  GraphinContext,
  GraphinData,
  Behaviors,
} from "@antv/graphin";
import { Row, Col, Card, Button, Input } from "antd";
import { PlayCircleOutlined, PauseOutlined } from "@ant-design/icons";
const { DragCanvas, ZoomCanvas, DragNode, ActivateRelations } = Behaviors;

const whiteNode = {
  size: 30,
  fill: "#fff",
  stroke: "#000",
};

const pinkNode = {
  size: 30,
  fill: "#e799b0",
  stroke: "#e799b0",
};

const redNode = {
  size: 30,
  fill: "#F00",
  stroke: "#F00",
};

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
    this.state = {
      isPlaying: false,
      lowerBound: 33, // 控制顔色對應queuesize上下限
      upperBound: 66,
      timer: 0,
      data: {
        nodes: [
          { id: "node-0" },
          { id: "node-1" },
          { id: "node-2" },
          { id: "node-3" },
          { id: "node-4" },
          { id: "node-5" },
        ],
        edges: [
          {
            source: "node-0",
            target: "node-1",
          },
          {
            source: "node-1",
            target: "node-2",
          },
          {
            source: "node-1",
            target: "node-3",
          },
          {
            source: "node-3",
            target: "node-4",
          },
        ],
      },
    };
  }

  updateNode(data, nodeID) {
    const queueSize = Math.round(Math.random() * 100); // 应该换成读取
    let keyShape = whiteNode;
    if (queueSize >= this.state.upperBound) {
      keyShape = redNode;
    } else if (queueSize >= this.state.lowerBound) {
      keyShape = pinkNode;
    }
    const newData = update(data, "node").set(nodeID, {
      style: {
        keyshape: keyShape,
        badges: [
          {
            position: "RT",
            type: "text",
            value: queueSize,
            size: [20, 20],
            color: "#fff",
            fill: "red",
          },
        ],
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
    for (let i = 0; i < 6; i++) {
      newData = this.updateNode(newData, "node-" + i.toString());
    }
    const newState = this.state;
    newState.data = newData;
    this.setState(newState);
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
