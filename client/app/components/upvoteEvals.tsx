'use client';

import { getEvals } from "../utils/getEvals";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../lib/store";
import { setEvals } from '../lib/store/dataSlice';
import { IEvalListItemResponse } from "../lib/types";
import Results from './search/results';
import React from "react";

export default function UpvoteEvalsComponent() {
  const singleCallRef = useRef(false);
  const dispatch = useDispatch();
  const evals = useSelector<IRootState, IEvalListItemResponse[]>((state: IRootState) => state.data.evals);
  const accessToken = useSelector<IRootState, string>((state: IRootState) => state.auth.token);

  useEffect(() => {
    if (singleCallRef.current) return;
    singleCallRef.current = true;

    const retrieveEvals = async () => {
      const ev = await getEvals(accessToken);
      dispatch(setEvals(ev));
    };
    retrieveEvals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (<Results evals={evals} />);
}