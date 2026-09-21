import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const cronSecret = process.env.CRON_SECRET_KEY;

  if (!cronSecret || key !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Supabase credentials not configured in environment variables. Please set SUPABASE_URL and SUPABASE_KEY (or SUPABASE_ANON_KEY).' },
      { status: 500 }
    );
  }

  try {
    // Query Supabase REST API to check if there is at least one active job
    const response = await fetch(`${supabaseUrl}/rest/v1/reports_job?is_active=eq.true&select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      // Prevent Vercel from caching this API call
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      // No active jobs, DO NOT PING RENDER!
      return NextResponse.json({
        status: "skipped",
        message: "No active jobs found. Render server kept asleep."
      });
    }

    // At least one active job exists, ping Render!
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://automated-email-reporter-api.onrender.com/api';
    
    // Support GET and POST from trigger-due
    const renderResponse = await fetch(`${backendUrl}/reports/trigger-due/?key=${key}`, {
      method: 'POST',
      headers: {
        'X-CRON-KEY': key
      }
    });

    if (!renderResponse.ok) {
        // Fallback to GET just in case POST is blocked by CORS/CSRF middleware incorrectly (though we disabled auth)
        const getFallback = await fetch(`${backendUrl}/reports/trigger-due/?key=${key}`);
        if (!getFallback.ok) {
            throw new Error(`Render API error: ${getFallback.statusText}`);
        }
        const renderData = await getFallback.json();
        return NextResponse.json({
            status: "success",
            message: "Active jobs found. Render pinged successfully (fallback GET).",
            render_response: renderData
        });
    }

    const renderData = await renderResponse.json();

    return NextResponse.json({
      status: "success",
      message: "Active jobs found. Render pinged successfully.",
      render_response: renderData
    });

  } catch (error: any) {
    console.error("Cron dispatcher error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
