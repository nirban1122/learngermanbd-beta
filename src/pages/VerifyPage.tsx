import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { GraduationCap, Mail, CheckCircle2, RefreshCw } from "lucide-react"
import { apiService } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

interface VerifyPageProps {
  email?: string
  onNavigate: (page: string) => void
}

export function VerifyPage({ email = "user@example.com", onNavigate }: VerifyPageProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(600)
  const [resendLoading, setResendLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { refreshUser } = useAuth()

  useEffect(() => {
    if (resendCountdown > 0) {
      const t = setTimeout(() => setResendCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendCountdown])

  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1)
    if (!/^\d*$/.test(char)) return
    const newOtp = [...otp]
    newOtp[index] = char
    setOtp(newOtp)
    setError("")
    if (char && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(""))
      inputRefs.current[5]?.focus()
    }
    e.preventDefault()
  }

  const handleVerify = async () => {
    const code = otp.join("")
    if (code.length < 6) { setError("Please enter the complete 6-digit code"); return }
    setLoading(true)
    setError("")
    try {
      const response = await apiService.verifyOtp(email, code)
      if (response.success) {
        setSuccess(true)
        await refreshUser()
        setTimeout(() => onNavigate("dashboard"), 2000)
      } else {
        setError(response.message || "Incorrect code")
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      }
    } catch {
      setError("Network error. Please try again.")
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCountdown > 0) return
    setResendLoading(true)
    setError("")
    try {
      const response = await apiService.sendOtp(email)
      if (response.success) {
        setResendCountdown(600)
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      } else {
        setError(response.message || "Failed to resend code")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-fade-in-up">
          <div className="size-24 rounded-full bg-chart-3/10 flex items-center justify-center mx-auto mb-6 animate-glow">
            <CheckCircle2 className="size-12 text-chart-3" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
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
          <CardHeader className="space-y-2 pb-4 text-center">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Mail className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Verify Your Email</h1>
            <p className="text-muted-foreground text-sm">
              We sent a 6-digit code to
              <span className="block font-medium text-foreground mt-1">{email}</span>
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  aria-label={`Digit ${i + 1} of 6`}
                  className={`size-12 text-center text-xl font-bold rounded-xl border-2 bg-accent/50 outline-none transition-all focus:border-primary focus:bg-accent ${
                    error ? "border-destructive" : digit ? "border-primary/50" : "border-border"
                  }`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && <p className="text-center text-sm text-destructive">{error}</p>}

            <div className="text-center text-sm text-muted-foreground">
              {resendCountdown > 0 ? (
                <span>Code expires in{" "}
                  <span className="font-mono font-semibold text-primary">
                    {String(Math.floor(resendCountdown / 60)).padStart(2, "0")}:{String(resendCountdown % 60).padStart(2, "0")}
                  </span>
                </span>
              ) : (
                <span>Code expired</span>
              )}
            </div>

            <Button
              className="w-full h-11 btn-gold-shimmer font-bold"
              onClick={handleVerify}
              disabled={loading || otp.join("").length < 6}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : "Verify Email"}
            </Button>

            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={resendCountdown > 0 || resendLoading}
                className={`inline-flex items-center gap-2 text-sm transition-colors ${
                  resendCountdown > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary hover:underline"
                }`}
              >
                <RefreshCw className={`size-3.5 ${resendLoading ? "animate-spin" : ""}`} />
                {resendCountdown > 0 ? `Resend in ${Math.ceil(resendCountdown / 60)}m` : "Resend code"}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Wrong email?{" "}
              <button onClick={() => onNavigate("register")} className="text-primary hover:underline">
                Go back
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
