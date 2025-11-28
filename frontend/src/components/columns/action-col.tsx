"use client"

import { Button } from "../ui/button"
import { Info, Pencil, Trash2 } from "lucide-react"

type ActionCellProps<T> = {
  data: T
  onEdit?: (data: T) => void
  onView?: (data: T) => void
  onDelete?: (data: T) => void
}

export function ActionCell<T>({ data, onEdit, onView, onDelete }: ActionCellProps<T>) {
  return (
    <div className="flex flex-row justify-end">
      {onEdit && (
        <Button size="sm" variant="flogin_edit" onClick={() => onEdit(data)}>
          <Pencil className="w-4 h-4" />
        </Button>
      )}
      {onView && (
        <Button size="sm" variant="flogin_edit" onClick={() => onView(data)}>
          <Info className="w-4 h-4" />
        </Button>
      )}
      {onDelete && (
        <Button variant="flogin_delete" size="sm" onClick={() => onDelete(data)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
