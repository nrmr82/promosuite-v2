import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Sun, Moon, Monitor, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/misc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/contexts/auth';
import { saveProfile, updatePassword, deleteAccount } from '@/lib/auth';
import { cn } from '@/lib/utils';

const PROFILE_INPUTS = [
  ['full_name', 'Full name', 'text', 'name'],
  ['phone', 'Phone', 'tel', 'tel'],
  ['brokerage_name', 'Brokerage', 'text', 'organization'],
  ['license_number', 'License number', 'text', 'off'],
  ['website', 'Website', 'url', 'url'],
];

function ProfileTab() {
  const { user, profile, setProfile, displayName, avatarUrl } = useAuth();
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(Object.fromEntries(PROFILE_INPUTS.map(([k]) => [k, profile?.[k] ?? (k === 'full_name' ? displayName : '')])));
  }, [profile, displayName]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v?.trim() || null]));
      setProfile(await saveProfile(user, trimmed));
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <form onSubmit={submit}>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>These details will appear on your designs once the brand kit launches.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar src={avatarUrl} name={displayName} className="size-14 text-base" />
            <div className="text-sm">
              <p className="font-medium">{displayName}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {PROFILE_INPUTS.map(([key, label, type, autoComplete]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input id={key} type={type} autoComplete={autoComplete} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t pt-6">
          <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Save changes</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const options = [
    ['light', 'Light', Sun, 'bg-white'],
    ['dark', 'Dark', Moon, 'bg-slate-900'],
    ['system', 'Match system', Monitor, 'bg-gradient-to-r from-white to-slate-900'],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose how PromoSuite looks on this device.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {options.map(([value, label, Icon, swatch]) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn('rounded-xl border-2 p-3 text-left transition-colors', theme === value ? 'border-primary' : 'border-border hover:border-muted-foreground/40')}
          >
            <div className={cn('h-20 rounded-md border', swatch)} />
            <p className="mt-3 flex items-center gap-2 text-sm font-medium"><Icon className="size-4" /> {label}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function PlanTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan</CardTitle>
        <CardDescription>You’re on the Free plan for individual agents.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between rounded-lg border bg-muted/40 p-4 mx-6 mb-6">
        <div>
          <p className="font-medium">Free <Badge variant="secondary" className="ml-2">Current</Badge></p>
          <p className="mt-1 text-sm text-muted-foreground">Templates, Design Studio, photo editor and downloads.</p>
        </div>
        <Button asChild><Link to="/app/plans">See plans</Link></Button>
      </CardContent>
    </Card>
  );
}

function AccountTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const isEmailUser = user?.app_metadata?.providers?.includes('email') ?? user?.app_metadata?.provider === 'email';

  const changePassword = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      setPassword('');
      toast.success('Password updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const removeAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success('Your account has been deleted');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={changePassword}>
          <CardHeader>
            <CardTitle>{isEmailUser ? 'Change password' : 'Set a password'}</CardTitle>
            <CardDescription>
              {isEmailUser ? 'Use at least 8 characters.' : 'You sign in with Google. Add a password to also sign in with your email.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-sm space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </CardContent>
          <CardFooter className="justify-end border-t pt-6">
            <Button type="submit" variant="outline" disabled={busy || !password}>{busy && <Loader2 className="animate-spin" />} Update password</Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Delete account</CardTitle>
          <CardDescription>Permanently delete your account, profile and saved designs. This can’t be undone.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-end">
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>Delete account</Button>
        </CardFooter>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={(o) => { setConfirmOpen(o); setConfirmText(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="size-5 text-destructive" /> Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently deletes {user?.email} and everything in it. Type <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={confirmText !== 'DELETE' || deleting} onClick={removeAccount}>
              {deleting && <Loader2 className="animate-spin" />} Delete forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-muted-foreground">Manage your profile, appearance and account.</p>
      <Tabs defaultValue="profile" className="mt-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="appearance"><AppearanceTab /></TabsContent>
        <TabsContent value="plan"><PlanTab /></TabsContent>
        <TabsContent value="account"><AccountTab /></TabsContent>
      </Tabs>
    </div>
  );
}
