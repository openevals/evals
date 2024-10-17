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
  Box,
} from "@chakra-ui/react";
import { MIN_INSTANCES } from "@/app/lib/constants";
import { ValidatorType, MobileEditorProps } from "@/app/lib/types";
import {
  RunSummary,
  ResultsSummary,
  ByModel,
  ByTaskInstance,
} from "../tables/tables";
import InstancesTable from "../tables/instancesTable";
import RobotoHeader from "../robotoHeader";
import useEvalResults from "../../lib/hooks/useEvalResults";
import { useState } from "react";
import ModelCheckbox from "./ModelCheckbox";
import InfoHeader from "../infoHeader";
import {
  VALIDATOR_TITLE,
  VALIDATOR_EXPLANATION,
  SYSTEM_PROMPT_TITLE,
  SYSTEM_PROMPT_EXPLANATION,
  TASK_INSTANCES_TITLE,
  TASK_INSTANCES_EXPLANATION,
} from "../../lib/constants";

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
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedTaskInstance, setSelectedTaskInstance] = useState<
    number | null
  >(null);
  const { evalRuns, allRunsCompleted } = useEvalResults(evalObj.id, evalRunIds);

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Center>
        <RobotoHeader size="md">
          {isTryingEval ? "Edit an eval" : "Create an eval"}
        </RobotoHeader>
      </Center>
      <Tabs
        index={tabIndex}
        onChange={handleTabsChange}
        variant="enclosed"
        isFitted
      >
        <TabList>
          <Tab>🌎</Tab>
          <Tab>About</Tab>
          <Tab>Instances</Tab>
          <Tab>Results</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card>
              <CardBody>
                <Text fontWeight="bold" mb={4}>
                  Tips to create an eval:
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
                  <Link href="https://conda-workshop.github.io/#:~:text=Data%20contamination%2C%20where,and%20reliable%20evaluations.">
                    [2]
                  </Link>
                </Text>
                <Text>5. Double check ideal outputs for task instances.</Text>
                <Text my={4}>{`That's all! Have fun~`}</Text>
                <Text>{`(Note: this editor is easier to use on desktop)`}</Text>
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
                <InfoHeader
                  title="Validator"
                  popoverTitle={VALIDATOR_TITLE}
                  popoverContent={VALIDATOR_EXPLANATION}
                />
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
              <FormLabel>Models</FormLabel>
              <VStack align="stretch" w="100%">
                {models.map((model, index) => (
                  <ModelCheckbox
                    key={`model-${model.id}`}
                    model={model}
                    onCheck={() => {
                      model.checked = !model.checked;
                      setModels([...models]);
                    }}
                  />
                ))}
              </VStack>
              <FormControl>
                <InfoHeader
                  title="System Prompt (Recommended)"
                  popoverTitle={SYSTEM_PROMPT_TITLE}
                  popoverContent={SYSTEM_PROMPT_EXPLANATION}
                />
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
            <VStack spacing={4} py={4} align="stretch">
              <Center>
                <InfoHeader
                  size="sm"
                  title={TASK_INSTANCES_TITLE}
                  popoverTitle={TASK_INSTANCES_TITLE}
                  popoverContent={TASK_INSTANCES_EXPLANATION}
                />
              </Center>
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
              <Box>
                <RunSummary evalRuns={evalRuns} />
                <ResultsSummary evalRuns={evalRuns} />
                <ByModel
                  evalRuns={evalRuns}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  taskMap={evalObj.taskInstances.reduce(
                    (acc, task) => ({ ...acc, [task.id]: task }),
                    {},
                  )}
                />
                <ByTaskInstance
                  evalRuns={evalRuns}
                  taskInstances={evalObj.taskInstances}
                  selectedTaskInstance={selectedTaskInstance}
                  setSelectedTaskInstance={setSelectedTaskInstance}
                />
                <Button onClick={() => handleTabsChange(tabIndex - 1)} mt={4}>
                  Previous
                </Button>
              </Box>
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
