// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pbujhnbcrkqslblrigxe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBidWpobmJjcmtxc2xibHJpZ3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NTYwMjMsImV4cCI6MjA2MjMzMjAyM30.7EZDRwbeYlw_xO8hp88eMpTsOPcRIQUYuNrn1tUNZA8";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBidWpobmJjcmtxc2xibHJpZ3hlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njc1NjAyMywiZXhwIjoyMDYyMzMyMDIzfQ.7EZDRwbeYlw_xO8hp88eMpTsOPcRIQUYuNrn1tUNZA8";
const ADMIN_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBidWpobmJjcmtxc2xibHJpZ3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NTYwMjMsImV4cCI6MjA2MjMzMjAyM30.7EZDRwbeYlw_xO8hp88eMpTsOPcRIQUYuNrn1tUNZA8";


// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, );