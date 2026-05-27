import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen, Brain, Trophy, Flame, Star, TrendingUp,
  ChevronRight, Zap, Target, Calendar,
} from "lucide-react"
import { apiService, type DashboardData } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardPageProps {
  onNavigate: (page: string) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await apiService.getDashboard()
        if (response.success && response.data) {
          setData(response.data)
        }
      } catch {
        // fallback to empty state
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const userName = user?.full_name ?? data?.user?.name ?? "Student"
  const level = user?.level ?? data?.user?.level ?? "A1"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  const stats = data?.stats ?? { points: 0, streak: 0, lessons_done: 0, exams_passed: 0, vocabulary_learned: 0 }
  const recentLessons = data?.recent_lessons ?? []
  const levelProgress = Math.min(100, Math.round((stats.lessons_done / 20) * 100))

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const achievements = [
    { icon: "🔥", title: `${stats.streak}-Day Streak`, earned: stats.streak >= 7 },
    { icon: "⭐", title: "First Lesson", earned: stats.lessons_done > 0 },
    { icon: "📚", title: "Vocabulary Master", earned: stats.vocabulary_learned >= 100 },
    { icon: "🏆", title: "Exam Ace", earned: stats.exams_passed >= 3 },
  ]

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"]
  const activityData = [stats.streak > 0, stats.streak > 1, stats.streak > 2, stats.streak > 3, stats.streak > 4, stats.streak > 5, stats.streak > 6]

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {greeting}, <span className="text-gold-gradient">{userName}!</span>
              </h1>
              <p className="text-muted-foreground mt-1">Ready to learn some German today?</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2">
                <Flame className="size-5 text-primary" />
                <span className="font-bold text-primary">{stats.streak}</span>
                <span className="text-sm text-muted-foreground">day streak</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Level", value: level, icon: Target, color: "text-chart-3", bg: "bg-chart-3/10" },
            { label: "Lessons Done", value: String(stats.lessons_done), icon: BookOpen, color: "text-chart-2", bg: "bg-chart-2/10" },
            { label: "Total Points", value: String(stats.points), icon: Star, color: "text-primary", bg: "bg-primary/10" },
            { label: "Exams Passed", value: String(stats.exams_passed), icon: Trophy, color: "text-chart-5", bg: "bg-chart-5/10" },
          ].map((stat, i) => (
            <Card key={i} className="glass-card border-border animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`size-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`size-5 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-border animate-fade-in-up delay-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Level Progress</CardTitle>
                  <Badge className="bg-primary/10 text-primary border-primary/20">{level} → {level === "A1" ? "A2" : level === "A2" ? "B1" : "B2"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-3xl font-extrabold text-gold-gradient">{levelProgress}%</p>
                    <p className="text-sm text-muted-foreground">{level} Completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{stats.points} XP</p>
                    <p className="text-xs text-muted-foreground">total earned</p>
                  </div>
                </div>
                <Progress value={levelProgress} className="h-3" />
              </CardContent>
            </Card>

            <Card className="glass-card border-border animate-fade-in-up delay-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Recent Lessons</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate("lessons")} className="text-primary">
                    View all <ChevronRight className="size-3.5 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentLessons.length > 0 ? recentLessons.map((lesson, i) => (
                  <button
                    key={lesson.id || i}
                    onClick={() => onNavigate("lesson")}
                    className="w-full flex items-center gap-4 rounded-xl p-3 border border-border hover:border-primary/30 hover:bg-accent cursor-pointer transition-all text-left"
                  >
                    <div className="size-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
                      <BookOpen className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{lesson.title}</p>
                        <Badge variant="outline" className="text-xs shrink-0 border-border">{lesson.level}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={lesson.score ?? 0} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground shrink-0">{lesson.score ?? 0}%</span>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </button>
                )) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <BookOpen className="size-8 mx-auto mb-2 opacity-50" />
                    <p>No lessons yet. Start your first lesson!</p>
                    <Button className="mt-3 btn-gold-shimmer" size="sm" onClick={() => onNavigate("lessons")}>
                      Browse Lessons
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-card border-border animate-fade-in-up delay-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 justify-between">
                  {weekDays.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className={`size-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                        activityData[i] ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"
                      }`}>
                        {activityData[i] && <Flame className="size-4" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{day}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  <span className="font-semibold text-primary">{Math.min(stats.streak, 7)}/7</span> days this week
                </p>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 bg-primary/5 animate-fade-in-up delay-300">
              <CardContent className="p-6 text-center">
                <Zap className="size-8 text-primary mx-auto mb-3 animate-float" />
                <h3 className="font-semibold mb-2">Continue Learning</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You're on a roll! Keep going with today's lesson.
                </p>
                <Button className="w-full btn-gold-shimmer font-semibold" onClick={() => onNavigate("lesson")}>
                  Continue <ChevronRight className="size-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-border animate-fade-in-up delay-400">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Trophy className="size-4 text-primary" />
                    Achievements
                  </CardTitle>
                  <Badge variant="outline" className="text-xs border-border">
                    {achievements.filter(a => a.earned).length}/{achievements.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((a, i) => (
                    <div
                      key={i}
                      className={`rounded-xl p-3 text-center border transition-all ${
                        a.earned ? "border-primary/20 bg-primary/5" : "border-border bg-accent/20 opacity-50 grayscale"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{a.icon}</span>
                      <p className="text-xs font-medium">{a.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border animate-fade-in-up delay-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Vocabulary Practice", icon: Brain, page: "vocabulary" },
                  { label: "Take an Exam", icon: TrendingUp, page: "exam" },
                  { label: "Browse All Lessons", icon: BookOpen, page: "lessons" },
                ].map(action => (
                  <button
                    key={action.page}
                    onClick={() => onNavigate(action.page)}
                    className="w-full flex items-center gap-3 rounded-lg p-2.5 border border-border hover:border-primary/30 hover:bg-accent transition-all text-sm"
                  >
                    <action.icon className="size-4 text-primary shrink-0" />
                    <span className="font-medium">{action.label}</span>
                    <ChevronRight className="size-3.5 text-muted-foreground ml-auto" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
