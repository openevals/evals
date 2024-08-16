import { getTopEvals } from "../utils/getEvals";
import { useEffect, useState } from "react";
import { IEvalListItemResponse } from "../lib/types";
import { Divider } from "@chakra-ui/react";
import ResultItem from "./resultItem";

export default function Trending() {
  const [evals, setEvals] = useState<IEvalListItemResponse[]>([]);

  useEffect(() => {
    const getTrending = async () => {
      const evals = await getTopEvals(); 
      setEvals(evals);
    }
    getTrending();
  }, []);

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