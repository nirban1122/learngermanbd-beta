import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Volume2, CheckCircle2, XCircle, RotateCcw, ChevronRight, ChevronLeft, Bookmark } from "lucide-react"
import { apiService, type VocabWord } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

interface VocabularyPageProps {
  onNavigate: (page: string) => void
}

const articleColor = (article: string) => {
  if (article === "der") return { text: "text-article-der", bg: "bg-article-der/10", border: "border-article-der/30" }
  if (article === "die") return { text: "text-article-die", bg: "bg-article-die/10", border: "border-article-die/30" }
  return { text: "text-article-das", bg: "bg-article-das/10", border: "border-article-das/30" }
}

export function VocabularyPage({ onNavigate: _onNavigate }: VocabularyPageProps) {
  const { user } = useAuth()
  const [vocabulary, setVocabulary] = useState<VocabWord[]>([])
  const [mode, setMode] = useState<"browse" | "flashcard">("browse")
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [learnedIds, setLearnedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        const level = user?.level ?? "A1"
        const response = await apiService.getVocabulary(level, 50)
        if (response.success && response.data) {
          const words = response.data.vocabulary
          setVocabulary(words)
          setTotalCount(response.data.total)
          setLearnedIds(new Set(words.filter(w => w.user_learned).map(w => w.id)))
        }
      } catch {
        // fallback
      } finally {
        setLoading(false)
      }
    }
    loadVocabulary()
  }, [user?.level])

  const markLearned = async (id: number) => {
    const isCurrentlyLearned = learnedIds.has(id)
    try {
      const response = await apiService.markVocabularyLearned(id, !isCurrentlyLearned)
      if (response.success) {
        setLearnedIds(prev => {
          const next = new Set(prev)
          if (next.has(id)) next.delete(id); else next.add(id)
          return next
        })
      }
    } catch {
      // silent fail
    }
  }

  const currentCard = vocabulary[cardIndex]
  const colors = currentCard ? articleColor(currentCard.article) : null
  const progress = totalCount > 0 ? (learnedIds.size / totalCount) * 100 : 0

  const nextCard = () => {
    setCardIndex(i => (i + 1) % vocabulary.length)
    setFlipped(false)
  }
  const prevCard = () => {
    setCardIndex(i => (i - 1 + vocabulary.length) % vocabulary.length)
    setFlipped(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (vocabulary.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No vocabulary available for your level yet.</p>
          <Button className="mt-4 btn-gold-shimmer" onClick={() => _onNavigate("dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6 animate-fade-in-up">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                <span className="text-gold-gradient">Vocabulary</span> Trainer
              </h1>
              <p className="text-muted-foreground text-sm">Master German nouns with article color coding</p>
            </div>
            <div className="flex gap-2">
              <Button variant={mode === "browse" ? "default" : "outline"} size="sm" onClick={() => setMode("browse")} className={mode === "browse" ? "btn-gold-shimmer" : ""}>Browse</Button>
              <Button variant={mode === "flashcard" ? "default" : "outline"} size="sm" onClick={() => setMode("flashcard")} className={mode === "flashcard" ? "btn-gold-shimmer" : ""}>Flashcards</Button>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Words learned</span>
              <span className="font-semibold">{learnedIds.size} / {totalCount}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 animate-fade-in-up delay-100">
          {[
            { article: "der", label: "Masculine", color: "text-article-der bg-article-der/10 border-article-der/20" },
            { article: "die", label: "Feminine", color: "text-article-die bg-article-die/10 border-article-die/20" },
            { article: "das", label: "Neuter", color: "text-article-das bg-article-das/10 border-article-das/20" },
          ].map(a => (
            <div key={a.article} className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${a.color}`}>
              <span className="font-bold">{a.article}</span>
              <span className="text-xs opacity-75">= {a.label}</span>
            </div>
          ))}
        </div>

        {mode === "browse" ? (
          <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up delay-200">
            {vocabulary.map((word, i) => {
              const c = articleColor(word.article)
              const isLearned = learnedIds.has(word.id)
              return (
                <Card key={word.id} className={`glass-card transition-all duration-200 animate-fade-in-up border ${c.border} ${isLearned ? "opacity-70" : ""}`} style={{ animationDelay: `${i * 0.05}s` }}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${c.bg} ${c.text}`}>{word.article}</span>
                          <span className="text-xl font-bold">{word.german_word.replace(/^(der|die|das)\s+/i, "")}</span>
                          <button className="text-muted-foreground hover:text-primary transition-colors" aria-label="Pronounce word">
                            <Volume2 className="size-4" />
                          </button>
                        </div>
                        <p className="text-muted-foreground text-sm">{word.english_translation}</p>
                      </div>
                      <button onClick={() => markLearned(word.id)} aria-label={isLearned ? "Unmark as learned" : "Mark as learned"}>
                        {isLearned ? <CheckCircle2 className="size-5 text-chart-3" /> : <Bookmark className="size-5 text-muted-foreground hover:text-primary transition-colors" />}
                      </button>
                    </div>
                    {word.example_sentence && (
                      <div className="rounded-lg bg-accent/50 border border-border px-3 py-2">
                        <p className="text-sm font-medium">{word.example_sentence}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="max-w-lg mx-auto animate-fade-in-up delay-200">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>{cardIndex + 1} / {vocabulary.length}</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="size-4 text-chart-3" />
                {learnedIds.size} learned
              </span>
            </div>

            <div
              className={`relative rounded-2xl border-2 p-10 text-center cursor-pointer transition-all duration-300 min-h-64 flex flex-col items-center justify-center ${
                colors ? `${colors.border} ${colors.bg}` : "border-border"
              }`}
              onClick={() => setFlipped(!flipped)}
            >
              {!flipped ? (
                <div className="space-y-4 animate-fade-in-up">
                  <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 ${colors?.bg} ${colors?.text}`}>
                    <span className="text-sm font-bold">{currentCard?.article}</span>
                  </div>
                  <p className="text-4xl font-extrabold">{currentCard?.german_word.replace(/^(der|die|das)\s+/i, "")}</p>
                  <p className="text-sm text-muted-foreground">Tap to reveal translation</p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in-up">
                  <p className="text-4xl font-extrabold text-primary">{currentCard?.english_translation}</p>
                  {currentCard?.example_sentence && (
                    <div className="rounded-lg bg-background/50 border border-border px-4 py-3">
                      <p className="text-sm font-medium">{currentCard.example_sentence}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {flipped && (
              <div className="flex gap-3 mt-4 animate-fade-in-up">
                <Button variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => { setFlipped(false); nextCard() }}>
                  <XCircle className="size-4 mr-2" />Still learning
                </Button>
                <Button className="flex-1 bg-chart-3/10 text-chart-3 border-chart-3/30 hover:bg-chart-3/20" variant="outline" onClick={() => { markLearned(currentCard.id); setFlipped(false); nextCard() }}>
                  <CheckCircle2 className="size-4 mr-2" />Got it!
                </Button>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <Button variant="ghost" size="icon" onClick={prevCard} aria-label="Previous card"><ChevronLeft className="size-5" /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => { setCardIndex(0); setFlipped(false) }} aria-label="Reset cards"><RotateCcw className="size-4" /></Button>
              <Button variant="ghost" size="icon" onClick={nextCard} aria-label="Next card"><ChevronRight className="size-5" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
