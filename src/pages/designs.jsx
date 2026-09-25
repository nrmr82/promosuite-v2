import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DesignGrid } from '@/components/designs/design-grid';
import { TemplateGallery } from '@/components/designs/template-gallery';

export default function Designs() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'templates' ? 'templates' : 'mine';
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Designs</h1>
      <p className="mt-1 text-muted-foreground">Your saved designs and ready-made templates.</p>
      <Tabs value={tab} onValueChange={(v) => setParams(v === 'templates' ? { tab: v } : {})} className="mt-6">
        <TabsList>
          <TabsTrigger value="mine">My designs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="mine" className="mt-6"><DesignGrid /></TabsContent>
        <TabsContent value="templates" className="mt-6"><TemplateGallery /></TabsContent>
      </Tabs>
    </div>
  );
}
