import { 
  Users, BookOpen, UserPlus, Calendar, BarChart3, 
  DollarSign, TrendingUp, ShoppingCart, FileText,
  UserCheck, Heart, Book, Shield, Home, LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import logoUrl from "@assets/Logo IPE Completo sem fundo_1763476158974.png";

type AppSidebarProps = {
  role: "pastor" | "treasurer" | "deacon" | "member" | "visitor";
  userName?: string;
};

const menuItemsByRole = {
  pastor: [
    { title: "Dashboard", url: "/pastor", icon: Home },
    { title: "Membros", url: "/pastor/members", icon: Users },
    { title: "Seminaristas", url: "/pastor/seminarians", icon: BookOpen },
    { title: "Catecúmenos", url: "/pastor/catechumens", icon: UserPlus },
    { title: "Visitantes", url: "/pastor/visitors", icon: UserCheck },
    { title: "Aniversariantes", url: "/pastor/birthdays", icon: Calendar },
    { title: "Relatórios", url: "/pastor/reports", icon: BarChart3 },
  ],
  treasurer: [
    { title: "Dashboard", url: "/treasurer", icon: Home },
    { title: "Dízimos", url: "/treasurer/tithes", icon: DollarSign },
    { title: "Ofertas", url: "/treasurer/offerings", icon: TrendingUp },
    { title: "Livraria", url: "/treasurer/bookstore", icon: ShoppingCart },
    { title: "Empréstimos", url: "/treasurer/loans", icon: FileText },
    { title: "Saídas", url: "/treasurer/expenses", icon: DollarSign },
    { title: "Relatórios", url: "/treasurer/reports", icon: BarChart3 },
  ],
  deacon: [
    { title: "Dashboard", url: "/deacon", icon: Home },
    { title: "Visitantes", url: "/deacon/visitors", icon: UserCheck },
    { title: "Ajuda Diaconal", url: "/deacon/help", icon: Heart },
    { title: "Boletim Dominical", url: "/deacon/bulletin", icon: Book },
  ],
  member: [
    { title: "Meus Dados", url: "/lgpd", icon: Shield },
    { title: "Exportar Dados", url: "/lgpd/export", icon: FileText },
    { title: "Solicitações", url: "/lgpd/requests", icon: UserCheck },
  ],
  visitor: [
    { title: "Meus Dados", url: "/lgpd", icon: Shield },
    { title: "Exportar Dados", url: "/lgpd/export", icon: FileText },
    { title: "Solicitações", url: "/lgpd/requests", icon: UserCheck },
  ],
};

const roleTitles = {
  pastor: "Painel do Pastor",
  treasurer: "Painel do Tesoureiro",
  deacon: "Painel do Diácono",
  member: "Portal LGPD",
  visitor: "Portal LGPD",
};

const roleColors = {
  pastor: "bg-primary text-primary-foreground",
  treasurer: "bg-accent text-accent-foreground",
  deacon: "bg-green-600 text-white",
  member: "bg-muted text-muted-foreground",
  visitor: "bg-muted text-muted-foreground",
};

export function AppSidebar({ role, userName = "Usuário" }: AppSidebarProps) {
  const [location] = useLocation();
  const menuItems = menuItemsByRole[role];

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex flex-col items-center gap-4">
          <img 
            src={logoUrl} 
            alt="Logo IPE" 
            className="w-full max-w-[120px]"
          />
          <Badge className={`${roleColors[role]} text-xs font-medium px-3 py-1`}>
            {roleTitles[role]}
          </Badge>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url || 
                  (item.url !== `/${role}` && location.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
              {userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">
              {role === "pastor" ? "Pastor" : 
               role === "treasurer" ? "Tesoureiro" : 
               role === "deacon" ? "Diácono" : 
               role === "member" ? "Membro" : "Visitante"}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 hover-elevate active-elevate-2"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
