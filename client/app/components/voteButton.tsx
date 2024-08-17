'use client';

import { Button, Box, Center } from "@chakra-ui/react";
import { TriangleUpIcon } from "@chakra-ui/icons";
import { useSelector } from "react-redux";
import { IRootState } from "@/app/lib/store";

function VoteButton({ votes, upvoted, onUpvote }: { votes: number, upvoted: boolean, onUpvote: () => void }) {
  const isAuthenticated = useSelector<IRootState, string>((state: IRootState) => state.auth.isAuthenticated);


  const cbVote = (ev: any) => {
    ev.stopPropagation();
    ev.preventDefault();
    if (isAuthenticated) onUpvote();
  };

  return (
    <Button
      variant='outline'
      p={0}
      onClick={cbVote}
      backgroundColor={upvoted ? 'var(--chakra-colors-gray-200)' : ''}
    >
      <Box as="span" ml={2}>
        <TriangleUpIcon />
      </Box>
      <Center h='100%' m={2} />
      <Box as="span" mr={2}>
        {votes}
      </Box>
    </Button>
  );
}

export default VoteButton;
