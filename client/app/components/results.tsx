"use client";

import ResultItem from "./resultItem";
import { Box, Text, Flex, } from "@chakra-ui/react";
import { IEvalListItemResponse, IVoteResult } from "../lib/types";

export default function Results({ evals, onVote }: { evals: IEvalListItemResponse[], onVote?: (payload: IVoteResult) => void }) {
  return (
    <Flex px={4}>
      {evals.length == 0 ? (
        <Box w="100%"><Text size="lg" textAlign="center">No evals found</Text></Box>
      ) : (
        <Box w={{ base: "100%", md: "50%" }}>
          {evals.map(({
            id, name, description, validatorType, upvotes, upvoted, authors
          }) => (
            <ResultItem
              key={`eval-${id}`} 
              id={id}
              name={name}
              description={description ?? ''}
              validatorType={validatorType}
              upvotes={upvotes}
              upvoted={upvoted}
              onVote={onVote}
              mainAuthor={ authors?.[0] ?? null }
              onClick='ItemDetail'
            />
          ))}
        </Box>
      )}
    </Flex>
  );
}