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
    "Content-Type": "application/json"
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

  // Log all headers for debugging (safely)
  const headers = {};
  req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = key.toLowerCase() === "authorization" ? 
      (value ? `${value.substring(0, 10)}...` : "missing") : value;
  });
  console.log("Request headers:", headers);
  
  // Log ADMIN_SECRET presence (safely)
  console.log("ADMIN_SECRET env var exists:", !!ADMIN_SECRET);
  console.log("ADMIN_SECRET length:", ADMIN_SECRET ? ADMIN_SECRET.length : 0);

  // Extract auth header (case insensitive)
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  console.log("Auth header exists:", !!authHeader);
  
  // Simple admin secret check with improved error details
  if (!authHeader) {
    return new Response(JSON.stringify({ 
      error: "Unauthorized - Missing Authorization header"
    }), { status: 401, headers: corsHeaders() });
  }
  
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ 
      error: "Unauthorized - Authorization header must begin with 'Bearer '"
    }), { status: 401, headers: corsHeaders() });
  }
  
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  
  if (token !== ADMIN_SECRET) {
    return new Response(JSON.stringify({ 
      error: "Unauthorized - Invalid admin secret",
      tokenLength: token.length,
      secretLength: ADMIN_SECRET.length,
      match: token === ADMIN_SECRET
    }), { status: 401, headers: corsHeaders() });
  }

  let body;
  try {
    body = await req.json();
    console.log("Request body received:", Object.keys(body));
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders() });
  }

  const { email, password, name, role, ec_number, school_id, subject_id } = body;
  
  // Validate required fields
  const missingFields = [];
  if (!email) missingFields.push("email");
  if (!password) missingFields.push("password");
  if (!name) missingFields.push("name");
  if (!role) missingFields.push("role");
  if (!ec_number) missingFields.push("ec_number");
  
  if (missingFields.length > 0) {
    return new Response(JSON.stringify({ 
      error: "Missing required fields", 
      fields: missingFields 
    }), { status: 400, headers: corsHeaders() });
  }

  try {
    // 1. Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, ec_number, school_id, subject_id },
    });
    
    if (authError) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ 
        error: authError.message || "Failed to create user in Auth" 
      }), { status: 400, headers: corsHeaders() });
    }
    
    if (!authUser || !authUser.user) {
      return new Response(JSON.stringify({ 
        error: "No user data returned from auth" 
      }), { status: 400, headers: corsHeaders() });
    }

    // 2. Insert user profile into users table
    const { data, error } = await supabase.from("users").select("*").eq("id", authUser.user.id).single();
    
    if (error) {
      console.error("DB error:", error);
      return new Response(JSON.stringify({ error: error.message }), 
        { status: 400, headers: corsHeaders() });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user_id: authUser.user.id 
    }), { status: 200, headers: corsHeaders() });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "An unexpected error occurred" 
    }), { status: 500, headers: corsHeaders() });
  }
});