import { Link, useParams, Navigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UPCOMING } from '@/lib/roadmap';

export default function ComingSoon() {
  const { slug } = useParams();
  const feature = UPCOMING.find((f) => f.slug === slug);
  if (!feature) return <Navigate to="/app" replace />;
  const { icon: Icon, title, summary, points, phase } = feature;
  return (
    <div className="mx-auto max-w-2xl py-8 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
        <Icon className="size-7" />
      </div>
      <Badge variant="gold" className="mt-6">Coming soon · {phase}</Badge>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{summary}</p>
      <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
        {points.map((p) => (
          <li key={p} className="flex gap-3 rounded-lg border bg-card p-4 text-sm">
            <Check className="size-4 shrink-0 text-primary" /> {p}
          </li>
        ))}
      </ul>
      <Button variant="outline" className="mt-10" asChild>
        <Link to="/app"><ArrowLeft /> Back to dashboard</Link>
      </Button>
    </div>
  );
}
