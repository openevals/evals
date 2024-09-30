import * as React from "react";
import { Table, Thead, Tbody, Tr, Th, Td, chakra, Box } from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel
} from "@tanstack/react-table";

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
};

export function BasicTable<Data extends object>({
  data,
  columns
}: DataTableProps<Data>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting
    },
    defaultColumn: {
      minSize: 30,
      maxSize: 400,
    },
    columnResizeMode: 'onChange',
  });

  const columnSizeVars = React.useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

  return (
    <Box overflowX="auto">
      <Table 
        variant="simple" 
        borderWidth="1px" 
        borderRadius="lg"
        borderColor="gray.200"
        style={{
          ...columnSizeVars,
          width: table.getTotalSize(),
        }}
      >
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta: any = header.column.columnDef.meta;
                return (
                  <Th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    isNumeric={meta?.isNumeric}
                    style={{
                      width: `calc(var(--header-${header.id}-size) * 1px)`,
                      position: 'relative',
                      borderRight: '1px solid',
                      borderColor: 'inherit',
                      cursor: 'pointer',
                    }}
                    _hover={{
                      backgroundColor: "gray.100",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                    <Box
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                      ml="2"
                      width="20px"
                      height="20px"
                    >
                      {header.column.getIsSorted() ? (
                        header.column.getIsSorted() === "desc" ? (
                          <TriangleDownIcon aria-label="sorted descending" />
                        ) : (
                          <TriangleUpIcon aria-label="sorted ascending" />
                        )
                      ) : null}
                    </Box>
                    <Box
                      position="absolute"
                      top={0}
                      right={0}
                      bottom={0}
                      width="5px"
                      cursor="col-resize"
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      _hover={{
                        backgroundColor: "gray.200",
                      }}
                    />
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map((row) => (
            <Tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const meta: any = cell.column.columnDef.meta;
                return (
                  <Td 
                    key={cell.id} 
                    isNumeric={meta?.isNumeric}
                    style={{
                      width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                      borderRight: '1px solid',
                      borderColor: 'inherit',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
