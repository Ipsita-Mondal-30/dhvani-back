export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hwedozsnqfayouumvvyq.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZWRvenNucWZheW91dW12dnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDIzNDUsImV4cCI6MjA2NzExODM0NX0.9kgoZ0kW2ffh-07XApFsRhHzx6x0YURieCfV9BBbpAw',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZWRvenNucWZheW91dW12dnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU0MjM0NSwiZXhwIjoyMDY3MTE4MzQ1fQ.FDjF4llQwqoiwA8SLABQI3ljG0tiJO-tfdnNEYdxjB8'
  }
}; 