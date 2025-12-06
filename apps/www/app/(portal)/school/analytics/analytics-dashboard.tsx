'use client'

import { Users, TrendingUp, GraduationCap, Building2, Award } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type {
  SchoolAnalytics,
  PlacementByFirmType,
  RecentPlacement,
  PlacementByYear,
} from '../analytics-actions'

interface AnalyticsDashboardProps {
  analytics: SchoolAnalytics | null
  placementsByFirmType: PlacementByFirmType[]
  recentPlacements: RecentPlacement[]
  placementsByYear: PlacementByYear[]
  studentsByStatus: { status: string; count: number }[]
  gpaDistribution: { range: string; count: number }[]
}

const FIRM_TYPE_COLORS: Record<string, string> = {
  investment_bank: '#3b82f6',
  private_equity: '#8b5cf6',
  hedge_fund: '#10b981',
  venture_capital: '#f59e0b',
  asset_management: '#06b6d4',
  consulting: '#ec4899',
  corporate: '#6366f1',
  other: '#9ca3af',
}

const FIRM_TYPE_LABELS: Record<string, string> = {
  investment_bank: 'Investment Banking',
  private_equity: 'Private Equity',
  hedge_fund: 'Hedge Fund',
  venture_capital: 'Venture Capital',
  asset_management: 'Asset Management',
  consulting: 'Consulting',
  corporate: 'Corporate',
  other: 'Other',
}

const STATUS_LABELS: Record<string, string> = {
  pending_verification: 'Pending',
  verified: 'Verified',
  active: 'Active',
  placed: 'Placed',
}

const STATUS_COLORS: Record<string, string> = {
  pending_verification: '#f59e0b',
  verified: '#10b981',
  active: '#3b82f6',
  placed: '#8b5cf6',
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: { value: number; label: string }
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
          )}
          {trend && (
            <p className={`mt-2 text-sm ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/20">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export function AnalyticsDashboard({
  analytics,
  placementsByFirmType,
  recentPlacements,
  placementsByYear,
  studentsByStatus,
  gpaDistribution,
}: AnalyticsDashboardProps) {
  if (!analytics) {
    return (
      <div className="rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
        <GraduationCap className="mx-auto h-12 w-12 text-neutral-400" />
        <h2 className="mt-4 text-xl font-semibold">No Analytics Available</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Analytics will appear once students from your school join the platform.
        </p>
      </div>
    )
  }

  // Prepare data for charts
  const firmTypeData = placementsByFirmType.map(item => ({
    name: FIRM_TYPE_LABELS[item.firm_type] || item.firm_type,
    value: item.placement_count,
    color: FIRM_TYPE_COLORS[item.firm_type] || '#9ca3af',
  }))

  const statusData = studentsByStatus.map(item => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || '#9ca3af',
  }))

  const yearData = [...placementsByYear]
    .sort((a, b) => a.graduation_year - b.graduation_year)
    .map(item => ({
      year: item.graduation_year.toString(),
      total: item.total_students,
      placed: item.placed_students,
      rate: item.placement_rate,
    }))

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={analytics.total_students}
          icon={Users}
        />
        <StatCard
          title="Placed"
          value={analytics.placed_students}
          subtitle={`${analytics.placement_rate}% placement rate`}
          icon={Award}
        />
        <StatCard
          title="Average GPA"
          value={analytics.avg_gpa.toFixed(2)}
          icon={GraduationCap}
        />
        <StatCard
          title="Avg Placed GPA"
          value={analytics.avg_placed_gpa > 0 ? analytics.avg_placed_gpa.toFixed(2) : 'N/A'}
          icon={TrendingUp}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Placements by Firm Type */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h3 className="text-lg font-semibold">Placements by Firm Type</h3>
          {firmTypeData.length > 0 ? (
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={firmTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {firmTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-4 text-center text-neutral-500 py-12">
              No placement data yet
            </p>
          )}
        </div>

        {/* Students by Status */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h3 className="text-lg font-semibold">Students by Status</h3>
          {statusData.length > 0 ? (
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-4 text-center text-neutral-500 py-12">
              No students yet
            </p>
          )}
        </div>
      </div>

      {/* Placements by Year */}
      {yearData.length > 0 && (
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h3 className="text-lg font-semibold">Placements by Graduation Year</h3>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total Students" fill="#94a3b8" />
                <Bar dataKey="placed" name="Placed" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* GPA Distribution */}
      {gpaDistribution.length > 0 && gpaDistribution.some(d => d.count > 0) && (
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h3 className="text-lg font-semibold">GPA Distribution</h3>
          <div className="mt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gpaDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="range" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" name="Students" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Placements */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">Recent Placements</h3>
        {recentPlacements.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-neutral-500">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Major</th>
                  <th className="pb-3 font-medium">GPA</th>
                  <th className="pb-3 font-medium">Firm</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentPlacements.map((placement) => (
                  <tr key={placement.candidate_id}>
                    <td className="py-3">
                      <div className="font-medium">{placement.candidate_name}</div>
                      <div className="text-sm text-neutral-500">Class of {placement.graduation_year}</div>
                    </td>
                    <td className="py-3 text-sm">{placement.major}</td>
                    <td className="py-3 text-sm font-medium">{placement.gpa.toFixed(2)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {placement.firm_logo_url ? (
                          <img
                            src={placement.firm_logo_url}
                            alt={placement.firm_name}
                            className="h-6 w-6 rounded object-contain"
                          />
                        ) : (
                          <Building2 className="h-5 w-5 text-neutral-400" />
                        )}
                        <div>
                          <div className="font-medium">{placement.firm_name}</div>
                          <div className="text-xs text-neutral-500">
                            {FIRM_TYPE_LABELS[placement.firm_type] || placement.firm_type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm">{placement.placement_role || '—'}</td>
                    <td className="py-3 text-sm text-neutral-500">
                      {new Date(placement.placed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-center text-neutral-500 py-8">
            No placements recorded yet. Placements will appear here once students are marked as placed.
          </p>
        )}
      </div>
    </div>
  )
}
