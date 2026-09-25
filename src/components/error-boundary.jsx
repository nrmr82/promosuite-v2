import { Component } from 'react';
import { Button } from '@/components/ui/button';

// Last-resort crash screen so a bug shows a way out instead of a blank page
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          An unexpected error stopped this page. Reloading usually fixes it; your saved designs are safe.
        </p>
        <div className="mt-6 flex gap-2">
          <Button onClick={() => window.location.reload()}>Reload page</Button>
          <Button variant="outline" onClick={() => { window.location.href = '/app'; }}>Go to dashboard</Button>
        </div>
      </div>
    );
  }
}
