'use client'

import { X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MultiSelectTagsProps {
  id: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  maxSelections?: number
}

export function MultiSelectTags({
  id,
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  maxSelections = 5,
}: MultiSelectTagsProps) {
  // Filter out already selected options
  const availableOptions = options.filter(opt => !selected.includes(opt))
  const canAddMore = selected.length < maxSelections

  const handleSelect = (value: string) => {
    if (value && value !== '__placeholder__' && !selected.includes(value) && canAddMore) {
      onChange([...selected, value])
    }
  }

  const handleRemove = (valueToRemove: string) => {
    onChange(selected.filter(v => v !== valueToRemove))
  }

  return (
    <div className="space-y-2">
      <Select
        value="__placeholder__"
        onValueChange={handleSelect}
        disabled={!canAddMore}
      >
        <SelectTrigger id={id} className={!canAddMore ? 'opacity-50' : ''}>
          <SelectValue placeholder={canAddMore ? placeholder : `Maximum ${maxSelections} selected`} />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.length === 0 ? (
            <SelectItem value="__placeholder__" disabled>
              {selected.length >= maxSelections ? 'Maximum reached' : 'No more options'}
            </SelectItem>
          ) : (
            availableOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
            >
              {value}
              <button
                type="button"
                onClick={() => handleRemove(value)}
                className="hover:text-purple-600 dark:hover:text-purple-100 transition-colors"
                aria-label={`Remove ${value}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-500">
        {selected.length}/{maxSelections} selected
      </p>
    </div>
  )
}
