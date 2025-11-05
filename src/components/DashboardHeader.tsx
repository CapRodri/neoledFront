import { SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "lucide-react";
import { getCurrentUser } from "@/api/AuthApi";

export function DashboardHeader() {
  const user = getCurrentUser();
  const username = user ? `${user.nombres} ${user.apellidos}` : "Usuario";
  const userRole = user?.rol || "Rol no definido";

  return (
    <header className="h-16 flex items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-primary">Sistema - NEOLED</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
          <User className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{username}</span>
            <span className="text-xs text-muted-foreground">{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}