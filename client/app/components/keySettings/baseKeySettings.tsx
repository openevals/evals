import { useState } from "react";
import {
  Heading,
  Button,
  Input,
  ModalBody,
  Grid,
  GridItem,
  useToast,
} from "@chakra-ui/react";

import { SmallCloseIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { isValidAIModelKey } from "@/app/utils/validateKeys";
import { AI_PROVIDER_NAME, AI_PROVIDER_URL } from "@/app/lib/constants";

export default function BaseKeysSettings({
  provider,
  aiKey,
  setAiKey,
}: {
  provider: "openai" | "anthropic" | "google";
  aiKey: string;
  setAiKey: (aiKey: string) => void;
}) {
  const [keyValue, setKeyValue] = useState(aiKey || "");
  const [keySaved, setKeySaved] = useState(aiKey?.length > 0);
  const toast = useToast();

  /**
   * Track the changes for the key
   * @param evt
   */
  const onKeyChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setKeyValue(evt.target.value);
    setKeySaved(false);
  };

  /**
   * Validate and save the key on local storage
   */
  const validateAndSaveKey = async () => {
    const isValid = await isValidAIModelKey(provider, keyValue);
    if (!isValid) {
      setKeySaved(false);
      toast({
        title: "Invalid key",
        description: `Please provide a working key for ${AI_PROVIDER_NAME[provider]}.`,
        status: "error",
        duration: 8000,
        isClosable: true,
      });
      return;
    }
    setAiKey(keyValue);
    setKeySaved(true);
    toast({
      description: `${AI_PROVIDER_NAME[provider]} key saved`,
      status: "success",
      duration: 8000,
      isClosable: true,
    });
  };

  /**
   * Go to provider API Keys
   */
  const goToProvider = () => {
    window.open(AI_PROVIDER_URL[provider], "_blank");
  };

  /**
   * Clear the key
   */
  const clearKey = () => {
    setAiKey("");
    setKeyValue("");
    setKeySaved(false);
  };

  return (
    <ModalBody>
      <Heading size="xs">
        {AI_PROVIDER_NAME[provider]} API key{" "}
        <ExternalLinkIcon cursor="pointer" onClick={goToProvider} />
      </Heading>
      <Grid mt={4} templateColumns="repeat(4, 1fr)" columnGap={1}>
        <GridItem colSpan={keySaved ? 4 : 3} pos="relative">
          <Input
            id={`${provider}-key`}
            placeholder={`Enter your ${AI_PROVIDER_NAME[provider]} key`}
            className="w-full"
            type={keySaved ? "password" : "text"}
            value={keyValue}
            onChange={onKeyChange}
            style={{ paddingRight: 30 }}
            autoComplete="off"
          />
          {keyValue.length > 0 && (
            <SmallCloseIcon
              onClick={clearKey}
              pos="absolute"
              cursor="pointer"
              right={2}
              top={11}
              color="gray.400"
              zIndex={10}
            />
          )}
        </GridItem>
        <GridItem colSpan={1} display={keySaved ? "none" : "block"}>
          <Button w="100%" onClick={() => validateAndSaveKey()}>
            {keySaved ? "..." : "Validate"}
          </Button>
        </GridItem>
      </Grid>
    </ModalBody>
  );
}
