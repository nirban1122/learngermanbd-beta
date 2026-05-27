import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react"
import { apiService } from "@/services/api"

interface RegisterPageProps {
  onNavigate: (page: string, data?: Record<string, string>) => void
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState("")

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Name is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) errs.email = "Valid email required"
    if (form.password.length < 8) errs.password = "Minimum 8 characters"
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    setApiError("")
    try {
      const response = await apiService.register(form.email, form.password, form.name)
      if (response.success) {
        onNavigate("verify", { email: form.email })
      } else {
        setApiError(response.message || "Registration failed")
      }
    } catch {
      setApiError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    if (form.password.length === 0) return null
    if (form.password.length < 6) return { label: "Weak", class: "bg-destructive", width: "w-1/4" }
    if (form.password.length < 8) return { label: "Fair", class: "bg-chart-5", width: "w-1/2" }
    if (form.password.length < 12) return { label: "Good", class: "bg-chart-2", width: "w-3/4" }
    return { label: "Strong", class: "bg-chart-3", width: "w-full" }
  }
  const strength = passwordStrength()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in-up">
        <div className="text-center mb-8">
          <button onClick={() => onNavigate("landing")} className="inline-flex items-center gap-2 group">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </div>
            <span className="font-bold text-lg text-gold-gradient">LEARN GERMAN WITH FUN</span>
          </button>
        </div>

        <Card className="glass-card border-border">
          <CardHeader className="space-y-2 pb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
              <Badge variant="outline" className="border-primary/30 text-primary text-xs">Free Forever</Badge>
            </div>
            <p className="text-muted-foreground text-sm">Start your German learning journey today</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {apiError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {apiError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Max Mustermann"
                  value={form.name}
                  onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }) }}
                  aria-invalid={!!errors.name}
                  className="h-11"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }) }}
                  aria-invalid={!!errors.email}
                  className="h-11"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }) }}
                    aria-invalid={!!errors.password}
                    className="h-11 pr-10"
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
                {strength && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strength.class} ${strength.width}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">{strength.label} password</p>
                  </div>
                )}
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2">
                {["Free access to A1 & A2 lessons", "AI-powered feedback", "Progress tracking & streaks"].map(b => (
                  <div key={b} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{b}</span>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full h-11 btn-gold-shimmer font-bold text-base"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <>
                    Create Free Account
                    <ArrowRight className="size-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => onNavigate("login")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>

              <p className="text-center text-xs text-muted-foreground">
                By registering, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
