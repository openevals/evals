'use client';

import {
  SimpleGrid,
  Card,
  CardHeader,
  Heading,
  Text,
  CardBody,
  CardFooter,
  Button,
  Stack,
  StackDivider,
  Box,
  Tag,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { getEvalItem } from '../utils/getEvalItem';
import InstancesTable from './instancesTable';
import { IEvalResponse, IModelResponse, ValidatorType } from '../lib/types';
import EvalRunResults from './evalRunResults';
import InstanceOutputResults from './instanceOutputResults';
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
  const [evalItem, setEvalItem] = useState<IEvalResponse>(defaultEvalItem as any);
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
    <SimpleGrid spacing={4} templateColumns='repeat(auto-fill, minmax(30%, 1fr))'>
      <Stack direction={['column']}>
        <Card variant="outline">
          <CardHeader>
            <Heading size='lg'>{evalItem.name}</Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} spacing='4'>
              <Box>
                <Heading size='xs' textTransform='uppercase'>
                  <Stack direction={['row']} alignItems='center'>
                    <Text>Method to evaluate: </Text>
                    <Tag>{evalItem.validatorType}</Tag>
                  </Stack>
                </Heading>
              </Box>
              <Box>
                <Heading size='xs' textTransform='uppercase'>
                  Description:
                </Heading>
                <Text pt='2' fontSize='sm'>
                  {evalItem.description}
                </Text>
              </Box>
              <Box>
                <Heading size='xs' textTransform='uppercase'>
                  Models tested:
                </Heading>
                <Text pt='2' fontSize='sm'>
                  {evalItem.modelSystems.map((ms: any) => (
                    <Tag key={`model-tag-${ms.id}`} mr={2} mb={2}>{modelMap[ms.modelId]}</Tag>
                  ))}
                </Text>
              </Box>
              <Box>
                <Heading size='xs' textTransform='uppercase'>
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
                <Heading size='xs' textTransform='uppercase'>
                  Authors:
                </Heading>
                <Text pt='2' fontSize='sm'>
                  {evalItem.authors.map((a: any, idx) => (
                    <Text key={`author-item-${idx}`}>{a.username}</Text>
                  ))}
                  OpenAI
                </Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
      <Stack>
        <Card variant="outline">
          <CardHeader>
            <Heading size='md'>Task instances</Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} spacing='4'>
              <InstancesTable
                instances={evalItem.taskInstances}
              />
            </Stack>
          </CardBody>
        </Card>
        <Card variant="outline">
          <CardHeader>
            <Heading size='md'>Aggregate Results</Heading>
          </CardHeader>
          <CardBody>
            <EvalRunResults
              evalId={evalItem.id}
              evalName={evalItem.name}
              evalRunIds={runIds}
            />
          </CardBody>
          <CardFooter>
            <Button>TODO: Try it out</Button>
          </CardFooter>
        </Card>
      </Stack>
      <Card variant="outline">
        <CardHeader>
          <Heading size='md'>Model Results</Heading>
        </CardHeader>
        <CardBody>
          <InstanceOutputResults
            evalId={evalItem.id}
            evalName={evalItem.name}
            evalRunIds={runIds}
          />
        </CardBody>
        <CardFooter>
          <Button>TODO: Try it out</Button>
        </CardFooter>
      </Card>
    </SimpleGrid>
  );
}