import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BookOpen, CheckCircle2, ChevronRight, Search, Clock } from "lucide-react"
import { apiService, type Lesson } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

interface LessonsPageProps {
  onNavigate: (page: string) => void
}

const typeColors: Record<string, string> = {
  Grammar: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Vocabulary: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Conversation: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  listening: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  reading: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  writing: "bg-primary/10 text-primary border-primary/20",
}

export function LessonsPage({ onNavigate }: LessonsPageProps) {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [activeLevel, setActiveLevel] = useState(user?.level ?? "all")
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLessons = async () => {
      try {
        const level = activeLevel === "all" ? undefined : activeLevel
        const response = await apiService.getLessons(level, undefined, 50)
        if (response.success && response.data) {
          setLessons(response.data.lessons)
        }
      } catch {
        // fallback
      } finally {
        setLoading(false)
      }
    }
    loadLessons()
  }, [activeLevel])

  const filtered = lessons.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            All <span className="text-gold-gradient">Lessons</span>
          </h1>
          <p className="text-muted-foreground">Master German step by step through structured lessons.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in-up delay-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search lessons..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10" />
          </div>
          <Tabs value={activeLevel} onValueChange={setActiveLevel}>
            <TabsList className="h-10">
              {["all", "A1", "A2", "B1", "B2", "C1"].map(l => (
                <TabsTrigger key={l} value={l} className="text-xs px-3">{l === "all" ? "All" : l}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={activeLevel} onValueChange={setActiveLevel}>
          <TabsContent value={activeLevel}>
            {filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((lesson, i) => {
                  const completed = lesson.user_status === "completed"
                  const inProgress = lesson.user_status === "in_progress"
                  const typeLabel = lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)
                  return (
                    <Card key={lesson.id} className="glass-card border-border transition-all duration-200 animate-fade-in-up hover:border-primary/30 cursor-pointer" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => onNavigate("lesson")}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`size-10 rounded-xl flex items-center justify-center ${completed ? "bg-chart-3/10" : "bg-primary/10"}`}>
                            {completed ? <CheckCircle2 className="size-5 text-chart-3" /> : <BookOpen className="size-5 text-primary" />}
                          </div>
                          <div className="flex gap-1.5">
                            <Badge variant="outline" className="text-xs border-border">{lesson.level}</Badge>
                            <Badge className={`text-xs border ${typeColors[lesson.type] ?? typeColors.Conversation}`} variant="outline">{typeLabel}</Badge>
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{lesson.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Clock className="size-3" />{lesson.duration_minutes}m</span>
                          <span className="text-primary font-medium">+{lesson.xp_reward} XP</span>
                        </div>
                        {inProgress && lesson.user_score !== undefined && (
                          <div className="mb-3 space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{lesson.user_score}%</span></div>
                            <Progress value={lesson.user_score} className="h-1.5" />
                          </div>
                        )}
                        {completed && (
                          <Badge className="text-xs bg-chart-3/10 text-chart-3 border-chart-3/20" variant="outline"><CheckCircle2 className="size-3 mr-1" />Completed</Badge>
                        )}
                        <Button size="sm" className={`w-full text-xs mt-3 ${completed ? "" : "btn-gold-shimmer"}`} variant={completed ? "outline" : "default"}>
                          {completed ? "Review" : inProgress ? "Continue" : "Start Lesson"}
                          <ChevronRight className="size-3.5 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="size-12 mx-auto mb-3 opacity-50" />
                <p>No lessons available for this level yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
