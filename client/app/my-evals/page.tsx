"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/app/lib/store";
import {
  getUserCreatedEvals,
  getUserContributedEvals,
} from "../utils/getEvals";
import { Heading, Box, Text, Link } from "@chakra-ui/react";
import ResultItem from "../components/search/resultItem";
import { IEvalListItemResponse, IVoteResult } from "../lib/types";
import { deleteEval } from "../lib/store/dataSlice";

export default function MyEvals() {
  const [userEvals, setUserEvals] = useState<IEvalListItemResponse[]>([]);
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
        setUserEvals(uEvals);
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
    setUserVotedEvals(
      evals.filter((value: IEvalListItemResponse) => value.upvoted),
    );
  }, [evals]);

  const onDeleteEval = (evalId: number) => {
    setUserEvals((prevValues) => {
      return prevValues.filter((value) => value.id !== evalId);
    });
    dispatch(deleteEval(evalId));
  };

  const updateEvals = (payload: IVoteResult) => {
    setUserEvals((prevValues) => {
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
    <Box w="100%" p={4} maxW="1200px" margin="0 auto">
      <Heading size="lg" mb={8} textAlign="center">
        My Evals
      </Heading>
      <Box>
        {userEvals?.length > 0 ? (
          userEvals.map(
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
                mainAuthor={authors[0] ?? null}
                canDelete={true}
                onDelete={onDeleteEval}
                onClick="ItemDetail"
              />
            ),
          )
        ) : (
          <Link href="/" color="gray" fontWeight="bold" textDecoration="none">
            Create your first eval!
          </Link>
        )}
      </Box>
      <Heading size="lg" my={8} textAlign="center">
        Contributed Evals
      </Heading>
      <Box>
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
                onClick="ItemDetail"
              />
            ),
          )
        ) : (
          <Link
            href="/evals"
            color="gray"
            fontWeight="bold"
            textDecoration="none"
          >
            Browse evals to see what you&apos;d like to contribute model runs
            to.
          </Link>
        )}
      </Box>
      <Heading size="lg" my={8} textAlign="center">
        Liked Evals
      </Heading>
      <Box>
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
          <Link
            href="/evals"
            color="gray"
            fontWeight="bold"
            textDecoration="none"
          >
            Browse evals to see what you&apos;d like to upvote.
          </Link>
        )}
      </Box>
    </Box>
  );
}
