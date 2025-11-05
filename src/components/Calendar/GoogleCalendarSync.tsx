import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { formatDate } from '@/utils/dateUtils';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

const GoogleCalendarSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { addTimeBlock } = useTimeBlocks();

  const handleGoogleAuth = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Google Calendar non configurato. Contatta l\'amministratore.');
      return;
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', window.location.origin + '/calendar');
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('scope', GOOGLE_SCOPES);

    window.location.href = authUrl.toString();
  };

  const handleSync = async (accessToken: string) => {
    setIsLoading(true);
    try {
      const today = formatDate(new Date());
      
      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        body: { accessToken, date: today },
      });

      if (error) throw error;

      // Add synced events as time blocks
      if (data.timeBlocks && data.timeBlocks.length > 0) {
        data.timeBlocks.forEach((block: any) => {
          addTimeBlock(block);
        });
        toast.success(`${data.timeBlocks.length} eventi sincronizzati da Google Calendar`);
      } else {
        toast.info('Nessun evento trovato per oggi');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Errore durante la sincronizzazione');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Sincronizza Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Importa automaticamente gli eventi dal tuo Google Calendar come blocchi temporali non modificabili.
        </p>
        
        {!isConnected ? (
          <Button onClick={handleGoogleAuth} className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Connetti Google Calendar
          </Button>
        ) : (
          <Button 
            onClick={() => handleSync('stored-token')} 
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Sincronizzazione...' : 'Sincronizza Ora'}
          </Button>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Gli eventi importati appariranno in grigio</p>
          <p>• Non possono essere modificati o eliminati</p>
          <p>• La sincronizzazione è manuale</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarSync;
