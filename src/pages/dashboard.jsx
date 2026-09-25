import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, ImageIcon, LayoutTemplate, PenTool, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { DesignGrid, useDesigns } from '@/components/designs/design-grid';
import { TemplateGallery } from '@/components/designs/template-gallery';

const QUICK_ACTIONS = [
  { to: '/app/editor?template=just-listed', icon: PenTool, title: 'Create a flyer', text: 'Start from a Just Listed design' },
  { to: '/app/photo-editor', icon: ImageIcon, title: 'Edit a photo', text: 'Crop and adjust listing photos' },
  { to: '/app/designs?tab=templates', icon: LayoutTemplate, title: 'Browse templates', text: 'Open house, just sold and more' },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function GettingStarted({ profile, designCount }) {
  const steps = [
    { done: Boolean(profile?.phone && profile?.brokerage_name), label: 'Add your contact and brokerage details', to: '/app/settings' },
    { done: designCount > 0, label: 'Save your first design', to: '/app/editor' },
    { done: false, label: 'Set up your brand kit', to: '/app/soon/brand-kit', soon: true },
  ];
  const completed = steps.filter((s) => s.done).length;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Get set up</CardTitle>
        <CardDescription>{completed} of {steps.length} done</CardDescription>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(completed / steps.length) * 100}%` }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {steps.map((s) => (
          <Link key={s.label} to={s.to} className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted">
            {s.done ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground" />}
            <span className={s.done ? 'text-muted-foreground line-through' : ''}>{s.label}</span>
            {s.soon && <Badge variant="outline" className="ml-auto text-[10px]">Soon</Badge>}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { displayName, profile } = useAuth();
  const { designs } = useDesigns(4);
  const firstName = displayName.split(' ')[0];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{greeting()}{firstName && `, ${firstName}`}</h1>
        <p className="mt-1 text-muted-foreground">What are you marketing today?</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_ACTIONS.map(({ to, icon: Icon, title, text }) => (
            <Link key={title} to={to} className="group rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                <Icon className="size-5" />
              </div>
              <p className="mt-4 font-medium">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </Link>
          ))}
        </div>
        <GettingStarted profile={profile} designCount={designs.length} />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent designs</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/designs">View all <ArrowRight /></Link>
          </Button>
        </div>
        <DesignGrid limit={4} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Start from a template</h2>
        <TemplateGallery />
      </section>

      <Link to="/app/soon/brand-kit" className="flex items-center gap-4 rounded-xl border border-dashed bg-gold-soft/50 p-5 hover:bg-gold-soft">
        <Palette className="size-6 shrink-0 text-gold" />
        <div className="flex-1">
          <p className="font-medium">Coming next: brand kit and listings</p>
          <p className="text-sm text-muted-foreground">Enter a property once and get a flyer, social posts and stories in your brand colors.</p>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
