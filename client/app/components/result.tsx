import { Card, Stack, CardBody, Heading, Text, Button, CardFooter } from '@chakra-ui/react';

export default function ResultItem({
  heading,
  description,
}: {
  heading: string;
  description: string;
}) {
  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow='hidden'
      variant='outline'
      p={4}
    >
      <Stack>
        <Heading size='md'>{Math.floor(Math.random() * 1000)}</Heading>
        <Button>Upvote</Button>
        <Button>Downvote</Button>
      </Stack>
      <Stack>
        <CardBody>
          <Heading size='md'>{heading}</Heading>

          <Text py={2}>
            {description}
          </Text>
        </CardBody>

        <CardFooter>
          <Button variant='solid' colorScheme='blue'>
            View
          </Button>
          <Button variant='solid' colorScheme='blue'>
            Use
          </Button>
        </CardFooter>
      </Stack>
    </Card>
  )
}