'use client';

import {
  Heading,
  Text,
  Button,
  Stack,
  StackDivider,
  Box,
  Tag,
  Wrap,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { getEvalItem } from '../utils/getEvalItem';
import { IEvalResponse, IModelResponse, ValidatorType } from '../lib/types';
import EvalRunResults from './evalRunResults';
import { useParams } from 'next/navigation';
import React from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '../lib/store';

const defaultEvalItem = {
  id: 0,
  name: '',
  description: '',
  validatorType: ValidatorType.ExactMatch,
  taskInstances: [],
  modelSystems: [],
  authors: []
};


export default function ItemDetails() {
  const [evalItem, setEvalItem] = useState<IEvalResponse>(defaultEvalItem);
  const models = useSelector<IRootState, IModelResponse[]>((state: IRootState) => state.data.models);
  const [modelMap, setModelMap] = useState<Record<number, string>>({});
  const [runIds, setRunIds] = useState<number[]>([]);
  const params: { id: string } = useParams();

  useEffect(() => {
    /* Get the id parameter */
    const id = parseInt(params.id, 10);
    if (!Number.isInteger(id)) {
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
  }, []);

  useEffect(() => {
    const map: Record<number, string> = {};
    models.forEach((model) => {
      map[model.id] = model.modelName;
    });
    setModelMap(map);
  }, [models]);

  return (
    <>
      <Wrap>
        <Box p={4} w='400px'>
          <Heading size='lg'>{evalItem.name}</Heading>
          <Stack divider={<StackDivider />} spacing='4'>
            <Box>
              <Heading size='xs'>
                <Stack direction={['row']}>
                  <Text>Method to evaluate: </Text>
                  <Tag>{evalItem.validatorType}</Tag>
                </Stack>
              </Heading>
            </Box>
            <Box>
              <Heading size='xs'>
                Description:
              </Heading>
              <Text pt='2' fontSize='sm'>
                {evalItem.description}
              </Text>
            </Box>
            <Box>
              <Heading size='xs'>
                Models tested: (TODO)
              </Heading>
              <Text pt='2' fontSize='sm'>
                {evalItem.modelSystems.map((ms: any) => (
                  <Tag key={`model-tag-${ms.id}`} mr={2} mb={2}>{modelMap[ms.modelId]}</Tag>
                ))}
              </Text>
            </Box>
            <Box>
              <Heading size='xs'>
                Prompts used:
              </Heading>
              <Text pt='2' fontSize='sm'>
                {/* TODO: Right now this only queries the first */}
                {evalItem.modelSystems.length > 0 && (
                  <>
                    {evalItem.taskInstances[0].systemPrompt && (
                      <Text>System prompt: {evalItem.taskInstances[0].systemPrompt}</Text>
                    )}
                    {evalItem.taskInstances[0].userPrompt && (
                      <Text>User prompt: {evalItem.taskInstances[0].userPrompt}</Text>
                    )}
                  </>
                )}
              </Text>
            </Box>
            <Box>
              <Heading size='xs'>
                Authors:
              </Heading>
              <Text pt='2' fontSize='sm'>
                {evalItem.authors.map((a, idx) => (
                  <Text key={`author-item-${idx}`}>{a.username}</Text>
                ))}
                OpenAI
              </Text>
            </Box>
          </Stack>
        </Box>
        <Box p={4} minW='70%'>
          <EvalRunResults
            evalId={evalItem.id}
            evalName={evalItem.name}
            evalRunIds={runIds}
          />
          <Button mr={4}>Details</Button>
          <Button>Try Eval</Button>
        </Box>
      </Wrap>
    </>
  );
}