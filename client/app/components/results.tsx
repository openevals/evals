'use client';

import ResultItem from "./resultItem";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../lib/store";
import { upvoteEval } from "../utils/upvote";
import { Box, Text, useToast } from "@chakra-ui/react";
import { IEvalListItemResponse } from "../lib/types";
import { setUpvotedEval } from "../lib/store/dataSlice";

export default function Results({ evals, onUpvote }: { evals: IEvalListItemResponse[], onUpvote?: (payload: any) => void }) {
  const dispatch = useDispatch();
  const accessToken = useSelector<IRootState, string>((state: IRootState) => state.auth.token);
  const toast = useToast();

  const callUpVoteEval = async (evalId: number) => {
    try {
      const response = await upvoteEval(accessToken, evalId);
      const payload = { id: evalId, upvotes: response.upvotes, upvoted: response.upvoted };
      dispatch(setUpvotedEval(payload));
      if (onUpvote) onUpvote(payload);
    } catch {
      toast({
        title: "Vote failed",
        description: "There is an error saving your vote. Please, try it again.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      {evals.length == 0 ? (
        <Box w="100%"><Text size="lg" textAlign="center">No evals found</Text></Box>
      ) : (
        <Box w="50%">
          {evals.map(({
            id, name, description, validatorType, upvotes, upvoted
          }) => (
            <ResultItem
              key={`eval-${id}`}
              id={id}
              name={name}
              description={description ?? ''}
              validatorType={validatorType}
              upvotes={upvotes}
              upvoted={upvoted}
              onUpvote={() => callUpVoteEval(id)}
            />
          ))}
        </Box>
      )}
    </>
  );
}