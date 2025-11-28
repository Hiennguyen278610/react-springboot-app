"use client"

import type { UserResponse } from "@/schema/user.schema"
import type { ColumnDef } from "@tanstack/react-table"
import { ActionCell } from "./action-col"

export type UserActionHandlers = {
  onEdit?: (user: UserResponse) => void
  onView?: (user: UserResponse) => void
  onDelete?: (user: UserResponse) => void
}

export const createUserColumns = (handlers?: UserActionHandlers): ColumnDef<UserResponse>[] => [
  {
    accessorKey: "id",
    header: "ID",
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      return String(row.getValue(columnId)) === String(filterValue)
    },
  },
  {
    accessorKey: "username",
    header: "TÊN ĐĂNG NHẬP",
  },
  {
    accessorKey: "mail",
    header: "MAIL",
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

export const columns = createUserColumns()