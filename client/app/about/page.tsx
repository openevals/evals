import { Center, Text, Heading, UnorderedList, ListItem, Link, VStack } from "@chakra-ui/react"

export default function About() {
  return (
    <Center>
      <VStack maxW='600px' textAlign='center'>
        <Heading size='md' p={2}>About OpenEvals</Heading>
        <Text>Hi there! OpenEvals is a project to help make evals more reliable and less data-contaminated.</Text>
        <Text><b>Evals</b>, or evaluations, are like school grades but for AI systems. We'd like anyone to easily access these test results, and contribute if they'd like.</Text>
        <Text>To grade someone or something well, it seems important that they can't cheat by peeking at the answers. To prevent AI systems from "cheating", OpenEval evals include a mix of public and private <b>task instances</b>.</Text>
        <Heading size='md' py={2}>People building this project</Heading>
        <Center>
          <UnorderedList textAlign='left' display="inline-block">
            <ListItem>Belinda Mo, <Link href="https://x.com/belindmo" isExternal textDecoration="underline">@belindmo</Link></ListItem>
            <ListItem>Justin Lin, <Link href="https://x.com/justinlinw" isExternal textDecoration="underline">@justinlinw</Link></ListItem>
            <ListItem>Amy Deng, <Link href="https://x.com/amydeng_" isExternal textDecoration="underline">@amydeng_</Link></ListItem>
            <ListItem>Reinier Millo-Sanchez, <Link href="https://x.com/reiniermillo" isExternal textDecoration="underline">@reiniermillo</Link></ListItem>
          </UnorderedList>
        </Center>
        <Text>For now, message us at <Link href="https://x.com/belindmo" isExternal>@belindmo</Link> on Twitter</Text>
        <Text>Made in San Francisco, CA ^^</Text>
      </VStack>
    </Center>
  )
} 