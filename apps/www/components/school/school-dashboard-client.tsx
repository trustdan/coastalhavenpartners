'use client'

import { useDemoData, shouldShowDemoData } from '@/hooks/use-demo-data'
import { DemoDataBanner, DemoBadge } from '@/components/demo-data-banner'
import { DemoEmptyState } from '@/components/demo-empty-state'
import { schoolDemoData } from '@/lib/demo-data'
import { GraduationCap, TrendingUp, Mail, Linkedin, UserPlus, CheckCircle, Building2 } from 'lucide-react'

interface RealDataProps {
  /** Whether the school has any real students */
  hasStudents: boolean
  /** The actual stats component (server-rendered) */
  statsComponent: React.ReactNode
  /** The actual filters component */
  filtersComponent: React.ReactNode
  /** The actual students table component */
  studentsTableComponent: React.ReactNode
}

export function SchoolDashboardClient({
  hasStudents,
  statsComponent,
  filtersComponent,
  studentsTableComponent,
}: RealDataProps) {
  const { dismissed, isHydrated, dismiss, restore } = useDemoData('school')

  const showDemoData = shouldShowDemoData(dismissed, hasStudents)

  // Wait for hydration to avoid flash
  if (!isHydrated) {
    return null
  }

  // Show empty state if demo is dismissed and no real data
  if (!hasStudents && !showDemoData) {
    return (
      <DemoEmptyState
        icon={<GraduationCap className="h-8 w-8 text-neutral-400" />}
        title="No Students Yet"
        description="Your dashboard will populate once students from your school join the platform."
        onRestore={restore}
      />
    )
  }

  // Show demo data
  if (showDemoData) {
    return (
      <div className="space-y-8">
        <DemoDataBanner
          title="Sample Data"
          description="This is example data showing what your dashboard looks like with students. Real data will appear automatically."
          onDismiss={dismiss}
        />

        {/* Demo Stats */}
        <DemoStats />

        {/* Demo Filters (disabled) */}
        <div className="pointer-events-none opacity-60">
          {filtersComponent}
        </div>

        {/* Demo Students Table */}
        <DemoStudentsTable />

        {/* Demo Recent Activity */}
        <DemoRecentActivity />
      </div>
    )
  }

  // Show real data
  return (
    <div className="space-y-8">
      {statsComponent}
      {filtersComponent}
      {studentsTableComponent}
    </div>
  )
}

// ============================================
// DEMO COMPONENTS (read-only with badges)
// ============================================

function DemoStats() {
  const { stats } = schoolDemoData

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Students</p>
              <DemoBadge />
            </div>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Verified</p>
              <DemoBadge />
            </div>
            <p className="text-2xl font-bold">{stats.verified}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Placed</p>
              <DemoBadge />
            </div>
            <p className="text-2xl font-bold">{stats.placed}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-teal-100 p-3 dark:bg-teal-900/20">
            <TrendingUp className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Placement Rate</p>
              <DemoBadge />
            </div>
            <p className="text-2xl font-bold">{Math.round(stats.placementRate * 100)}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DemoStudentsTable() {
  const { students } = schoolDemoData

  const statusColors = {
    verified: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
    placed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
    pending_verification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h3 className="font-semibold">Students</h3>
        <DemoBadge />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Major</th>
              <th className="px-6 py-3 text-left text-sm font-medium">GPA</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Grad Year</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Target Roles</th>
              <th className="px-6 py-3 text-right text-sm font-medium">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{student.profiles.full_name}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {student.profiles.email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{student.major}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-200">
                    {student.gpa.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{student.graduation_year}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[student.status]}`}>
                    {student.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {student.target_roles && student.target_roles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {student.target_roles.slice(0, 2).map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                        >
                          {role}
                        </span>
                      ))}
                      {student.target_roles.length > 2 && (
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                          +{student.target_roles.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-400">Not specified</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {student.profiles.linkedin_url && (
                      <span className="text-blue-600 cursor-not-allowed opacity-50" title="Demo data">
                        <Linkedin className="h-4 w-4" />
                      </span>
                    )}
                    <span className="text-blue-600 cursor-not-allowed opacity-50" title="Demo data">
                      <Mail className="h-4 w-4" />
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DemoRecentActivity() {
  const { recentActivity } = schoolDemoData

  const iconMap = {
    UserPlus: UserPlus,
    CheckCircle: CheckCircle,
    Building2: Building2,
  }

  const colorMap = {
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Activity</h3>
        <DemoBadge />
      </div>
      <div className="space-y-4">
        {recentActivity.map((activity, index) => {
          const Icon = iconMap[activity.icon as keyof typeof iconMap] || UserPlus
          const colorClass = colorMap[activity.color as keyof typeof colorMap] || colorMap.blue

          return (
            <div key={index} className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                  {activity.subtitle}
                </p>
              </div>
              <span className="text-xs text-neutral-500 shrink-0">{activity.time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
