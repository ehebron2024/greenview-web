"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuButton,
  NavigationMenuCenter,
} from "@/components/navigation-menu";

export default function NavigationBar() {
  const router = useRouter();
  const { user, loading } = useUser();

  if (loading) return null;

  return (
    <nav
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#ffffff",
      }}
    >
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuButton
              onClick={() =>
                user ? router.push(`/${user.uid}`) : router.push("/")
              }
            >
              Home
            </NavigationMenuButton>
          </NavigationMenuItem>

          <NavigationMenuCenter />

          <NavigationMenuItem>
            <NavigationMenuButton
              onClick={() =>
                user
                  ? router.push(`/${user.uid}/userProjects`)
                  : router.push("/")
              }
            >
              My Projects
            </NavigationMenuButton>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}
