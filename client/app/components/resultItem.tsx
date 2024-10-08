import {
  Stack,
  Heading,
  Text,
  Button,
  Tag,
  HStack,
  Avatar,
  useToast,
  Flex,
  useDisclosure,
  AlertDialog,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import VoteButton from "./voteButton";
import { useRouter } from "next/navigation";
import { IAuthorResponse, IVoteResult } from "../lib/types";
import { getEvalItem } from "../utils/getEvalItem";
import { useDispatch, useSelector } from "react-redux";
import { setEvalToTry } from "../lib/store/dataSlice";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRef } from "react";
import { deleteEval } from "../utils/getEvals";
import { IRootState } from "../lib/store";

export default function ResultItem({
  id,
  name,
  description,
  validatorType,
  upvotes,
  upvoted,
  onVote,
  mainAuthor,
  canDelete,
  onDelete,
}: {
  id: number;
  name: string;
  description: string;
  validatorType: string;
  upvotes: number;
  upvoted: boolean;
  onVote?: (payload: IVoteResult) => void;
  mainAuthor?: IAuthorResponse;
  canDelete?: boolean;
  onDelete?: (evalId: number) => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef: any = useRef();
  const accessToken = useSelector<IRootState, string>(
    (state: IRootState) => state.auth.token,
  );

  const copyTextToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        description: "Link copied to clipboard.",
        status: "success",
        duration: 8000,
      });
    } catch {
      toast({
        description: "Error copying link to clipboard.",
        status: "error",
        duration: 8000,
      });
    }
  };

  const shareEval = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
    const link = `${process.env.NEXT_PUBLIC_WEB_URL}/evals/${id}`;
    copyTextToClipboard(link);
  };

  const tryEval = async (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation();
    ev.preventDefault();

    const evalDetails = await getEvalItem(id);
    dispatch(setEvalToTry(evalDetails));
    router.push("/");
  };

  const deleteEvalOnConfirm = async () => {
    onClose();
    deleteEval(id, accessToken)
      .then(() => {
        toast({
          description: "Eval deleted!.",
          status: "success",
          duration: 8000,
        });
        if (onDelete) onDelete(id);
      })
      .catch((e) => {
        toast({
          description: "Error deleting eval.",
          status: "error",
          duration: 8000,
        });
      });
  };

  return (
    <>
      <Stack
        p={4}
        my={4}
        textAlign="start"
        _hover={{ backgroundColor: "gray.100", cursor: "pointer" }}
      >
        {mainAuthor && (
          <HStack>
            <Avatar
              size="xs"
              name={mainAuthor.username ?? "Unknown"}
              src={
                mainAuthor.avatar ??
                "https://www.svgrepo.com/show/448095/person-circle.svg"
              }
            />
            <Stack spacing={0}>
              <Text fontSize="sm">{mainAuthor.username ?? "Unknown"}</Text>
              <Text fontSize="xs">@{mainAuthor.githubLogin ?? ""}</Text>
            </Stack>
          </HStack>
        )}
        <Heading size="md">{name}</Heading>
        <Text>{description}</Text>
        <HStack>
          <Tag size="md">{validatorType}</Tag>
        </HStack>
        <HStack>
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            <HStack>
              <VoteButton
                evalId={id}
                votes={upvotes}
                upvoted={upvoted}
                onVote={onVote}
              />
              <Button onClick={shareEval} variant="outline">
                Share
              </Button>
              <Button onClick={tryEval} variant="outline">
                Try
              </Button>
            </HStack>
            {canDelete && (
              <Button
                leftIcon={<DeleteIcon />}
                onClick={onOpen}
                variant="outline"
                colorScheme="red"
              >
                Delete
              </Button>
            )}
          </Flex>
        </HStack>
      </Stack>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete eval
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? Data will be deleted and you can&apos;t undo this
              action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                colorScheme="red"
                onClick={() => deleteEvalOnConfirm()}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
