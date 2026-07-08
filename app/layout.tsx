import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATLAS AI — The AI Brain for Industrial Operations",
  description:
    "Industrial Knowledge Intelligence Platform: documents, assets, and maintenance history connected into one reasoning engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
