import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { GraduationCap, Users, TrendingUp, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SchoolStats {
  school_name: string;
  candidate_count: number;
  avg_gpa: number;
  top_majors: string[];
}

async function getSchoolStats(): Promise<SchoolStats[]> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all verified candidates grouped by school
  const { data: candidates, error } = await supabaseAdmin
    .from("candidate_profiles")
    .select("school_name, gpa, major")
    .eq("status", "verified")
    .not("school_name", "is", null);

  if (error || !candidates) {
    console.error("Error fetching school stats:", error);
    return [];
  }

  // Group by school and calculate stats
  const schoolMap = new Map<
    string,
    { gpas: number[]; majors: Map<string, number> }
  >();

  for (const candidate of candidates) {
    const school = candidate.school_name;
    if (!school) continue;

    if (!schoolMap.has(school)) {
      schoolMap.set(school, { gpas: [], majors: new Map() });
    }

    const stats = schoolMap.get(school)!;
    if (candidate.gpa) stats.gpas.push(candidate.gpa);
    if (candidate.major) {
      stats.majors.set(
        candidate.major,
        (stats.majors.get(candidate.major) || 0) + 1
      );
    }
  }

  // Convert to array with computed stats
  const schoolStats: SchoolStats[] = [];

  for (const [school_name, stats] of schoolMap) {
    const avg_gpa =
      stats.gpas.length > 0
        ? stats.gpas.reduce((a, b) => a + b, 0) / stats.gpas.length
        : 0;

    // Get top 3 majors
    const sortedMajors = Array.from(stats.majors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([major]) => major);

    schoolStats.push({
      school_name,
      candidate_count: stats.gpas.length,
      avg_gpa: Math.round(avg_gpa * 100) / 100,
      top_majors: sortedMajors,
    });
  }

  // Sort by candidate count descending
  return schoolStats.sort((a, b) => b.candidate_count - a.candidate_count);
}

export default async function SchoolsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const schoolStats = await getSchoolStats();

  // Calculate totals
  const totalCandidates = schoolStats.reduce(
    (sum, s) => sum + s.candidate_count,
    0
  );
  const totalSchools = schoolStats.length;
  const overallAvgGpa =
    schoolStats.length > 0
      ? schoolStats.reduce((sum, s) => sum + s.avg_gpa * s.candidate_count, 0) /
        totalCandidates
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse by School</h1>
        <p className="text-muted-foreground mt-2">
          Explore candidates organized by their undergraduate institution
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              institutions represented
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidates}</div>
            <p className="text-xs text-muted-foreground">verified profiles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Network Avg GPA
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallAvgGpa.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">across all schools</p>
          </CardContent>
        </Card>
      </div>

      {/* School Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {schoolStats.map((school) => (
          <Link
            key={school.school_name}
            href={`/recruiter/schools/${encodeURIComponent(school.school_name)}`}
          >
            <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold leading-tight">
                      {school.school_name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {school.candidate_count}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {school.candidate_count === 1 ? "candidate" : "candidates"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {school.avg_gpa.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">avg</span>
                  </div>
                </div>
                {school.top_majors.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {school.top_majors.map((major) => (
                        <Badge
                          key={major}
                          variant="secondary"
                          className="text-xs"
                        >
                          {major}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {schoolStats.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No schools found</h3>
          <p className="text-muted-foreground">
            There are no verified candidates in the network yet.
          </p>
        </div>
      )}
    </div>
  );
}
