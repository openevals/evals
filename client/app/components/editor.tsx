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
  Stack,
  Kbd,
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
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Card,
  CardBody,
  useToast,
  Center
} from '@chakra-ui/react';
import { postNewEval } from '@/app/utils/getEvalRun';
import { defaultEvalItem, MIN_INSTANCES } from '@/app/lib/constants';
import { ModelSystem, ValidatorType, TaskInstance, IModelResponse, IEvalResponse } from '@/app/lib/types';
import usePanels from "../lib/usePanels";
import EvalRunResults from "./evalRunResults";
import { IRootState } from "../lib/store";
import { useDispatch, useSelector } from "react-redux";
import InstancesTable from "./instancesTable";

import Trending from "./trending";
import { addNewEval } from "../lib/store/dataSlice";

export default function Editor({ initialEval }: { initialEval?: IEvalResponse }) {
  // step 1 = enter meta info
  // step 2 = add task instances
  // step 3 = run results
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [validator, setValidator] = useState<ValidatorType | ''>('');
  const [models, setModels] = useState<IModelResponse[]>([]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [instances, setInstances] = useState<TaskInstance[]>([]);
  const [evalObj, setEvalObj] = useState<IEvalResponse>(initialEval ?? defaultEvalItem);
  const [evalRunIds, setEvalRunIds] = useState<number[]>([]);
  const toast = useToast();
  const isAuthenticated = useSelector<IRootState, string>((state: IRootState) => state.auth.isAuthenticated);
  const accessToken = useSelector<IRootState, string>((state: IRootState) => state.auth.token);
  const instanceInputRef = useRef<HTMLTextAreaElement>(null);
  const allModels = useSelector<IRootState, IModelResponse[]>((state: IRootState) => state.data.models);
  const [panel1Ref, panel2Ref, panel3Ref, panel1Collapsed, setPanel1Collapsed, panel2Collapsed, setPanel2Collapsed] = usePanels(step);
  const dispatch = useDispatch();

  useEffect(() => {
    const newModels = allModels.map((model: IModelResponse) => {
      return { ...model, checked: model.checked ?? false };
    });
    setModels(newModels);
  }, [allModels]);

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

    console.log('name:', name);
    console.log('validator:', validator);
    console.log('models:', models);
    console.log('systemPrompt:', systemPrompt);
    console.log('inputText:', inputText);
    console.log('outputText:', outputText);
    console.log('instances:', instances);
    // Error checking
    const errors: string[] = [];
    if (!name.trim()) {
      errors.push("Name is required");
    }
    if (!description.trim()) {
      errors.push("Description is required");
    }
    if (!validator) {
      errors.push("Evaluation method is required");
    }
    if (!models.some(model => model.checked)) {
      errors.push("At least one model must be selected");
    }
    if (instances.length < 2) {
      errors.push(`At least ${MIN_INSTANCES} task instances are required`);
    }
    if (!instances.some(instance => instance.isPublic)) {
      errors.push("At least one task instance must be marked as public");
    }

    if (errors.length > 0) {
      toast({
        title: "Oops! Please check that you've entered everything correctly:",
        description: errors.join(", "),
        status: "error",
        isClosable: true,
        duration: 9000,
      });
      toggleSpinner();
      return;
    }

    const checkedModels = models.filter((model) => model.checked);
    const modelSystems: ModelSystem[] = checkedModels.map((model) => ({
      modelId: model.id,
      systemPrompt: systemPrompt,
    }));

    const newEval = await postNewEval(accessToken, {
      name,
      description,
      validatorType: validator,
      modelSystems,
      taskInstances: instances,
    });
    setEvalObj(newEval);
    dispatch(addNewEval({
      id: newEval.id,
      name: newEval.name,
      description: newEval.description,
      validatorType: newEval.validatorType,
    }));

    /* Show results and keep polling until eval run is finished */
    setEvalRunIds(newEval.modelSystems.map((value: any) => value.id));
    setStep(3);
  };

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

      // Set focus to the inputText field after adding an instance
      if (instanceInputRef.current) {
        instanceInputRef.current.focus();
      }

    } else {
      console.error('Input text and output text must not be empty')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (step === 1) {
        setStep(2);
      } else {
        addInstance();
      }
    }
  };

  return (
    <>
      <PanelGroup direction="horizontal">
        <Panel collapsible={true} collapsedSize={2} defaultSize={64} minSize={24} ref={panel1Ref} onExpand={() => { setPanel1Collapsed(false) }} onCollapse={() => { setPanel1Collapsed(true) }}>
          <Box w='100%' border='1px'
            borderColor='lightgray'
            borderLeftRadius='md'
            gap={4}
            p={4}
            h='calc(100vh - 8rem)'
            overflowY='auto'
            onKeyDown={handleKeyDown}
          >
            {!panel1Collapsed && (
              <>
                <VStack spacing={6} align="stretch" px={2}>
                  <FormControl>
                    <HStack top={0}>
                      <FormLabel htmlFor="evalName" srOnly>Evaluation Name</FormLabel>
                      <Input
                        id="evalName"
                        size='lg'
                        variant='flushed'
                        placeholder={`Eval name, e.g. "Linear algebra problems"`}
                        maxW='384px'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Spacer />
                      {step === 1 && panel2Collapsed && (
                        <Button float='right' onClick={() => { if (step === 1) setStep(2) }} minW='180px'>
                          <Kbd>cmd</Kbd> + <Kbd>enter</Kbd>
                          <Text ml={2}>
                            Next
                          </Text>
                        </Button>
                      )}
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <FormLabel>
                      <Heading size='sm'>Description</Heading>
                    </FormLabel>
                    <Textarea
                      placeholder='Linear algebra equations in Latex. Output is the answer only in Latex.'
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>
                      <Heading size='sm'>Method to evaluate</Heading>
                    </FormLabel>
                    <Select placeholder='Select validator type' value={validator} onChange={(e) => setValidator(e.target.value as ValidatorType)}>
                      {Object.values(ValidatorType).map((validatorType) => (
                        <option key={validatorType} value={validatorType}>
                          {validatorType}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>
                      <Heading size='sm'>Models to test</Heading>
                    </FormLabel>
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
                  </FormControl>

                  <FormControl>
                    <FormLabel>
                      <Heading size='sm'>System Prompt (Recommended)</Heading>
                    </FormLabel>
                    <Textarea
                      placeholder='You are a mathematics professor at MIT.'
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                    />
                  </FormControl>
                </VStack>
              </>
            )}
          </Box>
        </Panel>
        <PanelResizeHandle />
        <Panel 
          collapsible={true} 
          collapsedSize={2} 
          defaultSize={2} 
          minSize={24} 
          ref={panel2Ref} 
          onExpand={() => { 
            setPanel2Collapsed(false);
            if (step == 1) setStep(2);
          }} 
          onCollapse={() => { setPanel2Collapsed(true) }} 
        >
          <Box w='100%' border='1px'
            borderColor='lightgray'
            gap={4}
            p={4}
            h='calc(100vh - 8rem)'
            overflowY='auto'
          >
            {!panel2Collapsed && (
              <>
                <HStack mx={2} position="sticky" top={0} bg="white" zIndex={1}>
                  <Box as='span' flex='1' textAlign='left'>
                    <Heading size='sm'>Task instances</Heading>
                  </Box>
                  <Button variant='outline' ml='auto' onClick={addInstance}  minW='300px'>
                    <Kbd>cmd</Kbd> + <Kbd>enter</Kbd>
                    <Text ml={2}>Add task instance</Text>
                  </Button>
                  <Spinner id='loadingSpinner' hidden />
                  <Button ml='auto' onClick={handleSubmit} minW='150px'>
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
                      ref={instanceInputRef}
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
                    <InstancesTable
                      instances={instances}
                      setInstances={setInstances}
                    />
                  ) : (
                    <Text pt={8} textAlign='center'>{`Add task instances! At least ${MIN_INSTANCES}, ideally more 🧪`}</Text>
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
            h='calc(100vh - 8rem)'
            overflowY='auto'
            gap={4}
            p={4}>
            <Tabs defaultIndex={1} variant='enclosed'>
              <TabList>
                <Tab>Try an eval</Tab>
                <Tab>How to use</Tab>
                <Tab>Results</Tab>
              </TabList>
              <TabPanels>
                <TabPanel textAlign='left'>
                  <Heading size="md" pt={4}>Try out an eval</Heading>
                  <Trending />
                </TabPanel>
                <TabPanel>
                  <Card variant='outline'>
                    <CardBody>
                      <Heading size='md'>OpenEvals: Community-made AI model evaluations!</Heading>
                      <Text my={4}>OpenEvals provides an aggregated set of real-world, practical, and uncontaminated evals. 💛</Text>
                      <Heading size='md'>How to use this editor:</Heading>
                      <Text my={4}>This is an editor to create, edit, and save evals to learn how a specific AI model performs for your needs.</Text>
                      <Text>We welcome your submissions to OpenEvals! Once you contribute, your evaluation <i>results</i> are public for anyone to search, while <i>task instances</i> remain private and owned by you.</Text>
                      <Heading size='md' my={4}>Tips for submission:</Heading>
                      <Text>1. Choose an eval topic that you know well, e.g. you would be comfortable teaching.</Text>
                      <Text my={4}>2. Compare results for at least 3 models.</Text>
                      {/* <Text>3. For fair comparison, change one variable (ex: model, system prompt, user prompt) and keep the others constant.</Text> */}
                      <Text my={4}>3. Add at least {MIN_INSTANCES} task instances. Mark at least 1 as a public example.</Text>
                      <Text>4. Double check ideal outputs for task instances.</Text>
                      <Text my={4}>Have fun!</Text>
                    </CardBody>
                  </Card>
                </TabPanel>
                <TabPanel>
                  {step === 3 ? (
                    <EvalRunResults evalName={evalObj.name} evalId={evalObj.id} evalRunIds={evalRunIds} taskInstances={evalObj.taskInstances} />
                  ) : (
                    <Center>Your run results will appear here 🌱</Center>
                  )}
                  </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Panel>
      </PanelGroup>
    </>
  );
}