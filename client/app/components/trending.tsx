import { getTopEvals } from "../utils/getEvals";
import { useEffect, useState } from "react";
import { IEvalListItemResponse } from "../lib/types";
import { Divider, useToast } from "@chakra-ui/react";
import ResultItem from "./resultItem";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../lib/store";
import { upvoteEval } from "../utils/upvote";
import { setUpvotedEval } from "../lib/store/dataSlice";

export default function Trending() {
  const [evals, setEvals] = useState<IEvalListItemResponse[]>([]);
  const accessToken = useSelector<IRootState, string>((state: IRootState) => state.auth.token);
  const toast = useToast();
  const dispatch = useDispatch();

  useEffect(() => {
    const getTrending = async () => {
      const evals = await getTopEvals();
      setEvals(evals);
    };
    getTrending();
  }, []);

  const callUpvoteEval = async (evalId: number) => {
    try {
      const response = await upvoteEval(accessToken, evalId);
      const payload = { id: evalId, upvotes: response.upvotes, upvoted: response.upvoted };
      dispatch(setUpvotedEval(payload));
      setEvals(prevValues => {
        return prevValues.map((value) => {
          if (value.id === evalId) {
            value.upvotes = response.upvotes;
            value.upvoted = response.upvoted;
          }
          return value;
        });
      });
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
      {evals.map(({
        id, name, description, validatorType, upvotes, upvoted, authors
      }) => (
        <>
          <ResultItem
            id={id}
            key={name}
            name={name}
            description={description ?? ''}
            validatorType={validatorType}
            upvotes={upvotes}
            upvoted={upvoted}
            onUpvote={() => callUpvoteEval(id)}
            mainAuthor={authors[0]}
          />
          <Divider />
        </>
      ))}
    </>
  );
}