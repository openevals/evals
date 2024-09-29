import {
    Heading, Text, Button, Tag, HStack, Avatar, useToast,
    Input,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Box,
    Grid,
    GridItem
  } from '@chakra-ui/react';

  import { useRouter } from 'next/navigation';
  import { useDispatch } from 'react-redux';
  import { SmallCloseIcon, SettingsIcon, ExternalLinkIcon } from "@chakra-ui/icons";
  import { useState } from 'react';
import OpenAIKeysSettings from './openai';
import GeminiKeysSettings from './gemini';
import AnthropicKeysSettings from './anthropic';
  
  export default function KeysSettings() {
    const router = useRouter();
    const toast = useToast();
    const dispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure();
  
    return (
      <>
        <Button variant="link" onClick={() => onOpen()}><SettingsIcon /></Button>
        <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside" size="lg">
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
              <Button colorScheme='blue' mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }
