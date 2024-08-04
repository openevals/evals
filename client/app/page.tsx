import Image from "next/image";
import styles from "./page.module.css";
import { Input, HStack, VStack, Container, Button, Grid, GridItem, Card, CardBody, Text, Heading, CardHeader, Spacer } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import Editor from "./components/editor";
import Results from "./components/results";

export default function Home() {
  return (
    <main>
      <HStack m={4}>
        <Heading size='md'>OpenEvals</Heading>
        <Input ml={4} maxW={756} placeholder='Search OpenEvals' variant='outline' />
        <Button>Search</Button>
        <Spacer />
        <Text ml={16} mr={2}>About</Text>
        <Text mx={2}>Login</Text>
        <Text mx={2}>Register</Text>
      </HStack>
      <HStack alignItems='flex-start'>
        <VStack w='80%'>
          <Tabs variant='soft-rounded' w='100%' px={2} defaultIndex={0}>
            <TabList>
              <Tab>I'm feeling lucky 🍀</Tab>
              <Tab>Create your own eval (5 min) ⚒️</Tab>
              <Tab>Contribute to an existing eval! 💛</Tab>
              <Tab>Vote on important evals 😌</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Results />
              </TabPanel>
              <TabPanel>
                <Editor />
              </TabPanel>
              <TabPanel>
                <p>Contribute to an existing eval! 💛</p>
              </TabPanel>
              <TabPanel>
                <p>Vote on important evals 😌</p>
              </TabPanel>
            </TabPanels>
          </Tabs>        
        </VStack>
        <Container width='20%'>
          <Card variant="outline">
            <CardBody textAlign='center'>
              <Text>Newest! Contribute to SWE-bench</Text>
              <Button>Contribute</Button>
            </CardBody>
          </Card>
          <Results />
        </Container >

      </HStack>
    </main>
  );
}
