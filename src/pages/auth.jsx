import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, MailCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Separator } from '@/components/ui/misc';
import { LogoMark } from '@/components/brand';
import { useAuth } from '@/contexts/auth';
import {
  signInWithEmail, signUpWithEmail, signInWithGoogle, sendPasswordReset, updatePassword,
} from '@/lib/auth';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.5 10.5 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/60 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark className="mb-4 size-10" />
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">{children}</div>
        {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
      </div>
    </div>
  );
}

function FormError({ message }) {
  if (!message) return null;
  return <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>;
}

function GoogleButton({ onError }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await signInWithGoogle();
        } catch (e) {
          onError(e.message);
          setBusy(false);
        }
      }}
    >
      {busy ? <Loader2 className="animate-spin" /> : <GoogleIcon />} Continue with Google
    </Button>
  );
}

function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
      <Separator className="flex-1" /> or <Separator className="flex-1" />
    </div>
  );
}

function useRedirectIfSignedIn() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!loading && user) navigate(location.state?.from || '/app', { replace: true });
  }, [user, loading, navigate, location.state]);
}

export function LoginPage() {
  useRedirectIfSignedIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your PromoSuite account"
      footer={<>New to PromoSuite? <Link className="font-medium text-primary hover:underline" to="/signup">Create an account</Link></>}
    >
      <GoogleButton onError={setError} />
      <OrDivider />
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Sign in
        </Button>
      </form>
    </AuthCard>
  );
}

export function SignupPage() {
  useRedirectIfSignedIn();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      const { needsConfirmation } = await signUpWithEmail({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
      });
      if (needsConfirmation) setSentTo(form.email.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (sentTo) {
    return (
      <AuthCard title="Check your email" subtitle={`We sent a confirmation link to ${sentTo}.`}>
        <div className="flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
          <MailCheck className="size-10 text-primary" />
          <p>Click the link in the email to activate your account. It can take a minute to arrive; check your spam folder too.</p>
          <Button variant="outline" asChild className="mt-2"><Link to="/login">Back to sign in</Link></Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Free for individual agents. No credit card needed."
      footer={<>Already have an account? <Link className="font-medium text-primary hover:underline" to="/login">Sign in</Link></>}
    >
      <GoogleButton onError={setError} />
      <OrDivider />
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" required value={form.fullName} onChange={set('fullName')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={set('password')} />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Create account
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to the <a className="underline" href="/terms-of-service.html">Terms</a> and{' '}
          <a className="underline" href="/privacy-policy.html">Privacy Policy</a>.
        </p>
      </form>
    </AuthCard>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle={sent ? undefined : 'We’ll email you a link to choose a new password.'}
      footer={<Link className="font-medium text-primary hover:underline" to="/login">Back to sign in</Link>}
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
          <MailCheck className="size-10 text-primary" />
          <p>If an account exists for <strong className="text-foreground">{email}</strong>, a reset link is on its way.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <FormError message={error} />
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  const { user, loading, clearRecovery } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      clearRecovery();
      setDone(true);
      setTimeout(() => navigate('/app', { replace: true }), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <AuthCard title="Reset your password"><Loader2 className="mx-auto size-5 animate-spin" /></AuthCard>;

  if (!user) {
    return (
      <AuthCard title="This link has expired" subtitle="Password reset links work once and expire after a while.">
        <Button asChild className="w-full"><Link to="/forgot-password">Send a new link</Link></Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" subtitle={`For ${user.email}`}>
      {done ? (
        <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <CheckCircle2 className="size-10 text-success" /> Password updated. Taking you to your dashboard…
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <FormError message={error} />
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Update password
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

// Landing spot for OAuth and email-confirmation links; Supabase exchanges the code on load
export function AuthCallbackPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const urlError = params.get('error_description');
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 10000);
    return () => clearTimeout(t);
  }, []);

  if (urlError || (timedOut && !user && !loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">We couldn’t sign you in</h1>
          <p className="mt-2 text-sm text-muted-foreground">{urlError || 'The sign-in link may have expired. Please try again.'}</p>
          <Button asChild className="mt-6"><Link to="/login">Back to sign in</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> Signing you in…
    </div>
  );
}
