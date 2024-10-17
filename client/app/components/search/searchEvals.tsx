"use client";

import React, { useEffect, useState } from "react";
import { searchEvals } from "../../utils/getEvals";
import { useSelector } from "react-redux";
import { IRootState } from "../../lib/store";
import { IEvalListItemResponse, IVoteResult } from "../../lib/types";
import Results from "./results";

export default function SearchEvalsComponent() {
  const [evals, setEvals] = useState<IEvalListItemResponse[]>([]);
  const search = useSelector<IRootState, string>(
    (state: IRootState) => state.data.search,
  );
  const accessToken = useSelector<IRootState, string>(
    (state: IRootState) => state.auth.token,
  );

  useEffect(() => {
    const retrieveEvals = async () => {
      const ev = await searchEvals(accessToken, search);
      setEvals(ev);
    };
    retrieveEvals();
  }, [accessToken, search]);

  const setUpvoted = (payload: IVoteResult) => {
    setEvals(
      evals.map((value: IEvalListItemResponse) => {
        if (value.id !== payload.id) return value;
        value.upvotes = payload.upvotes;
        value.upvoted = payload.upvoted;
        return value;
      }),
    );
  };

  return <Results evals={evals} onVote={setUpvoted} />;
}
