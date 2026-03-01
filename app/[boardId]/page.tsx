import Footer from "@/components/boardFooter";
import Canvas from "@/components/canvas";
import Toolbar from "@/components/toolbar";

function Page() {
  return (
    <div className="h-screen relative">
      <Toolbar />
      <Canvas />
      <Footer />
    </div>
  );
}

export default Page;
