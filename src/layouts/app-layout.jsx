import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PenTool, ImageIcon, Settings, CreditCard, LogOut, Plus, ChevronsUpDown } from 'lucide-react';
import { Logo } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/misc';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth';
import { signOut } from '@/lib/auth';
import { UPCOMING } from '@/lib/roadmap';
import { cn } from '@/lib/utils';

const MAIN_NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/designs', label: 'Designs', icon: PenTool },
  { to: '/app/photo-editor', label: 'Photo editor', icon: ImageIcon },
];

const itemClass = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors [&_svg]:size-4',
    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  );

export function AppLayout() {
  const { user, displayName, avatarUrl } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r bg-sidebar">
        <div className="flex h-16 items-center px-5">
          <Link to="/app" aria-label="Dashboard">
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
          <div className="space-y-1">
            {MAIN_NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={itemClass}>
                <Icon /> {label}
              </NavLink>
            ))}
          </div>
          <div className="space-y-1">
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Coming soon</p>
            {UPCOMING.map(({ slug, title, icon: Icon }) => (
              <NavLink key={slug} to={`/app/soon/${slug}`} className={itemClass}>
                <Icon /> <span className="flex-1">{title}</span>
                <Badge variant="outline" className="px-1.5 text-[10px]">Soon</Badge>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t p-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar src={avatarUrl} name={displayName || user?.email} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronsUpDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Signed in as {user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate('/app/settings')}><Settings /> Settings</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/app/plans')}><CreditCard /> Plans & billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut}><LogOut /> Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-2 border-b bg-background/85 px-8 backdrop-blur">
          <ThemeToggle />
          <Button onClick={() => navigate('/app/editor')}>
            <Plus /> New design
          </Button>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
