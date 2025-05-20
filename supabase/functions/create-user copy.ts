import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET")!; // Set this in your Edge Function env

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // For production, specify your frontend URL
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders() });
  }

  // Simple admin secret check
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    console.log("Auth header received:", authHeader);
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders() });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders() });
  }

  const { email, password, name, role, ec_number, school_id, subject_id } = body;
  if (!email || !password || !name || !role || !ec_number) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders() });
  }

  // 1. Create user in Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role, ec_number, school_id, subject_id },
  });
  if (authError || !authUser || !authUser.user) {
    return new Response(JSON.stringify({ error: authError?.message || "Failed to create user in Auth" }), { status: 400, headers: corsHeaders() });
  }

  // 2. Insert user profile into users table
  const { error: dbError } = await supabase.from("users").insert({
    id: authUser.user.id,
    name,
    email,
    role,
    school_id: school_id || null,
    subject_id: subject_id || null,
    ec_number,
    is_active: true,
    setup_complete: false,
    token_identifier: email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (dbError) {
    return new Response(JSON.stringify({ error: dbError.message }), { status: 400, headers: corsHeaders() });
  }

  return new Response(JSON.stringify({ success: true, user_id: authUser.user.id }), { status: 200, headers: corsHeaders() });
}); 