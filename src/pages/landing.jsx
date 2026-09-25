import { Link } from 'react-router-dom';
import { ArrowRight, Check, Download, ImageIcon, LayoutTemplate, PenTool, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UPCOMING } from '@/lib/roadmap';
import { useAuth } from '@/contexts/auth';

const AVAILABLE = [
  {
    icon: LayoutTemplate,
    title: 'Real estate templates',
    text: 'Just Listed, Open House and Just Sold designs made for agents, ready in seconds.',
  },
  {
    icon: PenTool,
    title: 'Design Studio',
    text: 'Edit text, colors, fonts and layout. Drop your listing photos into ready-made photo slots.',
  },
  {
    icon: ImageIcon,
    title: 'Photo editor',
    text: 'Crop, brighten and adjust listing photos before they go into your marketing.',
  },
  {
    icon: Download,
    title: 'Print-quality downloads',
    text: 'Export high-resolution images for print, email and social media. Save designs to reuse later.',
  },
];

const STEPS = [
  ['Pick a template', 'Start from a design built for the moment: new listing, open house or closing.'],
  ['Make it yours', 'Add the address, price and photos. Adjust colors and text to match your brand.'],
  ['Download and share', 'Print it, email it or post it. Your designs are saved for next time.'],
];

function HeroVisual() {
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-[520px]" aria-hidden="true">
      <div className="absolute inset-x-8 inset-y-10 rounded-[2rem] bg-gradient-to-br from-accent to-gold-soft blur-2xl" />
      <img
        src="/templates/open-house.png"
        alt=""
        className="absolute left-0 top-12 w-[46%] -rotate-6 rounded-lg border bg-white shadow-xl"
      />
      <img
        src="/templates/just-sold.png"
        alt=""
        className="absolute right-0 top-14 w-[46%] rotate-6 rounded-lg border shadow-xl"
      />
      <img
        src="/templates/just-listed.png"
        alt=""
        className="absolute left-1/2 top-0 w-[52%] -translate-x-1/2 rounded-lg border bg-white shadow-2xl"
      />
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const primaryCta = user ? { to: '/app', label: 'Open PromoSuite' } : { to: '/signup', label: 'Get started free' };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <Badge variant="gold" className="mb-5">
              <Sparkles /> Marketing studio for real estate agents
            </Badge>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-foreground">
              Market every listing <span className="text-primary">beautifully</span>, in minutes.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              PromoSuite gives agents professional flyers and listing graphics without hiring a designer.
              Pick a template, add your photos, and download a print-ready design.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link to={primaryCta.to}>
                  {primaryCta.label} <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {['Free for individual agents', 'No credit card', 'No design skills needed'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* Available now */}
      <section id="features" className="border-y bg-muted/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Available today</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Everything you need for listing marketing</h2>
            <p className="mt-3 text-muted-foreground">Designed around how agents actually work: fast, on brand, and ready to print or post.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AVAILABLE.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">From listing to flyer in three steps</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="text-center">
              <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Roadmap */}
      <section className="border-y bg-muted/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-gold">On the roadmap</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">What we’re building next</h2>
            <p className="mt-3 text-muted-foreground">
              Social media is agents’ top source of leads, so every new feature is built to get your listings in front of more buyers.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {UPCOMING.map(({ slug, icon: Icon, title, summary, phase }) => (
              <div key={slug} className="rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between">
                  <Icon className="size-5 text-primary" />
                  <Badge variant="outline">{phase}</Badge>
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{summary}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-dashed bg-card p-5 text-sm">
            <Users className="size-5 shrink-0 text-gold" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Teams & brokerages:</span> shared brand kits, team seats and brokerage
              compliance are coming soon. PromoSuite is built for individual agents today.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl bg-primary px-8 py-14 text-center text-primary-foreground">
          <h2 className="text-3xl font-semibold tracking-tight">Your next listing deserves better marketing</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">Create your first flyer in a few minutes. It’s free.</p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link to={primaryCta.to}>
              {primaryCta.label} <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
