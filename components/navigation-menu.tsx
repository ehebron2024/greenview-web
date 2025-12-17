import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cn } from "@/lib/utils";

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex w-full items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex list-none items-center justify-center gap-8 w-full relative",
        className
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

function NavigationMenuButton({
  onClick,
  children,
  variant = "default",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-md transition-all",
        variant === "default"
          ? "text-[var(--foreground)] hover:bg-[var(--accent)]"
          : "bg-green-700 text-white hover:bg-green-800",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function NavigationMenuCenter() {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 justify-center">
      <img
        src="/print_transparent.svg"
        alt="GreenView Logo"
        className="w-10 h-10"
      />
      <h1 className="text-sm font-bold text-[var(--foreground)] tracking-wide whitespace-nowrap">
        Greenview Renovation
      </h1>
    </div>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuButton,
  NavigationMenuCenter,
};
