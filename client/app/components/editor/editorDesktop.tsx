"use client";

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import {
  Button,
  HStack,
  Kbd,
  Heading,
  Link,
  Box,
  Textarea,
  VStack,
  Spacer,
  Input,
  Text,
  Wrap,
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
  Center,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { MIN_INSTANCES } from '@/app/lib/constants';
import { ValidatorType, DesktopEditorProps } from '@/app/lib/types';
import InstancesTable from "../tables/instancesTable";
import Trending from "../trending";
import RobotoHeader from "../robotoHeader";
import { useState } from 'react';
import { FaRegClipboard } from "react-icons/fa";
import useEvalResults from "../../lib/hooks/useEvalResults";
import EditorModelItem from "./editorModel";

export default function DesktopEditor({
  isTryingEval,
  name,
  setName,
  step,
  setStep,
  panel1Collapsed,
  setPanel1Collapsed,
  panel2Collapsed,
  setPanel2Collapsed,
  panel3Collapsed,
  setPanel3Collapsed,
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [bulkText, setBulkText] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTaskInstance, setSelectedTaskInstance] = useState<number | null>(null);
  const { evalRuns, allRunsCompleted } = useEvalResults(evalObj.id, evalRunIds);

  const handleUpload = async () => {
    // Here you would implement the logic to send the bulkText to GPT
    // and process the response to create input-output pairs
    // For now, we'll just close the modal
    onClose();
    // Reset the bulkText
    setBulkText('');
  };

  return (
    <PanelGroup direction="horizontal">
      <Panel
        collapsible={true}
        collapsedSize={3}
        defaultSize={64}
        minSize={24}
        ref={panel1Ref as React.RefObject<ImperativePanelHandle>}
        onExpand={() => setPanel1Collapsed(false)}
        onCollapse={() => setPanel1Collapsed(true)}
      >
        <Box
          w="100%"
          border="1px"
          borderColor="lightgray"
          borderLeftRadius="md"
          gap={4}
          p={4}
          h="calc(100vh - 8rem)"
          overflowY="auto"
          onKeyDown={handleKeyDown}
        >
          {!panel1Collapsed && (
            <>
              <VStack spacing={6} align="stretch" px={2}>
                <HStack alignItems="center">
                  <RobotoHeader>{isTryingEval ? "Edit an eval" : "Create an eval"}</RobotoHeader>
                  <Spacer/>
                  {step === 1 && panel2Collapsed && (
                    <Button onClick={() => { if (step === 1) setStep(2); }} minW='180px'>
                      <Kbd>cmd</Kbd> + <Kbd>enter</Kbd>
                      <Text ml={2}>
                        Next
                      </Text>
                    </Button>
                  )}
                </HStack>
                {isTryingEval && (
                    <Text>Note: this is a clone of the original eval. Only the public task instances are shown here.</Text>
                  )}
                <FormControl>
                  <FormLabel>
                    <Heading size='sm'>Name</Heading>
                  </FormLabel>
                  <Input
                    id="evalName"
                    size='lg'
                    variant='flushed'
                    placeholder={`Eval name, e.g. "Linear algebra problems"`}
                    maxW='384px'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>
                    <Heading size="sm">Description</Heading>
                  </FormLabel>
                  <Textarea
                    placeholder="Linear algebra equations in Latex. Output is the answer only in Latex."
                    value={description}
                    onChange={(e) => setDescription(e.target.value) }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>
                    <Heading size='sm'>Validator</Heading>
                  </FormLabel>
                  <Select 
                    placeholder='Select validator type' value={validator} 
                    onChange={(e) => setValidator(e.target.value as ValidatorType)} 
                    required
                    >
                    {Object.values(ValidatorType).map((validatorType) => (
                      <option key={validatorType} value={validatorType}>
                        {validatorType}
                      </option>
                    ))}
                  </Select>
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

                <FormControl>
                  <FormLabel>
                    <Heading size='sm'>Models</Heading>
                  </FormLabel>
                  <Wrap 
                    direction='column'                     
                  >
                    {models?.map((model) => (
                      <EditorModelItem
                      key={`model-${model.id}`}
                      model={model}
                      modelUpdated={() => {
                        setModels([...models]);
                      }}
                    />
                    ))}
                  </Wrap>
                </FormControl>
              </VStack>
            </>
          )}
        </Box>
      </Panel>
      <PanelResizeHandle />
      <Panel
        collapsible={true}
        collapsedSize={3}
        defaultSize={2}
        minSize={24}
        ref={panel2Ref}
        onExpand={() => {
          setPanel2Collapsed(false);
          if (step == 1) setStep(2);
        }}
        onCollapse={() => {
          setPanel2Collapsed(true);
        }}
      >
        <Box
          w="100%"
          border="1px"
          borderColor="lightgray"
          gap={4}
          p={4}
          h="calc(100vh - 8rem)"
          overflowY="auto"
        >
          {!panel2Collapsed && (
            <>
              <HStack mx={2} position="sticky" top={0} bg="white" zIndex={1}>
                <Box as='span' flex='1' textAlign='left'>
                  <Heading size='sm'>Task instances</Heading>
                </Box>
                <Button
                  variant="outline"
                  ml="auto"
                  onClick={addInstance}
                  minW="300px"
                >
                  <Kbd>cmd</Kbd> + <Kbd>enter</Kbd>
                  <Text ml={2}>Add task instance</Text>
                </Button>
                <Button ml="auto" onClick={clickSubmitButton} minW="150px">
                  <Text>Submit</Text>
                </Button>
              </HStack>
              <HStack w="100%" pt={8}>
                <VStack w="50%">
                  <Text>Input</Text>
                  <Textarea
                    placeholder="\frac{d}{dx}x^2"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    ref={instanceInputRef}
                    required
                  />
                </VStack>
                <VStack w="50%">
                  <Text>Ideal Output</Text>
                  <Textarea
                    placeholder="2x"
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
                  <Text
                    pt={8}
                    textAlign="center"
                  >{`Add task instances! At least ${MIN_INSTANCES}, ideally more 🧪`}</Text>
                )}
              </Box>
            </>
          )}
        </Box>
      </Panel>
      <PanelResizeHandle />
      <Panel
        collapsible={true}
        collapsedSize={3}
        defaultSize={32}
        minSize={24}
        ref={panel3Ref as React.RefObject<ImperativePanelHandle>}
        onExpand={() => setPanel3Collapsed(false)}
        onCollapse={() => setPanel3Collapsed(true)}
      >
        <Box 
          w='100%' 
          border='1px'
          borderColor='lightgray'
          borderRightRadius='md'
          h='calc(100vh - 8rem)'
          overflowY='auto'
          gap={4}
          p={4}
        >
          {!panel3Collapsed && (
            <Tabs index={tabIndex} onChange={handleTabsChange} variant='enclosed'>
              <TabList>
                <Tab>Contribute</Tab>
                <Tab>Try an eval</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Card variant='outline'>
                    <CardBody>
                      <Heading size='md'>Welcome to OpenEvals, a practical evals database that anyone can contribute to. 💛</Heading>
                      <Text my={4}>An <b>eval</b> is a task that grades an AI {`system's`} output. It takes in a specific type of <b>input</b> and generates a specific type of <b>output</b>. <Link href="https://cookbook.openai.com/examples/evaluation/getting_started_with_openai_evals#:~:text=Evaluation%20is%20the,the%20LLM%20system.">[1]</Link></Text>
                      <Text my={4}>This is an editor to make your own textual evals.</Text>
                      <Heading size='md' my={4}>Tips:</Heading>
                      <Text>1. Choose an eval topic that you know well, e.g. a topic you would be comfortable teaching.</Text>
                      <Text my={4}>2. Compare results between at least 3 AI <b>models</b>.</Text>
                      <Text my={4}>3. Add at least {MIN_INSTANCES} <b>task instances</b>. A task instance is one input-output pair for an eval.</Text>
                      <Text my={4}>4. Mark at least 1 task instance as a public example. Task instances are private by default to avoid <b>data contamination</b>. <Link href="https://conda-workshop.github.io/#:~:text=Data%20contamination%2C%20where,and%20reliable%20evaluations.">[2]</Link></Text>
                      <Text>5. Double check ideal outputs for task instances.</Text>
                      <Text my={4}>{`That's all! Have fun~`}</Text>
                    </CardBody>
                  </Card>
                </TabPanel>
                <TabPanel textAlign='left'>
                  <Trending />
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </Box>
      </Panel>
    </PanelGroup>
  );
}
