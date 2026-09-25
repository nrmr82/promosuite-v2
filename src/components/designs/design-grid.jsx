import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Trash2, PenTool, FileImage, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/misc';
import { toast } from '@/components/ui/sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { listDesigns, deleteDesign } from '@/lib/designs';

const isMissingTable = (error) =>
  error?.code === '42P01' ||
  error?.code === 'PGRST205' ||
  (/designs/.test(error?.message || '') && /not find|does not exist/.test(error?.message || ''));

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function useDesigns(limit) {
  const [state, setState] = useState({ loading: true, designs: [], error: null });
  const load = useCallback(async () => {
    try {
      setState({ loading: false, designs: await listDesigns({ limit }), error: null });
    } catch (error) {
      setState({ loading: false, designs: [], error });
    }
  }, [limit]);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

export function DesignGrid({ limit, emptyAction = true }) {
  const { loading, designs, error, reload } = useDesigns(limit);
  const navigate = useNavigate();

  const remove = async (design) => {
    if (!window.confirm(`Delete “${design.name}”? This can’t be undone.`)) return;
    try {
      await deleteDesign(design.id);
      toast.success('Design deleted');
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="aspect-[4/5]" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dashed p-6 text-sm">
        <Database className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium">{isMissingTable(error) ? 'Saving designs needs a one-time database update' : 'Couldn’t load your designs'}</p>
          <p className="mt-1 text-muted-foreground">
            {isMissingTable(error)
              ? 'Run the latest migration in supabase/migrations to turn on saved designs. You can still create and download designs.'
              : error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!designs.length) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-12 text-center">
        <FileImage className="size-8 text-muted-foreground" />
        <p className="mt-3 font-medium">No saved designs yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Designs you save in the editor show up here.</p>
        {emptyAction && (
          <Button className="mt-5" asChild><Link to="/app/editor"><PenTool /> Create your first design</Link></Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {designs.map((d) => (
        <div key={d.id} className="group">
          <button
            onClick={() => navigate(`/app/editor/${d.id}`)}
            className="block aspect-[4/5] w-full overflow-hidden rounded-lg border bg-muted shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {d.thumbnail ? <img src={d.thumbnail} alt="" className="size-full object-cover" /> : <FileImage className="m-auto size-8 text-muted-foreground" />}
          </button>
          <div className="mt-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{d.name}</p>
              <p className="text-xs text-muted-foreground">Edited {timeAgo(d.updated_at)}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100" aria-label="Design options">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => navigate(`/app/editor/${d.id}`)}><PenTool /> Open</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => remove(d)} className="text-destructive [&_svg]:text-destructive"><Trash2 /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
