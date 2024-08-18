'use client';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IRootState } from "@/app/lib/store";
import { getUserEvals, getUserUpvotedEvals } from "../utils/getEvals";
import { Heading, Box } from "@chakra-ui/react";
import ResultItem from "../components/resultItem";
import { IEvalListItemResponse, IVoteResult } from "../lib/types";

export default function MyEvals() {
  const [userEvals, setUserEvals] = useState<IEvalListItemResponse[]>([]);
  const [userVotedEvals, setUserVotedEvals] = useState<IEvalListItemResponse[]>([]);
  const accessToken = useSelector<IRootState, string>((state: IRootState) => state.auth.token);
  const evals = useSelector<IRootState, IEvalListItemResponse[]>((state: IRootState) => state.data.evals);

  useEffect(() => {
    if (accessToken) {
      const getUserEvalInfo = async () => {
        const uEvals: IEvalListItemResponse[] = await getUserEvals(accessToken);
        if (uEvals.length > 0) {
          setUserEvals(uEvals);
        }
      };
      getUserEvalInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUserVotedEvals(evals.filter((value) => value.upvoted));
  }, [evals]);

  const updateEvals = (payload: IVoteResult) => {
    setUserEvals(prevValues => {
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
    <Box w='100%' p={4}>
      <Heading ml={4} size='lg'>My Created Evals</Heading>
      {userEvals && userEvals.map(({
        id, name, description, validatorType, upvotes, upvoted, authors
      }) => (
        <ResultItem
          key={`my-evals-${id}`}
          name={name}
          id={id}
          description={description ?? ''}
          validatorType={validatorType}
          upvotes={upvotes}
          upvoted={upvoted}
          onVote={updateEvals}
          mainAuthor={authors[0]}
        />
      ))}
      <Heading ml={4} size='lg'>My Upvotes</Heading>
      {userVotedEvals && userVotedEvals.map(({
        id, name, description, validatorType, upvotes, upvoted, authors
      }) => (
        <ResultItem
          key={`voted-evals-${id}`}
          id={id}
          name={name}
          description={description ?? ''}
          validatorType={validatorType}
          upvotes={upvotes}
          upvoted={upvoted}
          onVote={updateEvals}
          mainAuthor={authors[0]}
        />
      ))}
    </Box>
  );
}