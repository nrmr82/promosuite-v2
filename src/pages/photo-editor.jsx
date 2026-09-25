import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PortraitStudio from '@/components/PortraitStudio/PortraitStudio';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import './photo-editor.css';

export default function PhotoEditorPage() {
  const navigate = useNavigate();
  return (
    <div className="photo-editor-page flex h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon" asChild aria-label="Back to dashboard">
          <Link to="/app"><ArrowLeft /></Link>
        </Button>
        <span className="text-sm font-medium">Photo editor</span>
        <span className="text-xs text-muted-foreground">Upload a listing photo to crop, rotate and adjust it, then export.</span>
        <div className="ml-auto"><ThemeToggle /></div>
      </header>
      <div className="min-h-0 flex-1">
        <PortraitStudio onClose={() => navigate('/app')} />
      </div>
    </div>
  );
}
