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
  Link
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { getEvalItem } from '../utils/getEvalItem';
import { IEvalResponse, IModelResponse } from '../lib/types';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../lib/store';
import { defaultEvalItem } from '../lib/constants';
import { setEvalToTry } from '../lib/store/dataSlice';
import { LinkIcon } from '@chakra-ui/icons';
import { RunSummary, ResultsSummary, ByModel, ByTaskInstance } from './tables/tables';
import useEvalResults from "../lib/hooks/useEvalResults";
import RunModal from './runModal';

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
  const [selectedTaskInstance, setSelectedTaskInstance] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');

  const { evalRuns, allRunsCompleted } = useEvalResults(evalItem.id, runIds);
  const [taskMap, setTaskMap] = useState<Record<number, any>>({});

  useEffect(() => {
    if (evalItem && evalItem.modelSystems) {
      const selectedModelIds = evalItem.modelSystems.map(system => system.modelId);
      const selectedModels = models.filter(model => selectedModelIds.includes(model.id));
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

  useEffect(() => {
    const map: Record<number, any> = {};
    evalItem.taskInstances.forEach((value) => {
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
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast({
        title: "Copied link to eval",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }).catch((err) => {
      console.error('Failed to copy: ', err);
      toast({
        title: "Failed to copy link",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    });
  };

  const handleModelSelection = (modelId: number, isChecked: boolean) => {
    if (isChecked) {
      const modelToAdd = models.find(model => model.id === modelId);
      if (modelToAdd) {
        setRunModels(prevModels => [...prevModels, modelToAdd]);
      }
    } else {
      setRunModels(prevModels => prevModels.filter(model => model.id !== modelId));
    }
  };

  return (
    <>
      <Wrap m={{ base: 0, md: 8 }}>
        <Box p={4} pt={8} w={{base:"100%", md:"768px"}}>
          <Flex>
            <Heading size='lg'>{evalItem.name}</Heading>
            <Spacer />
            <HStack spacing={4}>
              <Button minW='100px' variant="ghost" onClick={tryEval}>Edit</Button>
              <Button variant="outline" onClick={copyLink}>
                <LinkIcon />  
                {!isMobile && <Text ml={2} >Copy Link</Text>}
              </Button>
              <RunModal evalItem={evalItem} models={models} runModels={runModels} handleModelSelection={handleModelSelection} />
            </HStack>
          </Flex>
          <Stack divider={<StackDivider />} spacing='4' py={8}>
            <Box>
              <Heading size='xs'>
                <Stack direction={['row']} alignItems="center">
                  <Text>Validator: </Text>
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
              <Heading size='xs'>
                System Prompt:
              </Heading>
              <Text pt='2' fontSize='sm'>
                {evalItem.taskInstances[0]?.systemPrompt ? (
                  <Text>{evalItem.taskInstances[0].systemPrompt}</Text>
                ) : (
                  <Text>None</Text>
                )}
              </Text>
            </Box>
            <Box>
              <Heading size='xs'>
                Models tested:
              </Heading>
              <Text pt='2' fontSize='sm'>
                {evalItem.modelSystems.length > 0 ? (
                  Array.from(new Set(evalItem.modelSystems.map((ms: any) => modelMap[ms.modelId]))).map((modelName: string) => (
                    <Tag key={`model-tag-${modelName}`} mr={2} mb={2}>{modelName}</Tag>
                  ))
                ) : (
                  <Text>None</Text>
                )}
              </Text>
            </Box>
            <Box>
              <Heading size='xs'>
                Authors:
              </Heading>
              <Text pt='2' fontSize='sm'>
                {evalItem.authors.map((a, idx) => (
                  <React.Fragment key={`author-item-${idx}`}>
                    <Text>
                      {a.username}
                      {` (`}
                      {a.githubLogin && (
                        <Link isExternal href={`https://github.com/${a.githubLogin}`}>@{a.githubLogin}</Link >
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
        <Stack p={8} pb={16} minW='100%' justifyContent="center" alignItems="center" spacing={12}>
          {runIds.length > 0 ? (
            <>
              <Stack direction={['column', 'column', 'row']} spacing={8} width="100%">
                <Box flex={1}>
                  <ResultsSummary evalRuns={evalRuns} />
                </Box>
                <Box flex={1}>
                  <RunSummary evalRuns={evalRuns} />
                </Box>
              </Stack>
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
            </>
          ) : (
            <Center>
              <VStack>
                <Text>No models have been tested on this eval yet. Would you like to be the first?</Text>
                <Button ml={2} minW='100px' onClick={tryEval}>Contribute Run</Button>
              </VStack>
            </Center>
          )}
        </Stack>
      </Wrap>
    </>
  );
}
