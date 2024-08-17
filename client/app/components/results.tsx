import ResultItem from "./resultItem";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/app/lib/store";
import { upvoteEval } from "../utils/upvote";
import { Box, Divider, useToast, Text, Flex, CardBody, Card, Spacer } from "@chakra-ui/react";
import { IEvalListItemResponse } from "../lib/types";
import ItemDetails from "./itemDetails";
import { setUpvotedEval } from "../lib/store/dataSlice";


export default function Results({ evals, onUpvote }: { evals: IEvalListItemResponse[], onUpvote?: (payload: any) => void }) {
  const [evalId, setEvalId] = useState<number | null>(null);
  const accessToken = useSelector<IRootState, string>((state: IRootState) => state.auth.token);
  const toast = useToast();
  const dispatch = useDispatch();


  const callUpvoteEval = async (evalId: number) => {
    try {
      const response = await upvoteEval(accessToken, evalId);
      const payload = { id: evalId, upvotes: response.upvotes, upvoted: response.upvoted };
      dispatch(setUpvotedEval(payload));
      if (onUpvote) onUpvote(payload);
    } catch {
      toast({
        title: "Vote failed",
        description: "There is an error saving your vote. Please, try it again.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const openEvalView = (id: number) => {
    setEvalId(id);
  };

  return (
    <Flex>
      {evals.length == 0 ? (
        <Box w="100%"><Text size="lg" textAlign="center">No evals found</Text></Box>
      ) : (
        <Box w="50%">
          {evals.map(({
            id, name, description, validatorType, upvotes, upvoted, authors
          }) => (
            <Box key={`eval-${id}`} onClick={() => { openEvalView(id); }}>
              <ResultItem
                id={id}
                name={name}
                description={description ?? ''}
                validatorType={validatorType}
                upvotes={upvotes}
                upvoted={upvoted}
                onUpvote={() => callUpvoteEval(id)}
                mainAuthor={authors[0]}
              />
              <Divider />
            </Box>
          ))}
        </Box>
      )}
      <Spacer></Spacer>
      {evalId && (
        <Box w="40%" right={16} position='fixed' >
          <Card variant="outline">
            <CardBody>
              <ItemDetails evalId={evalId} />
            </CardBody>
          </Card>
        </Box>
      )}

    </Flex>
  );
}