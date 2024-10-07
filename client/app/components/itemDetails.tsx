"use client";

import {
  Heading,
  Text,
  Button,
  Stack,
  HStack,
  StackDivider,
  Box,
  Tag,
  Wrap,
  Flex,
  Spacer,
  VStack,
  Center,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useBreakpointValue,
  useToast,
  Link,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { getEvalItem } from "../utils/getEvalItem";
import {
  IAuthorResponse,
  IEvalResponse,
  IModelResponse,
  IModelSystemResponse,
  ITaskInstanceResponse,
  TaskInstance,
} from "../lib/types";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../lib/store";
import {
  defaultEvalItem,
  SYSTEM_PROMPT_EXPLANATION,
  SYSTEM_PROMPT_TITLE,
  VALIDATOR_EXPLANATION,
  VALIDATOR_TITLE,
} from "../lib/constants";
import { setEvalToTry } from "../lib/store/dataSlice";
import { LinkIcon } from "@chakra-ui/icons";
import {
  RunSummary,
  ResultsSummary,
  ByModel,
  ByTaskInstance,
} from "./tables/tables";
import useEvalResults from "../lib/hooks/useEvalResults";
import RunModal from "./runModal";
import InfoPopover from "./infoPopover";

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
  const toast = useToast();

  const [runModels, setRunModels] = useState<IModelResponse[]>([]);
  const [selectedTaskInstance, setSelectedTaskInstance] = useState<
    number | null
  >(null);
  const [selectedModel, setSelectedModel] = useState<string>("");

  const { evalRuns, allRunsCompleted } = useEvalResults(evalItem.id, runIds);
  const [taskMap, setTaskMap] = useState<Record<number, any>>({});

  useEffect(() => {
    if (evalItem && evalItem.modelSystems) {
      const selectedModelIds = evalItem.modelSystems.map(
        (system: IModelSystemResponse) => system.modelId,
      );
      const selectedModels = models.filter((model: IModelResponse) =>
        selectedModelIds.includes(model.id),
      );
    }
  }, [evalItem, models]);

  const isMobile = useBreakpointValue({ base: true, sm: true, md: false });

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
      setRunIds(e.modelSystems.map((value: IModelSystemResponse) => value.id));
    };
    getEvalInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evalId]);

  useEffect(() => {
    const map: Record<number, string> = {};
    models.forEach((model: IModelResponse) => {
      map[model.id] = model.modelName;
    });
    setModelMap(map);
  }, [models]);

  useEffect(() => {
    const map: Record<number, any> = {};
    evalItem.taskInstances.forEach((value: ITaskInstanceResponse) => {
      map[value.id] = value;
    });
    setTaskMap(map);
  }, [evalItem.taskInstances]);

  useEffect(() => {
    if (evalRuns.length > 0) {
      setSelectedModel(evalRuns[0].model.id.toString());
    }
  }, [evalRuns]);

  useEffect(() => {
    if (evalItem.taskInstances.length > 0) {
      setSelectedTaskInstance(evalItem.taskInstances[0].id);
    }
  }, [evalItem.taskInstances]);

  const tryEval = () => {
    dispatch(setEvalToTry(evalItem));
    router.push("/");
  };

  const copyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toast({
          title: "Copied link to eval",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Failed to copy link",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  };

  return (
    <>
      <Wrap m={{ base: 0, md: 8 }}>
        <Stack
          direction={{ base: "column", lg: "row" }}
          p={4}
          pt={8}
          spacing={{ base: 8, md: 4 }}
        >
          <Stack w={{ base: "100%", md: "768px" }}>
            <Flex>
              <Heading size="lg">{evalItem.name}</Heading>
              <Spacer />
              <HStack spacing={4}>
                <Button variant="ghost" width="fit-content" onClick={tryEval}>
                  Edit
                </Button>
                <Button variant="outline" onClick={copyLink}>
                  <LinkIcon />
                  {!isMobile && <Text ml={2}>Copy Link</Text>}
                </Button>
                <RunModal
                  evalItem={evalItem}
                  models={models}
                  runModels={runModels}
                  setModels={setRunModels}
                />
              </HStack>
            </Flex>
            <Stack divider={<StackDivider />} spacing="4" py={8}>
              <Box>
                <Heading size="xs">
                  <Stack direction={["row"]} alignItems="center">
                    <Text>Validator </Text>
                    <InfoPopover
                      title={VALIDATOR_TITLE}
                      content={VALIDATOR_EXPLANATION}
                    />
                  </Stack>
                </Heading>
                <Text pt="2">
                  <Tag>{evalItem.validatorType}</Tag>
                </Text>
              </Box>
              <Box>
                <Heading size="xs">Description</Heading>
                <Text pt="2" fontSize="sm">
                  {evalItem.description}
                </Text>
              </Box>
              <Box>
                <Heading size="xs">
                  <Stack direction={["row"]} alignItems="center">
                    <Text>System Prompt </Text>
                    <InfoPopover
                      title={SYSTEM_PROMPT_TITLE}
                      content={SYSTEM_PROMPT_EXPLANATION}
                    />
                  </Stack>
                </Heading>
                <Text pt="2" fontSize="sm">
                  {evalItem.taskInstances[0]?.systemPrompt ? (
                    <Text>{evalItem.taskInstances[0].systemPrompt}</Text>
                  ) : (
                    <Text>None</Text>
                  )}
                </Text>
              </Box>
              <Box>
                <Heading size="xs">Models tested</Heading>
                <Text pt="2" fontSize="sm">
                  {evalItem.modelSystems.length > 0 ? (
                    Array.from<string>(
                      new Set(
                        evalItem.modelSystems.map(
                          (ms: IModelSystemResponse) => modelMap[ms.modelId],
                        ),
                      ),
                    ).map((modelName: string) => (
                      <Tag
                        key={`model-tag-${modelName as string}`}
                        mr={2}
                        mb={2}
                      >
                        {modelName as string}
                      </Tag>
                    ))
                  ) : (
                    <Text>None</Text>
                  )}
                </Text>
              </Box>
              <Box>
                <Heading size="xs">Authors</Heading>
                <Text pt="2" fontSize="sm">
                  {evalItem.authors.map((a: IAuthorResponse) => (
                    <React.Fragment key={`author-item-${a.id}`}>
                      <Text>
                        {a.username}
                        {` (`}
                        {a.githubLogin && (
                          <Link
                            isExternal
                            href={`https://github.com/${a.githubLogin}`}
                          >
                            @{a.githubLogin}
                          </Link>
                        )}
                        {`)`}
                      </Text>
                    </React.Fragment>
                  ))}
                </Text>
              </Box>
              <Box>
                <Heading size="xs">Contributors:</Heading>
                <Text pt="2" fontSize="sm">
                  {evalItem.contributors.map((a: IAuthorResponse) => (
                    <Text key={`contributor-item-${a.id}`}>{a.username}</Text>
                  ))}
                </Text>
              </Box>
            </Stack>
          </Stack>
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
                        {evalItem.taskInstances.map(
                          (instance: ITaskInstanceResponse) => (
                            <Tr key={`task-instance-${instance.id}`}>
                              <Td width="50%">
                                <Box
                                  overflowWrap="break-word"
                                  whiteSpace="normal"
                                >
                                  {instance.input}
                                </Box>
                              </Td>
                              <Td width="50%">
                                <Box
                                  overflowWrap="break-word"
                                  whiteSpace="normal"
                                >
                                  {instance.ideal}
                                </Box>
                              </Td>
                            </Tr>
                          ),
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              </TableContainer>
            </Box>
          </Box>
        </Stack>
        <Stack
          p={8}
          pb={16}
          minW="100%"
          justifyContent="center"
          alignItems="center"
          spacing={12}
        >
          {runIds.length > 0 ? (
            <>
              <ResultsSummary evalRuns={evalRuns} />
              <ByTaskInstance
                evalRuns={evalRuns}
                taskInstances={evalItem.taskInstances}
                selectedTaskInstance={selectedTaskInstance}
                setSelectedTaskInstance={setSelectedTaskInstance}
              />
              <ByModel
                evalRuns={evalRuns}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                taskMap={taskMap}
              />
              <Box flex={1}>
                <RunSummary evalRuns={evalRuns} />
              </Box>
            </>
          ) : (
            <Center>
              <VStack>
                <Text>
                  No models have been tested on this eval yet. Would you like to
                  be the first?
                </Text>
                <Button ml={2} minW="100px" onClick={tryEval}>
                  Contribute Run
                </Button>
              </VStack>
            </Center>
          )}
        </Stack>
      </Wrap>
    </>
  );
}
