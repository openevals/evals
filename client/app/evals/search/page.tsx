import type { Metadata } from "next";
import React from "react";
import SearchEvalsComponent from "../../components/searchEvals";
import { Box, Heading } from '@chakra-ui/react';

export const metadata: Metadata = {
  title: "OpenEvals - Search results",
  description: "Evals for the public",
};

export default function EvalSearchPage() {
  return (
    <Box>
      <Heading size='lg' p={4}>Results</Heading>
      <SearchEvalsComponent />
    </Box>
);
}
