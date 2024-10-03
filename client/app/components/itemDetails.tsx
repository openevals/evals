"use client";

import {
  Heading,
  Text,
  Button,
  Stack,
  StackDivider,
  Box,
  Tag,
  Wrap,
  HStack,
  VStack,
  Center,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { getEvalItem } from "../utils/getEvalItem";
import { IEvalResponse, IModelResponse } from "../lib/types";
import EvalRunResults from "./evalRunResults";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../lib/store";
import { defaultEvalItem } from "../lib/constants";
import { setEvalToTry } from "../lib/store/dataSlice";

export default function ItemDetails({ evalId }: { evalId?: number }) {
  const [evalItem, setEvalItem] = useState<IEvalResponse>(defaultEvalItem);
  const models = useSelector<IRootState, IModelResponse[]>(
    (state: IRootState) => state.data.models,
  );
  const [modelMap, setModelMap] = useState<Record<number, string>>({});
  const [runIds, setRunIds] = useState<number[]>([]);
  const params: { id: string } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    /* Get the id parameter */
    const id = evalId ?? parseInt(params.id, 10);
    if (!Number.isInteger(id)) {
      router.push("/");
      return;
    }

    /* Load the eval details by the given ID */
    const getEvalInfo = async () => {
      const e = await getEvalItem(id);
      setEvalItem(e);
      setRunIds(e.modelSystems.map((value: any) => value.id));
    };
    getEvalInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evalId]);

  useEffect(() => {
    const map: Record<number, string> = {};
    models.forEach((model) => {
      map[model.id] = model.modelName;
    });
    setModelMap(map);
  }, [models]);

  const tryEval = () => {
    dispatch(setEvalToTry(evalItem));
    router.push("/");
  };

  return (
    <>
      <Wrap>
        <Box p={4} w={{ base: "100%", md: "400px" }}>
          <HStack>
            <Heading size="lg">{evalItem.name}</Heading>
            <Button ml={2} minW="100px" onClick={tryEval}>
              Try Eval
            </Button>
          </HStack>
          <Stack divider={<StackDivider />} spacing="4" py={8}>
            <Box>
              <Heading size="xs">
                <Stack direction={["row"]}>
                  <Text>Method to evaluate: </Text>
                  <Tag>{evalItem.validatorType}</Tag>
                </Stack>
              </Heading>
            </Box>
            <Box>
              <Heading size="xs">Description:</Heading>
              <Text pt="2" fontSize="sm">
                {evalItem.description}
              </Text>
            </Box>
            <Box>
              <Heading size="xs">Models tested:</Heading>
              <Text pt="2" fontSize="sm">
                {evalItem.modelSystems.length > 0 ? (
                  evalItem.modelSystems.map((ms: any) => (
                    <Tag key={`model-tag-${ms.id}`} mr={2} mb={2}>
                      {modelMap[ms.modelId]}
                    </Tag>
                  ))
                ) : (
                  <Text>None</Text>
                )}
              </Text>
            </Box>
            <Box>
              <Heading size="xs">Prompts used:</Heading>
              <Text pt="2" fontSize="sm">
                {/* TODO: Right now this only queries the first */}
                {evalItem.modelSystems.length > 0 &&
                  (evalItem.taskInstances[0]?.systemPrompt ? (
                    <Text>
                      System prompt: {evalItem.taskInstances[0].systemPrompt}
                    </Text>
                  ) : (
                    <Text>None</Text>
                  ))}
              </Text>
            </Box>
            <Box>
              <Heading size="xs">Authors:</Heading>
              <Text pt="2" fontSize="sm">
                {evalItem.authors.map((a) => (
                  <Text key={`author-item-${a.id}`}>{a.username}</Text>
                ))}
              </Text>
            </Box>
            <Box>
              <Heading size="xs">Contributors:</Heading>
              <Text pt="2" fontSize="sm">
                {evalItem.contributors.map((a) => (
                  <Text key={`contributor-item-${a.id}`}>{a.username}</Text>
                ))}
              </Text>
            </Box>
          </Stack>
        </Box>
        <Box
          p={4}
          w={{ base: "100%", lg: "70%" }}
          maxW={{ base: "100%", lg: "70%" }}
        >
          <Heading size="md" mb={6}>
            Task Instances
          </Heading>
          <Box
            maxH="60vh"
            overflowY="auto"
            border="1px"
            borderRadius="md"
            borderColor="lightgray"
          >
            <TableContainer maxW="100%">
              <Box position="relative">
                <Table layout="fixed" width="100%">
                  <Thead
                    position="sticky"
                    top={0}
                    bg="white"
                    zIndex={2}
                    boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                  >
                    <Tr>
                      <Th width="50%">Input</Th>
                      <Th width="50%">Ideal Output</Th>
                    </Tr>
                  </Thead>
                </Table>
                <Box maxHeight="calc(60vh - 40px)" overflowY="auto">
                  <Table layout="fixed" width="100%">
                    <Tbody>
                      {evalItem.taskInstances.map((instance) => (
                        <Tr key={`task-instance-${instance.id}`}>
                          <Td width="50%">
                            <Box overflowWrap="break-word" whiteSpace="normal">
                              {instance.input}
                            </Box>
                          </Td>
                          <Td width="50%">
                            <Box overflowWrap="break-word" whiteSpace="normal">
                              {instance.ideal}
                            </Box>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TableContainer>
          </Box>
        </Box>
        <Box p={4} minW="70%">
          {runIds.length > 0 ? (
            <EvalRunResults
              evalId={evalItem.id}
              evalName={evalItem.name}
              evalRunIds={runIds}
              taskInstances={evalItem.taskInstances}
            />
          ) : (
            <Center>
              <VStack>
                <Text>
                  No model systems have been tested on this eval yet. Would you
                  like to be the first?
                </Text>
                <Button ml={2} minW="100px" onClick={tryEval}>
                  Try Eval
                </Button>
              </VStack>
            </Center>
          )}
        </Box>
      </Wrap>
    </>
  );
}
