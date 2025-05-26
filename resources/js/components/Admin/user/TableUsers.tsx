import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from "@tanstack/react-table"
   
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

  import DeleteUser from './delete-user'

  import React, { useEffect, useState } from "react"

  interface withId {
    id: number | string;
  }

  interface DataTableProps<TData extends withId, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
  }

  export function TableUser<TData extends withId, TValue> ({
    columns,
    data,
  }: DataTableProps<TData,TValue>) {

    // Create a object table based on data, columns, etc
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel:getCoreRowModel(),
        enableRowSelection: true,
    })

    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

    // Get all row selected
    useEffect(() => {
        const selectedRows = table.getSelectedRowModel().rows;
        const ids = selectedRows.map((row) => row.original.id);
        setSelectedIds(ids);
      }, [table.getSelectedRowModel().rows]);

    return (
    <>
        <DeleteUser userIds={selectedIds}/>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                        ? null
                                        :flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ): (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    </>
    )
  }