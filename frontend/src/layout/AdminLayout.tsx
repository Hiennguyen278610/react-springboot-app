import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen flex-row gap-x-10 bg-sidebar">
        <AppSidebar />
        <main className="flex-1 p-6 bg-sidebar h-full">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}