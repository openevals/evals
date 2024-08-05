'use client';

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

import { useState } from 'react';
import {
  Button, 
  Grid, 
  GridItem, 
  HStack, 
  Kbd,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Textarea,
  VStack,
  Spacer,
  Input,
  Checkbox,
  Text,
  Wrap,
  WrapItem,
  Select,
  Progress,
  Spinner,
  IconButton,
  Container, 
  Tabs, 
  TabList,
  Tab, 
  TabPanels, 
  TabPanel, 
  Card, 
  CardBody
} from '@chakra-ui/react';
import RunResults from "./runResults";
import Results from './results';

import dummyData from '../utils/dummyData.json';
const { eval_runs } = dummyData;
const filteredEvalRuns = eval_runs.map(({ model, score }) => ({ model, score }));

import { InfoOutlineIcon } from '@chakra-ui/icons';
import { MIN_EXAMPLES, MIN_INSTANCES, ValidatorType, ModelName, TaskInstanceInput } from '../lib/constants';

export default function Editor() {

  const [name, setName] = useState('');
  const [validator, setValidator] = useState<ValidatorType | ''>('');
  const [models, setModels] = useState<ModelName[]>([ModelName.GPT_4]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [instances, setInstances] = useState<TaskInstanceInput[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);

  // useEffect(() => {
  //   // Calculate progress based on the completeness of the form
  //   let progress = 0;
  //   if (name) progress += 20;
  //   if (validator) progress += 20;
  //   if (models.length > 0) progress += 20;
    
  //   let instanceProgress = 0;
  //   const incrementalProgress = 20 / MIN_INSTANCES;
    
  //   for (let i = 0; i < instances.length && i < MIN_INSTANCES; i++) {
  //     instanceProgress += incrementalProgress;
  //   }
  //   progress += instanceProgress;
    
  //   const checkedExamples = instances.filter(instance => instance.input && instance.output).length;
  //   if (checkedExamples >= MIN_EXAMPLES) progress += 20;

  //   // Update the progress bar
  //   setProgressPercent(progress);
  // }, [name, validator, models, instances]);

  const toggleSpinner = () => {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
      loadingSpinner.hidden = !loadingSpinner.hidden;
    }
  };

  const handleSubmit = () => {
    toggleSpinner();
    console.log('name:', name);
    console.log('validator:', validator);
    console.log('models:', models);
    console.log('systemPrompt:', systemPrompt);
    console.log('userPrompt:', userPrompt);
    console.log('inputText:', inputText);
    console.log('outputText:', outputText);
    console.log('instances:', instances);
    console.log('progressPercent:', progressPercent);
    
    // TODO: POSTs to (1) submit the eval with instances (2) get model results

  }

  const addInstance = () => {
    if (inputText !== '' && outputText !== '') {
      const newInstance: TaskInstanceInput = {
        isPublic: false,
        input: inputText,
        ideal: outputText,
      };
      setInstances([...instances, newInstance]);
      setInputText('');
      setOutputText('');
      
    } else {
      console.error('Input text and output text must not be empty')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      addInstance();
    }
  };

  return (
    <>
     <PanelGroup direction="horizontal">
        <Panel defaultSize={64} minSize={60}>
          <Box w='100%' border='1px'
              borderColor='lightgray'
              borderLeftRadius='md' 
              gap={4}
              p={4}
              h='calc(100vh - 12rem)'
              overflowY='auto'
              >
            <HStack mx={2} position="sticky" top={0} bg="white" zIndex={1}>
              <Input variant='flushed' placeholder={`Your eval name, e.g. "Linear algebra problems"`} maxW='384px' value={name} onChange={(e) => setName(e.target.value)} />
              <Spacer />
              <Spinner id='loadingSpinner' hidden />
              <IconButton variant='link' aria-label="Info on submit" icon={<InfoOutlineIcon/>} />
              <Button float='right'>Submit eval</Button>  
            </HStack>
            <Accordion allowMultiple defaultIndex={[0,1]}>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as='span' flex='1' textAlign='left'>
                      <Heading size='sm'>Method to evaluate</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Select placeholder='Select validator type' value={validator} onChange={(e) => setValidator(e.target.value as ValidatorType)}>
                    {Object.values(ValidatorType).map((validatorType) => (
                      <option key={validatorType} value={validatorType}>
                        {validatorType}
                      </option>
                    ))}
                  </Select>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as='span' flex='1' textAlign='left'>
                    <Heading size='sm'>Models to test</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Wrap direction='column'>
                    {Object.values(ModelName).map((modelName) => (
                      <WrapItem key={modelName}>
                        <Checkbox
                          isChecked={models.includes(modelName)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModels([...models, modelName]);
                            } else {
                              setModels(models.filter((m) => m !== modelName));
                            }
                          }}
                        >
                          {modelName}
                        </Checkbox>
                      </WrapItem>
                    ))}
                  </Wrap>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as='span' flex='1' textAlign='left'>
                    <Heading size='sm'>Prompts</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <HStack>
                    <VStack w='100%'>
                      <Text>System Prompt (Recommended)</Text>
                      <Textarea 
                        placeholder='You are a mathematics professor at MIT.'
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                      />
                    </VStack>
                    <VStack w='100%'>
                      <Text>User Prompt (Optional)</Text>
                      <Textarea
                        placeholder='Solve linear algebra problems by responding with the numeric answer only.'
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                      />
                    </VStack>
                  </HStack>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as='span' flex='1' textAlign='left'>
                    <Heading size='sm'>Task instances</Heading>
                    </Box>
                    <Button ml='auto' onClick={addInstance}>
                        <Kbd>cmd</Kbd> + <Kbd>enter</Kbd>
                        <Text>Add task instance</Text>
                      </Button>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <HStack w='100%'>
                    <VStack w='50%'>
                      <Text>Input</Text>
                      <Textarea 
                        placeholder='Derivative of x^2'
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        />
                    </VStack>
                    <VStack w='50%'>
                      <Text>Ideal Output</Text>
                      <Textarea 
                        placeholder='2x'
                        value={outputText}
                        onChange={(e) => setOutputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </VStack>
                  </HStack>
            
                </AccordionPanel>
              </AccordionItem>

            </Accordion>
          </Box>
        </Panel>
        <PanelResizeHandle />
        <Panel collapsible={true} defaultSize={32} minSize={20}>
          <Box w='100%' border='1px'
              borderColor='lightgray'
              borderRightRadius='md' 
              gap={4}
              p={4}>
            <Container 
              h='calc(100vh - 12rem)'
              w='100%'
              overflowY='auto'
            >
              <Tabs defaultIndex={1}>
                <TabList position="sticky" top={0} zIndex={1} bg="white">
                  <Tab>Feed</Tab>
                  <Tab>How to use</Tab>
                  <Tab>Task instances</Tab>
                  <Tab>Results</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel textAlign='center'>
                    <Card variant="outline">
                      <CardBody>
                        <Text>Newest! Contribute to SWE-bench</Text>
                        <Button mt={4}>Contribute</Button>
                      </CardBody>
                    </Card>
                    <Heading size="md" pt={8}><i>Trending</i></Heading>
                    <Results />
                  </TabPanel>
                  <TabPanel>
                    How this works
                  </TabPanel>
                  <TabPanel>
                    {instances.length > 0 ? (
                      <TableContainer
                      border='1px'
                      borderRadius='md'
                      borderColor='lightgray'>
                        <Table>
                          <Thead>
                            <Tr>
                              <Th>Public?</Th>
                              <Th>Input</Th>
                              <Th>Ideal Output</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {instances.map((instance, index) => (
                              <Tr key={index}>
                                <Td>
                                  <Checkbox 
                                    isChecked={instance.isPublic}
                                    onChange={(e) => {
                                      const updatedInstances = [...instances];
                                      updatedInstances[index].isPublic = e.target.checked;
                                      setInstances(updatedInstances);
                                    }}
                                  />
                                </Td>
                                <Td>{instance.input}</Td>
                                <Td>{instance.ideal}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Text>Your added instances will appear here! ☺️</Text>
                    )}
                  </TabPanel>
                  <TabPanel>
                    <RunResults runs={filteredEvalRuns} evalName={'Eval Name'}/>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Container>
          </Box>
        </Panel>
      </PanelGroup>
    </>
  )
}