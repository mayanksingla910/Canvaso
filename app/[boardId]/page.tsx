import Canvas from "@/components/canvas";
import Toolbar from "@/components/toolbar";
import ToolsSidebar from "@/components/ToolsSidebar";

function BoardPage() {
  return (
    <div className="h-screen relative overflow-hidden">
      <Toolbar />
      <ToolsSidebar />
      <Canvas />
    </div>
  );
}

export default BoardPage;
