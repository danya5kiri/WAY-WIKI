import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WAY WIKI — ЭТРН и ГИС ЭПД",
  description: "Поиск инструкций, разъяснений и нормативных материалов по ЭТРН и ГИС ЭПД.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
