import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "dark" | "outline";
};

export function Button({ children, className, variant = "primary", ...props }: Props) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
    dark: "bg-foreground text-background hover:bg-foreground/90",
    outline: "border border-border bg-background text-foreground hover:bg-muted",
  };
  return (
    <button
      className={cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-6 text-sm font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
