import StyleWrapper from "./app.style";
import emoji from "assets/emoji.png";

export function App() {
  console.log(process.env);
  return (
    <StyleWrapper className="wrapper">
      <p>你好</p>
      <img src={emoji} alt="" />
    </StyleWrapper>
  );
}

export default App;
