import {
    Heading,
    Button,
    Input,
    ModalBody,
    Grid,
    GridItem
  } from '@chakra-ui/react';
  
  import { SmallCloseIcon, ExternalLinkIcon } from "@chakra-ui/icons";
  import { useState } from 'react';
  import { isValidAIModelKey } from '@/app/utils/validateKeys';

  const PROVIDER_NAME = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Gemini'
  };

  const PROVIDER_URL = {
    openai: "https://platform.openai.com/account/api-keys",
    anthropic: "https://console.anthropic.com/settings/keys",
    google: "https://ai.google.dev/gemini-api/docs/api-key"
  };

  
  export default function BaseKeysSettings({ 
    provider,
    aiKey,
    setAiKey
  }: {
    provider: 'openai' | 'anthropic' | 'google',
    aiKey: string,
    setAiKey: (aiKey: string) => void
  }) {
    const [keyValue, setKeyValue] = useState(aiKey || '');
    const [keySaved, setKeySaved] = useState(aiKey?.length > 0);
  
    /**
     * Track the changes for the key
     * @param evt 
     */
    const onKeyChange = (evt: any) => {
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
        return;
      }
      setAiKey(keyValue);
      setKeySaved(true);
    };
  
    /**
     * Go to provider API Keys
     */
    const goToProvider = () => {
      window.open(PROVIDER_URL[provider], "_blank");
    };
  
    return (
      <ModalBody>
        <Heading size="xs">
          {PROVIDER_NAME[provider]} API key <ExternalLinkIcon cursor="pointer" onClick={goToProvider} />
        </Heading>
        <Grid mt={4} templateColumns='repeat(4, 1fr)' columnGap={1}>
          <GridItem colSpan={keySaved ? 4 : 3} pos="relative">
            <Input
              id={`${provider}-key`}
              placeholder={`Enter your ${PROVIDER_NAME[provider]} key`}
              className="w-full"
              type={keySaved ? "password" : "text"}
              value={keyValue}
              onChange={onKeyChange}
              style={{ paddingRight: 30 }}
            />
            {keyValue.length > 0 && <SmallCloseIcon onClick={() => { }} pos="absolute" cursor="pointer" right={2} top={11} className="text-muted-foreground " />}
  
          </GridItem>
          <GridItem colSpan={1} display={keySaved ? "none" : "block"}>
            <Button w="100%" onClick={() => validateAndSaveKey()}>{keySaved ? "..." : "Validate"}</Button>
          </GridItem>
        </Grid>
      </ModalBody>
    );
  }
  