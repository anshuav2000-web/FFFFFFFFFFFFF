import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  Phone,
  Kanban,
  CheckSquare,
  Settings,
  Webhook,
  UserPlus,
  FileText,
  CreditCard,
  Receipt,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import logoPath from "@assets/logo.png";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Leads", url: "/leads", icon: UserPlus },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Call Logs", url: "/call-logs", icon: Phone },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Invoices", url: "/invoices", icon: FileText },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Expenses", url: "/expenses", icon: Receipt },
];

const settingsItems = [
  { title: "Webhooks", url: "/webhooks", icon: Webhook },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <img src={logoPath} alt="Canvas Cartel" className="h-8 w-auto" />
        </Link>
        <p className="text-xs text-muted-foreground mt-1">Creative Agency CRM</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    data-active={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    data-active={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">
          <p>canvascartel.in</p>
          <p className="mt-1 opacity-60">v1.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
