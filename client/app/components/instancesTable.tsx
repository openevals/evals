import {
  TableContainer,
  Thead,
  Table,
  Tr,
  Th,
  Tbody,
  Td,
  Checkbox,
  Box,
  Input,
  Icon,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { TaskInstance } from '../lib/types';

export default function InstancesTable({
  instances,
  setInstances,
}: {
  instances: TaskInstance[];
  setInstances: (instances: TaskInstance[]) => void;
}): JSX.Element {
  return (
    <TableContainer
      border='1px'
      borderRadius='md'
      borderColor='lightgray'>
      <Table>
        <Thead>
          <Tr>
            <Th>Public?</Th>
            <Th>Input</Th>
            <Th>Ideal Output</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {instances.map((instance, index) => (
            <Tr key={index} position="relative" _hover={{ "& .delete-icon": { opacity: 1 } }}>
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
              <Td>
                <Input
                  value={instance.input}
                  onChange={(e) => {
                    const updatedInstances = [...instances];
                    updatedInstances[index].input = e.target.value;
                    setInstances(updatedInstances);
                  }}
                  variant='unstyled'
                />
              </Td>
              <Td>
                <Input
                  value={instance.ideal}
                  onChange={(e) => {
                    const updatedInstances = [...instances];
                    updatedInstances[index].ideal = e.target.value;
                    setInstances(updatedInstances);
                  }}
                  variant='unstyled'
                />
              </Td>
              <Td>
                <Box position="absolute" right="4" top="50%" transform="translateY(-50%)">
                  <Icon
                    as={DeleteIcon}
                    opacity={0}
                    className="delete-icon"
                    cursor="pointer"
                    transition="opacity 0.1s"
                    onClick={() => {
                      if (setInstances) {
                        const updatedInstances = instances.filter((_, i) => i !== index);
                        setInstances(updatedInstances);
                      }
                    }}
                  />
                </Box>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}