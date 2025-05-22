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

  // Extract auth header (case insensitive)
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  
  // Check authentication
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
      error: "Unauthorized - Invalid admin secret"
    }), { status: 401, headers: corsHeaders() });
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders() });
  }

  const { email, password, name, role, ec_number, phone, school_id, subject_id } = body;
  
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
    const { error: dbError } = await supabase.from("users").insert({
      id: authUser.user.id,
      name,
      email,
      role,
      school_id: school_id || null,
      subject_id: subject_id || null,
      ec_number,
      phone: phone || null,
      is_active: true,
      setup_complete: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (dbError) {
      // If user creation in the database fails, we should try to clean up the auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      
      return new Response(JSON.stringify({ 
        error: dbError.message || "Failed to create user record" 
      }), { status: 400, headers: corsHeaders() });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user_id: authUser.user.id 
    }), { status: 200, headers: corsHeaders() });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || "An unexpected error occurred" 
    }), { status: 500, headers: corsHeaders() });
  }
});