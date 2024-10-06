import * as React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  chakra,
  Box,
  Button,
  Flex,
  Text,
  Select,
} from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  maxRows?: number;
};

export function BasicTable<Data extends object>({
  data,
  columns,
  maxRows = 10,
}: DataTableProps<Data>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: maxRows,
  });

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
    defaultColumn: {
      minSize: 20,
      maxSize: 400,
    },
    columnResizeMode: "onChange",
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

  const pageSizeOptions = React.useMemo(() => {
    const totalRows = data.length;
    const options = [10, 25, 50];
    while (options[options.length - 1] < totalRows) {
      options.push(options[options.length - 1] * 2);
    }
    if (!options.includes(totalRows)) {
      options.push(totalRows);
    }
    return options.filter((option) => option <= totalRows);
  }, [data.length]);

  return (
    <Box overflowX="auto" width="100%">
      <Table
        variant="simple"
        borderWidth="1px"
        borderRadius="lg"
        borderColor="gray.200"
        style={{
          ...columnSizeVars,
          width: "100%",
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
                      width:
                        meta?.width ||
                        `calc(var(--header-${header.id}-size) * 1px)`,
                      position: "relative",
                      borderRight: "1px solid",
                      borderColor: "inherit",
                      cursor: "pointer",
                    }}
                    _hover={{
                      backgroundColor: "gray.100",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
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
                      width:
                        meta?.width ||
                        `calc(var(--col-${cell.column.id}-size) * 1px)`,
                      borderRight: "1px solid",
                      borderColor: "inherit",
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
      {data.length > maxRows && (
        <Flex justifyContent="space-between" alignItems="center" mt={4}>
          <Flex>
            <Button
              onClick={() => table.setPageIndex(0)}
              isDisabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </Button>
            <Button
              onClick={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
              ml={2}
            >
              {"<"}
            </Button>
          </Flex>
          <Flex alignItems="center" width="auto">
            <Text>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </Text>
            <Select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              ml={2}
            >
              {pageSizeOptions.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </Select>
          </Flex>
          <Flex>
            <Button
              onClick={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
              mr={2}
            >
              {">"}
            </Button>
            <Button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              isDisabled={!table.getCanNextPage()}
            >
              {">>"}
            </Button>
          </Flex>
        </Flex>
      )}
    </Box>
  );
}
