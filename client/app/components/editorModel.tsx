'use client';

import {
  Checkbox,
  WrapItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import { AIProvider, IModelResponse } from '@/app/lib/types';
import { useModelStorageContext } from "../lib/providers/model-storage";
import { useEffect, useState } from "react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { AI_PROVIDER_NAME, AI_PROVIDER_A_AN } from '../lib/constants';

export default function EditorModelItem({
  model,
  modelUpdated
}: { model: IModelResponse, modelUpdated: () => void }) {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [provider, setProvider] = useState<AIProvider>(model.modelDeveloper.toLowerCase() as AIProvider);
  const { openAIKey, anthropicKey, geminiKey, setSettingsVisible } = useModelStorageContext();
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const keys = { openai: openAIKey, anthropic: anthropicKey, google: geminiKey };
    const provider = model.modelDeveloper.toLowerCase() as keyof typeof keys;
    setIsDisabled(!keys[provider] || keys[provider] === "");
  }, [openAIKey, anthropicKey, geminiKey, model.modelDeveloper]);

  useEffect(() => {
    setProvider(model.modelDeveloper.toLowerCase() as AIProvider);
  }, [model.modelDeveloper]);


  const showSettings = () => {
    onClose();
    setSettingsVisible(true);
  };

  return (
    <WrapItem key={model.modelName} alignItems='center'>
      <Checkbox
        isDisabled={isDisabled}
        isChecked={model.checked}
        onChange={(e) => {
          model.checked = !model.checked;
          modelUpdated();
        }}
      >
        {model.modelName}
      </Checkbox>
      {isDisabled &&
        <Popover isLazy isOpen={isOpen} onClose={onClose} onOpen={onOpen}>
          <PopoverTrigger>
            <InfoOutlineIcon ml={2} cursor="pointer" />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader fontWeight='semibold'>{AI_PROVIDER_NAME[provider]} key is not set</PopoverHeader>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>
              <p>
                To run <strong>{model.modelName}</strong>, please set {AI_PROVIDER_A_AN[provider]} {AI_PROVIDER_NAME[provider]} API key.
              </p>
              <Button mt={2} onClick={showSettings}>Set {AI_PROVIDER_NAME[provider]} key</Button>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      }
    </WrapItem>
  );
}
