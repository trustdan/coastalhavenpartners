import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Calendar, Users, TrendingUp, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface YearStats {
  graduation_year: number;
  candidate_count: number;
  avg_gpa: number;
  top_schools: string[];
  top_majors: string[];
}

async function getYearStats(): Promise<YearStats[]> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: candidates, error } = await supabaseAdmin
    .from("candidate_profiles")
    .select("graduation_year, gpa, school_name, major")
    .eq("status", "verified")
    .not("graduation_year", "is", null);

  if (error || !candidates) {
    console.error("Error fetching year stats:", error);
    return [];
  }

  // Group by graduation year and calculate stats
  const yearMap = new Map<
    number,
    { gpas: number[]; schools: Map<string, number>; majors: Map<string, number> }
  >();

  for (const candidate of candidates) {
    const year = candidate.graduation_year;
    if (!year) continue;

    if (!yearMap.has(year)) {
      yearMap.set(year, { gpas: [], schools: new Map(), majors: new Map() });
    }

    const stats = yearMap.get(year)!;
    if (candidate.gpa) stats.gpas.push(candidate.gpa);
    if (candidate.school_name) {
      stats.schools.set(
        candidate.school_name,
        (stats.schools.get(candidate.school_name) || 0) + 1
      );
    }
    if (candidate.major) {
      stats.majors.set(
        candidate.major,
        (stats.majors.get(candidate.major) || 0) + 1
      );
    }
  }

  // Convert to array with computed stats
  const yearStats: YearStats[] = [];

  for (const [graduation_year, stats] of yearMap) {
    const avg_gpa =
      stats.gpas.length > 0
        ? stats.gpas.reduce((a, b) => a + b, 0) / stats.gpas.length
        : 0;

    // Get top 3 schools
    const sortedSchools = Array.from(stats.schools.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([school]) => school);

    // Get top 3 majors
    const sortedMajors = Array.from(stats.majors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([major]) => major);

    yearStats.push({
      graduation_year,
      candidate_count: stats.gpas.length,
      avg_gpa: Math.round(avg_gpa * 100) / 100,
      top_schools: sortedSchools,
      top_majors: sortedMajors,
    });
  }

  // Sort by graduation year descending (most recent first)
  return yearStats.sort((a, b) => b.graduation_year - a.graduation_year);
}

function getYearLabel(year: number): string {
  const currentYear = new Date().getFullYear();
  if (year === currentYear) return "Current Year";
  if (year === currentYear + 1) return "Upcoming";
  if (year < currentYear) return "Alumni";
  return "Future";
}

export default async function ClassYearsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const yearStats = await getYearStats();

  // Calculate totals
  const totalCandidates = yearStats.reduce(
    (sum, y) => sum + y.candidate_count,
    0
  );
  const currentYear = new Date().getFullYear();
  const upcomingGrads = yearStats
    .filter((y) => y.graduation_year >= currentYear)
    .reduce((sum, y) => sum + y.candidate_count, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Browse by Graduation Year
        </h1>
        <p className="text-muted-foreground mt-2">
          Explore candidates organized by when they graduate
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Graduation Years
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearStats.length}</div>
            <p className="text-xs text-muted-foreground">classes represented</p>
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
              Current & Upcoming
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingGrads}</div>
            <p className="text-xs text-muted-foreground">
              graduating {currentYear}+
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Year Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {yearStats.map((year) => (
          <Link
            key={year.graduation_year}
            href={`/recruiter/class/${year.graduation_year}`}
          >
            <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">
                        Class of {year.graduation_year}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-xs font-normal"
                      >
                        {getYearLabel(year.graduation_year)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{year.candidate_count}</span>
                    <span className="text-sm text-muted-foreground">
                      {year.candidate_count === 1 ? "candidate" : "candidates"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {year.avg_gpa.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">avg</span>
                  </div>
                </div>

                {year.top_schools.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {year.top_schools.map((school) => (
                        <Badge
                          key={school}
                          variant="outline"
                          className="text-xs"
                        >
                          {school}
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

      {yearStats.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No graduation years found</h3>
          <p className="text-muted-foreground">
            There are no verified candidates in the network yet.
          </p>
        </div>
      )}
    </div>
  );
}
