import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Save } from 'lucide-react';
import FlyerStudio from '@/components/FlyerStudio/FlyerStudio';
import { FLYER_TEMPLATES } from '@/components/FlyerStudio/flyerTemplates';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { toast } from '@/components/ui/sonner';
import { PageSpinner } from '@/components/page-spinner';
import { useAuth } from '@/contexts/auth';
import { getDesign, saveDesign } from '@/lib/designs';

export default function FlyerEditorPage() {
  const { designId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const studioRef = useRef(null);

  const template = FLYER_TEMPLATES.find((t) => t.id === params.get('template'));
  const [initial, setInitial] = useState(designId ? null : template || FLYER_TEMPLATES.find((t) => t.id === 'just-listed'));
  const [name, setName] = useState(template && template.id !== 'blank' ? `${template.name} flyer` : 'Untitled design');
  const [status, setStatus] = useState(designId ? 'saved' : 'new'); // new | dirty | saving | saved
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!designId) return;
    getDesign(designId)
      .then((d) => {
        setInitial(d.data);
        setName(d.name);
        setStatus('saved');
      })
      .catch((e) => setLoadError(e.message));
  }, [designId]);

  const persist = useCallback(
    async ({ thumbnail, data, width, height }) => {
      setStatus('saving');
      try {
        const saved = await saveDesign({ id: designId, userId: user.id, name: name.trim() || 'Untitled design', data, thumbnail, width, height });
        setStatus('saved');
        if (!designId) navigate(`/app/editor/${saved.id}`, { replace: true });
      } catch (e) {
        setStatus('dirty');
        toast.error('Couldn’t save this design', {
          description: /designs/.test(e.message) ? 'Saving needs the latest database update. You can still export a PNG.' : e.message,
        });
      }
    },
    [designId, user, name, navigate]
  );

  const save = () => studioRef.current?.handleSave();

  // Ctrl/Cmd+S saves; warn before leaving with unsaved changes
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        studioRef.current?.handleSave();
      }
    };
    const onBeforeUnload = (e) => {
      if (status === 'dirty') e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [status]);

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="font-medium">We couldn’t open this design.</p>
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <Button asChild><Link to="/app/designs">Back to designs</Link></Button>
      </div>
    );
  }
  if (!initial) return <PageSpinner label="Opening design…" />;

  const statusLabel = { new: 'Not saved yet', dirty: 'Unsaved changes', saving: 'Saving…', saved: 'All changes saved' }[status];

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon" asChild aria-label="Back to designs">
          <Link to="/app/designs"><ArrowLeft /></Link>
        </Button>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); if (status === 'saved') setStatus('dirty'); }}
          aria-label="Design name"
          className="min-w-0 max-w-xs rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-medium hover:border-input focus:border-ring focus:outline-none"
        />
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {status === 'saving' ? <Loader2 className="size-3 animate-spin" /> : status === 'saved' && <Check className="size-3 text-success" />}
          {statusLabel}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={save} disabled={status === 'saving'}>
            <Save /> Save
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <FlyerStudio
          key={designId || 'new'}
          ref={studioRef}
          initialTemplate={initial}
          showHeaderActions={false}
          onSave={persist}
          onChange={() => setStatus((s) => (s === 'saving' ? s : 'dirty'))}
        />
      </div>
    </div>
  );
}
