'use client';

import { useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  TableCaption,
  TabPanel,
  Heading,
  Box
} from '@chakra-ui/react';

import useEvalResults from "../lib/hooks/useEvalResults";


export default function EvalRunResults({ evalId, evalRunIds, evalName }: { evalId: number, evalRunIds: number[], evalName: string }) {
  const { evalRuns } = useEvalResults(evalId, evalRunIds);

  return (
    <>
      <Box>
        <Heading size='md'>Aggregate Results</Heading>
        <TableContainer>
          <Table variant='simple'>
            <TableCaption>{'Model results for ' + evalName}</TableCaption>
            <Thead>
              <Tr>
                <Th>Model</Th>
                <Th>Score</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {evalRuns.map((run) => (
                <Tr key={`eval-run-result-${run.id}`}>
                  <Td>{run.model.modelName}</Td>
                  <Td>{run.score}</Td>
                  <Td>{run.status}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
      <Box py={8}>
        <Heading size='md'>Model Results</Heading>
        <TableContainer>
          <Table variant='simple'>
            <TableCaption>{'Model outputs for ' + evalName}</TableCaption>
            <Thead>
              <Tr>
                <Th>Model</Th>
                {evalRuns[0]?.taskInstanceOutputs.map((_, index) => (
                  <Th key={`input-${index}`}>Input {index + 1}</Th>
                ))}
                <Th>Correct Outputs</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>Ideal Output</Td>
                {evalRuns[0]?.taskInstanceOutputs.map((output, index) => (
                  <Td key={`ideal-${index}`}>{output.idealOutput}</Td>
                ))}
                <Td>N/A</Td>
              </Tr>
              {evalRuns.map((run) => (
                <Tr key={`eval-run-result-${run.id}`}>
                  <Td>{run.model.modelName}</Td>
                  {run.taskInstanceOutputs.map((output, index) => (
                    <Td key={`output-${run.id}-${index}`}>{output.output}</Td>
                  ))}
                  <Td>{run.taskInstanceOutputs.filter(output => output.output === output.idealOutput).length}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}