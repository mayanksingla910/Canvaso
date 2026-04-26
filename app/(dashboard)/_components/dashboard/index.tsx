import React from "react";
import BoardTable from "./board-table";
import ProjectTable from "./project-table";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function DashBoard() {
  return (
    <div className="space-y-8">
      <div>
        <Label className="font-bold text-xl">Boards</Label>
        <BoardTable />
      </div>
      <Separator />
      <div>
        <Label className="font-bold text-xl">Projects</Label>
        <ProjectTable />
      </div>
    </div>
  );
}

export default DashBoard;
