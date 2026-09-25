import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/auth';
import { handleSubscription } from '@/lib/stripe';
import { cn } from '@/lib/utils';

// Prices are placeholders until Stripe products are created (see CLOUDFLARE_SETUP.md)
const PRO_PRICE = { monthly: 12.99, annually: 129 };
const PRICE_IDS = {
  monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID,
  annually: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID,
};

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Everything you need to start marketing your listings.',
    features: [
      { label: 'Design Studio with real estate templates' },
      { label: 'Unlimited PNG downloads' },
      { label: 'Photo editor: crop, adjust and filters' },
      { label: 'Save and reopen your designs' },
      { label: 'AI writer: 10 generations a month', soon: true },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For active agents marketing listings every week.',
    highlight: true,
    features: [
      { label: 'Everything in Free' },
      { label: 'Brand kit applied to every design', soon: true },
      { label: 'Listings with one-click campaign packs', soon: true },
      { label: 'AI writer and AI images', soon: true },
      { label: 'Listing web pages with QR codes and lead capture', soon: true },
      { label: 'Social planner and video reels', soon: true },
      { label: 'Priority email support' },
    ],
  },
];

const FAQ = [
  ['Is PromoSuite really free to start?', 'Yes. The Free plan has no time limit and doesn’t need a credit card.'],
  ['What does “Soon” mean?', 'Those features are on our published roadmap and being built now. Pro subscribers get them as they launch at no extra cost.'],
  ['Can I cancel anytime?', 'Yes. Plans are month to month (or yearly), and you keep access until the end of the period you paid for.'],
  ['Do you offer plans for teams or brokerages?', 'Not yet. Shared brand kits, team seats and brokerage-wide templates are coming soon.'],
];

export default function PricingPage({ inApp = false }) {
  const [cycle, setCycle] = useState('monthly');
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const upgrade = async () => {
    if (!user) {
      navigate('/signup');
      return;
    }
    const priceId = PRICE_IDS[cycle];
    if (!priceId) {
      toast.info('Pro launches soon. Everything available today is free in the meantime.');
      return;
    }
    setBusy(true);
    try {
      await handleSubscription(priceId);
    } catch (error) {
      toast.error(error.message);
      setBusy(false);
    }
  };

  return (
    <div className={cn(!inApp && 'mx-auto max-w-6xl px-6 py-16')}>
      <div className={cn('mx-auto max-w-2xl text-center', inApp ? 'mb-8' : 'mb-12')}>
        {!inApp && <Badge variant="gold" className="mb-4">Built for individual agents</Badge>}
        <h1 className={cn('font-semibold tracking-tight', inApp ? 'text-2xl' : 'text-4xl')}>
          {inApp ? 'Plans & billing' : 'Simple pricing for busy agents'}
        </h1>
        <p className="mt-3 text-muted-foreground">Start free. Upgrade when PromoSuite is saving you hours every week.</p>
        <div className="mt-6 inline-flex rounded-lg bg-muted p-1 text-sm">
          {['monthly', 'annually'].map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={cn(
                'rounded-md px-4 py-1.5 font-medium capitalize transition-colors',
                cycle === c ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {c}
              {c === 'annually' && <span className="ml-1.5 text-xs text-success">Save 17%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const price = plan.id === 'free' ? 0 : PRO_PRICE[cycle];
          return (
            <Card key={plan.id} className={cn('flex flex-col', plan.highlight && 'border-primary shadow-md ring-1 ring-primary')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {plan.highlight && <Badge>Most popular</Badge>}
                </div>
                <CardDescription>{plan.tagline}</CardDescription>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">${price}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.id === 'free' ? 'forever' : cycle === 'monthly' ? '/ month' : '/ year'}
                  </span>
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="flex-1">{f.label}</span>
                      {f.soon && <Badge variant="outline" className="h-5 shrink-0 self-start text-[10px]">Soon</Badge>}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.id === 'free' ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={user ? '/app' : '/signup'}>{user ? 'Your current plan' : 'Get started free'}</Link>
                  </Button>
                ) : (
                  <Button className="w-full" onClick={upgrade} disabled={busy}>
                    Upgrade to Pro
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}

        <Card className="flex flex-col border-dashed bg-muted/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Teams & brokerages</CardTitle>
              <Badge variant="gold">Coming soon</Badge>
            </div>
            <CardDescription>For teams and brokerages that want every agent on brand.</CardDescription>
            <div className="mt-4 flex size-12 items-center justify-center rounded-full bg-gold-soft">
              <Users className="size-6 text-gold" />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm text-muted-foreground">
              {['Shared brand kits and templates', 'Team seats and roles', 'Brokerage compliance details on every design', 'Central billing'].map((f) => (
                <li key={f} className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0" /> {f}</li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full" disabled>Coming soon</Button>
          </CardFooter>
        </Card>
      </div>

      {!inApp && (
        <div className="mx-auto mt-20 max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight">Questions</h2>
          <div className="divide-y rounded-xl border">
            {FAQ.map(([q, a]) => (
              <div key={q} className="p-5">
                <h3 className="font-medium">{q}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
