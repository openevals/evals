'use client';

import { Button, Grid, GridItem, HStack } from '@chakra-ui/react';
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Textarea,
  VStack,
  Spacer,
  Input,
  Checkbox,
  Text,
  Wrap,
  WrapItem,
  Select,
  Progress,
  Spinner,
} from '@chakra-ui/react'
import { IconButton } from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons';

export default function EditorPage() {

  const toggleSpinner = () => {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
      loadingSpinner.hidden = !loadingSpinner.hidden;
    }
  };

  return (
    <>
      <Grid 
        h='1024px'
        w='100%'
        templateRows='repeat(11, 1fr)'
        templateColumns='repeat(2, 1fr)'
        gap={4}
        p={4}
        border='1px'
        borderColor='lightgray'
        borderRadius='md'
      >
        <GridItem rowSpan={1} colSpan={2}>
          <HStack mx={2}>
            <Input variant='flushed' placeholder='Name of your Eval' maxW='384px'/>
            <Spacer />
            <Spinner id='loadingSpinner' hidden />
            <IconButton variant='link' aria-label="Info on submit" icon={<InfoOutlineIcon/>} />
            <Button px={8} onClick={toggleSpinner}>Submit to OpenEvals</Button>
          </HStack>
        </GridItem>
        <GridItem rowSpan={1} colSpan={2}>
          <Progress value={80} />
        </GridItem>
        <GridItem rowSpan={1} colSpan={2}>
          <Accordion allowToggle allowMultiple defaultIndex={[0,1]}>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as='span' flex='1' textAlign='left'>
                    Method to evaluate
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Select placeholder='Select validator type'>
                  <option value='exact'>Exact</option>
                  <option value='fuzzy'>Fuzzy</option>
                  <option value='model-graded'>Model-graded</option>
                  <option value='custom'>Custom</option>
                </Select>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as='span' flex='1' textAlign='left'>
                    Models to test
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Wrap direction='column'>
                  <WrapItem><Checkbox defaultChecked>Gemini-1.5-Pro-Exp-0801</Checkbox></WrapItem>
                  <WrapItem><Checkbox defaultChecked>GPT-4o-2024-05-13</Checkbox></WrapItem>
                  <WrapItem><Checkbox defaultChecked>GPT-4o-mini-2024-07-18</Checkbox></WrapItem>
                  <WrapItem><Checkbox defaultChecked>claude-3-sonnet-20240620</Checkbox></WrapItem>
                  <WrapItem><Checkbox>GPT-4</Checkbox></WrapItem>
                  <WrapItem><Checkbox>Gemini-Advanced-0514</Checkbox></WrapItem>
                  <WrapItem><Checkbox>claude-3-opus-20240229</Checkbox></WrapItem>
                </Wrap>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </GridItem>
        <GridItem rowSpan={4} colSpan={1}>
          Input
          <Textarea placeholder='Input Text' />
        </GridItem>
        <GridItem rowSpan={4} colSpan={1}>
          Output
          <Textarea placeholder='Ideal Text Output' />
        </GridItem>
        <GridItem rowSpan={4} colSpan={2}>
          Eval data
          <TableContainer
          border='1px'
          borderRadius='md'
          borderColor='lightgray'>
            <Table 
            variant='striped' 
            colorScheme='blue' 
            >
              <Thead>
                <Tr>
                  <Th>Public example?</Th>
                  <Th>Input</Th>
                  <Th>Ideal Output</Th>
                  <Th isNumeric>multiply by</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td><Checkbox /></Td>
                  <Td>inches</Td>
                  <Td>millimetres (mm)</Td>
                  <Td isNumeric>25.4</Td>
                </Tr>
                <Tr>
                  <Td><Checkbox /></Td>
                  <Td>feet</Td>
                  <Td>centimetres (cm)</Td>
                  <Td isNumeric>30.48</Td>
                </Tr>
                <Tr>
                  <Td><Checkbox /></Td>
                  <Td>yards</Td>
                  <Td>metres (m)</Td>
                  <Td isNumeric>0.91444</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </GridItem>
      </Grid>
    </>
  )
}