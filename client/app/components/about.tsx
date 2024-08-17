import { Center, Text, Heading, UnorderedList, ListItem, Link } from "@chakra-ui/react";

export default function About() {
  return (
    <Center>
      <Heading size='md'>About OpenEvals</Heading>
      <Text>{`Hi there! OpenEvals is a project that help make evals more reliable and less data-contaminated.`}</Text>
      <Text>{`Evals, or evaluations, are like school grades but for AI models & agents. We'd like anyone to easily access the test results and try testing them for themselves.`}</Text>
      <Text>{`It seems important that anyone should be able to test an AI system! It also seems important that an AI system can't cheat by peeking at the answers. To prevent "cheating", people can provide a mix of public and private task instances.`}</Text>
      <Heading size='sm'>{`The people building the thing`}</Heading>
      <UnorderedList>
        <ListItem>{`Belinda Mo`}</ListItem>
        <ListItem>{`Justin Lin`}</ListItem>
        <ListItem>{`Amy Deng`}</ListItem>
        <ListItem>{`Reinier Millo-Sanchez`}</ListItem>
      </UnorderedList>
      <Text>{`For now, message us at `}<Link href="https://x.com/belindmo" isExternal>{`@belindmo`}</Link>{` on Twitter`}</Text>
      <Text>{`Made in San Francisco, CA ^^`}</Text>
    </Center>
  );
} 