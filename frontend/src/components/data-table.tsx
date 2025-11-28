"use client"

import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"

import type { ColumnDef, ColumnFiltersState } from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onAdd?: () => void
    addButtonLabel?: string
}

export function DataTable<TData, TValue>({ columns, data, onAdd, addButtonLabel = "Tạo mới" }: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )

    const filterableColumns = React.useMemo(
        () => columns.filter((col: any) => col.accessorKey),
        [columns]
    )

    const [filterColumn, setFilterColumn] = React.useState<string>(
        (filterableColumns[0] as any)?.accessorKey || ""
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            columnFilters,
        },
    })

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center p-4 gap-2 bg-inherit">
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-s ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={filterColumn}
                    onChange={(event) => {setFilterColumn(event.target.value)
                        table.resetColumnFilters()
                    }}
                >
                    {filterableColumns.map((col: any) => (
                        <option key={col.accessorKey} value={col.accessorKey}>
                            {typeof col.header === "string" ? col.header : col.accessorKey}
                        </option>
                    ))}
                </select>
                <Input
                    placeholder="Tìm kiếm..."
                    value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <div className="flex flex-1 justify-end">
                    {onAdd && (
                        <Button onClick={onAdd}>{addButtonLabel}</Button>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-hidden border-t-2 border-secondary/20">
                <Table>
                    <TableHeader className="select-none">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-secondary/10">
                                {headerGroup.headers.map((header, index) => {
                                    const isFirst = index === 0
                                    const isLast = index === headerGroup.headers.length - 1
                                    const isMiddle = !isFirst && !isLast
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={`text-primary font-bold ${isFirst ? "pl-10 text-left" : ""} ${isLast ? "pr-8 text-right" : ""} ${isMiddle ? "text-center" : ""}`}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
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
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}
                                className="text-primary font-sans text-lg"
                                >
                                    {row.getVisibleCells().map((cell, index) => {
                                        const isFirst = index === 0
                                        const isLast = index === row.getVisibleCells().length - 1
                                        const isMiddle = !isFirst && !isLast
                                        return (
                                            <TableCell key={cell.id}
                                                className={`${isFirst ? "pl-10 text-left" : ""} ${isLast ? "pr-5 text-right" : ""} ${isMiddle ? "text-center" : ""}`}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Không có dữ liệu.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end p-4 border-t-2 gap-x-4 border-secondary/20 bg-inherit select-none">
                <Button
                    variant="flogin_deactivate"
                    className="border-1.0 border-secondary"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Trước
                </Button>
                <Button
                    variant="flogin_activate"
                    className="border-1.0 "
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Tiếp
                </Button>
            </div>
        </div>
    )
}