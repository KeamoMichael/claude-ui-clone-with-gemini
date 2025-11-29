import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://msdlxcydmltiypuvbodm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZGx4Y3lkbWx0aXlwdXZib2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNjM1MjksImV4cCI6MjA3OTkzOTUyOX0._dOoatk4yITxcQjERVYLZDU3y8G6QjqQpGpBy8h3MnM";

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Authentication will not work.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
