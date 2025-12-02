import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  GraduationCap,
  Users,
  TrendingUp,
  BookOpen,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CandidateTable } from "../../candidate-table";

interface PageProps {
  params: Promise<{ school: string }>;
}

async function getSchoolCandidates(schoolName: string) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: candidates, error } = await supabaseAdmin
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
    .ilike("school_name", schoolName)
    .order("gpa", { ascending: false });

  if (error) {
    console.error("Error fetching school candidates:", error);
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

  // Count graduation years
  const yearCounts = new Map<number, number>();
  candidates.forEach((c) => {
    if (c.graduation_year) {
      yearCounts.set(
        c.graduation_year,
        (yearCounts.get(c.graduation_year) || 0) + 1
      );
    }
  });
  const gradYears = Array.from(yearCounts.entries()).sort((a, b) => a[0] - b[0]);

  return {
    candidates: transformedCandidates,
    stats: {
      totalCandidates: transformedCandidates.length,
      avgGpa: Math.round(avgGpa * 100) / 100,
      topMajors,
      gradYears,
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

export default async function SchoolPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { school } = await params;
  const schoolName = decodeURIComponent(school);

  const [{ candidates, stats }, interestedCandidateIds] = await Promise.all([
    getSchoolCandidates(schoolName),
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
          href="/recruiter/schools"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all schools
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{schoolName}</h1>
            <p className="text-muted-foreground mt-1">
              {stats.totalCandidates} verified{" "}
              {stats.totalCandidates === 1 ? "candidate" : "candidates"} in the
              network
            </p>
          </div>
        </div>
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
            <p className="text-xs text-muted-foreground">cohort average</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Graduation Years
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.gradYears.map(([year, count]) => (
                <Link
                  key={year}
                  href={`/recruiter/class/${year}?school=${encodeURIComponent(schoolName)}`}
                >
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20"
                  >
                    Class of {year} ({count})
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Majors */}
      {stats.topMajors.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Popular Majors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.topMajors.map(([major, count]) => (
                <div
                  key={major}
                  className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
                >
                  <span className="font-medium">{major}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate Table */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Candidates</h2>
        <Button variant="outline" asChild>
          <Link href={`/recruiter?school=${encodeURIComponent(schoolName)}`}>
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
