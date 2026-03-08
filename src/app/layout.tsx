import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MY CLASS – AI-Powered Learning Platform",
  description: "Gamified, AI-driven infinite learning for students from Class 3–12. CBSE & State Boards with unlimited questions, XP streaks, and an AI mentor.",
};

import Notifications from "@/components/Notifications";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-mesh antialiased">
        <Notifications />
        {children}
      </body>
    </html>
  );
}
