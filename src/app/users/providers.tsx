"use client";

import { UserSidebarProvider } from "@/components/Layouts/usersidebar/sidebar-context";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <UserSidebarProvider>{children}</UserSidebarProvider>
     
    </ThemeProvider>
  );
}
