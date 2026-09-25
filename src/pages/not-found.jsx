import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogoMark } from '@/components/brand';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <LogoMark className="size-10" />
      <p className="mt-6 text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you’re looking for doesn’t exist or has moved.</p>
      <Button className="mt-8" asChild><Link to="/">Go home</Link></Button>
    </div>
  );
}
