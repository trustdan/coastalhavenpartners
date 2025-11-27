'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from './input'
import { X } from 'lucide-react'

interface MultiAutocompleteInputProps {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  fetchSuggestions: (query: string) => Promise<string[]>
  debounceMs?: number
}

export function MultiAutocompleteInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  fetchSuggestions,
  debounceMs = 200,
}: MultiAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Parse current values and get the active (last) value being typed
  const parseValues = useCallback(() => {
    const parts = value.split(',').map(s => s.trim())
    const completed = parts.slice(0, -1).filter(Boolean)
    const active = parts[parts.length - 1] || ''
    return { completed, active }
  }, [value])

  const fetchSuggestionsDebounced = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      if (query.length < 1) {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      const { completed } = parseValues()

      setIsLoading(true)
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await fetchSuggestions(query)
          // Filter out already-selected values
          const filtered = results.filter(
            r => !completed.some(c => c.toLowerCase() === r.toLowerCase())
          )
          setSuggestions(filtered)
          setIsOpen(filtered.length > 0)
          setHighlightedIndex(-1)
        } catch (error) {
          console.error('Error fetching suggestions:', error)
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      }, debounceMs)
    },
    [fetchSuggestions, debounceMs, parseValues]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Get the active value (after last comma)
    const parts = newValue.split(',')
    const activeValue = parts[parts.length - 1].trim()

    fetchSuggestionsDebounced(activeValue)
  }

  const handleSelectSuggestion = (suggestion: string) => {
    const { completed } = parseValues()
    // Add the selected suggestion to the list
    const newValues = [...completed, suggestion]
    onChange(newValues.join(', ') + ', ')

    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleRemoveValue = (indexToRemove: number) => {
    const { completed, active } = parseValues()
    const newCompleted = completed.filter((_, i) => i !== indexToRemove)
    const newValue = active
      ? newCompleted.join(', ') + (newCompleted.length > 0 ? ', ' : '') + active
      : newCompleted.join(', ')
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      // Handle backspace to remove last tag when input is empty or at start
      if (e.key === 'Backspace') {
        const { completed, active } = parseValues()
        if (active === '' && completed.length > 0) {
          e.preventDefault()
          handleRemoveValue(completed.length - 1)
        }
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        if (highlightedIndex >= 0) {
          e.preventDefault()
          handleSelectSuggestion(suggestions[highlightedIndex])
        }
        break
      case 'Tab':
        if (highlightedIndex >= 0) {
          e.preventDefault()
          handleSelectSuggestion(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const handleFocus = () => {
    const { active } = parseValues()
    if (active.length >= 1 && suggestions.length > 0) {
      setIsOpen(true)
    }
  }

  const { completed, active } = parseValues()

  return (
    <div className="relative">
      {/* Tags display */}
      {completed.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {completed.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveValue(index)}
                className="hover:text-purple-600 dark:hover:text-purple-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={completed.length === 0 ? placeholder : 'Add more...'}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${id}-suggestions`}
        />

        {isOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            id={`${id}-suggestions`}
            className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg dark:bg-neutral-900 dark:border-neutral-700 max-h-60 overflow-auto"
            role="listbox"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                  index === highlightedIndex
                    ? 'bg-neutral-100 dark:bg-neutral-800'
                    : ''
                }`}
                onClick={() => handleSelectSuggestion(suggestion)}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500 mt-1">
        Type to search, or separate values with commas
      </p>
    </div>
  )
}
