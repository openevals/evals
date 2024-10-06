import { useCallback } from "react";
import { upvoteEval } from "../../utils/upvoteEval";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../store";
import { setUpvotedEval } from "../store/dataSlice";
import { useToast } from "@chakra-ui/react";
import { IVoteResult } from "../types";

const useEvalVote = (
  evalId: number,
  onVote?: (payload: IVoteResult) => void,
) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const isAuthenticated = useSelector<IRootState, string>(
    (state: IRootState) => state.auth.isAuthenticated,
  );
  const accessToken = useSelector<IRootState, string>(
    (state: IRootState) => state.auth.token,
  );

  /* Keep the object state updated */
  const vote = useCallback(async () => {
    if (!isAuthenticated) {
      toast({
        description: "You must be logged in",
        duration: 8000,
        status: "warning",
      });
      return;
    }
    try {
      const response = await upvoteEval(accessToken, evalId);
      const payload = {
        id: evalId,
        upvotes: response.upvotes,
        upvoted: response.upvoted,
      };
      dispatch(setUpvotedEval(payload));
      if (onVote) onVote(payload);
    } catch {
      toast({
        title: "Vote failed",
        description:
          "There is an error saving your vote. Please, try it again.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, evalId, onVote]);

  return vote;
};

export default useEvalVote;
