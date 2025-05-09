
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDatabase() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        // Perform a simple query to check if the database is connected
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('Database connection error:', error);
          setError(error.message);
          setIsConnected(false);
        } else {
          console.log('Database connected successfully');
          setIsConnected(true);
        }
      } catch (err) {
        console.error('Failed to check database connection:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkConnection();
  }, []);

  return { isConnected, isLoading, error };
}
