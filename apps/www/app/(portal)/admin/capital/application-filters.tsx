"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, ArrowUpDown } from "lucide-react"

export type SortOption =
  | "date_desc"
  | "date_asc"
  | "name_asc"
  | "name_desc"
  | "gpa_desc"
  | "gpa_asc"
  | "university_asc"

interface ApplicationFiltersProps {
  universities: string[]
  graduationYears: number[]
}

export function ApplicationFilters({
  universities,
  graduationYears,
}: ApplicationFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, value)
        }
      })

      return newSearchParams.toString()
    },
    [searchParams]
  )

  const updateFilter = (key: string, value: string | null) => {
    const queryString = createQueryString({ [key]: value })
    router.push(`/admin/capital${queryString ? `?${queryString}` : ""}`)
  }

  const clearAllFilters = () => {
    router.push("/admin/capital")
  }

  const hasActiveFilters =
    searchParams.has("university") ||
    searchParams.has("gradYear") ||
    searchParams.has("minGpa") ||
    searchParams.has("maxGpa")

  const currentSort = searchParams.get("sort") || "date_desc"

  const sortOptions = [
    { value: "date_desc", label: "Applied (Newest)" },
    { value: "date_asc", label: "Applied (Oldest)" },
    { value: "name_asc", label: "Name (A-Z)" },
    { value: "name_desc", label: "Name (Z-A)" },
    { value: "gpa_desc", label: "GPA (High to Low)" },
    { value: "gpa_asc", label: "GPA (Low to High)" },
    { value: "university_asc", label: "University (A-Z)" },
  ]

  return (
    <div className="rounded-xl border bg-white p-4 dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Filters & Sorting</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 text-neutral-500 hover:text-neutral-700"
          >
            <X className="mr-1 h-3 w-3" />
            Clear filters
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Sort By */}
        <div className="space-y-1.5">
          <Label htmlFor="sort" className="text-xs text-neutral-500">
            <ArrowUpDown className="mr-1 inline h-3 w-3" />
            Sort By
          </Label>
          <Select
            value={currentSort}
            onValueChange={(value) => updateFilter("sort", value === "date_desc" ? null : value)}
          >
            <SelectTrigger id="sort" className="h-9">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* University Filter */}
        <div className="space-y-1.5">
          <Label htmlFor="university" className="text-xs text-neutral-500">
            University
          </Label>
          <Select
            value={searchParams.get("university") || "all"}
            onValueChange={(value) => updateFilter("university", value)}
          >
            <SelectTrigger id="university" className="h-9">
              <SelectValue placeholder="All universities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All universities</SelectItem>
              {universities.map((uni) => (
                <SelectItem key={uni} value={uni}>
                  {uni}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Graduation Year Filter */}
        <div className="space-y-1.5">
          <Label htmlFor="gradYear" className="text-xs text-neutral-500">
            Graduation Year
          </Label>
          <Select
            value={searchParams.get("gradYear") || "all"}
            onValueChange={(value) => updateFilter("gradYear", value)}
          >
            <SelectTrigger id="gradYear" className="h-9">
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {graduationYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Min GPA Filter */}
        <div className="space-y-1.5">
          <Label htmlFor="minGpa" className="text-xs text-neutral-500">
            Min GPA
          </Label>
          <Input
            id="minGpa"
            type="number"
            step="0.01"
            min="0"
            max="4"
            placeholder="0.00"
            className="h-9"
            value={searchParams.get("minGpa") || ""}
            onChange={(e) => updateFilter("minGpa", e.target.value)}
          />
        </div>

        {/* Max GPA Filter */}
        <div className="space-y-1.5">
          <Label htmlFor="maxGpa" className="text-xs text-neutral-500">
            Max GPA
          </Label>
          <Input
            id="maxGpa"
            type="number"
            step="0.01"
            min="0"
            max="4"
            placeholder="4.00"
            className="h-9"
            value={searchParams.get("maxGpa") || ""}
            onChange={(e) => updateFilter("maxGpa", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
