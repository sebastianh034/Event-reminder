import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wexmomxwqeitiyxcpboc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleG1vbXh3cWVpdGl5eGNwYm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjU5MzgsImV4cCI6MjA3NDI0MTkzOH0.36MRvrAF_Uz_jK9nIbtALXskpKtzNHCldlOKGHV52FQ'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
