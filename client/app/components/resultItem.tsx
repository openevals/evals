import { Card, Stack, CardBody, Heading, Text, Button, CardFooter, Tag, HStack, VStack, Avatar } from '@chakra-ui/react';
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
    <>
      <Stack
        p={4}
        my={4}
        textAlign='start'
        _hover={{ backgroundColor: 'gray.100', cursor: 'pointer' }}
      >
        <HStack>
          <Avatar size='xs' name='openai/evals' src="https://www.svgrepo.com/show/306500/openai.svg" />
          <Stack spacing={0}>
            <Text fontSize='sm'>openai/evals</Text>
            <Text fontSize='xs'>@justinlinw</Text>
          </Stack>
        </HStack>
        <Heading size='md'>{name}</Heading>
        <Text>
          {description}
        </Text>
        <HStack>
          <Tag size='md'>{validatorType}</Tag>
        </HStack>
        <HStack>
          <VoteButton votes={upvotes} upvoted={upvoted} onUpvote={() => onUpvote()} />
          <Button variant='outline'>Share</Button>
          <Button variant="outline">Try</Button>
        </HStack>
      </Stack>
    </>
  );
}