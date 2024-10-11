import React from 'react';
import { Heading, Stack, Text } from "@chakra-ui/react";
import InfoPopover from "./infoPopover";

interface InfoHeaderProps {
  title: string;
  popoverTitle: string;
  popoverContent: string;
  size?: string;
}

const InfoHeader: React.FC<InfoHeaderProps> = ({ title, popoverTitle, popoverContent, size = "xs" }) => {
  return (
    <Heading size={size}>
      <Stack direction={["row"]} alignItems="center">
        <Text>{title}</Text>
        <InfoPopover
          title={popoverTitle}
          content={popoverContent}
        />
      </Stack>
    </Heading>
  );
};

export default InfoHeader;
