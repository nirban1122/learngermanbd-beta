import { useState, useEffect, Component, type ReactNode } from "react"
import { Header } from "@/components/Header"
import { LandingPage } from "@/pages/LandingPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { LoginPage } from "@/pages/LoginPage"
import { VerifyPage } from "@/pages/VerifyPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { LessonsPage } from "@/pages/LessonsPage"
import { LessonPage } from "@/pages/LessonPage"
import { VocabularyPage } from "@/pages/VocabularyPage"
import { ExamPage } from "@/pages/ExamPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { I18nProvider, useI18n } from "@/contexts/I18nContext"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function LoadingScreen() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    </div>
  )
}

type Page =
  | "landing"
  | "register"
  | "login"
  | "verify"
  | "dashboard"
  | "lessons"
  | "lesson"
  | "vocabulary"
  | "exam"
  | "profile"

function AppContent() {
  const [page, setPage] = useState<Page>("landing")
  const [verifyEmail, setVerifyEmail] = useState("")
  const { isAuthenticated, isLoading, user } = useAuth()

  const navigate = (target: string, data?: Record<string, string>) => {
    if (data?.email) setVerifyEmail(data.email)
    setPage(target as Page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Redirect to dashboard if authenticated and on landing/login/register
  useEffect(() => {
    if (isAuthenticated && (page === "landing" || page === "login" || page === "register")) {
      setPage("dashboard")
    }
  }, [isAuthenticated, page])

  const protectedPages: Page[] = ["dashboard", "lessons", "lesson", "vocabulary", "exam", "profile"]
  const showHeader = page !== "register" && page !== "login" && page !== "verify"

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated && protectedPages.includes(page)) {
    return <LoginPage onNavigate={navigate} />
  }

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Skip to main content
      </a>
      {showHeader && (
        <Header
          currentPage={page}
          onNavigate={navigate}
          isLoggedIn={isAuthenticated}
          userName={user?.full_name ?? ""}
        />
      )}

      <main id="main-content">
        {page === "landing" && <LandingPage onNavigate={navigate} />}
        {page === "register" && <RegisterPage onNavigate={navigate} />}
        {page === "login" && <LoginPage onNavigate={navigate} />}
        {page === "verify" && (
          <VerifyPage email={verifyEmail} onNavigate={navigate} />
        )}
        {page === "dashboard" && <DashboardPage onNavigate={navigate} />}
        {page === "lessons" && <LessonsPage onNavigate={navigate} />}
        {page === "lesson" && <LessonPage onNavigate={navigate} />}
        {page === "vocabulary" && <VocabularyPage onNavigate={navigate} />}
        {page === "exam" && <ExamPage onNavigate={navigate} />}
        {page === "profile" && <ProfilePage onNavigate={navigate} />}
      </main>
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}

export default App
