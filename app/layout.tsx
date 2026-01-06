import "./globals.css";
import { Fredoka } from "next/font/google";

const fun = Fredoka({
  subsets: ["latin"],
  variable: "--font-fun",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Roblox Wrapped",
  description: "A story-style Wrapped for Roblox badges (2025).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={fun.variable}>{children}</body>
    </html>
  );
}
