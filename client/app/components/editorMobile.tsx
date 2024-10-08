"use client";

import {
  Button,
  HStack,
  Heading,
  Link,
  Textarea,
  VStack,
  Input,
  Text,
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
import { ValidatorType, MobileEditorProps } from "@/app/lib/types";
import EvalRunResults from "./evalRunResults";
import InstancesTable from "./instancesTable";
import EditorModelItem from "./editorModel";

export default function MobileEditor({
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
      <Heading size="md">
        {isTryingEval ? "Contributing to eval" : "Create new eval"}
      </Heading>
      <Tabs
        index={tabIndex}
        onChange={handleTabsChange}
        variant="enclosed"
        isFitted
      >
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
                <Text fontWeight="bold" mb={4}>
                  How to contribute an eval:
                </Text>
                <Text my={4}>
                  1. Give your eval a <b>name</b> and <b>description</b>.
                </Text>
                <Text my={4}>
                  2. Choose an <b>evaluation method</b> and <b>models</b> to
                  test.
                </Text>
                <Text my={4}>
                  3. Add at least {MIN_INSTANCES} <b>task instances</b>. A task
                  instance is one input-output pair for an eval.
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
                <Text>5. Double check ideal outputs for task instances.</Text>
                <Text my={4}>{`That's all! Have fun~`}</Text>
              </CardBody>
            </Card>
            <Button
              onClick={() => handleTabsChange(tabIndex + 1)}
              mt={4}
              w="100%"
            >
              Next
            </Button>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="stretch">
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
                  onChange={(e) =>
                    setValidator(e.target.value as ValidatorType)
                  }
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
                    <EditorModelItem
                      key={`model-${model.id}`}
                      model={model}
                      modelUpdated={() => {
                        setModels([...models]);
                      }}
                    />
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
                <Button onClick={() => handleTabsChange(tabIndex - 1)}>
                  Previous
                </Button>
                <Button
                  onClick={() => {
                    setStep(2);
                    handleTabsChange(tabIndex + 1);
                  }}
                >
                  Next
                </Button>
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
              <Button onClick={addInstance} w="100%">
                Add Instance
              </Button>
              <InstancesTable
                instances={instances}
                setInstances={setInstances}
                onChange={onInstancesChange}
              />
              <HStack justify="space-between" w="100%">
                <Button onClick={() => handleTabsChange(tabIndex - 1)}>
                  Previous
                </Button>
                <Button
                  onClick={clickSubmitButton}
                  isDisabled={instances.length < MIN_INSTANCES}
                >
                  Submit Eval
                </Button>
              </HStack>
            </VStack>
          </TabPanel>
          <TabPanel>
            {step === 3 ? (
              <>
                <EvalRunResults
                  evalName={evalObj.name}
                  evalId={evalObj.id}
                  evalRunIds={evalRunIds}
                  taskInstances={evalObj.taskInstances}
                />
                <Button onClick={() => handleTabsChange(tabIndex - 1)} mt={4}>
                  Previous
                </Button>
              </>
            ) : (
              <Center py={4}>
                Your evaluation results will appear here 🌱
              </Center>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
