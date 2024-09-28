"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/app/lib/store";
import {
  getUserCreatedEvals,
  getUserContributedEvals,
} from "../utils/getEvals";
import { Heading, Box, Text, Link } from "@chakra-ui/react";
import ResultItem from "../components/resultItem";
import { IEvalListItemResponse, IVoteResult } from "../lib/types";
import { deleteEval } from "../lib/store/dataSlice";

export default function MyEvals() {
  const [userCreatedEvals, setUserCreatedEvals] = useState<
    IEvalListItemResponse[]
  >([]);
  const [userContributedEvals, setUserContributedEvals] = useState<
    IEvalListItemResponse[]
  >([]);
  const [userVotedEvals, setUserVotedEvals] = useState<IEvalListItemResponse[]>(
    [],
  );
  const accessToken = useSelector<IRootState, string>(
    (state: IRootState) => state.auth.token,
  );
  const evals = useSelector<IRootState, IEvalListItemResponse[]>(
    (state: IRootState) => state.data.evals,
  );
  const dispatch = useDispatch();

  const loadData = async () => {
    if (accessToken) {
      // Load user created evals
      const uEvals: IEvalListItemResponse[] =
        await getUserCreatedEvals(accessToken);
      if (uEvals.length > 0) {
        setUserCreatedEvals(uEvals);
      }
      // Load user contributed evals
      const uContEvals: IEvalListItemResponse[] =
        await getUserContributedEvals(accessToken);
      if (uContEvals.length > 0) {
        setUserContributedEvals(uContEvals);
      }
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUserVotedEvals(evals.filter((value: IEvalListItemResponse) => value.upvoted));
  }, [evals]);

  const onDeleteEval = (evalId: number) => {
    setUserCreatedEvals((prevValues) => {
      return prevValues.filter((value) => value.id !== evalId);
    });
    dispatch(deleteEval(evalId));
  };

  const updateEvals = (payload: IVoteResult) => {
    setUserCreatedEvals((prevValues) => {
      return prevValues.map((value) => {
        if (value.id === payload.id) {
          value.upvotes = payload.upvotes;
          value.upvoted = payload.upvoted;
        }
        return value;
      });
    });
    setUserContributedEvals((prevValues) => {
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
    <Box w='100%' p={4} mx={{ base: 0, md: 4 }} maxW="1200px" margin="0 auto">
      <Heading size='lg' >My Created Evals</Heading>
      <Box my={8}>
      {userCreatedEvals?.length > 0 ? (
        userCreatedEvals.map(
          ({
            id,
            name,
            description,
            validatorType,
            upvotes,
            upvoted,
            authors,
          }) => (
            <ResultItem
              key={`my-evals-${id}`}
              name={name}
              id={id}
              description={description ?? ""}
              validatorType={validatorType}
              upvotes={upvotes}
              upvoted={upvoted}
              onVote={updateEvals}
              mainAuthor={authors[0]}
              canDelete={true}
              onDelete={onDeleteEval}
              onClick='ItemDetail'
            />
          ),
        )
      ) : (
        <Link href="/" color="gray" fontWeight="bold">Create your first eval!</Link>
      )}
      </Box>
      <Heading size="lg">My Contributed Evals</Heading>
      <Box my={8}>
      {userContributedEvals?.length > 0 ? (
        userContributedEvals.map(
          ({
            id,
            name,
            description,
            validatorType,
            upvotes,
            upvoted,
            authors,
          }) => (
            <ResultItem
              key={`my-contributed-evals-${id}`}
              name={name}
              id={id}
              description={description ?? ""}
              validatorType={validatorType}
              upvotes={upvotes}
              upvoted={upvoted}
              onVote={updateEvals}
              mainAuthor={authors[0]}
              onClick='ItemDetail'
            />
          ),
        )
      ) : (
        <Text ml={4} my={4}>
          User has not contributed to any evals
        </Text>
      )}
      </Box>
      <Heading size="lg">My Upvotes</Heading>
      <Box my={8}>
      {userVotedEvals?.length > 0 ? (
        userVotedEvals.map(
          ({
            id,
            name,
            description,
            validatorType,
            upvotes,
            upvoted,
            authors,
          }) => (
            <ResultItem
              key={`voted-evals-${id}`}
              id={id}
              name={name}
              description={description ?? ""}
              validatorType={validatorType}
              upvotes={upvotes}
              upvoted={upvoted}
              onVote={updateEvals}
              mainAuthor={authors[0]}
            />
          ),
        )
      ) : (
        <Link href="/evals" color="gray" fontWeight="bold">Browse evals to see what you'd like to upvote.</Link>
      )}
      </Box>
    </Box>
  );
}
