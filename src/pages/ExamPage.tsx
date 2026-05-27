import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, ChevronRight, CheckCircle2, Trophy, Target, BookOpen } from "lucide-react"
import { apiService, type Exam } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

interface ExamPageProps {
  onNavigate: (page: string) => void
}

interface ExamQuestion {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

type ExamState = "list" | "active" | "results"

const defaultQuestions: ExamQuestion[] = [
  { id: 1, question: "Which article goes with 'Hund' (dog)?", options: ["der", "die", "das", "den"], correct: 0, explanation: "'Hund' is masculine, so it uses 'der'." },
  { id: 2, question: "How do you say 'Good morning' in German?", options: ["Guten Abend", "Gute Nacht", "Guten Morgen", "Guten Tag"], correct: 2, explanation: "'Guten Morgen' means 'Good morning'." },
  { id: 3, question: "What is the plural of 'das Buch'?", options: ["die Buchs", "die Bücher", "die Buche", "die Buch"], correct: 1, explanation: "The plural of 'das Buch' is 'die Bücher'." },
  { id: 4, question: "Fill in: 'Ich _____ Deutsch.' (I speak German)", options: ["spreche", "spricht", "sprechen", "sprichst"], correct: 0, explanation: "With 'ich', 'sprechen' conjugates to 'spreche'." },
  { id: 5, question: "Which sentence is correct?", options: ["Ich bin hungrig", "Ich sein hungrig", "Ich bist hungrig", "Ich hat hungrig"], correct: 0, explanation: "'Sein' conjugates to 'bin' with 'ich'." },
]

export function ExamPage({ onNavigate }: ExamPageProps) {
  const { user } = useAuth()
  const [examState, setExamState] = useState<ExamState>("list")
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(5).fill(null))
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [passed, setPassed] = useState(false)

  const questions = defaultQuestions

  useEffect(() => {
    const loadExams = async () => {
      try {
        const level = user?.level ?? "A1"
        const response = await apiService.getExams(level)
        if (response.success && response.data) {
          setExams(response.data.exams)
        }
      } catch {
        // fallback
      } finally {
        setLoading(false)
      }
    }
    loadExams()
  }, [user?.level])

