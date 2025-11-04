import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_CATEGORIES } from '@/types';
import { Palette, Info } from 'lucide-react';

const SettingsView = () => {
  return (
    <div className="p-4 pb-20 space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Impostazioni</h1>
        <p className="text-sm text-muted-foreground">Configura la tua app</p>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Categorie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEFAULT_CATEGORIES.map(cat => (
            <div 
              key={cat.id} 
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div 
                className="w-10 h-10 rounded-full flex-shrink-0" 
                style={{ backgroundColor: cat.color }}
              />
              <div className="flex-1">
                <h4 className="font-medium">{cat.name}</h4>
                <p className="text-xs text-muted-foreground capitalize">{cat.id}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versione</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">App</span>
            <span className="font-medium">ChronoFocus</span>
          </div>
          <p className="text-muted-foreground pt-4">
            ChronoFocus ti aiuta a pianificare la tua giornata ora per ora e 
            a visualizzare come utilizzi il tuo tempo attraverso grafici dettagliati.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;
