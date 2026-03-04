import type { Metadata } from "next";
import "./globals.css";
import AntdProvider from "@/components/AntdProvider";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "ForexHunt — Track Your Trading Career",
  description:
    "Personal forex trading tracker. Manage portfolios, record trades, and review monthly performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AntdProvider>
          <AppShell>{children}</AppShell>
        </AntdProvider>
      </body>
    </html>
  );
}
