import { Scale, Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@canon/integrations/supabase/client";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarFooter, useSidebar
} from "@canon/components/ui/sidebar";

interface DashboardSidebarProps {
  activeTab: "processos" | "agenda";
  onTabChange: (tab: "processos" | "agenda") => void;
}

const navItems = [
  { id: "processos" as const, title: "Processos", icon: Scale },
  { id: "agenda" as const, title: "Agenda", icon: Calendar },
];

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
  // Arquivo removido. Sidebar do Dashboard não é mais usada.
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter>
          <SidebarMenuButton onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Sair
          </SidebarMenuButton>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
import { Scale, Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@canon/integrations/supabase/client";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarFooter, useSidebar
} from "@canon/components/ui/sidebar";

interface DashboardSidebarProps {
  activeTab: "processos" | "agenda";
  onTabChange: (tab: "processos" | "agenda") => void;
}

const navItems = [
  { id: "processos" as const, title: "Processos", icon: Scale },
  { id: "agenda" as const, title: "Agenda", icon: Calendar },
];

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={activeTab === item.id ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {!collapsed && <span>Sair da Conta</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
