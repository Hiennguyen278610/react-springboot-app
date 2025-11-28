import { Users, Package, Code} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DropdownAdmin } from "./dropdown-admin"

const items = [
  {
    title: "Quản lý tài khoản",
    url: "/home/users",
    icon: Users,
  },
  {
    title: "Quản lý sản phẩm",
    url: "/home/products",
    icon: Package,
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
      <Sidebar className="w-80">
        <SidebarHeader className="flex flex-row items-center mx-4 mt-4 bg-background rounded-tl-2xl rounded-tr-2xl shadow-lg p-4 gap-x-4">
          <Code className="text-accent" size={28} strokeWidth={3}/>
          <p className="text-3xl text-primary font-bold">Flogin </p>
        </SidebarHeader>
        <SidebarContent className="mx-4 bg-background shadow-lg">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="mx-4 mb-4 rounded-br-2xl rounded-bl-2xl bg-background shadow-lg">
          <DropdownAdmin/>
        </SidebarFooter>
      </Sidebar>
  )
}