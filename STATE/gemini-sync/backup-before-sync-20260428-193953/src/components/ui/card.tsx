import * as React from "react";
import { cn } from "@/lib/utils";
export const Card = ({className,...props}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn("rounded-xl border bg-card text-card-foreground shadow-elegant", className)} {...props}/>;
export const CardHeader = ({className,...props}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn("p-5 pb-2", className)} {...props}/>;
export const CardTitle = ({className,...props}:React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn("text-lg font-semibold", className)} {...props}/>;
export const CardDescription = ({className,...props}:React.HTMLAttributes<HTMLParagraphElement>) => <p className={cn("text-sm text-muted-foreground", className)} {...props}/>;
export const CardContent = ({className,...props}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn("p-5 pt-3", className)} {...props}/>;
