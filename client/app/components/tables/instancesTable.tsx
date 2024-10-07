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
  Textarea,
  Icon,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { TaskInstance } from "../../lib/types";
import { Dispatch, SetStateAction } from "react";

export default function InstancesTable({
  instances,
  setInstances,
  onChange,
}: {
  instances: TaskInstance[];
  setInstances: Dispatch<SetStateAction<TaskInstance[]>>;
  onChange?: () => void;
}): JSX.Element {
  return (
    <TableContainer border="1px" borderRadius="md" borderColor="lightgray">
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
            <Tr
              key={index}
              position="relative"
              _hover={{ "& .delete-icon": { opacity: 1 } }}
            >
              {setInstances && (
                <Td>
                  <Checkbox
                    isChecked={instance.isPublic}
                    onChange={(e) => {
                      setInstances((prevInstances) => {
                        return prevInstances.map((value, idx) => {
                          const obj = { ...value };
                          if (idx === index) obj.isPublic = e.target.checked;
                          return obj;
                        });
                      });
                      if (onChange) onChange();
                    }}
                  />
                </Td>
              )}
              <Td>
                <Textarea
                  value={instance.input}
                  onChange={(e) => {
                    setInstances((prevInstances) => {
                      return prevInstances.map((value, idx) => {
                        const obj = { ...value };
                        if (idx === index) obj.input = e.target.value;
                        return obj;
                      });
                    });
                    if (onChange) onChange();
                  }}
                  variant="unstyled"
                  resize="vertical"
                />
              </Td>
              <Td>
                <Textarea
                  value={instance.ideal}
                  onChange={(e) => {
                    setInstances((prevInstances) => {
                      return prevInstances.map((value, idx) => {
                        const obj = { ...value };
                        if (idx === index) obj.ideal = e.target.value;
                        return obj;
                      });
                    });
                    if (onChange) onChange();
                  }}
                  variant="unstyled"
                  resize="vertical"
                />
              </Td>
              <Td>
                <Box
                  position="absolute"
                  right="4"
                  top="50%"
                  transform="translateY(-50%)"
                >
                  <Icon
                    as={DeleteIcon}
                    opacity={0}
                    className="delete-icon"
                    cursor="pointer"
                    transition="opacity 0.1s"
                    onClick={() => {
                      if (setInstances) {
                        const updatedInstances = instances.filter(
                          (_, i) => i !== index,
                        );
                        setInstances(updatedInstances);
                        if (onChange) onChange();
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
