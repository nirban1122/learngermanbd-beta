import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Volume2, Lightbulb } from "lucide-react"
import { apiService, type Lesson } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

interface LessonPageProps {
  onNavigate: (page: string) => void
}

interface LessonStep {
  type: "intro" | "vocabulary" | "quiz" | "complete"
  title?: string
  content?: string
  vocabulary?: { german: string; article: string; translation: string }[]
  question?: string
  options?: string[]
  correct?: number
  xp?: number
}

export function LessonPage({ onNavigate }: LessonPageProps) {
  const { user } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const level = user?.level ?? "A1"
        const lessonsRes = await apiService.getLessons(level, undefined, 1)
        if (lessonsRes.success && lessonsRes.data && lessonsRes.data.lessons.length > 0) {
          const lessonData = await apiService.getLesson(lessonsRes.data.lessons[0].id)
          if (lessonData.success && lessonData.data) {
            setLesson(lessonData.data)
          }
        }
      } catch {
        // fallback
      } finally {
        setLoading(false)
      }
    }
    loadLesson()
  }, [user?.level])

  const steps: LessonStep[] = lesson?.content
    ? parseContentToSteps(lesson.content, lesson.xp_reward)
    : getDefaultSteps()

  const step = steps[currentStep]
  const progress = (currentStep / steps.length) * 100

  const handleAnswer = (index: number) => {
    if (answered) return
    setSelectedAnswer(index)
    setAnswered(true)
    if (step.type === "quiz" && index === step.correct) {
      setCorrectCount(c => c + 1)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!lesson || step.type !== "quiz") return
    const answer = step.options?.[selectedAnswer ?? 0] ?? ""
    try {
      await apiService.submitLessonAnswer(lesson.id, answer)
    } catch {
      // silent
    }
  }

  const handleNext = () => {
    if (step.type === "quiz") handleSubmitAnswer()
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1)
      setSelectedAnswer(null)
      setAnswered(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const lessonTitle = lesson?.title ?? "German Lesson"

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center gap-4 mb-6 animate-fade-in-up">
          <Button variant="ghost" size="icon-sm" onClick={() => onNavigate("lessons")} aria-label="Back to lessons">
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{lessonTitle}</span>
                <Badge variant="outline" className="text-xs border-border">{lesson?.level ?? "A1"}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">{currentStep + 1} / {steps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="animate-fade-in-up delay-100">
          {step.type === "intro" && (
            <Card className="glass-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center"><Lightbulb className="size-5 text-primary" /></div>
                  <div><h2 className="text-xl font-bold">{step.title}</h2><p className="text-sm text-muted-foreground">{lesson?.type} · {lesson?.level}</p></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">{step.content}</p>
                {step.vocabulary && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {step.vocabulary.map((v, i) => (
                      <div key={i} className="rounded-xl border border-border bg-accent/50 p-4 text-center group hover:border-primary/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <p className="text-lg font-bold text-primary">{v.german}</p>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity"><Volume2 className="size-3.5 text-muted-foreground hover:text-primary" /></button>
                        </div>
                        <p className="text-xs text-muted-foreground">{v.translation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step.type === "vocabulary" && (
            <Card className="glass-card border-border">
              <CardHeader><h2 className="text-xl font-bold">{step.title}</h2></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {step.vocabulary?.map((v, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-accent/50 px-5 py-4 hover:border-primary/30 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-primary">{v.german}</span>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity"><Volume2 className="size-4 text-muted-foreground hover:text-primary" /></button>
                      </div>
                      <span className="text-muted-foreground text-sm">{v.translation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {step.type === "quiz" && (
            <Card className="glass-card border-border">
              <CardHeader>
                <Badge variant="outline" className="w-fit border-primary/30 text-primary mb-2">Quiz</Badge>
                <h2 className="text-xl font-bold">{step.question}</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                {step.options?.map((option, i) => {
                  const isSelected = selectedAnswer === i
                  const isCorrect = step.correct === i
                  let cls = "border-border hover:border-primary/30 hover:bg-accent"
                  if (answered) {
                    if (isCorrect) cls = "border-chart-3/50 bg-chart-3/10 text-chart-3"
                    else if (isSelected && !isCorrect) cls = "border-destructive/50 bg-destructive/10 text-destructive"
                    else cls = "border-border opacity-50"
                  }
                  return (
                    <button key={i} onClick={() => handleAnswer(i)} className={`w-full flex items-center justify-between rounded-xl border px-5 py-4 font-medium text-sm transition-all text-left ${cls}`}>
                      <span>{option}</span>
                      {answered && isCorrect && <CheckCircle2 className="size-5 text-chart-3" />}
                      {answered && isSelected && !isCorrect && <XCircle className="size-5 text-destructive" />}
                    </button>
                  )
                })}
                {answered && (
                  <div className={`rounded-xl p-4 border mt-4 ${selectedAnswer === step.correct ? "bg-chart-3/10 border-chart-3/20 text-chart-3" : "bg-destructive/10 border-destructive/20 text-destructive"}`}>
                    <p className="font-semibold">{selectedAnswer === step.correct ? "Correct!" : "Not quite!"}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step.type === "complete" && (
            <Card className="glass-card border-primary/20 border text-center animate-glow">
              <CardContent className="p-10">
                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="size-10 text-primary animate-float" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Lesson Complete!</h2>
                <p className="text-muted-foreground mb-6">You answered {correctCount} quiz questions correctly.</p>
                <div className="inline-flex items-center gap-3 rounded-2xl bg-primary/10 border border-primary/20 px-8 py-4 mb-8">
                  <span className="text-3xl font-extrabold text-gold-gradient">+{step.xp}</span>
                  <span className="text-muted-foreground font-medium">XP Earned</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="btn-gold-shimmer font-semibold px-8" onClick={() => onNavigate("lessons")}>Next Lesson<ChevronRight className="size-4 ml-1" /></Button>
                  <Button variant="outline" onClick={() => onNavigate("dashboard")}>Back to Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {step.type !== "complete" && (
          <div className="flex justify-between mt-6 animate-fade-in-up delay-200">
            <Button variant="outline" onClick={() => { setCurrentStep(s => s - 1); setSelectedAnswer(null); setAnswered(false) }} disabled={currentStep === 0}>
              <ChevronLeft className="size-4 mr-1" />Previous
            </Button>
            <Button onClick={handleNext} disabled={step.type === "quiz" && !answered} className="btn-gold-shimmer font-semibold">
              {currentStep === steps.length - 2 ? "Finish" : "Next"}<ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function parseContentToSteps(content: Record<string, unknown>, xp: number): LessonStep[] {
  // Try to parse lesson content from backend JSON
  const questions = (content.questions ?? []) as Array<Record<string, unknown>>
  const vocab = (content.vocabulary ?? []) as Array<Record<string, unknown>>

  const steps: LessonStep[] = []

  if (vocab.length > 0) {
    steps.push({
      type: "intro",
      title: (content.title as string) ?? "German Lesson",
      content: (content.description as string) ?? "Learn these German words and phrases.",
      vocabulary: vocab.slice(0, 5).map(v => ({
        german: (v.german ?? v.german_word ?? "") as string,
        article: (v.article ?? "") as string,
        translation: (v.translation ?? v.english_translation ?? "") as string,
      })),
    })
  }

  if (questions.length > 0) {
    questions.forEach((q) => {
      const options = (q.options ?? []) as string[]
      steps.push({
        type: "quiz",
        question: (q.question ?? q.text ?? "") as string,
        options,
        correct: (q.correct ?? q.correct_index ?? 0) as number,
      })
    })
  }

  steps.push({ type: "complete", xp })
  return steps.length > 1 ? steps : getDefaultSteps()
}

function getDefaultSteps(): LessonStep[] {
  return [
    {
      type: "intro",
      title: "Numbers in German",
      content: "In this lesson, you'll learn how to count in German from 1 to 100.",
      vocabulary: [
        { german: "eins", article: "", translation: "one" },
        { german: "zwei", article: "", translation: "two" },
        { german: "drei", article: "", translation: "three" },
        { german: "vier", article: "", translation: "four" },
        { german: "fünf", article: "", translation: "five" },
      ],
    },
    { type: "quiz", question: "How do you say 'three' in German?", options: ["zwei", "drei", "vier", "fünf"], correct: 1 },
    { type: "quiz", question: "What does 'fünf' mean in English?", options: ["four", "five", "six", "three"], correct: 1 },
    { type: "complete", xp: 50 },
  ]
}
