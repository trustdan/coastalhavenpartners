'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Columns3, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OPTIONAL_COLUMNS, type OptionalColumnKey } from '@/lib/constants/firms'

interface ColumnSelectorProps {
  selectedColumns: OptionalColumnKey[]
}

export function ColumnSelector({ selectedColumns }: ColumnSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const toggleColumn = (columnKey: OptionalColumnKey) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentColumns = params.get('columns')?.split(',').filter(Boolean) || []

    let newColumns: string[]
    if (currentColumns.includes(columnKey)) {
      newColumns = currentColumns.filter(c => c !== columnKey)
    } else {
      newColumns = [...currentColumns, columnKey]
    }

    if (newColumns.length > 0) {
      params.set('columns', newColumns.join(','))
    } else {
      params.delete('columns')
    }

    startTransition(() => {
      router.push('?' + params.toString())
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Columns3 className="h-4 w-4" />
          Columns
          {selectedColumns.length > 0 && (
            <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {selectedColumns.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Optional Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONAL_COLUMNS.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.key}
            checked={selectedColumns.includes(column.key)}
            onCheckedChange={() => toggleColumn(column.key)}
            disabled={isPending}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
