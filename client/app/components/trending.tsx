import { getTopEvals } from "../utils/getEvals";
import { useEffect, useState } from "react";
import { IEvalListItemResponse, IVoteResult } from "../lib/types";
import { Divider } from "@chakra-ui/react";
import ResultItem from "./resultItem";

export default function Trending() {
  const [evals, setEvals] = useState<IEvalListItemResponse[]>([]);

  useEffect(() => {
    const getTrending = async () => {
      const evals = await getTopEvals();
      setEvals(evals);
    };
    getTrending();
  }, []);

  const updateEvals = (payload: IVoteResult) => {
    setEvals(prevValues => {
      return prevValues.map((value) => {
        if (value.id === payload.id) {
          value.upvotes = payload.upvotes;
          value.upvoted = payload.upvoted;
        }
        return value;
      });
    });
  };

  return (
    <>
      {evals.map(({
        id, name, description, validatorType, upvotes, upvoted, authors
      }) => (
        <>
          <ResultItem
            key={`trending-eval-${id}`}
            id={id}
            name={name}
            description={description ?? ''}
            validatorType={validatorType}
            upvotes={upvotes}
            upvoted={upvoted}
            onVote={updateEvals}
            mainAuthor={authors[0]}
          />
          <Divider />
        </>
      ))}
    </>
  );
}