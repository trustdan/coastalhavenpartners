'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from './input'

interface AutocompleteInputProps {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  fetchSuggestions: (query: string) => Promise<string[]>
  debounceMs?: number
}

export function AutocompleteInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  required,
  fetchSuggestions,
  debounceMs = 200,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

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

      setIsLoading(true)
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await fetchSuggestions(query)
          setSuggestions(results)
          setIsOpen(results.length > 0)
          setHighlightedIndex(-1)
        } catch (error) {
          console.error('Error fetching suggestions:', error)
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      }, debounceMs)
    },
    [fetchSuggestions, debounceMs]
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
    fetchSuggestionsDebounced(newValue)
  }

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion)
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return

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
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const handleFocus = () => {
    if (value.length >= 1 && suggestions.length > 0) {
      setIsOpen(true)
    }
  }

  return (
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
        placeholder={placeholder}
        required={required}
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
  )
}

