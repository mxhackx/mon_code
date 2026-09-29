import type { Metadata } from "next";
import "./globals.css";
import { FileProvider } from "./context/FileContext";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "MonCode — Vos menus digitaux en un scan",
  description: "Créez et partagez votre menu digital avec MonCode.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={cn("h-full antialiased font-sans")}>
      <body className="min-h-full flex flex-col">
        <FileProvider>{children}</FileProvider>
      </body>
    </html>
  );
}
