import "@/css/satoshi.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NAMCO",
  icons: {
    icon: '/favicon.ico',
  },
  description: "Login to access the NextAdmin dashboard.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  );
}