import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SidebarState = "expanded" | "collapsed";
const Ctx = React.createContext<{state:SidebarState; toggle:()=>void}>({state:"expanded", toggle:()=>{}});
export function SidebarProvider({children}:{children:React.ReactNode}) { const [state,setState]=React.useState<SidebarState>("expanded"); return <Ctx.Provider value={{state,toggle:()=>setState(s=>s==="expanded"?"collapsed":"expanded")}}>{children}</Ctx.Provider>; }
export const useSidebar = () => React.useContext(Ctx);
export function SidebarTrigger({className}:{className?:string}) { const {toggle}=useSidebar(); return <Button variant="ghost" size="sm" className={className} onClick={toggle}>☰</Button>; }
export function Sidebar({children,className}:{children:React.ReactNode; className?:string; side?:"left"|"right"; collapsible?:"icon"}) { const {state}=useSidebar(); return <aside className={cn("min-h-screen border-l bg-sidebar text-sidebar-foreground transition-all", state==="collapsed"?"w-16":"w-72", className)}>{children}</aside>; }
export const SidebarHeader = ({className,...p}:React.HTMLAttributes<HTMLDivElement>) => <div className={className} {...p}/>;
export const SidebarContent = ({className,...p}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn("p-2",className)} {...p}/>;
export const SidebarFooter = ({className,...p}:React.HTMLAttributes<HTMLDivElement>) => <div className={className} {...p}/>;
export const SidebarGroup = ({className,...p}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn("py-2",className)} {...p}/>;
export const SidebarGroupContent = ({className,...p}:React.HTMLAttributes<HTMLDivElement>) => <div className={className} {...p}/>;
export const SidebarGroupLabel = ({className,...p}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn("px-3 py-2 text-xs text-sidebar-foreground/60",className)} {...p}/>;
export const SidebarMenu = ({className,...p}:React.HTMLAttributes<HTMLUListElement>) => <ul className={cn("space-y-1",className)} {...p}/>;
export const SidebarMenuItem = ({className,...p}:React.HTMLAttributes<HTMLLIElement>) => <li className={className} {...p}/>;
export function SidebarMenuButton({children,isActive,className}:{children:React.ReactNode; asChild?:boolean; isActive?:boolean; tooltip?:string; className?:string}) { return <div className={cn("rounded-md", isActive&&"bg-sidebar-accent text-sidebar-accent-foreground", className)}>{children}</div>; }
