'use client';

import { Card, Stack, CardBody, Heading, Text, Button, CardFooter, Tag } from '@chakra-ui/react';
import VoteButton from './voteButton';
import { useRouter } from 'next/navigation';

export default function ResultItem({
  id,
  name,
  description,
  validatorType,
  upvotes,
  upvoted,
  onUpvote,
}: {
  id: number;
  name: string;
  description: string;
  validatorType: string;
  upvotes: number;
  upvoted: boolean;
  onUpvote: () => void;
}) {
  const router = useRouter();

  const viewDetails = () => {
    router.push(`/evals/${id}`);
  };

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
          <Button variant='solid' colorScheme='blue' mr={2} onClick={() => viewDetails()}>
            View
          </Button>
          {/* <Button variant='solid' colorScheme='blue'>
            Use
          </Button> */}
        </CardFooter>
      </Stack>
      <Stack m={4} ml='auto'>
        <VoteButton votes={upvotes} upvoted={upvoted} onUpvote={() => onUpvote()} />
      </Stack>
    </Card>
  );
}