import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { GraduationCap, Eye, EyeOff, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface LoginPageProps {
  onNavigate: (page: string, data?: Record<string, string>) => void
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError("Please fill in all fields"); return }
    setError("")
    setLoading(true)
    try {
      const result = await login(form.email, form.password)
      if (result.success) {
        onNavigate("dashboard")
      } else {
        setError(result.message)
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 size-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 size-72 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in-up">
        <div className="text-center mb-8">
          <button onClick={() => onNavigate("landing")} className="inline-flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </div>
            <span className="font-bold text-lg text-gold-gradient">LEARN GERMAN WITH FUN</span>
          </button>
        </div>

        <Card className="glass-card border-border">
          <CardHeader className="space-y-2 pb-4">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground text-sm">Sign in to continue your German journey</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="h-11"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="h-11 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 btn-gold-shimmer font-bold text-base"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="size-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                New to Learn German with Fun?{" "}
                <button
                  type="button"
                  onClick={() => onNavigate("register")}
                  className="text-primary hover:underline font-medium"
                >
                  Create free account
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
