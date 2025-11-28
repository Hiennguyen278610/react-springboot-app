"use client"

import { CategoryDisplayNames, type ProductResponse } from "@/schema/product.schema"
import type { ColumnDef } from "@tanstack/react-table"
import { ActionCell } from "./action-col"

export type ProductActionHandlers = {
  onEdit?: (product: ProductResponse) => void
  onView?: (product: ProductResponse) => void
  onDelete?: (product: ProductResponse) => void
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export const createProductColumns = (handlers?: ProductActionHandlers): ColumnDef<ProductResponse>[] => [
    {
        accessorKey: "id",
        header: "ID",
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            return String(row.getValue(columnId)) === String(filterValue)
        },
    },
    {
        accessorKey: "name",
        header: "TÊN SẢN PHẨM"
    },
    {
        accessorKey: "category",
        header: "LOẠI SẢN PHẨM",
        cell: ({ row }) => {
            const category = row.getValue("category") as keyof typeof CategoryDisplayNames
            return (
                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-2xl text-sm">
                    {CategoryDisplayNames[category] || category}
                </span>
            )
        },
    },
    {
        accessorKey: "quantity",
        header: "SỐ LƯỢNG",
    },
    {
        accessorKey: "price",
        header: "GIÁ",
        cell: ({ row }) => formatPrice(row.getValue("price")),
    },
    {
        id: "actions",
        header: "HÀNH ĐỘNG",
        cell: ({ row }) => (
            <ActionCell 
                data={row.original}
                onEdit={handlers?.onEdit}
                onView={handlers?.onView}
                onDelete={handlers?.onDelete}
            />
        ),
    },
]

export const productColumns = createProductColumns()    