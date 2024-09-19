import type { Metadata } from "next";
import React from "react";
import UpvoteEvalsComponent from "../components/upvoteEvals";
import { Box, Heading } from '@chakra-ui/react';

export const metadata: Metadata = {
  title: "OpenEvals - Browse evals",
  description: "Evals for the public",
};

export default function BrowsePage() {
  return (
    <Box>
      <Heading size='lg' p={4}>Browse evals</Heading>
      <UpvoteEvalsComponent/>
    </Box>
  );
}
