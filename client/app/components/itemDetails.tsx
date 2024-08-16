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
  Flex,
  Wrap,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { getEvalItem } from '../utils/getEvalItem';
import InstancesTable from './instancesTable';
import { IEvalRunResponse, ValidatorType } from '../lib/types';
import EvalRunResults from './evalRunResults';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

const defaultEvalItem = {
  id: 0,
  name: '',
  description: '',
  validatorType: ValidatorType.ExactMatch,
  taskInstances: [],
  modelSystems: [],
  authors: []
}

export default function ItemDetails() {
  const [evalItem, setEvalItem] = useState(defaultEvalItem);
  const [runIds, setRunIds] = useState<number[]>([]);

  useEffect(() => {
    const getEvalInfo = async () => {
      const e = await getEvalItem(1); // TODO
      setEvalItem(e);

      setRunIds(e.modelSystems.map((value: any) => value.id));

    }
    getEvalInfo();
  }, []);

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
                {evalItem.modelSystems.map((ms) => (
                  <Tag>{ms.modelId}</Tag>
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
                    {evalItem.modelSystems[0].systemPrompt && (
                      <Text>System prompt: {evalItem.modelSystems[0].systemPrompt}</Text>
                    )}
                    {evalItem.modelSystems[0].userPrompt && (
                      <Text>User prompt: {evalItem.modelSystems[0].userPrompt}</Text>
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
                {evalItem.authors.map((a) => (
                  <Text>{a.username}</Text>
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
          <Button>TODO: Try it out</Button>
        </Box>
      </Wrap>
    </>
  )
}