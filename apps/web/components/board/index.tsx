import Toolbar from "./toolbar";
import ToolsSidebar from "./ToolsSidebar";
import Canvas from "./canvas";

interface BoardProps {
  readonly?: boolean;
}

function Board({ readonly = false }: BoardProps) {
  return (
    <div className="h-screen relative overflow-hidden">
      {!readonly && <Toolbar />}
      {!readonly && <ToolsSidebar />}
      <Canvas />
    </div>
  );
}

export default Board;