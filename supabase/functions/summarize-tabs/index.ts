
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tabs } = await req.json();
    
    // Format tabs into a clean text format for summarization
    const tabsText = tabs.map((tab: { title: string, url: string }) => 
      `Title: ${tab.title}\nURL: ${tab.url}`
    ).join('\n\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that analyzes open browser tabs to help users understand and organize their browsing context.
            Analyze the provided tabs and create a concise summary that:
            1. Groups related tabs by topic or purpose
            2. Identifies potential workflows or tasks the user might be working on
            3. Suggests ways to organize these tabs (e.g., "These 3 JavaScript docs could be grouped into a 'JS Learning' category")
            4. Points out any duplicate or similar content
            5. Highlights key topics that emerge from the collection of tabs
            
            Keep the summary focused on helping users understand their current browsing context and suggesting organization strategies.`
          },
          {
            role: 'user',
            content: `Please analyze these open tabs:\n\n${tabsText}`
          }
        ],
      }),
    });

    const data = await response.json();
    const summary = data.choices[0].message.content;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in summarize-tabs function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

