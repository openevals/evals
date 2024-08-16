'use client';

import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, TableCaption } from '@chakra-ui/react';
import useEvalResults from "../lib/hooks/useEvalResults";

export default function InstanceOutputResults({ evalId, evalRunIds, evalName }: { evalId: number, evalRunIds: number[], evalName: string }) {
  const { evalRuns } = useEvalResults(evalId, evalRunIds);

  return (
    <TableContainer>
      <Table variant='simple'>
        <TableCaption>{evalName}</TableCaption>
        <Thead>
          <Tr>
            <Th>Model</Th>
            {/* <Th>Ideal Output</Th> */}
            <Th>Actual Output</Th>
          </Tr>
        </Thead>
        <Tbody>
          {evalRuns.map((run) =>
            run.taskInstanceOutputs.map((output, index) => (
              <Tr key={`eval-run-result-${run.id}-${index}`}>
                <Td>{run.model.modelName}</Td>
                <Td>{output.output}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}