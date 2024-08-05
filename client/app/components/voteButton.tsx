'use client';

import { Button, Divider, Box, Center } from "@chakra-ui/react";
import { TriangleUpIcon } from "@chakra-ui/icons";

function VoteButton({ votes }: { votes: number }) {
  return (
    <Button 
      variant='outline'
      p={0}
    >
      <Box as="span" ml={2}>
        <TriangleUpIcon />
      </Box>
      <Center h='100%' m={2}>
        <Divider orientation='vertical' />
      </Center>
      <Box as="span" mr={2}>
        {votes}
      </Box>
    </Button>
  );
}

export default VoteButton;
