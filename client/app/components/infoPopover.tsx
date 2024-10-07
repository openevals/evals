import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Button,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";

interface InfoPopoverProps {
  title: string;
  content: string;
  actionText?: string;
  onAction?: () => void;
}

const InfoPopover: React.FC<InfoPopoverProps> = ({
  title,
  content,
  actionText,
  onAction,
}) => {
  return (
    <Popover isLazy placement="top-start" trigger="hover">
      <PopoverTrigger>
        <InfoOutlineIcon
          ml={2}
          cursor="pointer"
          _focus={{ boxShadow: "none" }}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight="semibold">{title}</PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody fontWeight="normal">
          {content.split("\n").map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
          {actionText && onAction && (
            <Button mt={2} onClick={onAction}>
              {actionText}
            </Button>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default InfoPopover;
