"use client";

import * as React from "react";
import {
  Command,
  FolderKanban,
  Home,
  Presentation,
  Send,
  Settings,
} from "lucide-react";

import { NavPrimary } from "@/app/(dashboard)/_components/sidebar/nav-primary";
import { NavSecondary } from "@/app/(dashboard)/_components/sidebar/nav-secondary";
import { NavUser } from "@/app/(dashboard)/_components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SearchForm } from "./searchForm";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  navPrimary: [
    {
      name: "Home",
      url: "/",
      icon: Home,
    },
    {
      name: "Boards",
      url: "/boards",
      icon: Presentation,
    },
    {
      name: "Projects",
      url: "/projects",
      icon: FolderKanban,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="my-6 ">
        <Link href="/" className="flex items-center justify-center gap-3">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Command className="size-4" />
          </div>
          <span className="grid flex-1 text-left text-lg leading-tight truncate font-medium">
            Canvaso
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="overflow-visible">
        <SearchForm />
        <NavPrimary projects={data.navPrimary} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="mb-2">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
