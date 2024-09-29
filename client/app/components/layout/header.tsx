"use client";

import {
  Input, HStack, Button, Heading, Spacer, Box, Flex, Link, Avatar,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useOutsideClick,
  Text,
  Center,
  useBreakpointValue,
  VStack,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
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
import { Roboto_Mono } from 'next/font/google';
import KeysSettings from '../keySettings/modal';

const robotoMono = Roboto_Mono({ subsets: ['latin'] });

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
  const mobileInputRef = useRef<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();


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
    setSuggestions([]);
    setIsOpen(false);
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
  const isMobile = useBreakpointValue({ base: true, sm: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: true, xl: true, '2xl': false });
  const isDesktop = useBreakpointValue({ base: false, '2xl': true });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <VStack spacing={4} align="stretch" my={8} mx={8} className={robotoMono.className}>
      {isMobile ? (
        <MobileHeader
          inputValue={inputValue}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          doSearch={doSearch}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          mobileInputRef={mobileInputRef}
          gotoHome={gotoHome}
          isAuthenticated={isAuthenticated}
          profile={profile}
          dispatch={dispatch}
          router={router}
        />
      ) : (
        <HStack>
          <Text as='b' fontSize='xl' cursor='pointer' onClick={gotoHome} mr={2}>OpenEvals</Text>
          <Popover isOpen={isOpen && suggestions.length > 0} onClose={() => setIsOpen(false)} initialFocusRef={inputRef} placement="bottom-start">
            <PopoverTrigger>
              <Input
                placeholder="Start typing..."
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                ref={inputRef}
                autoComplete='off'
                maxW={isDesktop ? '30%' : '100%'}
              />
            </PopoverTrigger>
            <PopoverContent width={inputRef?.current?.offsetWidth + "px"} ref={popoverRef} maxH='60vh' overflowY='auto'>
              <PopoverBody p={0}>
                {suggestions.map((suggestion, index) => (
                  <Box
                    key={index}
                    p={2}
                    _hover={{ bg: 'gray.100' }}
                    cursor="pointer"
                    onClick={() => {
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
          {isDesktop && <NavButtons />}
          <Button mx={8} variant="link" onClick={() => router.push('/about')}>About</Button>
          {isAuthenticated && profile ? (
            <Menu>
              <MenuButton as={Avatar} name={profile.username} src={profile.githubAvatar} h="32px" w="32px" cursor="pointer" />
              <MenuList zIndex={999}>
                <MenuItem>{profile.username}<br />{profile.email}</MenuItem>
                <MenuDivider />
                <MenuItem onClick={() => router.push('/my-evals')}>My Evals</MenuItem>
                <MenuDivider />
                <MenuItem as={Box} onClick={() => window.open(`https://www.github.com/${profile.githubLogin}`, "_blank")} cursor="pointer">Github profile</MenuItem>
                <MenuDivider />
                <MenuItem as={Box} onClick={() => dispatch(logoutUser())} cursor="pointer">Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <GithubLoginButton 
              text="Connect with Github"
              height={32} 
            />
          )}
          <KeysSettings />
        </HStack>
      )}
      {isTablet && <NavButtons />}
    </VStack>
  );
}
interface MobileHeaderProps {
  inputValue: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  doSearch: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileInputRef: React.RefObject<HTMLInputElement>;
  gotoHome: () => void;
  isAuthenticated: boolean;
  profile: IUserProfileResponse | null;
  dispatch: any; // Consider using a more specific type if possible
  router: any; // Consider using a more specific type if possible
}
import { Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure } from "@chakra-ui/react";
import { HamburgerIcon} from "@chakra-ui/icons";

const MobileHeader = ({
  inputValue,
  handleChange,
  handleKeyDown,
  doSearch,
  isSearchOpen,
  setIsSearchOpen,
  mobileInputRef,
  gotoHome,
  isAuthenticated,
  profile,
  dispatch,
  router
}: MobileHeaderProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <HStack>
        <IconButton
          aria-label="Menu"
          icon={<HamburgerIcon />}
          onClick={onOpen}
          mr={2}
        />
        <Text as='b' fontSize='xl' cursor='pointer' onClick={gotoHome} mr={2}>OpenEvals</Text>
        <Spacer />
        <IconButton
          aria-label="Search"
          variant="link"
          icon={<SearchIcon/>}
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            setTimeout(() => mobileInputRef.current?.focus(), 0);
          }}
        />
        {isAuthenticated && profile ? (
          <Menu>
            <MenuButton as={Avatar} name={profile.username} src={profile.githubAvatar} h="32px" w="32px" cursor="pointer" />
            <MenuList zIndex={999}>
              <MenuItem>{profile.username}<br />{profile.email}</MenuItem>
              <MenuDivider />
              <MenuItem onClick={() => router.push('/my-evals')}>My Evals</MenuItem>
              <MenuDivider />
              <MenuItem as={Box} onClick={() => window.open(`https://www.github.com/${profile.githubLogin}`, "_blank")} cursor="pointer">Github profile</MenuItem>
              <MenuDivider />
              <MenuItem as={Box} onClick={() => dispatch(logoutUser())} cursor="pointer">Logout</MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <GithubLoginButton 
            text=""
            height={32} 
          />
        )}
      </HStack>
      <Text textAlign='center'>OpenEvals: the crowdsourced evals database.</Text>
      {isSearchOpen && (
        <Box position="fixed" top={4} left={0} right={0} bg="white" p={4} zIndex={1000}>
          <Flex alignItems="center">
            <Input
              placeholder="Start typing..."
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoComplete='off'
              flex={1}
              mr={2}
              ref={mobileInputRef}
              onBlur={() => {
                setTimeout(() => setIsSearchOpen(false), 100);
              }}
            />
            <IconButton
              aria-label="Search"
              icon={<SearchIcon />}
              onClick={() => doSearch()}
            />
          </Flex>
        </Box>
      )}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Main menu</DrawerHeader>
          <DrawerBody>
            <NavButtons direction='column' />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
