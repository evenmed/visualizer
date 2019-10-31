import React from "react";
import { createGlobalStyle } from "styled-components";
import Visualizer from "../components/Visualizer";

const GlobalStyles = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    background: #000;
  }
  #__next {
    line-height: 0;
  }
`;

const index = () => {
  return (
    <>
      <GlobalStyles />
      <Visualizer />
    </>
  );
};

export default index;
