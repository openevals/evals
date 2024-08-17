import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IRootState } from "@/app/lib/store";
import { getUserEvals, getUserUpvotedEvals } from "../utils/getEvals";
import { Heading } from "@chakra-ui/react";
import ResultItem from "./resultItem";
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
          setUserEvals(userEvals);
        }
        if (uUpvotedEvals.length > 0) {
          setUserVotedEvals(uUpvotedEvals);
        }
      };
      getUserEvalInfo();
    }
  });

  return (
    <>
      <Heading size='lg'>Your Evals</Heading>
      <Heading size='md'>Created Evals</Heading>
      <>
        {userEvals && userEvals.map(({
          id, name, description, validatorType, upvotes, upvoted
        }) => (
          <ResultItem
            id={id}
            key={name}
            name={name}
            description={description ?? ''}
            validatorType={validatorType}
            upvotes={upvotes}
            upvoted={upvoted}
            onUpvote={() => { console.log('TODO'); }}
          />
        ))}
      </>
      <Heading size='md'>Upvoted Evals</Heading>
      <>
        {userVotedEvals && userVotedEvals.map(({
          id, name, description, validatorType, upvotes, upvoted
        }) => (
          <ResultItem
            id={id}
            key={name}
            name={name}
            description={description ?? ''}
            validatorType={validatorType}
            upvotes={upvotes}
            upvoted={upvoted}
            onUpvote={() => {}} 
          />
        ))}
      </>          
    </>
  );
}