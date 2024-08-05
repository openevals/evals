import { Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react'

import { ModelName } from "../lib/constants";

type Run = {
  model: ModelName;
  score: number;
};

export default function RunResults({
  evalName,
  runs,
}: {
  evalName: string;
  runs: Run[];
}) {
  return (
    <>
      <TableContainer>
        <Table variant='simple'>
          <TableCaption>{evalName}</TableCaption>
          <Thead>
            <Tr>
              <Th>Model</Th>
              <Th>Score</Th>
            </Tr>
          </Thead>
          <Tbody>
            {runs.map((run, index) => (
              <Tr key={index}>
                <Td>{run.model}</Td>
                <Td>{run.score}</Td>
              </Tr>
            ))}
          </Tbody> 
        </Table>
      </TableContainer>
    </>
  );
}