import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const { url, offset = 0 } = await req.json();
  const key = Deno.env.get('FIRECRAWL_API_KEY_1') || Deno.env.get('FIRECRAWL_API_KEY');

  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true, waitFor: 8000, timeout: 60000 }),
  });

  const data = await res.json();
  const md = data?.data?.markdown || '';

  return new Response(
    JSON.stringify({ status: res.status, length: md.length, preview: md.substring(offset, offset + 3000), error: data?.error }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
