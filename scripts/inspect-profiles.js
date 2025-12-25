const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  envVars['NEXT_PUBLIC_SUPABASE_URL'],
  envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']
);

async function inspectProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Profiles table columns:', Object.keys(data[0]));
  } else {
    // If no data, we can't easily infer columns from select * with anon key usually,
    // but let's try to insert a dummy row to see errors if columns are missing?
    // Or better, let's just assume we need to add them if we are not sure.
    console.log('No profiles found. Cannot infer columns.');
  }
}

inspectProfiles();
