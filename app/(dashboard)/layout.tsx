"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import InsetHeader from "./_components/dashboard/inset-header";
import AddNewButtons from "./_components/dashboard/add-new-buttons";
import { authClient } from "@/lib/auth-client";
import GuestHome from "./_components/guest-home";
import { AppSidebar } from "./_components/sidebar/app-sidebar";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  if (!session) return <GuestHome />;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <InsetHeader />
        <main className="flex flex-1 flex-col gap-10 p-4 lg:px-12 bg-background border-b ">
          <AddNewButtons />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DashboardLayout;