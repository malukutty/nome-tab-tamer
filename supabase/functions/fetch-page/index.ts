
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Readability } from "https://esm.sh/@mozilla/readability@0.5.0"
import { DOMParser } from "https://esm.sh/linkedom@0.16.8"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    // Fetch the webpage content
    const response = await fetch(url)
    const html = await response.text()

    // Parse the HTML
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const reader = new Readability(doc)
    const article = reader.parse()

    if (!article) {
      throw new Error('Could not parse article content')
    }

    // Return both the readable content and original HTML
    return new Response(
      JSON.stringify({
        title: article.title,
        content: article.content,
        textContent: article.textContent,
        originalHtml: html,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error fetching page:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
