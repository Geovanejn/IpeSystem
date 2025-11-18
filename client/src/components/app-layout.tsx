import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

type AppLayoutProps = {
  children: React.ReactNode;
  role: "pastor" | "treasurer" | "deacon" | "member" | "visitor";
  userName?: string;
};

export function AppLayout({ children, role, userName }: AppLayoutProps) {
  // Largura personalizada da sidebar para o contexto eclesiástico
  const style = {
    "--sidebar-width": "20rem",      // 320px para melhor visualização do logo e conteúdo
    "--sidebar-width-icon": "4rem",  // largura padrão de ícone
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role={role} userName={userName} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
