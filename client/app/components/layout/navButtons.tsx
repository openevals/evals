"use client";

import {
  Tabs, TabList, Tab,
} from '@chakra-ui/react';


import { useSelector } from 'react-redux';
import { IRootState } from '../../lib/store';
import { IEvalListItemResponse } from '../../lib/types';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function NavButtons() {
  const router = useRouter();
  const pathname = usePathname();
  const [tabIndex, setTabIndex] = useState(0);
  const [lastEvalId, setLastEvalId] = useState(0);
  const evals = useSelector<IRootState, IEvalListItemResponse[]>((state: IRootState) => state.data.evals);


  useEffect(() => {
    if (pathname == `/evals/${lastEvalId}`) {
      setTabIndex(0);
    } else if (pathname == '/') {
      setTabIndex(1);
    } else if (pathname == '/evals/vote') {
      setTabIndex(3);
    } else {
      setTabIndex(-1);
    }
  }, [pathname, lastEvalId]);

  const gotoPage = (page: string) => {
    if (pathname == page) return;
    router.push(page);
  };

  const feelingLucky = () => {
    const idx = Math.floor(Math.random() * evals.length);
    if (idx >= evals.length) {
      gotoPage('/');
      setTabIndex(1);
      return false;
    }
    const id = evals[idx].id;
    setLastEvalId(id);
    gotoPage(`/evals/${id}`);
    return true;
  };

  const handleTabsChange = (index: number) => {
    switch (index) {
      case 0:
        if (!feelingLucky()) return;
        break;
      case 1:
        gotoPage('/');
        break;
      case 2:
        gotoPage('/');
        setTabIndex(1);
        return;
      case 3:
        gotoPage('/evals/vote');
        break;
    }
    setTabIndex(index);
  };

  return (
    <Tabs variant='soft-rounded' w='100%' defaultIndex={1} index={tabIndex} onChange={handleTabsChange}>
      <TabList>
        <Tab onClick={feelingLucky}>{"I'm feeling lucky 🍀"}</Tab>
        <Tab>Create your own eval (5 min) ⚒️</Tab>
        <Tab onClick={() => gotoPage('/evals/vote')}>Browse evals 😌</Tab>
      </TabList>
    </Tabs>
  );
}
