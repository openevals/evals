"use client";

import {
  Input, HStack, Button, Heading, Spacer, Box, Link, Avatar,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useOutsideClick,
} from '@chakra-ui/react';
import GithubLoginButton from '@/app/components/auth/github';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/app/lib/store';
import { IEvalListItemResponse, IUserProfileResponse } from '@/app/lib/types';
import { useEffect, useRef, useState } from 'react';
import { getUserProfile } from '@/app/utils/account';
import { setUserProfile, logoutUser } from '@/app/lib/store/authSlice';
import { getSupportedModels } from '@/app/utils/getEvalRun';
import { setEvals, setModels, setSearchTerm } from '@/app/lib/store/dataSlice';
import { getEvals } from '@/app/utils/getEvals';
import { useRouter, usePathname } from 'next/navigation';
import NavButtons from '@/app/components/layout/navButtons';

export default function HeaderComponent() {
  const dispatch = useDispatch();
  const accessToken = useSelector<IRootState, string>((state: IRootState) => state.auth.token);
  const profile = useSelector<IRootState, IUserProfileResponse>((state: IRootState) => state.auth.profile);
  const evals = useSelector<IRootState, IEvalListItemResponse[]>((state: IRootState) => state.data.evals);
  const isAuthenticated = useSelector<IRootState, boolean>((state: IRootState) => state.auth.isAuthenticated);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<IEvalListItemResponse[]>([]);
  const inputRef = useRef<any>(null);
  const popoverRef = useRef<any>(null);
  const [inputWidth, setInputWidth] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Update the input width to sync with the suggestions width
  const updateWidth = () => {
    if (inputRef.current) {
      setInputWidth(inputRef.current.offsetWidth);
    }
  };

  // Listen for screen resize to sync width
  useEffect(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Load all the models at the beginning
  useEffect(() => {
    const loadModels = async () => {
      const models = await getSupportedModels();
      dispatch(setModels(models));
    };
    loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load all the evals at the begining
  useEffect(() => {
    const loadEvals = async (token?: string) => {
      const evalsData = await getEvals(token);
      dispatch(setEvals(evalsData));
    };
    loadEvals(accessToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (isAuthenticated) {
      getUserProfile(accessToken).then((value) => {
        dispatch(setUserProfile(value));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter the evals by name and description
  const fetchSuggestions = (value: string) => {
    value = value.toLowerCase();
    if (evals.length > 0) {
      const filteredSuggestions = evals.filter((obj: IEvalListItemResponse) =>
        obj.name.toLowerCase().includes(value) || obj.description?.toLowerCase().includes(value)
      );
      setSuggestions(filteredSuggestions);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleChange = (event: any) => {
    const value = event.target.value;
    setInputValue(value);
    fetchSuggestions(value);
  };

  useOutsideClick({
    ref: popoverRef,
    handler: () => setIsOpen(false)
  });

  const doSearch = () => {
    if (inputValue.length == 0) return;
    dispatch(setSearchTerm(inputValue));
    if (pathname !== '/evals/search') {
      router.push('/evals/search');
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      doSearch();
    }
  };

  const gotoHome = () => {
    router.push('/');
  };

  return (
    <HStack my={8} mx={8}>
      <Heading size='md' cursor='pointer' onClick={gotoHome}>OpenEvals</Heading>
      <Popover isOpen={isOpen && suggestions.length > 0} onClose={() => setIsOpen(false)} initialFocusRef={inputRef} placement="bottom-start">
        <PopoverTrigger>
          <Input
            placeholder="Start typing..."
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            autoComplete='off'
          />
        </PopoverTrigger>
        <PopoverContent width={inputWidth + "px"} ref={popoverRef}>
          <PopoverBody p={0}>
            {suggestions.map((suggestion, index) => (
              <Box
                key={index}
                p={2}
                _hover={{ bg: 'gray.100' }}
                cursor="pointer"
                onClick={() => {
                  // Open eval details
                  router.push(`/evals/${suggestion.id}`);
                  setIsOpen(false);
                  setSuggestions([]);
                  setInputValue('');
                }}
              >
                {index > 0 && <hr />}
                <b>{suggestion.name}</b><br />
                {suggestion.description}
              </Box>
            ))}
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <Button px={8} onClick={() => doSearch()}>Search</Button>
      <Spacer />
      <NavButtons />
      <Button ml={8} mr={2} variant="link">About</Button>
      {isAuthenticated && profile ? (
        <Menu>
          <MenuButton as={Avatar} name={profile.username} src={profile.githubAvatar} h="32px" w="32px" cursor="pointer" />
          <MenuList zIndex={999}>
            <MenuItem>{profile.username}<br />{profile.email}</MenuItem>
            <MenuItem as={Box} onClick={() => window.open(`https://www.github.com/${profile.githubLogin}`, "_blank")} cursor="pointer">Github profile</MenuItem>
            <MenuItem>User profile</MenuItem>
            <MenuDivider />
            <MenuItem as={Box} onClick={() => dispatch(logoutUser())} cursor="pointer">Logout</MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <GithubLoginButton text="Connect with Github" height={32} />
      )}
    </HStack>
  );
}
