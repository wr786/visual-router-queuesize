import "./App.css";
import { Layout, Typography } from "antd";
import Graph from "./Graph.js";
const { Header, Footer, Sider, Content } = Layout;
const { Title, Link } = Typography;

function App() {
  return (
    <div className="App">
      <Layout>
        <Header style={{ textAlign: "center", padding: "0.3em" }}>
          <Title>
            <div style={{ color: "white" }}>Visual Router QueueSize</div>
          </Title>
        </Header>
        <Content style={{ padding: "0 400px" }}>
          <Graph />
        </Content>
        <Footer>by <Link href="https://github.com/wr786" target="_blank">@wr786</Link></Footer>
      </Layout>
    </div>
  );
}

export default App;
