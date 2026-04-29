"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

function InsetHeader() {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0] ?? "Dashboard";
  const title = segment.charAt(0).toUpperCase() + segment.slice(1);
  return (
    <header className="sticky top-0 bg-background border-b flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <span className="text-lg font-medium">{title}</span>
      </div>
    </header>
  );
}

export default InsetHeader;
