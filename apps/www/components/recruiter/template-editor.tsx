'use client'

import { useState, useRef, useCallback } from 'react'
import { Info } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TEMPLATE_VARIABLES, type TemplateVariable, renderTemplate } from '@/lib/campaign-template'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TemplateEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  rows?: number
  showPreview?: boolean
  recruiterName?: string
  firmName?: string
}

const SAMPLE_CANDIDATE = {
  full_name: 'John Smith',
  school_name: 'Harvard Business School',
  major: 'Finance',
  graduation_year: 2025,
  gpa: 3.85,
}

export function TemplateEditor({
  value,
  onChange,
  label = 'Message',
  placeholder = 'Write your message...',
  className,
  rows = 6,
  showPreview = true,
  recruiterName = 'Your Name',
  firmName = 'Your Firm',
}: TemplateEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showPreviewCard, setShowPreviewCard] = useState(false)

  const insertVariable = useCallback((variable: TemplateVariable) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = value
    const variableText = `{{${variable}}}`

    const newText = text.substring(0, start) + variableText + text.substring(end)
    onChange(newText)

    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variableText.length, start + variableText.length)
    }, 0)
  }, [value, onChange])

  const previewMessage = showPreview
    ? renderTemplate(value, SAMPLE_CANDIDATE, { full_name: recruiterName, firm_name: firmName })
    : ''

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="template-editor">{label}</Label>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" type="button">
                Insert Variable
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-2">
                <h4 className="font-medium">Template Variables</h4>
                <p className="text-sm text-muted-foreground">
                  Click a variable to insert it at the cursor position.
                </p>
                <div className="grid gap-1">
                  {(Object.entries(TEMPLATE_VARIABLES) as [TemplateVariable, string][]).map(([key, description]) => (
                    <Button
                      key={key}
                      variant="ghost"
                      size="sm"
                      className="justify-start h-auto py-2"
                      onClick={() => insertVariable(key)}
                      type="button"
                    >
                      <div className="text-left">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {`{{${key}}}`}
                        </code>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {description}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>
                  Use template variables like <code className="text-xs">{'{{first_name}}'}</code> to personalize
                  your message for each candidate.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Textarea
        id="template-editor"
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="font-mono text-sm"
      />

      {showPreview && value && (
        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreviewCard(!showPreviewCard)}
            type="button"
          >
            {showPreviewCard ? 'Hide Preview' : 'Show Preview'}
          </Button>

          {showPreviewCard && (
            <Card className="mt-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Message Preview</CardTitle>
                <CardDescription>
                  Using sample candidate: {SAMPLE_CANDIDATE.full_name} from {SAMPLE_CANDIDATE.school_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-md">
                  {previewMessage}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
