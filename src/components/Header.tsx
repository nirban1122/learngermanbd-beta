import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe, Menu, X, BookOpen, GraduationCap } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useI18n } from "@/contexts/I18nContext"

interface HeaderProps {
  currentPage: string
  onNavigate: (page: string) => void
  isLoggedIn?: boolean
  userName?: string
}

export function Header({ currentPage, onNavigate, isLoggedIn, userName }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const { t, language, setLanguage, languages } = useI18n()

  const displayName = userName || user?.full_name || "User"
  const displayLevel = user?.level || "A1"

  const navItems = isLoggedIn
    ? [
        { label: t("header.dashboard"), page: "dashboard" },
        { label: t("header.lessons"), page: "lessons" },
        { label: t("header.vocabulary"), page: "vocabulary" },
        { label: t("header.exams"), page: "exam" },
      ]
    : []

  const handleLogout = async () => {
    await logout()
    onNavigate("landing")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md" role="banner">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button
            onClick={() => onNavigate(isLoggedIn ? "dashboard" : "landing")}
            className="flex items-center gap-2 group"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-gold-gradient">{t("common.appName").split(" ")[0].toUpperCase()}</span>
              <span className="block text-xs text-muted-foreground leading-none">{t("common.subtitle")}</span>
            </div>
          </button>

          {isLoggedIn && (
            <nav className="hidden md:flex items-center gap-1" aria-label={t("header.mainNavigation")}>
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.page
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t("header.changeLanguage")}>
                  <Globe className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? "bg-accent" : ""}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:flex border-primary/30 text-primary text-xs">
                  <BookOpen className="size-3 mr-1" />
                  {displayLevel}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <div className="size-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {displayName ? displayName[0].toUpperCase() : "U"}
                      </div>
                      <span className="hidden sm:inline text-sm">{displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onNavigate("profile")}>{t("header.profile")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      {t("header.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onNavigate("login")}>
                  {t("header.login")}
                </Button>
                <Button size="sm" onClick={() => onNavigate("register")} className="btn-gold-shimmer font-semibold">
                  {t("header.getStarted")}
                </Button>
              </div>
            )}

            {isLoggedIn && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? t("header.closeMenu") : t("header.openMenu")}
              >
                {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isLoggedIn && mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-4 gap-1" aria-label={t("header.mobileNavigation")}>
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => { onNavigate(item.page); setMobileOpen(false) }}
                className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                  currentPage === item.page
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
