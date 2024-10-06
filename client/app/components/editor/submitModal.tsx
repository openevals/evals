import React from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  UnorderedList,
  ListItem,
  Text,
} from "@chakra-ui/react";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Please confirm the following:</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <UnorderedList spacing={2}>
            <ListItem>
              <Text>
                My eval solves a useful task in a format that is easy for humans
                to understand.
              </Text>
            </ListItem>
            <ListItem>
              <Text>
                I've double checked that my task instances are correct.
              </Text>
            </ListItem>
            <ListItem>
              <Text>
                To the best of my knowledge, my task instances are not easily
                available online in their task format.
              </Text>
            </ListItem>
            <ListItem>
              <Text>
                To the best of my knowledge, I won't share private task instance
                data publicly. If I do, I will delete my eval from the OpenEvals
                platform.
              </Text>
            </ListItem>
          </UnorderedList>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Back
          </Button>
          <Button onClick={onConfirm}>I confirm, submit</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubmitModal;
