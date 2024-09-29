import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';

import { SettingsIcon } from "@chakra-ui/icons";
import { useEffect } from 'react';
import OpenAIKeysSettings from './openai';
import GeminiKeysSettings from './gemini';
import AnthropicKeysSettings from './anthropic';
import { useModelStorageContext } from '@/app/lib/providers/model-storage';

export default function KeysSettings() {
  const { settingsVisible, setSettingsVisible } = useModelStorageContext();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (settingsVisible) {
      onOpen();
    }
  }, [onOpen, settingsVisible]);

  const closeSettings = () => {
    setSettingsVisible(false);
    onClose();
  };

  return (
    <>
      <Button variant="link" onClick={() => setSettingsVisible(true)}><SettingsIcon /></Button>
      <Modal isOpen={isOpen} onClose={closeSettings} isCentered scrollBehavior="inside" size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Configure your AI models keys</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Note: these API keys will be stored in your local browser cache. OpenEvals doesn&apos;t save your keys.
          </ModalBody>
          <OpenAIKeysSettings />
          <GeminiKeysSettings />
          <AnthropicKeysSettings />
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={closeSettings}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
