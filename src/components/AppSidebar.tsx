import React from "react";
import { Home, TrendingUp, Video, Settings, ChevronLeft, ChevronRight, Trophy, Sun, Moon, Database, Cpu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Race Results", url: "/results", icon: Trophy },
  { title: "Quantum Rankings", url: "/quantum-rankings", icon: TrendingUp },
  { title: "Video Performance", url: "/video-performance", icon: Video },
];

const adminItems = [
  { title: "Admin Dashboard", url: "/admin", icon: Settings },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const { theme, setTheme } = useTheme();

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-white/10 text-foreground font-medium border-l-2 border-primary" 
      : "text-muted-foreground hover:text-foreground hover:bg-white/5";

  return (
    <Sidebar
      className="glass-sidebar border-r-0"
      collapsible="icon"
    >
      <SidebarHeader className="p-3 border-b border-white/5 flex flex-row items-center justify-between gap-2">
        <SidebarTrigger className="glass-button-secondary p-2 rounded-lg">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </SidebarTrigger>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg hover:bg-white/5 h-8 w-8"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-blue-400" />
            )}
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup defaultOpen>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider px-3 py-2 font-medium">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin section - visible for testing */}
        <SidebarGroup defaultOpen className="mt-4">
          <SidebarGroupLabel className="text-cyan-400/80 text-xs uppercase tracking-wider px-3 py-2 font-medium">
            {!collapsed && "Admin & Data"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 font-medium border-l-2 border-cyan-400" 
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
