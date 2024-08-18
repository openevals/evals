import ResultItem from "./resultItem";
import { useState } from "react";
import { Box, Divider, Text, Flex, CardBody, Card, Spacer } from "@chakra-ui/react";
import { IEvalListItemResponse, IVoteResult } from "../lib/types";
import ItemDetails from "./itemDetails";

export default function Results({ evals, onVote }: { evals: IEvalListItemResponse[], onVote?: (payload: IVoteResult) => void }) {
  const [evalId, setEvalId] = useState<number | null>(null);

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
                onVote={onVote}
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