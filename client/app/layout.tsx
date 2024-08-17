import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import HeaderComponent from '@/app/components/layout/header';
import { Box } from "@chakra-ui/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenEvals",
  description: "Evals for the public",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <main>
            <HeaderComponent />
            <Box w='100%' px={6}>
              {children}
            </Box>
          </main>
        </Providers>
      </body>
    </html>
  );
}
