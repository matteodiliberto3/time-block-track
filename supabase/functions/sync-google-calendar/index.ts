import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { accessToken, date } = await req.json();

    if (!accessToken || !date) {
      return new Response(
        JSON.stringify({ error: "Missing accessToken or date" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch events from Google Calendar for the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events?` +
      `timeMin=${startOfDay.toISOString()}&` +
      `timeMax=${endOfDay.toISOString()}&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    const events: CalendarEvent[] = data.items || [];

    // Transform Google Calendar events to ChronoFocus format
    const timeBlocks = events.map((event: CalendarEvent) => {
      const start = event.start.dateTime || event.start.date;
      const end = event.end.dateTime || event.end.date;
      
      if (!start || !end) return null;

      const startDate = new Date(start);
      const endDate = new Date(end);

      return {
        id: `google-${event.id}`,
        title: event.summary || "Evento senza titolo",
        startTime: startDate.toLocaleTimeString("it-IT", { 
          hour: "2-digit", 
          minute: "2-digit" 
        }),
        endTime: endDate.toLocaleTimeString("it-IT", { 
          hour: "2-digit", 
          minute: "2-digit" 
        }),
        category: "other" as const,
        subTasks: [],
        date: date,
        completed: false,
        status: "planned" as const,
        externalEvent: true,
      };
    }).filter(Boolean);

    return new Response(
      JSON.stringify({ timeBlocks }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error syncing calendar:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
