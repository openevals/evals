'use client';

import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, TableCaption } from '@chakra-ui/react';
import useEvalResults from "../lib/hooks/useEvalResults";


export default function EvalRunResults({ evalId, evalRunIds, evalName }: { evalId: number, evalRunIds: number[], evalName: string }) {
  const { evalRuns } = useEvalResults(evalId, evalRunIds);

  return (
    <TableContainer>
      <Table variant='simple'>
        <TableCaption>{evalName}</TableCaption>
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
  );
}