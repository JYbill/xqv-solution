import StyleWrapper from "./app.style";
import emoji from "assets/emoji.png";
import React, { useRef } from "react";

export function App() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  return (
    <>
      <button onClick={print}>打印</button>
      <StyleWrapper className="wrapper" ref={wrapperRef}>
        <div className="header" ref={headerRef}>
          日记：GPT的一天
        </div>
        <div className="content">
          <p>
            今天的天气非常宜人，是一个适合出门活动的好日子。早晨，阳光透过厚重的云层，逐渐洒落在大地上，温暖的阳光给人一种温馨的感觉。
          </p>
          <p>
            在这样的好天气里，人们纷纷走出家门，去做一些自己喜欢的事情。有的人去公园里散步，有的人去运动场锻炼身体，还有的人去逛街、购物。而我呢，我和我的好朋友一起去了郊外游玩。
          </p>
          <p>
            我们来到了一个小山丘上，饱览了整个城市的美景。眼前的一切都是那么的美妙，让人感到无比的惬意。天空中的白云，在悠扬的风中，缓缓地变换着形态，像是一幅幅抽象的画作，非常的迷人。
          </p>
          <p>
            随着时间的流逝，天色渐渐地变暗了，一阵微风吹过，让人想起了那首经典的歌曲：“清风徐来，水波不兴；微澜起伏，翠烟缭绕。”在柔和的光线中，我们依依不舍地离开了这个美好的地方，却感到满足和充实。
          </p>
          <p>
            今天的天气非常舒适，透着一股舒适的亲和力。它给予我们充分的时间和空间，去发掘和体验生活中的种种美好，让我们感受到生命的无限可能性。今天的经历，对于我来说，是一个美好的回忆，也是我日后无比珍惜的财富。
          </p>
          <img src={emoji} alt="" />
          <p>
            今天的天气非常宜人，是一个适合出门活动的好日子。早晨，阳光透过厚重的云层，逐渐洒落在大地上，温暖的阳光给人一种温馨的感觉。
          </p>
          <p>
            在这样的好天气里，人们纷纷走出家门，去做一些自己喜欢的事情。有的人去公园里散步，有的人去运动场锻炼身体，还有的人去逛街、购物。而我呢，我和我的好朋友一起去了郊外游玩。
          </p>
          <p>
            我们来到了一个小山丘上，饱览了整个城市的美景。眼前的一切都是那么的美妙，让人感到无比的惬意。天空中的白云，在悠扬的风中，缓缓地变换着形态，像是一幅幅抽象的画作，非常的迷人。
          </p>
          <p>
            随着时间的流逝，天色渐渐地变暗了，一阵微风吹过，让人想起了那首经典的歌曲：“清风徐来，水波不兴；微澜起伏，翠烟缭绕。”在柔和的光线中，我们依依不舍地离开了这个美好的地方，却感到满足和充实。
          </p>
          <p>
            今天的天气非常舒适，透着一股舒适的亲和力。它给予我们充分的时间和空间，去发掘和体验生活中的种种美好，让我们感受到生命的无限可能性。今天的经历，对于我来说，是一个美好的回忆，也是我日后无比珍惜的财富。
          </p>
          <img src={emoji} alt="" />
        </div>
        <table className="print-table" ref={tableRef}>
          <thead></thead>
          <tbody></tbody>
          <tfoot></tfoot>
        </table>
        <div className="footer" ref={footerRef}>
          作者：GPT3.5
        </div>
      </StyleWrapper>
      <iframe
        ref={iframeRef}
        title="打印iframe容器"
        width="100%"
        height="600px"
      />
    </>
  );

  /**
   * 打印核心逻辑
   */
  function print() {
    if (
      !tableRef.current ||
      !wrapperRef.current ||
      !headerRef.current ||
      !footerRef.current ||
      !iframeRef.current
    )
      return;
    const contentEl = wrapperRef.current.querySelector(
      ".content"
    ) as HTMLDivElement;

    const theadEl = tableRef.current.tHead as HTMLTableSectionElement;
    const tfootEl = tableRef.current.tFoot as HTMLTableSectionElement;
    const tbodyEl = tableRef.current.tBodies[0];
    tbodyEl.appendChild(contentEl.cloneNode(true)); // clone主体部分copy到table里
    contentEl.style.display = "none";

    // 设置thead、tfoot高度
    const headerHeight = getElHeight(headerRef);
    const footerHeight = getElHeight(footerRef);
    theadEl.style.height = `${headerHeight + 10}px`;
    tfootEl.style.height = `${footerHeight + 10}px`;

    // 拷贝打印内容到iframe
    const header = document.head.innerHTML;
    console.log(wrapperRef.current);
    const copyNode = wrapperRef.current.cloneNode(true);
    const iframeDoc = iframeRef.current.contentDocument as Document;
    const iframeWin = iframeRef.current.contentWindow as Window;
    iframeDoc.head.innerHTML = header;
    iframeDoc.body.appendChild(copyNode);
    iframeWin.focus();
    iframeWin.print();

    // 复原
    contentEl.style.display = "block";
    iframeDoc.head.innerHTML = "";
    iframeDoc.body.innerHTML = "";
  }

  /**
   * 获取元素高度
   * @param el
   */
  function getElHeight(el: React.RefObject<HTMLElement>) {
    if (!el.current) {
      console.error("getElHeight()#el有误");
      return -1;
    }
    return el.current.getBoundingClientRect().height;
  }
}

export default App;
