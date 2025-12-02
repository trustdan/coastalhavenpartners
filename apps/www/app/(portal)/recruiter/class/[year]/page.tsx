import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  Calendar,
  Users,
  TrendingUp,
  GraduationCap,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CandidateTable } from "../../candidate-table";

interface PageProps {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ school?: string }>;
}

async function getYearCandidates(
  graduationYear: number,
  schoolFilter?: string
) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = supabaseAdmin
    .from("candidate_profiles")
    .select(
      `
      id,
      school_name,
      major,
      gpa,
      graduation_year,
      target_roles,
      preferred_locations,
      status,
      undergrad_degree_type,
      grad_degree_type,
      gpa_verified,
      resume_verified,
      transcript_verified,
      profiles!user_id (
        full_name,
        email
      )
    `
    )
    .eq("status", "verified")
    .eq("graduation_year", graduationYear)
    .order("gpa", { ascending: false });

  // Apply school filter if provided
  if (schoolFilter) {
    query = query.ilike("school_name", schoolFilter);
  }

  const { data: candidates, error } = await query;

  if (error) {
    console.error("Error fetching year candidates:", error);
    return { candidates: [], stats: null };
  }

  // Transform profiles from array to single object (Supabase returns array for joins)
  const transformedCandidates = candidates.map((c) => ({
    ...c,
    profiles: Array.isArray(c.profiles) ? c.profiles[0] || null : c.profiles,
  }));

  // Calculate stats
  const gpas = candidates.map((c) => c.gpa).filter(Boolean);
  const avgGpa =
    gpas.length > 0 ? gpas.reduce((a, b) => a + b, 0) / gpas.length : 0;

  // Count schools
  const schoolCounts = new Map<string, number>();
  candidates.forEach((c) => {
    if (c.school_name) {
      schoolCounts.set(c.school_name, (schoolCounts.get(c.school_name) || 0) + 1);
    }
  });
  const topSchools = Array.from(schoolCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Count majors
  const majorCounts = new Map<string, number>();
  candidates.forEach((c) => {
    if (c.major) {
      majorCounts.set(c.major, (majorCounts.get(c.major) || 0) + 1);
    }
  });
  const topMajors = Array.from(majorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Count target roles
  const roleCounts = new Map<string, number>();
  candidates.forEach((c) => {
    if (c.target_roles) {
      c.target_roles.forEach((role: string) => {
        roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
      });
    }
  });
  const topRoles = Array.from(roleCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    candidates: transformedCandidates,
    stats: {
      totalCandidates: transformedCandidates.length,
      avgGpa: Math.round(avgGpa * 100) / 100,
      topSchools,
      topMajors,
      topRoles,
    },
  };
}

async function getInterestedCandidates(recruiterId: string) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get the recruiter's firm name
  const { data: recruiterProfile } = await supabaseAdmin
    .from("recruiter_profiles")
    .select("firm_name")
    .eq("user_id", recruiterId)
    .single();

  if (!recruiterProfile?.firm_name) return [];

  // Get candidates interested in this firm
  const { data: interests } = await supabaseAdmin
    .from("candidate_firm_interests")
    .select("candidate_id")
    .eq("firm_name", recruiterProfile.firm_name);

  return interests?.map((i) => i.candidate_id) || [];
}

function getYearLabel(year: number): string {
  const currentYear = new Date().getFullYear();
  if (year === currentYear) return "Graduating This Year";
  if (year === currentYear + 1) return "Graduating Next Year";
  if (year < currentYear) return "Alumni";
  return `Graduating in ${year - currentYear} years`;
}

export default async function ClassYearPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { year } = await params;
  const { school: schoolFilter } = await searchParams;
  const graduationYear = parseInt(year, 10);

  if (isNaN(graduationYear)) {
    notFound();
  }

  const [{ candidates, stats }, interestedCandidateIds] = await Promise.all([
    getYearCandidates(graduationYear, schoolFilter),
    getInterestedCandidates(user.id),
  ]);

  if (!stats || stats.totalCandidates === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/recruiter/class"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all classes
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Class of {graduationYear}
              {schoolFilter && (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  at {schoolFilter}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              {getYearLabel(graduationYear)} &middot; {stats.totalCandidates}{" "}
              verified {stats.totalCandidates === 1 ? "candidate" : "candidates"}
            </p>
          </div>
        </div>

        {/* Clear school filter if active */}
        {schoolFilter && (
          <div className="mt-4">
            <Link href={`/recruiter/class/${graduationYear}`}>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20"
              >
                Filtering by: {schoolFilter} ✕
              </Badge>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">verified profiles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgGpa.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">class average</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Schools</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.topSchools.map(([school, count]) => (
                <Link
                  key={school}
                  href={`/recruiter/schools/${encodeURIComponent(school)}`}
                >
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20"
                  >
                    {school} ({count})
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {/* Top Majors */}
        {stats.topMajors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Popular Majors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.topMajors.map(([major, count]) => (
                  <div
                    key={major}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg"
                  >
                    <span className="text-sm font-medium">{major}</span>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Target Roles */}
        {stats.topRoles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Target Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.topRoles.map(([role, count]) => (
                  <div
                    key={role}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  >
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {role}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-100 dark:bg-blue-800"
                    >
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Candidate Table */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Candidates</h2>
        <Button variant="outline" asChild>
          <Link href={`/recruiter?gradYear=${graduationYear}`}>
            View with filters
          </Link>
        </Button>
      </div>
      <CandidateTable
        candidates={candidates}
        interestedCandidateIds={interestedCandidateIds}
      />
    </div>
  );
}
