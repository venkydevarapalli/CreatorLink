import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="rounded-xl" />

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search gigs, freelancers..."
          className="pl-9 rounded-xl bg-secondary border-0 focus-visible:ring-primary/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
            3
          </span>
        </Button>
        <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/10">
          <AvatarFallback className="gradient-primary text-primary-foreground text-sm font-semibold">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
