import React from "react";
import Toolbar from "./toolbar";
import ToolsSidebar from "./ToolsSidebar";
import Canvas from "./canvas";

function Board() {
  return (
    <div className="h-screen relative overflow-hidden">
      <Toolbar />
      <ToolsSidebar />
      <Canvas />
    </div>
  );
}

export default Board;
