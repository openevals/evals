"use client";

import { Input, HStack, Button, Heading, Spacer, Box } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import Editor from "./components/editor";
import Results from "./components/results";

import TopEvals from "./components/topEvals";

export default function Home() {
  return (
    <main>
      <HStack my={4} mx={8}>
        <Heading size='md'>OpenEvals</Heading>
        <Input ml={4} maxW={756} placeholder='Search OpenEvals' variant='outline' />
        <Button>Search</Button>
        <Spacer />
        <Button ml={16} mr={2} variant="link">About</Button>
        <Button mx={2} variant="outline">Log in</Button>
        <Button mx={2} variant="solid">Register</Button>
      </HStack>
      <Tabs variant='soft-rounded' w='100%' px={4} defaultIndex={1}>
        <TabList>
          <Tab>{"I'm feeling lucky 🍀"}</Tab>
          <Tab>Create your own eval (5 min) ⚒️</Tab>
          <Tab>Contribute to an existing eval! 💛</Tab>
          <Tab>Vote on important evals 😌</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box w="50%">
              <Results />
            </Box>
          </TabPanel>
          <TabPanel>
            <Editor />
          </TabPanel>
          <TabPanel>
            <Editor />
          </TabPanel>
          <TabPanel>
            <TopEvals />
          </TabPanel>
        </TabPanels>
      </Tabs>     
    </main>
  );
}