  const handleAnswer = (optionIndex: number) => {
    if (answers[currentQ] !== null) return
    setSelectedAnswer(optionIndex)
    const newAnswers = [...answers]
    newAnswers[currentQ] = optionIndex
    setAnswers(newAnswers)
    setShowExplanation(true)
  }

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1)
      setSelectedAnswer(answers[currentQ + 1])
      setShowExplanation(answers[currentQ + 1] !== null)
    } else {
      // Calculate score
      const correct = answers.filter((a, i) => a === questions[i].correct).length
      const s = Math.round((correct / questions.length) * 100)
      setScore(s)
      setPassed(s >= 60)

      // Submit to backend if we have an active exam
      const firstExam = exams[0]
      if (firstExam) {
        const examAnswers = answers.map((a, i) => ({
          question_id: questions[i].id,
          answer: a !== null ? questions[i].options[a] : "",
        }))
        apiService.submitExam(firstExam.id, examAnswers, 30).catch(() => {})
      }

      setExamState("results")
    }
  }

  const resetExam = () => {
    setExamState("list")
    setCurrentQ(0)
    setAnswers(new Array(questions.length).fill(null))
    setSelectedAnswer(null)
    setShowExplanation(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (examState === "list") {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              <span className="text-gold-gradient">Exams</span> & Practice Tests
            </h1>
            <p className="text-muted-foreground">Test your German knowledge and earn certificates.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {exams.length > 0 ? exams.map((exam, i) => (
              <Card key={exam.id} className="glass-card border-border animate-fade-in-up hover:border-primary/30 transition-all" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      {exam.passed ? <Trophy className="size-6 text-primary" /> : <Target className="size-6 text-primary" />}
                    </div>
                    <Badge variant="outline" className="text-xs border-border">{exam.level}</Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{exam.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><BookOpen className="size-3" />{exam.total_questions} questions</span>
                    <span className="flex items-center gap-1"><Clock className="size-3" />{exam.duration_minutes}m</span>
                    <span className="text-primary font-medium">+200 XP</span>
                  </div>
                  <Button className="w-full text-sm btn-gold-shimmer font-semibold" onClick={() => setExamState("active")}>
                    {exam.passed ? "Retake Exam" : "Start Exam"}
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                <Target className="size-12 mx-auto mb-3 opacity-50" />
                <p>No exams available for your level yet.</p>
                <Button className="mt-4 btn-gold-shimmer" size="sm" onClick={() => setExamState("active")}>
                  Try Practice Test
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (examState === "results") {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="mx-auto max-w-lg px-4 py-8 text-center animate-fade-in-up">
          <Card className={`glass-card border-2 ${passed ? "border-chart-3/30 animate-glow" : "border-destructive/30"}`}>
            <CardContent className="p-10">
              <div className={`size-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? "bg-chart-3/10" : "bg-destructive/10"}`}>
                {passed ? <Trophy className="size-10 text-chart-3 animate-float" /> : <Target className="size-10 text-destructive" />}
              </div>
              <h2 className="text-2xl font-bold mb-2">{passed ? "Exam Passed!" : "Keep Practicing!"}</h2>
              <p className="text-muted-foreground mb-6">
                You answered {answers.filter((a, i) => a === questions[i].correct).length} out of {questions.length} correctly.
              </p>
              <div className={`text-6xl font-extrabold mb-2 ${passed ? "text-gold-gradient" : "text-destructive"}`}>{score}%</div>
              <p className="text-sm text-muted-foreground mb-8">{passed ? "Minimum pass score: 60%" : `You need ${Math.max(0, 60 - score)}% more to pass`}</p>
              {passed && (
                <div className="rounded-2xl bg-primary/10 border border-primary/20 px-6 py-4 mb-6 inline-block">
                  <span className="text-2xl font-extrabold text-gold-gradient">+200 XP</span>
                  <span className="text-muted-foreground ml-2">earned!</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="btn-gold-shimmer font-semibold px-8" onClick={resetExam}>{passed ? "View All Exams" : "Try Again"}</Button>
                <Button variant="outline" onClick={() => onNavigate("dashboard")}>Back to Dashboard</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const question = questions[currentQ]
  const answered = answers.filter(a => a !== null).length
  const progressVal = (currentQ / questions.length) * 100

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6 animate-fade-in-up">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Question {currentQ + 1} of {questions.length}</span>
              <span className="text-sm text-muted-foreground">{answered}/{questions.length} answered</span>
            </div>
            <Progress value={progressVal} className="h-2" />
          </div>
        </div>

        <Card className="glass-card border-border animate-fade-in-up delay-100">
          <CardHeader>
            <Badge variant="outline" className="w-fit border-primary/30 text-primary mb-3">Question {currentQ + 1}</Badge>
            <h2 className="text-xl font-bold">{question.question}</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option, i) => {
              const isAnswered = answers[currentQ] !== null
              const isSelected = selectedAnswer === i
              const isCorrect = question.correct === i
              let cls = "border-border hover:border-primary/30 hover:bg-accent"
              if (isAnswered) {
                if (isCorrect) cls = "border-chart-3/50 bg-chart-3/10"
                else if (isSelected && !isCorrect) cls = "border-destructive/50 bg-destructive/10"
                else cls = "border-border opacity-40"
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} className={`w-full flex items-center gap-3 rounded-xl border px-5 py-4 font-medium text-sm transition-all text-left ${cls}`}>
                  <span className={`size-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAnswered && isCorrect ? "border-chart-3 bg-chart-3 text-white" : isAnswered && isSelected && !isCorrect ? "border-destructive bg-destructive text-white" : "border-border"
                  }`}>{["A", "B", "C", "D"][i]}</span>
                  {option}
                  {isAnswered && isCorrect && <CheckCircle2 className="size-4 text-chart-3 ml-auto" />}
                </button>
              )
            })}
            {showExplanation && (
              <div className={`rounded-xl p-4 border mt-4 animate-fade-in-up ${answers[currentQ] === question.correct ? "bg-chart-3/10 border-chart-3/20 text-chart-3" : "bg-destructive/10 border-destructive/20 text-destructive"}`}>
                <p className="font-semibold mb-1">{answers[currentQ] === question.correct ? "Correct!" : "Incorrect"}</p>
                <p className="text-sm opacity-90">{question.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6 animate-fade-in-up delay-200">
          <Button variant="outline" onClick={() => { setCurrentQ(q => q - 1); setSelectedAnswer(answers[currentQ - 1]); setShowExplanation(answers[currentQ - 1] !== null) }} disabled={currentQ === 0}>
            Previous
          </Button>
          <Button onClick={handleNext} disabled={answers[currentQ] === null} className="btn-gold-shimmer font-semibold">
            {currentQ < questions.length - 1 ? "Next Question" : "Finish Exam"}
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
