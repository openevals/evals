import {
  TableContainer,
  Thead,
  Table,
  Tr,
  Th,
  Tbody,
  Td,
  Checkbox
} from '@chakra-ui/react';
import { TaskInstance } from '../lib/types';

export default function InstancesTable({
  instances,
  setInstances,
}: {
  instances: TaskInstance[];
  setInstances?: (instances: TaskInstance[]) => void;
}): JSX.Element {
  return (
    <TableContainer
      border='1px'
      borderRadius='md'
      borderColor='lightgray'>
      <Table>
        <Thead>
          <Tr>
            {setInstances &&(<Th>Public?</Th>)}
            <Th>Input</Th>
            <Th>Ideal Output</Th>
          </Tr>
        </Thead>
        <Tbody>
          {instances.map((instance, index) => (
            <Tr key={index}>
              {setInstances &&
                (<Td>
                 
                  <Checkbox
                    isChecked={instance.isPublic}
                    onChange={(e) => {
                      const updatedInstances = [...instances];
                      updatedInstances[index].isPublic = e.target.checked;
                      setInstances(updatedInstances);
                    }}
                  />
                </Td>)
              }
              <Td>{instance.input}</Td>
              <Td>{instance.ideal}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}