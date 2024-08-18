import { Stack, Heading, Text, Button, Tag, HStack, Avatar, useToast } from '@chakra-ui/react';
import VoteButton from './voteButton';
import { useRouter } from 'next/navigation';
import { IAuthorResponse, IVoteResult } from '../lib/types';

export default function ResultItem({
  id,
  name,
  description,
  validatorType,
  upvotes,
  upvoted,
  onVote,
  mainAuthor,
}: {
  id: number;
  name: string;
  description: string;
  validatorType: string;
  upvotes: number;
  upvoted: boolean;
  onVote?: (payload: IVoteResult) => void;
  mainAuthor?: IAuthorResponse;
}) {
  const router = useRouter();
  const toast = useToast();

  const copyTextToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        description: "Link copied to clipboard.",
        status: 'success',
        duration: 5000,
      });
    } catch {
      toast({
        description: "Error copying link to clipboard.",
        status: 'error',
        duration: 5000,
      });
    }
  };

  const shareEval = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
    const link = `${process.env.NEXT_PUBLIC_WEB_URL}/evals/${id}`;
    copyTextToClipboard(link);
  };

  const tryEval = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
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
          <Avatar size='xs' name={mainAuthor?.username ?? 'Unknown'} src={mainAuthor?.avatar ?? 'https://www.svgrepo.com/show/448095/person-circle.svg'} />
          <Stack spacing={0}>
            <Text fontSize='sm'>{mainAuthor?.username ?? 'Unknown'}</Text>
            <Text fontSize='xs'>@{mainAuthor?.githubLogin ?? ''}</Text>
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
          <VoteButton evalId={id} votes={upvotes} upvoted={upvoted} onVote={onVote} />
          <Button onClick={shareEval} variant='outline'>Share</Button>
          <Button onClick={tryEval} variant="outline">Try</Button>
        </HStack>
      </Stack>
    </>
  );
}