// Template variables available for campaign messages
export const TEMPLATE_VARIABLES = {
  first_name: "Candidate's first name",
  last_name: "Candidate's last name",
  full_name: "Candidate's full name",
  school: "Candidate's school",
  major: "Candidate's major",
  graduation_year: "Candidate's graduation year",
  gpa: "Candidate's GPA",
  recruiter_name: "Your name",
  firm_name: "Your firm name",
} as const

export type TemplateVariable = keyof typeof TEMPLATE_VARIABLES

interface CandidateData {
  full_name?: string | null
  school_name?: string | null
  major?: string | null
  graduation_year?: number | null
  gpa?: number | null
}

interface RecruiterData {
  full_name?: string | null
  firm_name?: string | null
}

// Render template with variable substitution
export function renderTemplate(
  template: string,
  candidate: CandidateData,
  recruiter: RecruiterData
): string {
  const firstName = candidate.full_name?.split(' ')[0] || ''
  const lastName = candidate.full_name?.split(' ').slice(1).join(' ') || ''

  const variables: Record<TemplateVariable, string> = {
    first_name: firstName,
    last_name: lastName,
    full_name: candidate.full_name || '',
    school: candidate.school_name || '',
    major: candidate.major || '',
    graduation_year: candidate.graduation_year?.toString() || '',
    gpa: candidate.gpa?.toFixed(2) || '',
    recruiter_name: recruiter.full_name || '',
    firm_name: recruiter.firm_name || '',
  }

  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }

  return result
}
