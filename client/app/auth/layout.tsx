import { Box } from "@chakra-ui/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenEvals - Authentication",
  description: "Authenticate into your account",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box width="100vw" height="100vh" display="flex">
      {children}
    </Box>
  );
}
