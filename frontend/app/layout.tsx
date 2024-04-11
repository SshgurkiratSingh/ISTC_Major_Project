import type { Metadata } from "next";

import "./globals.css";
import { Inter } from "next/font/google";
import ClientOnly from "./clientOnly";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ISTC Major Project",
  description: "Collaborative Kitchen",
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
          <script src="../path/to/flowbite/dist/flowbite.min.js"></script>

          <ClientOnly>{children}</ClientOnly>
        </Providers>
      </body>
    </html>
  );
}
