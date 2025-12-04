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
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary";
}) {
  const baseStyles = {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'Open Sans', sans-serif",
  };

  const variantStyles = {
    default: {
      backgroundColor: "transparent",
      color: "#013220",
    },
    primary: {
      backgroundColor: "#2e7d32",
      color: "#ffffff",
    },
  };

  const style = {
    ...baseStyles,
    ...variantStyles[variant],
  };

  return (
    <button
      onClick={onClick}
      style={style}
      onMouseEnter={(e) => {
        if (variant === "default") {
          e.currentTarget.style.backgroundColor = "#e8f5e9";
        } else {
          e.currentTarget.style.backgroundColor = "#1b5e20";
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "default") {
          e.currentTarget.style.backgroundColor = "transparent";
        } else {
          e.currentTarget.style.backgroundColor = "#2e7d32";
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function NavigationMenuCenter() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        flex: 1,
        justifyContent: "center",
      }}
    >
      <img
        src="/print_transparent.svg"
        alt="GreenView Logo"
        style={{
          width: "40px",
          height: "40px",
        }}
      />
      <h1
        style={{
          margin: "0",
          fontSize: "14px",
          fontWeight: "700",
          color: "#013220",
          letterSpacing: "0.5px",
          fontFamily: "'Open Sans', sans-serif",
          whiteSpace: "nowrap",
        }}
      >
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
