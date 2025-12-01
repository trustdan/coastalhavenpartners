'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function ExportButton() {
  const searchParams = useSearchParams()

  const handleExport = () => {
    // Build export URL with current filters
    const exportUrl = `/api/export/candidates?${searchParams.toString()}`
    window.location.href = exportUrl
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}
