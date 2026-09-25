import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { FLYER_TEMPLATES } from '@/components/FlyerStudio/flyerTemplates';
import { cn } from '@/lib/utils';

export function TemplateGallery({ limit, className }) {
  const navigate = useNavigate();
  const templates = limit ? FLYER_TEMPLATES.slice(0, limit) : FLYER_TEMPLATES;
  return (
    <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => navigate(`/app/editor?template=${t.id}`)}
          className="group text-left focus-visible:outline-none"
        >
          <div className="aspect-[4/5] overflow-hidden rounded-lg border bg-muted shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
            {t.id === 'blank' ? (
              <div className="flex size-full flex-col items-center justify-center gap-2 bg-card text-muted-foreground">
                <Plus className="size-6" />
                <span className="text-sm">Blank page</span>
              </div>
            ) : (
              <img src={`/templates/${t.id}.png`} alt={`${t.name} template`} className="size-full object-cover" loading="lazy" />
            )}
          </div>
          <p className="mt-2 text-sm font-medium">{t.name}</p>
          <p className="text-xs text-muted-foreground">Flyer · 8×10</p>
        </button>
      ))}
    </div>
  );
}
