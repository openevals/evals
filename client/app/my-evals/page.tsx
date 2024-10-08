"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/app/lib/store";
import {
  getUserCreatedEvals,
  getUserContributedEvals,
} from "../utils/getEvals";
import { Heading, Box, Text } from "@chakra-ui/react";
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
    setUserVotedEvals(evals.filter((value) => value.upvoted));
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
    <Box w="100%" p={4}>
      <Heading ml={4} size="lg">
        My Created Evals
      </Heading>
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
            />
          ),
        )
      ) : (
        <Text ml={4} my={4}>
          User has not created any evals
        </Text>
      )}
      <Heading ml={4} size="lg">
        My Contributed Evals
      </Heading>
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
            />
          ),
        )
      ) : (
        <Text ml={4} my={4}>
          User has not contributed to any evals
        </Text>
      )}
      <Heading ml={4} size="lg">
        My Upvotes
      </Heading>
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
        <Text ml={4} my={4}>
          User has not voted on any evals
        </Text>
      )}
    </Box>
  );
}
