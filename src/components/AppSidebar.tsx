import { Home, TrendingUp, Video, Settings, Database, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/auth/AuthContext";
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
  useSidebar,
} from "@/components/ui/sidebar";

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

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-betting-darkPurple/80 text-orange-400 font-semibold shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(139,92,246,0.1)] border-l-2 border-orange-500" 
      : "text-gray-300 hover:text-white hover:bg-betting-darkPurple/50 hover:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(139,92,246,0.05)]";

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} bg-betting-dark border-r border-betting-tertiaryPurple/30 transition-all duration-300 shadow-[4px_0_8px_rgba(0,0,0,0.4)]`}
      collapsible
    >
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

      {/* Toggle Button at Bottom */}
      <div className="mt-auto p-4 border-t border-betting-tertiaryPurple/30">
        <SidebarTrigger className="w-full bg-betting-darkPurple/50 hover:bg-betting-darkPurple/70 text-white rounded-xl p-2 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(139,92,246,0.1)] hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(139,92,246,0.1)] transition-all">
          {collapsed ? <ChevronRight className="h-5 w-5 mx-auto" /> : <ChevronLeft className="h-5 w-5 mx-auto" />}
        </SidebarTrigger>
      </div>
    </Sidebar>
  );
}
