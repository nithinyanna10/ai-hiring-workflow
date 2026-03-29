import type { Metadata } from "next";
import "./globals.css";

import { DevMockEmailMount } from "../components/dev/dev-mock-email-mount";

export const metadata: Metadata = {
  title: "AI Hiring Workflow",
  description: "Operational scaffold for hiring workflows powered by AI services.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <DevMockEmailMount />
      </body>
    </html>
  );
}
