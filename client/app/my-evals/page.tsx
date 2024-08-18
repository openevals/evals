'use client'; 
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IRootState } from "@/app/lib/store";
import { getUserEvals, getUserUpvotedEvals } from "../utils/getEvals";
import { Heading, Box, VStack } from "@chakra-ui/react";
import ResultItem from "../components/resultItem";
import { IEvalListItemResponse } from "../lib/types";

export default function MyEvals() {
  const [userEvals, setUserEvals] = useState<IEvalListItemResponse[]>([]);
  const [userVotedEvals, setUserVotedEvals] = useState<IEvalListItemResponse[]>([]);
  const accessToken = useSelector<IRootState, string>((state: IRootState) => state.auth.token);

  useEffect(() => {
    if (accessToken) {
      const getUserEvalInfo = async () => {
        const uEvals: IEvalListItemResponse[]  = await getUserEvals(accessToken);
        const uUpvotedEvals: IEvalListItemResponse[] = await getUserUpvotedEvals(accessToken);
        if (uEvals.length > 0) {
          setUserEvals(uEvals);
        }
        if (uUpvotedEvals.length > 0) {
          setUserVotedEvals(uUpvotedEvals);
        }
      };
      getUserEvalInfo();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return (
    <Box w='100%' p={4}>
      <Heading ml={4} size='lg'>My Created Evals</Heading>
      {userEvals && userEvals.map(({
        id, name, description, validatorType, upvotes, upvoted
      }) => (
        <ResultItem
          key={name}
          name={name}
          id={id}
          description={description ?? ''}
          validatorType={validatorType}
          upvotes={upvotes}
          upvoted={upvoted}
          onUpvote={() => { console.log('TODO'); }}
        />
      ))}
      <Heading ml={4} size='lg'>My Upvotes</Heading>
      {userVotedEvals && userVotedEvals.map(({
        id, name, description, validatorType, upvotes, upvoted
      }) => (
        <ResultItem
          key={name}
          id={id}
          name={name}
          description={description ?? ''}
          validatorType={validatorType}
          upvotes={upvotes}
          upvoted={upvoted}
          onUpvote={() => { console.log('TODO');}}
        />
      ))}
    </Box>
  );
}