"use client";

import { useState } from "react";
import { Counter } from "../ui/counter";
import HistoryButtons from "./historyButtons";

function Footer() {
  const [boardZoom, setBoardZoom] = useState(100);
  return (
    <div className="fixed bottom-5 left-10 flex items-center gap-4">
      <Counter number={boardZoom} setNumber={setBoardZoom} className="w-fit" />
      <HistoryButtons />
    </div>
  );
}

export default Footer;
