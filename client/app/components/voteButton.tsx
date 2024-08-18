'use client';

import { Button, Box, Center } from "@chakra-ui/react";
import { TriangleUpIcon } from "@chakra-ui/icons";
import { IVoteResult } from "../lib/types";
import useEvalVote from "../lib/hooks/useEvalVote";

function VoteButton({ evalId, votes, upvoted, onVote }: { evalId: number, votes: number, upvoted: boolean, onVote?: (payload: IVoteResult) => void }) {
  const vote = useEvalVote(evalId, onVote);

  const callVote = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
    vote();
  };

  return (
    <Button
      variant='outline'
      p={0}
      onClick={callVote}
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
