import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  BookOpen,
  Brain,
  Trophy,
  Zap,
  Globe,
  Star,
  ChevronRight,
  GraduationCap,
  Users,
  TrendingUp,
  CheckCircle2,
  Play,
  Flame,
} from "lucide-react"
import { useI18n } from "@/contexts/I18nContext"

interface LandingPageProps {
  onNavigate: (page: string) => void
}

const levels = [
  { code: "A1", name: "Beginner", desc: "Basic phrases & expressions", color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  { code: "A2", name: "Elementary", desc: "Simple conversations", color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
  { code: "B1", name: "Intermediate", desc: "Clear communication", color: "bg-primary/10 text-primary border-primary/20" },
  { code: "B2", name: "Upper Intermediate", desc: "Complex topics", color: "bg-chart-1/10 text-chart-1 border-chart-1/20" },
  { code: "C1", name: "Advanced", desc: "Fluent expression", color: "bg-chart-5/10 text-chart-5 border-chart-5/20" },
]

const stats = [
  { value: "50,000+", label: "Active Learners", icon: Users },
  { value: "500+", label: "Lessons Available", icon: BookOpen },
  { value: "4.9/5", label: "Average Rating", icon: Star },
  { value: "30 days", label: "Avg. to A1", icon: TrendingUp },
]

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { t } = useI18n()

  const features = [
    { icon: Brain, title: t("landing.features.aiPowered.title"), desc: t("landing.features.aiPowered.desc"), color: "text-chart-1" },
    { icon: BookOpen, title: t("landing.features.structured.title"), desc: t("landing.features.structured.desc"), color: "text-chart-2" },
    { icon: Trophy, title: t("landing.features.gamified.title"), desc: t("landing.features.gamified.desc"), color: "text-chart-4" },
    { icon: Globe, title: t("landing.features.multilingual.title"), desc: t("landing.features.multilingual.desc"), color: "text-chart-3" },
    { icon: Zap, title: t("landing.features.vocabulary.title"), desc: t("landing.features.vocabulary.desc"), color: "text-primary" },
    { icon: GraduationCap, title: t("landing.features.exams.title"), desc: t("landing.features.exams.desc"), color: "text-chart-5" },
  ]

  const levels = [
    { code: "A1", name: t("landing.curriculum.beginner"), desc: t("landing.curriculum.basicPhrases"), color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
    { code: "A2", name: t("landing.curriculum.elementary"), desc: t("landing.curriculum.simpleCon"), color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
    { code: "B1", name: t("landing.curriculum.intermediate"), desc: t("landing.curriculum.clearCom"), color: "bg-primary/10 text-primary border-primary/20" },
    { code: "B2", name: t("landing.curriculum.upperIntermediate"), desc: t("landing.curriculum.complex"), color: "bg-chart-1/10 text-chart-1 border-chart-1/20" },
    { code: "C1", name: t("landing.curriculum.advanced"), desc: t("landing.curriculum.fluent"), color: "bg-chart-5/10 text-chart-5 border-chart-5/20" },
  ]

  const stats = [
    { value: "50,000+", label: t("landing.stats.learners"), icon: Users },
    { value: "500+", label: t("landing.stats.lessons"), icon: BookOpen },
    { value: "4.9/5", label: t("landing.stats.rating"), icon: Star },
    { value: "30 days", label: t("landing.stats.speed"), icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 size-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-40 size-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/3 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-sm px-4 py-1">
              <Flame className="size-3.5 mr-1.5" />
              {t("landing.badge")}
            </Badge>
          </div>

          <h1 className="animate-fade-in-up delay-100 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance mb-6">
            {t("landing.title")}
            <span className="block text-gold-gradient">{t("landing.titleHighlight")}</span>
          </h1>

          <p className="animate-fade-in-up delay-200 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("landing.subtitle")}
          </p>

          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="btn-gold-shimmer font-bold text-base px-8 h-12 animate-glow"
              onClick={() => onNavigate("register")}
            >
              {t("landing.startLearning")}
              <ChevronRight className="size-5 ml-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-medium text-base px-8 h-12 border-border hover:bg-accent"
              onClick={() => onNavigate("login")}
            >
              <Play className="size-4 mr-2 fill-current" />
              {t("landing.watchDemo")}
            </Button>
          </div>

          {/* Social proof */}
          <div className="animate-fade-in-up delay-400 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-4 text-primary" />
              {t("landing.freeToStart")}
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-4 text-primary" />
              {t("landing.noCard")}
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-4 text-primary" />
              {t("landing.languages")}
            </div>
          </div>
        </div>

        {/* Floating German words decoration */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
          <div className="animate-fade-in-up delay-500">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
              {[
                { word: "Hallo", meaning: "Hello", article: "" },
                { word: "der Hund", meaning: "the dog", article: "der" },
                { word: "die Katze", meaning: "the cat", article: "die" },
                { word: "das Buch", meaning: "the book", article: "das" },
                { word: "Danke!", meaning: "Thank you!", article: "" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="animate-float glass-card rounded-xl p-3 text-center"
                  style={{ animationDelay: `${(i + 1) * 0.1}s` }}
                >
                  <p className={`font-bold text-sm ${
                    item.article === "der" ? "text-article-der" :
                    item.article === "die" ? "text-article-die" :
                    item.article === "das" ? "text-article-das" :
                    "text-primary"
                  }`}>
                    {item.word}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <stat.icon className="size-6 text-primary mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-gold-gradient">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need to <span className="text-gold-gradient">master German</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete language learning ecosystem designed for modern learners.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="glass-card border-border hover:border-primary/30 transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-accent ${feature.color}`}>
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section className="py-20 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Curriculum</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t("landing.curriculum.title")} <span className="text-gold-gradient">{t("landing.curriculum.highlight")}</span> {t("landing.curriculum.subtitle")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("landing.curriculum.description")}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {levels.map((level, i) => (
              <div
                key={i}
                className={`rounded-2xl border px-8 py-6 text-center min-w-[160px] ${level.color} animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <p className="text-3xl font-extrabold mb-1">{level.code}</p>
                <p className="font-semibold text-sm mb-1">{level.name}</p>
                <p className="text-xs opacity-75">{level.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Article Colors Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">German Grammar</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                {t("landing.grammar.title")} <span className="text-gold-gradient">{t("landing.grammar.highlight")}</span>{" "}
                {t("landing.grammar.subtitle")}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                {t("landing.grammar.description")}
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { article: "der", color: "text-article-der bg-article-der/10 border-article-der/20", example: "der Hund (the dog)" },
                  { article: "die", color: "text-article-die bg-article-die/10 border-article-die/20", example: "die Katze (the cat)" },
                  { article: "das", color: "text-article-das bg-article-das/10 border-article-das/20", example: "das Buch (the book)" },
                ].map((item) => (
                  <div key={item.article} className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${item.color}`}>
                    <span className="text-2xl font-extrabold">{item.article}</span>
                    <span className="text-sm font-medium">{item.example}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { word: "der Mann", meaning: "the man", article: "der" },
                { word: "die Frau", meaning: "the woman", article: "die" },
                { word: "das Kind", meaning: "the child", article: "das" },
                { word: "der Hund", meaning: "the dog", article: "der" },
                { word: "die Stadt", meaning: "the city", article: "die" },
                { word: "das Haus", meaning: "the house", article: "das" },
              ].map((item, i) => (
                <Card
                  key={i}
                  className={`glass-card border animate-float ${
                    item.article === "der" ? "border-article-der/30" :
                    item.article === "die" ? "border-article-die/30" :
                    "border-article-das/30"
                  }`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <CardContent className="p-4 text-center">
                    <p className={`text-lg font-bold ${
                      item.article === "der" ? "text-article-der" :
                      item.article === "die" ? "text-article-die" :
                      "text-article-das"
                    }`}>
                      {item.word}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{item.meaning}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t("landing.testimonials.title")} <span className="text-gold-gradient">{t("landing.testimonials.highlight")}</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: "Sarah M.", flag: "🇺🇸", text: "I passed my Goethe B1 exam after 4 months using this platform. The AI feedback is incredible!", level: "B1 Certified", stars: 5 },
              { name: "Ahmed K.", flag: "🇸🇦", text: "Having Arabic support made all the difference. I finally understand German grammar!", level: "A2 Level", stars: 5 },
              { name: "Maria G.", flag: "🇪🇸", text: "The streak system keeps me motivated every day. 120-day streak and counting!", level: "B2 Level", stars: 5 },
            ].map((testimonial, i) => (
              <Card key={i} className="glass-card border-border animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.stars }).map((_, j) => (
                      <Star key={j} className="size-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{testimonial.flag}</span>
                      <span className="font-semibold text-sm">{testimonial.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">{testimonial.level}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card rounded-3xl p-12 border border-primary/20 animate-glow">
            <GraduationCap className="size-16 text-primary mx-auto mb-6 animate-float" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t("landing.cta.title")} <span className="text-gold-gradient">{t("landing.cta.highlight")}</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {t("landing.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="btn-gold-shimmer font-bold text-base px-10 h-12"
                onClick={() => onNavigate("register")}
              >
                {t("landing.startLearning")}
                <ChevronRight className="size-5 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-medium text-base px-8 h-12"
                onClick={() => onNavigate("login")}
              >
                {t("landing.cta.alreadyHave")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-4 gap-8">
            <div className="sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="size-5" />
                </div>
                <span className="font-bold text-gold-gradient">{t("common.appName").split(" ").slice(0, 2).join(" ").toUpperCase()}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("landing.footer.slogan")}
              </p>
            </div>
            {[
              { title: t("landing.footer.learn"), links: [t("landing.footer.a1Beginner"), t("landing.footer.a2Elementary"), t("landing.footer.b1Intermediate"), t("landing.footer.b2Advanced")] },
              { title: t("landing.footer.platform"), links: [t("landing.footer.allLessons"), t("landing.footer.allVocab"), t("landing.footer.allExams"), t("landing.footer.allDash")] },
              { title: t("landing.footer.support"), links: [t("landing.footer.about"), t("landing.footer.contact"), t("landing.footer.privacy"), t("landing.footer.terms")] },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-semibold text-sm mb-4">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>{t("landing.footer.copyright")}</p>
            <p>{t("landing.footer.madeWith")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
