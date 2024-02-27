import type { Metadata } from "next";

import "./globals.css";
import { Inter } from "next/font/google";
import ClientOnly from "./clientOnly";
import { Providers } from "./providers";
export const metadata: Metadata = {
  title: "ISTC MINOR PROJECT",
  description: "Website made by students of ISTC for Minor Project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={" bg-black"}>
        <Providers>
          <ClientOnly>{children}</ClientOnly>
        </Providers>
      </body>
    </html>
  );
}
