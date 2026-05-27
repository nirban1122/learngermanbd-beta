import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Trophy, Flame, Star, BookOpen, TrendingUp, Edit, Settings } from "lucide-react"
import { apiService, type UserProfile } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

interface ProfilePageProps {
  onNavigate?: (page: string) => void
}

export function ProfilePage({ onNavigate: _onNavigate }: ProfilePageProps) {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiService.getProfile()
        if (response.success && response.data) {
          setProfile(response.data)
        }
      } catch {
        // fallback
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const userName = user?.full_name ?? profile?.user?.full_name ?? "Student"
  const userLevel = user?.level ?? profile?.user?.level ?? "A1"
  const stats = profile?.stats ?? { lessons_completed: 0, vocabulary_learned: 0, best_exam_score: 0, exams_passed: 0 }
  const points = profile?.points ?? 0
  const streak = profile?.streak?.current_streak ?? 0

  const statCards = [
    { label: "Current Level", value: userLevel, icon: TrendingUp, color: "text-chart-3" },
    { label: "Day Streak", value: String(streak), icon: Flame, color: "text-primary" },
    { label: "Total XP", value: String(points), icon: Star, color: "text-chart-1" },
    { label: "Lessons Done", value: String(stats.lessons_completed), icon: BookOpen, color: "text-chart-2" },
    { label: "Exams Passed", value: String(stats.exams_passed), icon: Trophy, color: "text-chart-5" },
    { label: "Words Learned", value: String(stats.vocabulary_learned), icon: BookOpen, color: "text-chart-3" },
  ]

  const achievements = [
    { icon: "🔥", title: `${streak}-Day Streak`, desc: "7 consecutive days", earned: streak >= 7 },
    { icon: "⭐", title: "First Lesson", desc: "Completed first lesson", earned: stats.lessons_completed > 0 },
    { icon: "📚", title: "Word Collector", desc: "Learn 100 words", progress: stats.vocabulary_learned, earned: stats.vocabulary_learned >= 100 },
    { icon: "🏆", title: "Exam Champion", desc: "Pass 5 exams", progress: stats.exams_passed * 20, earned: stats.exams_passed >= 5 },
    { icon: "🎯", title: "Perfect Score", desc: "Get 100% on an exam", earned: stats.best_exam_score >= 100 },
    { icon: "🌟", title: "Level Up", desc: "Reach A2 level", earned: ["A2", "B1", "B2", "C1", "C2"].includes(userLevel) },
  ]

  const levelHistory = [
    { level: "A1", started: "Jan 2026", status: userLevel === "A1" ? "in progress" : "completed", progress: userLevel === "A1" ? Math.min(100, stats.lessons_completed * 5) : 100 },
    { level: "A2", started: userLevel === "A2" ? "Mar 2026" : "—", status: userLevel === "A2" ? "in progress" : ["B1", "B2", "C1", "C2"].includes(userLevel) ? "completed" : "locked", progress: userLevel === "A2" ? Math.min(100, stats.lessons_completed * 5) : ["B1", "B2", "C1", "C2"].includes(userLevel) ? 100 : 0 },
    { level: "B1", started: userLevel === "B1" ? "Jun 2026" : "—", status: userLevel === "B1" ? "in progress" : ["B2", "C1", "C2"].includes(userLevel) ? "completed" : "locked", progress: userLevel === "B1" ? Math.min(100, stats.lessons_completed * 3) : ["B2", "C1", "C2"].includes(userLevel) ? 100 : 0 },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">

        <Card className="glass-card border-border mb-6 animate-fade-in-up">
          <CardContent className="p-6">
            <div className="flex items-start gap-6 flex-wrap">
              <div className="relative">
                <div className="size-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-extrabold animate-glow">
                  {userName[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-chart-3 border-2 border-background flex items-center justify-center">
                  <Flame className="size-3.5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-2xl font-bold">{userName}</h1>
                  <Badge className="bg-primary/10 text-primary border-primary/20">{userLevel} Student</Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-3">{user?.email ?? profile?.user?.email ?? ""}</p>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" className="gap-2"><Edit className="size-3.5" />Edit Profile</Button>
                  <Button size="sm" variant="ghost" className="gap-2" onClick={logout}><Settings className="size-3.5" />Logout</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6 animate-fade-in-up delay-100">
          {statCards.map((stat, i) => (
            <Card key={i} className="glass-card border-border text-center" style={{ animationDelay: `${i * 0.05}s` }}>
              <CardContent className="p-3">
                <stat.icon className={`size-4 mx-auto mb-1 ${stat.color}`} />
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="achievements">
          <TabsList className="mb-6">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
              {achievements.map((a, i) => (
                <Card key={i} className={`glass-card border-border transition-all ${a.earned ? "border-primary/20 bg-primary/5" : "opacity-50"}`} style={{ animationDelay: `${i * 0.07}s` }}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-3xl ${!a.earned ? "grayscale" : ""}`}>{a.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.desc}</p>
                      </div>
                    </div>
                    {!a.earned && a.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{a.progress}%</span></div>
                        <Progress value={Math.min(100, a.progress)} className="h-1.5" />
                      </div>
                    )}
                    {a.earned && <Badge className="text-xs bg-primary/10 text-primary border-primary/20" variant="outline">Earned</Badge>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="space-y-4 animate-fade-in-up">
              {levelHistory.map((level, i) => (
                <Card key={i} className={`glass-card border-border ${level.status === "locked" ? "opacity-50" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`size-12 rounded-xl flex items-center justify-center font-extrabold text-lg ${
                        level.status === "in progress" ? "bg-primary/10 text-primary" : level.status === "completed" ? "bg-chart-3/10 text-chart-3" : "bg-muted text-muted-foreground"
                      }`}>
                        {level.level}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Level {level.level}</span>
                          <Badge variant="outline" className={`text-xs ${
                            level.status === "in progress" ? "border-primary/30 text-primary" : level.status === "completed" ? "border-chart-3/30 text-chart-3" : "border-border"
                          }`}>
                            {level.status === "in progress" ? "In Progress" : level.status === "completed" ? "Completed" : "Locked"}
                          </Badge>
                        </div>
                        {level.progress > 0 && (
                          <>
                            <Progress value={level.progress} className="h-2 mb-1" />
                            <p className="text-xs text-muted-foreground">{level.progress}% complete</p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
