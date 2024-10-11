import React, { useState, SetStateAction } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Checkbox,
  Wrap,
  WrapItem,
  FormControl,
  FormLabel,
  Heading,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { IEvalResponse, IModelResponse, ModelSystem } from "../lib/types";
import { useSelector } from "react-redux";
import { IRootState } from "../lib/store";
import { addNewEvalRuns } from "../utils/getEvalRun";
import { useRouter } from "next/navigation";
import { useModelStorageContext } from "../lib/providers/model-storage";
import EditorModelItem from "./editor/ModelCheckbox";

interface RunModalProps {
  evalItem: IEvalResponse;
  models: IModelResponse[];
  runModels: IModelResponse[];
  setModels: (models: IModelResponse[]) => void;
}

const RunModal: React.FC<RunModalProps> = ({
  evalItem,
  models,
  runModels,
  setModels,
}: RunModalProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { openAIKey, anthropicKey, geminiKey } = useModelStorageContext();
  const toast = useToast();
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const accessToken = useSelector<IRootState, string>(
    (state: IRootState) => state.auth.token,
  );

  const handleRunEval = async () => {
    setIsRunning(true);

    const modelSystems: ModelSystem[] = runModels.map(
      (model: IModelResponse) => ({
        modelId: model.id,
        systemPrompt: evalItem.taskInstances[0]?.systemPrompt ?? "",
      }),
    );

    try {
      const newEval = await addNewEvalRuns(
        accessToken,
        evalItem.id,
        {
          openai: openAIKey,
          anthropic: anthropicKey,
          google: geminiKey,
        },
        modelSystems,
      );

      onClose();
      setIsRunning(false);

      toast({
        title: "Eval run started! 💛",
        description:
          "We are running your eval. Refresh the page to see the updated results.",
        status: "success",
        isClosable: true,
        duration: 12000,
      });
    } catch (error) {
      console.error("Error running eval:", error);
      setIsRunning(false);
      toast({
        title: "Error running eval",
        description:
          "An error occurred while trying to run the eval. Please try again.",
        status: "error",
        isClosable: true,
        duration: 9000,
      });
    }
  };

  return (
    <>
      <Button onClick={onOpen}>Add a Run</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>🏃🏻‍♀️ Add a run 🏃🏻‍♀️</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Check the accuracy of a model for yourself, while sharing the
                run results with others!
              </Text>
              <FormControl>
                <FormLabel>
                  <Heading size="sm">Models</Heading>
                </FormLabel>
                <Wrap direction="column">
                  {models?.map((model: IModelResponse) => (
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
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleRunEval}
              isLoading={isRunning}
              loadingText="Running..."
              disabled={runModels.length === 0 || isRunning}
            >
              Run eval {evalItem.name} on model{runModels.length > 1 && "s"}
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={isRunning}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RunModal;
