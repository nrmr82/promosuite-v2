import { Link, NavLink, Outlet } from 'react-router-dom';
import { Logo } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { cn } from '@/lib/utils';

const navClass = ({ isActive }) =>
  cn('text-sm font-medium transition-colors hover:text-foreground', isActive ? 'text-foreground' : 'text-muted-foreground');

export function PublicLayout() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Link to="/" aria-label="PromoSuite home">
              <Logo />
            </Link>
            <nav className="flex items-center gap-6">
              <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Features
              </a>
              <NavLink to="/pricing" className={navClass}>
                Pricing
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild>
                <Link to="/app">Open PromoSuite</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Get started free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Logo className="[&_svg]:size-6 [&_span]:text-base" />
            <span>© {new Date().getFullYear()} PromoSuite</span>
          </div>
          <nav className="flex gap-6">
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
            <a href="/privacy-policy.html" className="hover:text-foreground">Privacy</a>
            <a href="/terms-of-service.html" className="hover:text-foreground">Terms</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
