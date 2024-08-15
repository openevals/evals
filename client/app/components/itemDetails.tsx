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
import { IEvalRunResponse, ValidatorType } from '../lib/types';
import EvalRunResults from './evalRunResults';
import InstanceOutputResults from './instanceOutputResults';

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
      const e = await getEvalItem(288); // TODO
      setEvalItem(e);

      setRunIds(e.modelSystems.map((value: any) => value.id));

    }
    getEvalInfo();
  }, []);

  return (
    <>
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
                    <Stack direction={['row']}>
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
                    Models tested: (TODO)
                  </Heading>
                  <Text pt='2' fontSize='sm'>
                    {evalItem.modelSystems.map((ms) => (
                      <Tag>{ms.modelId}</Tag>
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
                  <Heading size='xs' textTransform='uppercase'>
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
            </CardBody>
          </Card>
        </Stack>
        <Stack>
          <Card variant="outline">
            <CardHeader>
              <Heading size='lg'>Task instances</Heading>
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
    </>
  )
}