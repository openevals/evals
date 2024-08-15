"use client";

import {
  Input, HStack, Button, Heading, Spacer, Box, Link,
  Tabs, TabList, TabPanels, Tab, TabPanel, Avatar,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
} from '@chakra-ui/react';
import Editor from "./components/editor";
import Results from "./components/results";

import TopEvals from "./components/topEvals";
import GithubLoginButton from '@/app/components/auth/github';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/app/lib/store';
import { IUserProfileResponse } from './lib/types';
import { useEffect } from 'react';
import { getUserProfile } from './utils/account';
import { setUserProfile, logoutUser } from '@/app/lib/store/authSlice';
import ItemDetails from './components/itemDetails';

export default function Home() {
  const dispatch = useDispatch();
  const accessToken = useSelector<IRootState, string>((state: IRootState) => state.auth.token);
  const profile = useSelector<IRootState, IUserProfileResponse>((state: IRootState) => state.auth.profile);
  const isAuthenticated = useSelector<IRootState, boolean>((state: IRootState) => state.auth.isAuthenticated);


  useEffect(() => {
    if (isAuthenticated) {
      getUserProfile(accessToken).then((value) => {
        dispatch(setUserProfile(value));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <main>
      <HStack my={4} mx={8}>
        <Heading size='md'>OpenEvals</Heading>
        <Input ml={4} maxW={756} placeholder='Search OpenEvals' variant='outline' />
        <Button>Search</Button>
        <Spacer />
        <Button ml={16} mr={2} variant="link">About</Button>
        {isAuthenticated && profile ? (
          <Menu>
            <MenuButton as={Avatar} name={profile.username} src={profile.githubAvatar} h="32px" w="32px" cursor="pointer" />
            <MenuList zIndex={999}>
              <MenuItem>Reinier Millo<br />reinier.millo88@gmail.com</MenuItem>
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
      <Tabs variant='soft-rounded' w='100%' px={4} defaultIndex={1}>
        <TabList>
          <Tab>{"I'm feeling lucky 🍀"}</Tab>
          <Tab>Create your own eval (5 min) ⚒️</Tab>
          <Tab>Contribute to an existing eval! 💛</Tab>
          <Tab>Vote on important evals 😌</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ItemDetails />
          </TabPanel>
          <TabPanel>
            <Editor />
          </TabPanel>
          <TabPanel>
            <Editor />
          </TabPanel>
          <TabPanel>
            <Box w="50%">
              <Results />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
}
