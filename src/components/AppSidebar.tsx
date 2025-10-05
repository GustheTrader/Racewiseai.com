import { Home, TrendingUp, Video, Settings, Database, ChevronLeft, ChevronRight, Trophy, Sun, Moon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/auth/AuthContext";
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
  { title: "Admin Panel", url: "/admin", icon: Settings },
  { title: "Data Dashboard", url: "/data-dashboard", icon: Database },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const { isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-betting-darkPurple/80 text-orange-400 font-semibold shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(139,92,246,0.1)] border-l-2 border-orange-500" 
      : "text-gray-300 hover:text-white hover:bg-betting-darkPurple/50 hover:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(139,92,246,0.05)]";

  return (
    <Sidebar
      className="bg-betting-dark border-r border-betting-tertiaryPurple/30 shadow-[4px_0_8px_rgba(0,0,0,0.4)]"
      collapsible="icon"
    >
      {/* Toggle and Theme at Top */}
      <SidebarHeader className="p-4 border-b border-betting-tertiaryPurple/30 flex flex-row items-center justify-between gap-2">
        <SidebarTrigger className="bg-betting-darkPurple/50 hover:bg-betting-darkPurple/70 text-white rounded-xl p-2 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(139,92,246,0.1)] hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(139,92,246,0.1)] transition-all">
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </SidebarTrigger>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl hover:bg-betting-darkPurple/50"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-purple-400" />
            )}
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-betting-dark">
        {/* Main Navigation */}
        <SidebarGroup defaultOpen>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider px-4 py-2">
            {!collapsed && "Main Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="my-1">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {isAdmin && (
          <SidebarGroup defaultOpen className="mt-4">
            <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider px-4 py-2">
              {!collapsed && "Admin"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="my-1">
                      <NavLink 
                        to={item.url}
                        className={({ isActive }) => 
                          `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${getNavCls({ isActive })}`
                        }
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
