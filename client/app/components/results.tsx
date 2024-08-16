import ResultItem from "./resultItem";
import { getEvals } from "../utils/getEvals";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { IRootState } from "@/app/lib/store";
import { upvoteEval } from "../utils/upvote";
import { Divider, useToast } from "@chakra-ui/react";
import { IEvalListItemResponse } from "../lib/types";

export default function Results() {
  const singleCallRef = useRef(false);
  const [evals, setEvals] = useState<IEvalListItemResponse[]>([]);
  const accessToken = useSelector<IRootState, string>((state: IRootState) => state.auth.token);
  const toast = useToast();

  useEffect(() => {
    if (singleCallRef.current) return;
    singleCallRef.current = true;

    const retrieveEvals = async () => {
      const ev = await getEvals(accessToken);
      setEvals(ev);
    };
    retrieveEvals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callUpVoteEval = async (evalId: number) => {
    try {
      const response = await upvoteEval(accessToken, evalId);
      setEvals(evals.map((value: any) => {
        if (value.id !== evalId) return value;
        value.upvotes = response.upvotes;
        value.upvoted = response.upvoted;
        return value;
      }));
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
        id, name, description, validatorType, upvotes, upvoted
      }) => (
        <>
          <ResultItem
            key={name}
            name={name}
            description={description ?? ''}
            validatorType={validatorType}
            upvotes={upvotes}
            upvoted={upvoted}
            onUpvote={() => callUpVoteEval(id)}
          />
          <Divider />
        </>
      ))}
    </>
  );
}