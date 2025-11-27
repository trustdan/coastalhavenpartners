'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from './input'
import { ChevronDown } from 'lucide-react'

// Common undergraduate degree types
export const UNDERGRAD_DEGREES = [
  'AA',   // Associate of Arts
  'AS',   // Associate of Science
  'BA',   // Bachelor of Arts
  'BBA',  // Bachelor of Business Administration
  'BFA',  // Bachelor of Fine Arts
  'BS',   // Bachelor of Science
  'BSE',  // Bachelor of Science in Engineering
  'AB',   // Artium Baccalaureus (Latin BA)
  'SB',   // Scientiae Baccalaureus (Latin BS, MIT style)
]

// Common graduate/professional degree types
export const GRADUATE_DEGREES = [
  'MA',     // Master of Arts
  'MBA',    // Master of Business Administration
  'MFA',    // Master of Fine Arts
  'MPA',    // Master of Public Administration
  'MPH',    // Master of Public Health
  'MPP',    // Master of Public Policy
  'MS',     // Master of Science
  'MSW',    // Master of Social Work
  'MPhil',  // Master of Philosophy
  'MEng',   // Master of Engineering
  'MFin',   // Master of Finance
  'MAcc',   // Master of Accounting
  'LLM',    // Master of Laws
  'JD',     // Juris Doctor
  'MD',     // Doctor of Medicine
  'DO',     // Doctor of Osteopathic Medicine
  'PhD',    // Doctor of Philosophy
  'EdD',    // Doctor of Education
  'DBA',    // Doctor of Business Administration
  'SJD',    // Doctor of Juridical Science
  'DDS',    // Doctor of Dental Surgery
  'DMD',    // Doctor of Dental Medicine
  'PharmD', // Doctor of Pharmacy
  'DVM',    // Doctor of Veterinary Medicine
  'PsyD',   // Doctor of Psychology
]

interface DegreeTypeSelectProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  degreeCategory: 'undergrad' | 'graduate'
  customDegrees?: string[]
}

export function DegreeTypeSelect({
  id,
  value,
  onChange,
  placeholder = 'Select degree...',
  degreeCategory,
  customDegrees = [],
}: DegreeTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Combine standard degrees with any custom ones from the database
  const standardDegrees = degreeCategory === 'undergrad' ? UNDERGRAD_DEGREES : GRADUATE_DEGREES
  const allDegrees = [...new Set([...standardDegrees, ...customDegrees])].sort()

  // Filter degrees based on search query
  const filteredDegrees = allDegrees.filter(degree =>
    degree.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        // Reset search to current value when closing
        setSearchQuery(value)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [value])

  // Sync search query with value when value changes externally
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery(value)
    }
  }, [value, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsOpen(true)
    setHighlightedIndex(-1)
  }

  const handleSelect = (degree: string) => {
    onChange(degree)
    setSearchQuery(degree)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsOpen(true)
      setHighlightedIndex(prev =>
        prev < filteredDegrees.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && filteredDegrees[highlightedIndex]) {
        handleSelect(filteredDegrees[highlightedIndex])
      } else if (searchQuery.trim()) {
        // Allow custom entry if it's not in the list
        handleSelect(searchQuery.trim())
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchQuery(value)
      setHighlightedIndex(-1)
    } else if (e.key === 'Tab') {
      setIsOpen(false)
      // If there's a highlighted option, select it
      if (highlightedIndex >= 0 && filteredDegrees[highlightedIndex]) {
        handleSelect(filteredDegrees[highlightedIndex])
      } else if (searchQuery.trim() && searchQuery !== value) {
        // Accept custom entry on tab
        handleSelect(searchQuery.trim())
      }
    }
  }

  const handleFocus = () => {
    setIsOpen(true)
    // Select all text for easy replacement
    inputRef.current?.select()
  }

  const handleBlur = () => {
    // Small delay to allow click events on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        // Accept custom entry on blur
        if (searchQuery.trim() && searchQuery !== value) {
          onChange(searchQuery.trim())
        }
      }
    }, 150)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          className="pr-8"
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen)
            inputRef.current?.focus()
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg dark:bg-neutral-900 dark:border-neutral-700 max-h-60 overflow-auto"
          role="listbox"
        >
          {filteredDegrees.length === 0 ? (
            <div className="px-4 py-2 text-sm text-neutral-500">
              {searchQuery ? (
                <span>
                  Press Enter to add "{searchQuery}" as custom degree
                </span>
              ) : (
                <span>No degrees found</span>
              )}
            </div>
          ) : (
            filteredDegrees.map((degree, index) => (
              <button
                key={degree}
                type="button"
                className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                  index === highlightedIndex ? 'bg-neutral-100 dark:bg-neutral-800' : ''
                } ${degree === value ? 'font-medium text-purple-600 dark:text-purple-400' : ''}`}
                onClick={() => handleSelect(degree)}
                role="option"
                aria-selected={degree === value}
              >
                {degree}
              </button>
            ))
          )}
          {searchQuery && !filteredDegrees.includes(searchQuery) && (
            <button
              type="button"
              className={`w-full px-4 py-2 text-left text-sm border-t hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:border-neutral-700 ${
                highlightedIndex === filteredDegrees.length ? 'bg-neutral-100 dark:bg-neutral-800' : ''
              }`}
              onClick={() => handleSelect(searchQuery)}
            >
              <span className="text-purple-600 dark:text-purple-400">+ Add "{searchQuery}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
