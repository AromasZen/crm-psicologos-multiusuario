const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://nkkyyqqqusodhwqvprik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra3l5cXFxdXNvZGh3cXZwcmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjU1MDIsImV4cCI6MjA4ODYwMTUwMn0.Gs5bdRrv9HNViruVjr8mQl4Oh2Ei1Hyryr0vxpdPPhU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  console.log("Checking leads table...");
  const { data, error } = await supabase.from('leads').select('id').limit(1);
  if (error) {
    console.error("Error querying leads:", error.message || error);
  } else {
    console.log("Leads query successful, found data count:", data?.length);
  }

  console.log("Checking recursos table...");
  const { data: recData, error: recError } = await supabase.from('recursos').select('id').limit(1);
  if (recError) {
    console.error("Error querying recursos:", recError.message || recError);
  } else {
    console.log("Recursos query successful, found data count:", recData?.length);
  }
}

check();
