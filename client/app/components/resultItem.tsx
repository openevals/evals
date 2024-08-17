import { Card, Stack, CardBody, Heading, Text, Button, CardFooter, Tag, HStack, VStack, Avatar, useToast } from '@chakra-ui/react';
import VoteButton from './voteButton';
import { useRouter } from 'next/navigation';
import { IAuthorResponse } from '../lib/types';
import { MouseEventHandler } from 'react';

export default function ResultItem({
  id,
  name,
  description,
  validatorType,
  upvotes,
  upvoted,
  onUpvote,
  mainAuthor,
}: {
  id: number;
  name: string;
  description: string;
  validatorType: string;
  upvotes: number;
  upvoted: boolean;
  onUpvote: () => void;
  mainAuthor?: IAuthorResponse;
}) {
  const router = useRouter();
  const toast = useToast();

  const viewDetails = () => {
    router.push(`/evals/${id}`);
  };

  const copyTextToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        description: "Link copied to clipboard.",
        status: 'success',
        duration: 9000,
        isClosable: true
      });
    } catch {
      toast({
        description: "Error copying link to clipboard.",
        status: 'error',
        duration: 9000,
        isClosable: true
      });
    }
  };

  const cbShare = (ev: any) => {
    ev.stopPropagation();
    ev.preventDefault();
    const link = `${process.env.NEXT_PUBLIC_WEB_URL}/evals/${id}`;
    copyTextToClipboard(link);
  };

  const cbTry = (ev: any) => {
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
          <VoteButton votes={upvotes} upvoted={upvoted} onUpvote={() => onUpvote()} />
          <Button onClick={cbShare} variant='outline'>Share</Button>
          <Button onClick={cbTry} variant="outline">Try</Button>
        </HStack>
      </Stack>
    </>
  );
}