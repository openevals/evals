import {
  Center,
  Text,
  Heading,
  UnorderedList,
  ListItem,
  Link,
  VStack,
} from "@chakra-ui/react";
import { Roboto_Mono } from "next/font/google";

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export default function About() {
  return (
    <Center>
      <VStack maxW="600px" textAlign="center">
        <Text fontSize="xl" as="b" className={robotoMono.className} p={2}>
          About OpenEvals
        </Text>
        <Text>{`Hi there! OpenEvals is a project to help make evals more legible, reproducible, and less data-contaminated.`}</Text>
        <Text>{`Shiny new model scores 89 on MMLU? What does that mean for your use case? Find out by contributing evals for your own use cases! Worried about data contamination? OpenEvals is private by default and you can customize eval visibility.`}</Text>
        <Text
          fontSize="xl"
          as="b"
          className={robotoMono.className}
          py={2}
        >{`People building this project`}</Text>
        <Center>
          <UnorderedList textAlign="left" display="inline-block">
            <ListItem>
              {`Belinda Mo, `}
              <Link
                href="https://x.com/belindmo"
                isExternal
                textDecoration="underline"
              >{`@belindmo`}</Link>
            </ListItem>
            <ListItem>
              {`Justin Lin, `}
              <Link
                href="https://x.com/justinlinw"
                isExternal
                textDecoration="underline"
              >{`@justinlinw`}</Link>
            </ListItem>
            <ListItem>
              {`Amy Deng, `}
              <Link
                href="https://x.com/amydeng_"
                isExternal
                textDecoration="underline"
              >{`@amydeng_`}</Link>
            </ListItem>
            <ListItem>
              {`Reinier Millo-Sanchez, `}
              <Link
                href="https://x.com/reiniermillo"
                isExternal
                textDecoration="underline"
              >{`@reiniermillo`}</Link>
            </ListItem>
          </UnorderedList>
        </Center>
        <Text>
          {`If you'd like to contribute, message `}
          <Link
            href="https://x.com/belindmo"
            isExternal
            textDecoration="underline"
          >{`@belindmo`}</Link>
          {` on Twitter.`}
        </Text>
        <Text>{`Made in San Francisco, CA 💛`}</Text>
      </VStack>
    </Center>
  );
}
