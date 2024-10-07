import type { Metadata } from "next";
import React from "react";
import SearchEvalsComponent from "../../components/search/searchEvals";
import { Box, Heading } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: "OpenEvals - Search results",
  description: "Evals for the public",
};

export default function EvalSearchPage() {
  return (
    <Box m={8}>
      <Heading size="lg">Results</Heading>
      <SearchEvalsComponent />
    </Box>
  );
}
