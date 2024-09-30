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
} from "@chakra-ui/react";
import { MIN_INSTANCES } from "@/app/lib/constants";
import { ValidatorType, DesktopEditorProps } from "@/app/lib/types";
import EvalRunResults from "./evalRunResults";
import InstancesTable from "./instancesTable";
import Trending from "./trending";
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
                <Heading size="md">
                  {isTryingEval ? "Contributing to eval" : "Create new eval"}
                </Heading>
                <FormControl>
                  <HStack top={0}>
                    <FormLabel htmlFor="evalName" srOnly>
                      Evaluation Name
                    </FormLabel>
                    <Input
                      id="evalName"
                      size="lg"
                      variant="flushed"
                      placeholder={`Eval name, e.g. "Linear algebra problems"`}
                      maxW="384px"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Spacer />
                    {step === 1 && panel2Collapsed && (
                      <Button
                        float="right"
                        onClick={() => {
                          if (step === 1) setStep(2);
                        }}
                        minW="180px"
                      >
                        <Kbd>cmd</Kbd> + <Kbd>enter</Kbd>
                        <Text ml={2}>Next</Text>
                      </Button>
                    )}
                  </HStack>
                </FormControl>
                <FormControl>
                  <FormLabel>
                    <Heading size="sm">Description</Heading>
                  </FormLabel>
                  <Textarea
                    placeholder="Linear algebra equations in Latex. Output is the answer only in Latex."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>
                    <Heading size="sm">Method to evaluate</Heading>
                  </FormLabel>
                  <Select
                    placeholder="Select validator type"
                    value={validator}
                    onChange={(e) =>
                      setValidator(e.target.value as ValidatorType)
                    }
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
                    <Heading size="sm">Models to test</Heading>
                  </FormLabel>
                  <Wrap direction="column">
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

                <FormControl>
                  <FormLabel>
                    <Heading size="sm">System Prompt (Recommended)</Heading>
                  </FormLabel>
                  <Textarea
                    placeholder="You are a mathematics professor at MIT."
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
                <Box as="span" flex="1" textAlign="left">
                  <Heading size="sm">Task instances</Heading>
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
        collapsedSize={2}
        defaultSize={32}
        minSize={24}
        ref={panel3Ref}
      >
        <Box
          w="100%"
          border="1px"
          borderColor="lightgray"
          borderRightRadius="md"
          h="calc(100vh - 8rem)"
          overflowY="auto"
          gap={4}
          p={4}
        >
          <Tabs index={tabIndex} onChange={handleTabsChange} variant="enclosed">
            <TabList>
              <Tab>Contribute</Tab>
              <Tab>Try out an eval</Tab>
              <Tab>Results</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Card variant="outline">
                  <CardBody>
                    <Heading size="md">
                      Welcome to OpenEvals, a practical evals database that
                      anyone can contribute to. 💛
                    </Heading>
                    <Text my={4}>
                      An <b>eval</b> is a task that grades an AI {`system's`}{" "}
                      output. It takes in a specific type of <b>input</b> and
                      generates a specific type of <b>output</b>.{" "}
                      <Link
                        href="https://cookbook.openai.com/examples/evaluation/getting_started_with_openai_evals#:~:text=Evaluation%20is%20the,the%20LLM%20system."
                        textDecoration="underline"
                      >
                        [1]
                      </Link>
                    </Text>
                    <Text my={4}>This is an editor to contribute evals.</Text>
                    <Heading size="md" my={4}>
                      Tips for submission:
                    </Heading>
                    <Text>
                      1. Choose an eval topic that you know well, e.g. a topic
                      you would be comfortable teaching.
                    </Text>
                    <Text my={4}>
                      2. Compare results between at least 3 AI <b>models</b>.
                    </Text>
                    {/* <Text>3. For fair comparison, change one variable (ex: model, system prompt, user prompt) and keep the others constant.</Text> */}
                    <Text my={4}>
                      3. Add at least {MIN_INSTANCES} <b>task instances</b>. A
                      task instance is one input-output pair for an eval.
                    </Text>
                    <Text my={4}>
                      4. Mark at least 1 task instance as a public example. Task
                      instances are private by default to avoid{" "}
                      <b>data contamination</b>.{" "}
                      <Link
                        href="https://conda-workshop.github.io/#:~:text=Data%20contamination%2C%20where,and%20reliable%20evaluations."
                        textDecoration="underline"
                      >
                        [2]
                      </Link>
                    </Text>
                    <Text>
                      5. Double check ideal outputs for task instances.
                    </Text>
                    <Text my={4}>{`That's all! Have fun~`}</Text>
                  </CardBody>
                </Card>
              </TabPanel>
              <TabPanel textAlign="left">
                <Trending />
              </TabPanel>
              <TabPanel>
                {step === 3 ? (
                  <EvalRunResults
                    evalName={evalObj.name}
                    evalId={evalObj.id}
                    evalRunIds={evalRunIds}
                    taskInstances={evalObj.taskInstances}
                  />
                ) : (
                  <Center py={4}>
                    Your evaluation results will appear here 🌱
                  </Center>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Panel>
    </PanelGroup>
  );
}
