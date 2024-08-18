'use client';

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle
} from "react-resizable-panels";
import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import {
  Button,
  HStack,
  Kbd,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  UnorderedList,
  ListItem,
  useBreakpointValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Link,
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
  FormControl,
  FormLabel,
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
import { addNewEvalRuns, postNewEval } from '@/app/utils/getEvalRun';
import { defaultEvalItem, MIN_INSTANCES } from '@/app/lib/constants';
import { ModelSystem, ValidatorType, TaskInstance, IModelResponse, IEvalResponse } from '@/app/lib/types';
import usePanels from "../lib/usePanels";
import EvalRunResults from "./evalRunResults";
import { IRootState } from "../lib/store";
import { useDispatch, useSelector } from "react-redux";
import InstancesTable from "./instancesTable";

import Trending from "./trending";
import { addNewEval, clearEvalToTry } from "../lib/store/dataSlice";

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
  const [tabIndex, setTabIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure(); // modal

  const evalToTryObj = useSelector<IRootState, IEvalResponse>((state: IRootState) => state.data.evalToTry);
  const [isTryingEval, setIsTryingEval] = useState(false);

  const dispatch = useDispatch();

  /* Load the data from the model to try */
  useEffect(() => {
    if (evalToTryObj) {
      setIsTryingEval(true);
      const obj = evalToTryObj;
      setEvalObj(obj);
      dispatch(clearEvalToTry(undefined));

      setName(obj.name);
      setDescription(obj.description);
      setValidator(obj.validatorType as ValidatorType);
      setSystemPrompt(obj.taskInstances[0]?.systemPrompt ?? "");
      setInstances(obj.taskInstances);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evalToTryObj]);

  useEffect(() => {
    const newModels = allModels.map((model: IModelResponse) => {
      return { ...model, checked: model.checked ?? false };
    });
    setModels(newModels);
  }, [allModels]);

  const clickSubmitButton = async () => {

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

    // Error checking
    const errors: string[] = [];
    if (!name.trim()) {
      errors.push("Name is required");
    }
    if (!description.trim()) {
      errors.push("Description is required");
    }
    if (!Object.values(ValidatorType).includes(validator as ValidatorType)) {
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
      return;
    }
    onOpen();
  };

  const confirmSubmit = async () => {
    onClose();
    const checkedModels = models.filter((model) => model.checked);
    const modelSystems: ModelSystem[] = checkedModels.map((model) => ({
      modelId: model.id,
      systemPrompt: systemPrompt,
    }));


    const newEval = isTryingEval ? await addNewEvalRuns(accessToken, evalObj.id, modelSystems) : await postNewEval(accessToken, {
      name,
      description,
      validatorType: validator as ValidatorType,
      modelSystems,
      taskInstances: instances,
    });
    setEvalObj(newEval);

    if (!isTryingEval) {
      dispatch(addNewEval({
        id: newEval.id,
        name: newEval.name,
        description: newEval.description,
        validatorType: newEval.validatorType,
      }));
      setIsTryingEval(true);
    }

    /* Show results and keep polling until eval run is finished */
    setEvalRunIds(newEval.modelSystems.map((value: any) => value.id));
    setTabIndex(isMobile ? 3 : 2);
    setStep(3);
  };

  const addInstance = () => {
    if (inputText !== '' && outputText !== '') {
      const newInstance: TaskInstance = {
        isPublic: false,
        input: inputText,
        ideal: outputText,
      };
      if (isTryingEval) {
        clearEvalToTryData();
        setInstances([newInstance]);
      } else {
        setInstances([...instances, newInstance]);
      }
      setInputText('');
      setOutputText('');

      // Set focus to the inputText field after adding an instance
      if (instanceInputRef.current) {
        instanceInputRef.current.focus();
      }

    } else {
      console.error('Input text and output text must not be empty');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (step === 1) {
        setStep(2);
      } else {
        addInstance();
      }
    }
  };

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  const clearEvalToTryData = () => {
    if (isTryingEval) {
      setIsTryingEval(false);
      setEvalObj(defaultEvalItem);
      setInstances([]);
    }
  };

  const changeName = (value: string) => {
    setName(value);
    clearEvalToTryData();
  };

  const changeDescription = (value: string) => {
    setDescription(value);
    clearEvalToTryData();
  };

  const changeValidator = (value: ValidatorType | '') => {
    setValidator(value);
    clearEvalToTryData();
  };

  const changeSystemPrompt = (value: string) => {
    setSystemPrompt(value);
    clearEvalToTryData();
  };

  const isMobile = useBreakpointValue({ base: true, md: false });


  return (
    <>
      {isMobile ? (
        <MobileEditor
          isTryingEval={isTryingEval}
          name={name}
          setName={changeName}
          description={description}
          setDescription={changeDescription}
          validator={validator}
          setValidator={changeValidator}
          models={models}
          setModels={setModels}
          systemPrompt={systemPrompt}
          setSystemPrompt={changeSystemPrompt}
          inputText={inputText}
          setInputText={setInputText}
          outputText={outputText}
          setOutputText={setOutputText}
          instances={instances}
          setInstances={setInstances}
          step={step}
          setStep={setStep}
          handleKeyDown={handleKeyDown}
          addInstance={addInstance}
          onInstancesChange={clearEvalToTryData}
          clickSubmitButton={clickSubmitButton}
          tabIndex={tabIndex}
          handleTabsChange={handleTabsChange}
          evalObj={evalObj}
          evalRunIds={evalRunIds}
          instanceInputRef={instanceInputRef}
          panel1Collapsed={panel1Collapsed}
          setPanel1Collapsed={setPanel1Collapsed}
          panel2Collapsed={panel2Collapsed}
          setPanel2Collapsed={setPanel2Collapsed}
          panel1Ref={panel1Ref}
          panel2Ref={panel2Ref}
          panel3Ref={panel3Ref}
        />
      ) : (
        <DesktopEditor
          isTryingEval={isTryingEval}
          name={name}
          setName={changeName}
          description={description}
          setDescription={changeDescription}
          validator={validator}
          setValidator={changeValidator}
          models={models}
          setModels={setModels}
          systemPrompt={systemPrompt}
          setSystemPrompt={changeSystemPrompt}
          inputText={inputText}
          setInputText={setInputText}
          outputText={outputText}
          setOutputText={setOutputText}
          instances={instances}
          setInstances={setInstances}
          step={step}
          setStep={setStep}
          panel1Collapsed={panel1Collapsed}
          setPanel1Collapsed={setPanel1Collapsed}
          panel2Collapsed={panel2Collapsed}
          setPanel2Collapsed={setPanel2Collapsed}
          handleKeyDown={handleKeyDown}
          panel1Ref={panel1Ref}
          panel2Ref={panel2Ref}
          panel3Ref={panel3Ref}
          addInstance={addInstance}
          onInstancesChange={clearEvalToTryData}
          clickSubmitButton={clickSubmitButton}
          tabIndex={tabIndex}
          handleTabsChange={handleTabsChange}
          evalObj={evalObj}
          evalRunIds={evalRunIds}
          instanceInputRef={instanceInputRef}
        />
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Please confirm the following:</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <UnorderedList spacing={2}>
              <ListItem>
                <Text>My eval solves a useful task in a format that is easy for humans to understand.</Text>
              </ListItem>
              <ListItem>
                <Text>{`I've`} double checked that my task instances are correct.</Text>
              </ListItem>
              <ListItem>
                <Text>To the best of my knowledge, my task instances are not easily available online in their task format.</Text>
              </ListItem>
              <ListItem>
                <Text>To the best of my knowledge, I {`won't`} share private task instance data publicly. If I do, I will delete my eval from the OpenEvals platform.</Text>
              </ListItem>
            </UnorderedList>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Back
            </Button>
            <Button onClick={confirmSubmit}>I confirm, submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}


interface DesktopEditorProps {
  isTryingEval: boolean,
  name: string;
  setName: (name: string) => void;
  step: number;
  setStep: (step: 1 | 2 | 3) => void;
  panel1Collapsed: boolean;
  setPanel1Collapsed: (collapsed: boolean) => void;
  panel2Collapsed: boolean;
  setPanel2Collapsed: (collapsed: boolean) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>) => void;
  panel1Ref: React.RefObject<ImperativePanelHandle>;
  panel2Ref: React.RefObject<ImperativePanelHandle>;
  panel3Ref: React.RefObject<ImperativePanelHandle>;
  addInstance: () => void;
  onInstancesChange: () => void;
  clickSubmitButton: () => void;
  inputText: string;
  setInputText: (text: string) => void;
  outputText: string;
  setOutputText: (text: string) => void;
  instances: TaskInstance[];
  setInstances: Dispatch<SetStateAction<TaskInstance[]>>;
  instanceInputRef: React.RefObject<HTMLTextAreaElement>;
  tabIndex: number;
  handleTabsChange: (index: number) => void;
  evalObj: IEvalResponse;
  evalRunIds: number[];
  description: string;
  setDescription: (description: string) => void;
  validator: ValidatorType | '';
  setValidator: (validator: ValidatorType | '') => void;
  models: IModelResponse[];
  setModels: (models: IModelResponse[]) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
}

interface MobileEditorProps extends DesktopEditorProps { }

function DesktopEditor({
  isTryingEval,
  name,
  setName,
  step,
  setStep,
  panel1Collapsed,
  setPanel1Collapsed,
  panel2Collapsed,
  setPanel2Collapsed,
  handleKeyDown,
  panel1Ref,
  panel2Ref,
  panel3Ref,
  addInstance,
  onInstancesChange,
  clickSubmitButton,
  inputText,
  setInputText,
  outputText,
  setOutputText,
  instances,
  setInstances,
  instanceInputRef,
  tabIndex,
  handleTabsChange,
  evalObj,
  evalRunIds,
  description,
  setDescription,
  validator,
  setValidator,
  models,
  setModels,
  systemPrompt,
  setSystemPrompt,
}: DesktopEditorProps) {
  return (
    <PanelGroup direction="horizontal">
      <Panel
        collapsible={true}
        collapsedSize={2}
        defaultSize={64}
        minSize={24}
        ref={panel1Ref as React.RefObject<ImperativePanelHandle>}
        onExpand={() => setPanel1Collapsed(false)}
        onCollapse={() => setPanel1Collapsed(true)}
      >
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
                <Heading size='md'>{isTryingEval ? "Contributing to eval" : "Create new eval"}</Heading>
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
                      <Button float='right' onClick={() => { if (step === 1) setStep(2); }} minW='180px'>
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
                  <Select placeholder='Select validator type' value={validator} onChange={(e) => setValidator(e.target.value as ValidatorType)} required>
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
        onCollapse={() => { setPanel2Collapsed(true); }}
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
                <Button variant='outline' ml='auto' onClick={addInstance} minW='300px'>
                  <Kbd>cmd</Kbd> + <Kbd>enter</Kbd>
                  <Text ml={2}>Add task instance</Text>
                </Button>
                <Button ml='auto' onClick={clickSubmitButton} minW='150px'>
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
                    required
                  />
                </VStack>
                <VStack w='50%'>
                  <Text>Ideal Output</Text>
                  <Textarea
                    placeholder='2x'
                    value={outputText}
                    onChange={(e) => setOutputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    required
                  />
                </VStack>
              </HStack>
              <Box pt={4}>
                {instances.length > 0 ? (
                  <InstancesTable
                    instances={instances}
                    setInstances={setInstances}
                    onChange={onInstancesChange}
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
          <Tabs index={tabIndex} onChange={handleTabsChange} variant='enclosed'>
            <TabList>
              <Tab>Contribute</Tab>
              <Tab>Try out an eval</Tab>
              <Tab>Results</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Card variant='outline'>
                  <CardBody>
                    <Heading size='md'>Welcome to OpenEvals, a practical evals database that anyone can contribute to. 💛</Heading>
                    <Text my={4}>An <b>eval</b> is a task that grades an AI {`system's`} output. It takes in a specific type of <b>input</b> and generates a specific type of <b>output</b>. <Link href="https://cookbook.openai.com/examples/evaluation/getting_started_with_openai_evals#:~:text=Evaluation%20is%20the,the%20LLM%20system." textDecoration="underline">[1]</Link></Text>
                    <Text my={4}>This is an editor to contribute evals.</Text>
                    <Heading size='md' my={4}>Tips for submission:</Heading>
                    <Text>1. Choose an eval topic that you know well, e.g. a topic you would be comfortable teaching.</Text>
                    <Text my={4}>2. Compare results between at least 3 AI <b>models</b>.</Text>
                    {/* <Text>3. For fair comparison, change one variable (ex: model, system prompt, user prompt) and keep the others constant.</Text> */}
                    <Text my={4}>3. Add at least {MIN_INSTANCES} <b>task instances</b>. A task instance is one input-output pair for an eval.</Text>
                    <Text my={4}>4. Mark at least 1 task instance as a public example. Task instances are private by default to avoid <b>data contamination</b>. <Link href="https://conda-workshop.github.io/#:~:text=Data%20contamination%2C%20where,and%20reliable%20evaluations." textDecoration="underline">[2]</Link></Text>
                    <Text>5. Double check ideal outputs for task instances.</Text>
                    <Text my={4}>{`That's all! Have fun~`}</Text>
                  </CardBody>
                </Card>
              </TabPanel>
              <TabPanel textAlign='left'>
                <Trending />
              </TabPanel>
              <TabPanel>
                {step === 3 ? (
                  <EvalRunResults evalName={evalObj.name} evalId={evalObj.id} evalRunIds={evalRunIds} taskInstances={evalObj.taskInstances} />
                ) : (
                  <Center py={4}>Your evaluation results will appear here 🌱</Center>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Panel>
    </PanelGroup>
  );
}

function MobileEditor({
  isTryingEval,
  name,
  setName,
  step,
  setStep,
  handleKeyDown,
  addInstance,
  onInstancesChange,
  clickSubmitButton,
  inputText,
  setInputText,
  outputText,
  setOutputText,
  instances,
  setInstances,
  instanceInputRef,
  tabIndex,
  handleTabsChange,
  evalObj,
  evalRunIds,
  description,
  setDescription,
  validator,
  setValidator,
  models,
  setModels,
  systemPrompt,
  setSystemPrompt,
}: MobileEditorProps) {
  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Tabs index={tabIndex} onChange={handleTabsChange} variant="enclosed" isFitted>
        <TabList>
          <Tab>🌎</Tab>
          <Tab>Meta</Tab>
          <Tab>Instances</Tab>
          <Tab>Results</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card>
              <CardBody>
                <Text fontWeight="bold" mb={4}>How to contribute an eval:</Text>
                <Text my={4}>1. Give your eval a <b>name</b> and <b>description</b>.</Text>
                <Text my={4}>2. Choose an <b>evaluation method</b> and <b>models</b> to test.</Text>
                <Text my={4}>3. Add at least {MIN_INSTANCES} <b>task instances</b>. A task instance is one input-output pair for an eval.</Text>
                <Text my={4}>4. Mark at least 1 task instance as a public example. Task instances are private by default to avoid <b>data contamination</b>. <Link href="https://conda-workshop.github.io/#:~:text=Data%20contamination%2C%20where,and%20reliable%20evaluations." textDecoration="underline">[2]</Link></Text>
                <Text>5. Double check ideal outputs for task instances.</Text>
                <Text my={4}>{`That's all! Have fun~`}</Text>
              </CardBody>
            </Card>
            <Button onClick={() => handleTabsChange(tabIndex + 1)} mt={4} w="100%">Next</Button>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Heading size='md'>{isTryingEval ? "Contributing to eval" : "Create new eval"}</Heading>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter eval name"
                  w="100%"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter eval description"
                  w="100%"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Validator</FormLabel>
                <Select
                  value={validator}
                  onChange={(e) => setValidator(e.target.value as ValidatorType)}
                  placeholder="Select validator"
                  w="100%"
                >
                  {Object.values(ValidatorType).map((validatorType) => (
                    <option key={validatorType} value={validatorType}>
                      {validatorType}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Models</FormLabel>
                <VStack align="stretch" w="100%">
                  {models.map((model, index) => (
                    <Checkbox
                      key={index}
                      isChecked={model.checked}
                      onChange={(e) => {
                        const newModels = [...models];
                        newModels[index].checked = e.target.checked;
                        setModels(newModels);
                      }}
                    >
                      {model.modelName}
                    </Checkbox>
                  ))}
                </VStack>
              </FormControl>
              <FormControl>
                <FormLabel>System Prompt</FormLabel>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter system prompt"
                  w="100%"
                />
              </FormControl>
              <HStack justify="space-between" w="100%">
                <Button onClick={() => handleTabsChange(tabIndex - 1)}>Previous</Button>
                <Button onClick={() => {
                  setStep(2);
                  handleTabsChange(tabIndex + 1);
                }}>Next</Button>
              </HStack>
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Center>Add at least {MIN_INSTANCES} task instances.</Center>
              <FormControl>
                <FormLabel>Input</FormLabel>
                <Textarea
                  ref={instanceInputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter input text"
                  w="100%"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Output</FormLabel>
                <Textarea
                  value={outputText}
                  onChange={(e) => setOutputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter output text"
                  w="100%"
                />
              </FormControl>
              <Button onClick={addInstance} w="100%">Add Instance</Button>
              <InstancesTable instances={instances} setInstances={setInstances} onChange={onInstancesChange} />
              <HStack justify="space-between" w="100%">
                <Button onClick={() => handleTabsChange(tabIndex - 1)}>Previous</Button>
                <Button onClick={clickSubmitButton} isDisabled={instances.length < MIN_INSTANCES}>
                  Submit Eval
                </Button>
              </HStack>
            </VStack>
          </TabPanel>
          <TabPanel>
            {step === 3 ? (
              <>
                <EvalRunResults evalName={evalObj.name} evalId={evalObj.id} evalRunIds={evalRunIds} taskInstances={evalObj.taskInstances} />
                <Button onClick={() => handleTabsChange(tabIndex - 1)} mt={4}>Previous</Button>
              </>
            ) : (
              <Center py={4}>Your evaluation results will appear here 🌱</Center>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
