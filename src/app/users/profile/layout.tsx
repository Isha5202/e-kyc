// app/layout.tsx or appropriate path

import "@/css/satoshi.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import { Metadata } from "next";
import type { PropsWithChildren } from "react";
import NextTopLoader from "nextjs-toploader";

import { Providers } from "../providers";
import { UserSidebar } from "@/components/Layouts/usersidebar";
import { UserHeader } from "@/components/Layouts/userheader";

export const metadata: Metadata = {
  title: {
    template: "%s | NAMCO",
    default: "NAMCO",
  },
  icons: {
    icon: '/favicon.ico',
  },
  description:
    "Next.js admin dashboard toolkit with 200+ templates, UI components, and integrations for fast dashboard development.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />

          <div className="flex min-h-screen">
            <UserSidebar />

            <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
              <UserHeader />

              <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
