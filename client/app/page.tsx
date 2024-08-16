"use client";

import {
  Tabs, TabList, TabPanels, Tab, TabPanel,
} from '@chakra-ui/react';
import Editor from "./components/editor";
import Results from "./components/results";


import { useSelector } from 'react-redux';
import { IRootState } from '@/app/lib/store';
import { IEvalListItemResponse } from './lib/types';
import ItemDetails from './components/itemDetails';

export default function Home() {
  const evals = useSelector<IRootState, IEvalListItemResponse[]>((state: IRootState) => state.data.evals);
  return (
    <Tabs variant='soft-rounded' w='100%' defaultIndex={1}>
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
          <Results evals={evals ?? []} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
