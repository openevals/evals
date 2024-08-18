import type { Metadata } from "next";
import "./globals.css";
import { Providers } from './providers';
import HeaderComponent from '@/app/components/layout/header';
import { Box } from "@chakra-ui/react";


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
      <body>
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
