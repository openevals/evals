import { Card, Stack, CardBody, Heading, Text, Button, CardFooter, Tag } from '@chakra-ui/react';
import VoteButton from './voteButton';

export default function ResultItem({
  name,
  description,
  validatorType,
}: {
  name: string;
  description: string;
  validatorType: string;
}) {
  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow='hidden'
      variant='outline'
      p={4}
      my={4}
      textAlign='start'
    >
      <Stack>
        <CardBody>
          <Heading size='md'>{name}</Heading>
          <Text py={2}>
            {description}
          </Text>
          <Tag>{validatorType}</Tag>
        </CardBody>

        <CardFooter>
          <Button variant='solid' colorScheme='blue' mr={2}>
            View
          </Button>
          <Button variant='solid' colorScheme='blue'>
            Use
          </Button>
        </CardFooter>
      </Stack>
      <Stack m={4} ml='auto'>
        <VoteButton votes={Math.floor(Math.random() * 100)} />
      </Stack>
    </Card>
  )
}