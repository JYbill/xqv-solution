import styled from "styled-components";

export default styled.div`
  position: relative;
  width: 500px;
  text-align: center;
  padding: 5px 10px;
  margin: 0 auto;

  @media print {
    .header,
    .footer {
      position: fixed; /* 浮动定位实现页眉页脚 */
      transform: translateX(-50%);
    }
    .header {
      top: 0;
      left: 50%;
    }
    .footer {
      bottom: 0;
      left: 50%;
    }
    /* 默认隐藏table，打印时显示table */
    .print-table {
      display: table !important;
    }
  }

  .header,
  .footer {
    max-width: 600px;
    width: 100%;
    height: 50px;
    line-height: 50px;
    border-radius: 10px;
    font-size: 18px;
    font-weight: bold;
    border: 1px solid #999;
  }
  .header {
    background-color: lightcoral;
  }

  .footer {
    background-color: orangered;
  }

  .content {
    padding: 2px;
    border-left: 1px solid #000;
    border-right: 1px solid #000;
  }

  .print-table,
  thead,
  tfoot,
  tbody {
    margin: 0;
    padding: 0;
    width: 100%;
  }

  /* 默认隐藏table，打印时显示table */
  .print-table {
    display: none;
  }

  thead,
  tfoot {
    border: 1px solid orangered;
  }

  p {
    text-indent: 2em;
    text-align: left;
  }
`;
