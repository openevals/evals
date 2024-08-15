'use client';

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle
} from "react-resizable-panels";

import { useState, useEffect, useRef } from 'react';
import {
  Button,
  HStack,
  Kbd,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  TableCaption,
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
  Spinner,
  IconButton,
  Container,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Card,
  CardBody,
  useToast
} from '@chakra-ui/react';
import Results from './results';

import { getSupportedModels, postNewEval } from '@/app/utils/getEvalRun';

import dummyData from '@/app/utils/dummyData.json';
const { eval_runs } = dummyData;

import { MIN_EXAMPLES, MIN_INSTANCES } from '@/app/lib/constants';
import { ModelSystem, ValidatorType, TaskInstance, IModelResponse } from '@/app/lib/types';
import usePanels from "../lib/usePanels";

import useEvalResults from "../lib/hooks/useEvalResults";
import EvalRunResults from "./evalRunResults";
import { IRootState } from "../lib/store";
import { useSelector } from "react-redux";


export default function Editor() {
  // step 1 = enter meta info
  // step 2 = add task instances
  // step 3 = run results
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [outputDescription, setOutputDescription] = useState('');
  const [validator, setValidator] = useState<ValidatorType | ''>('');
  const [models, setModels] = useState<IModelResponse[]>([]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [instances, setInstances] = useState<TaskInstance[]>([]);
  const [evalName, setEvalName] = useState<string>('');
  const [evalId, setEvalId] = useState<number>(0);
  const [evalRunIds, setEvalRunIds] = useState<number[]>([]);
  const toast = useToast();
  const isAuthenticated = useSelector<IRootState, string>((state: IRootState) => state.auth.isAuthenticated);
  const accessToken = useSelector<IRootState, string>((state: IRootState) => state.auth.token);


  const [panel1Ref, panel2Ref, panel3Ref, panel2Collapsed, setPanel2Collapsed] = usePanels(step);

  useEffect(() => {
    const getModels = async () => {
      const models = await getSupportedModels();
      models.forEach((model: Omit<IModelResponse, 'checked'>) => {
        (model as IModelResponse).checked = false;
      });
      setModels(models);
    };
    getModels();
  }, []);

  const toggleSpinner = () => {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
      loadingSpinner.hidden = !loadingSpinner.hidden;
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Not authorized",
        description: "You should authenticate with your account first to create new evaluations.",
        status: "error",
        isClosable: true,
        duration: 9000,
      });
      return;
    }
    toggleSpinner();
    const checkedModels = models.filter((model) => model.checked);
    const modelSystems: ModelSystem[] = checkedModels.map((model) => ({
      modelId: model.id,
      systemPrompt: systemPrompt,
      userPrompt: userPrompt,
    }));
    // TODO: error handling
    if (validator === '') {
      return;
    }


    console.log('name:', name);
    console.log('validator:', validator);
    console.log('models:', models);
    console.log('systemPrompt:', systemPrompt);
    console.log('userPrompt:', userPrompt);
    console.log('inputText:', inputText);
    console.log('outputText:', outputText);
    console.log('instances:', instances);
    const newEval = await postNewEval(accessToken, {
      name,
      description: `Input: ${inputDescription}\nOutput: ${outputDescription}`,
      validatorType: validator,
      modelSystems,
      taskInstances: instances,
    });

    /* Show results and keep polling until eval run is finished */
    setEvalName(newEval.name)
    setEvalId(newEval.id)
    console.log(newEval)
    console.log(newEval.modelSystems.map((value: any) => value.id));
    setEvalRunIds(newEval.modelSystems.map((value: any) => value.id))
    setStep(3);
  }

  const addInstance = () => {
    if (inputText !== '' && outputText !== '') {
      const newInstance: TaskInstance = {
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
        <Panel collapsible={true} collapsedSize={2} defaultSize={64} minSize={24} ref={panel1Ref}>
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
              {step === 1 && (
                <Button float='right' onClick={() => { if (step === 1) setStep(2) }}>Next</Button>
              )}
            </HStack>
            <Accordion pt={2} allowMultiple defaultIndex={[0, 1, 2]}>
              <AccordionItem py={2} border='none'>
                <h2>
                  <AccordionButton>
                    <Box as='span' flex='1' textAlign='left'>
                      <Heading size='sm'>Description</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <HStack w='100%'>
                    <VStack w='50%'>
                      <Text>Input</Text>
                      <Textarea
                        placeholder='Linear algebra equation in Latex'
                        value={inputDescription}
                        onChange={(e) => setInputDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </VStack>
                    <VStack w='50%'>
                      <Text>Ideal Output</Text>
                      <Textarea
                        placeholder='Answer only in Latex'
                        value={outputDescription}
                        onChange={(e) => setOutputDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </VStack>
                  </HStack>

                </AccordionPanel>
              </AccordionItem>
              <AccordionItem py={2} >
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
              <AccordionItem py={2} >
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
                    {models?.map((model) => (
                      <WrapItem key={model.modelName}>
                        <Checkbox
                          isChecked={model.checked}
                          onChange={(e) => {
                            model.checked = !model.checked;
                            setModels([...models]);
                          }}
                        >
                          {model.modelName}
                        </Checkbox>
                      </WrapItem>
                    ))}
                  </Wrap>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem py={2} borderBottom='none' >
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
            </Accordion>
          </Box>
        </Panel>
        <PanelResizeHandle />
        <Panel collapsible={true} collapsedSize={2} defaultSize={2} minSize={24} ref={panel2Ref} onExpand={() => { setPanel2Collapsed(false) }} onCollapse={() => { setPanel2Collapsed(true) }} >
          <Box w='100%' border='1px'
            borderColor='lightgray'
            gap={4}
            p={4}
            h='calc(100vh - 12rem)'
            overflowY='auto'
          >
            {!panel2Collapsed && (
              <>
                <HStack mx={2} position="sticky" top={0} bg="white" zIndex={1}>
                  <Box as='span' flex='1' textAlign='left'>
                    <Heading size='sm'>Task instances</Heading>
                  </Box>
                  <Button variant='outline' ml='auto' onClick={addInstance}>
                    <Kbd>cmd</Kbd> + <Kbd>enter</Kbd>
                    <Text ml={2}>Add task instance</Text>
                  </Button>
                  <Button ml='auto' onClick={handleSubmit}>
                    <Text>Submit</Text>
                  </Button>
                </HStack>
                <HStack w='100%' pt={8}>
                  <VStack w='50%'>
                    <Text>Input</Text>
                    <Textarea
                      placeholder='\frac{d}{dx}x^2'
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
                <Box pt={4}>
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
                    <Text pt={8} textAlign='center'>{`Add task instances! At least ${MIN_INSTANCES} examples, ideally more 🧪`}</Text>
                  )}

                </Box>
              </>
            )}
          </Box>
        </Panel>
        <PanelResizeHandle />
        <Panel collapsible={true} collapsedSize={2} defaultSize={32} minSize={24} ref={panel3Ref}>
          <Box w='100%' border='1px'
            borderColor='lightgray'
            borderRightRadius='md'
            h='calc(100vh - 12rem)'
            gap={4}
            p={4}>
            <Container
              w='100%'
              overflowY='auto'
            >
              <Tabs defaultIndex={1}>
                <TabList position="sticky" top={0} zIndex={1} bg="white">
                  <Tab>Feed</Tab>
                  <Tab>How to use</Tab>
                  {step === 3 && (
                    <Tab>Results</Tab>
                  )}
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
                    <Card variant='outline'>
                      <CardBody>
                        <Heading size='md'>OpenEvals: Community-owned AI model evaluations!</Heading>
                        <Text my={4}>OpenEvals provides an aggregated set of real-world, practical, and uncontaminated evals. 💛</Text>
                        <Heading size='md'>How to use this editor:</Heading>
                        <Text my={4}>This is an editor to create, edit, and save evals to learn how a specific AI model performs for your needs.</Text>
                        <Text>We welcome your submissions to OpenEvals! Once you contribute, your evaluation <i>results</i> are public for anyone to search, while <i>task instances</i> remain private and owned by you.</Text>
                        <Heading size='md' my={4}>Tips for submission:</Heading>
                        <Text>1. Choose an eval topic that you know well, e.g. you would be comfortable teaching.</Text>
                        <Text my={4}>2. Compare results for at least 3 models.</Text>
                        <Text>3. For fair comparison, change one variable (ex: model, system prompt, user prompt) and keep the others constant.</Text>
                        <Text my={4}>4. Add at least 15 task instances.</Text>
                        <Text>5. Double check ideal outputs for task instances.</Text>
                        <Text my={4}>Have fun!</Text>
                      </CardBody>
                    </Card>
                  </TabPanel>
                  {/* {step === 3 && ( */}
                  <EvalRunResults evalName={evalName} evalId={evalId} evalRunIds={evalRunIds} />
                  {/* )} */}
                </TabPanels>
              </Tabs>
            </Container>
          </Box>
        </Panel>
      </PanelGroup>
    </>
  )
}