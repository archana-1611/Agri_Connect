import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ResourceContext = createContext();

export const ResourceProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setResources(data || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const addResource = async (resourceData) => {
    if (!user) throw new Error('You must be logged in to add a resource');
    
    try {
      const { data, error: insertError } = await supabase
        .from('resources')
        .insert([{ ...resourceData, user_id: user.id }])
        .select();

      if (insertError) throw insertError;
      
      // Update local state
      setResources(prev => [data[0], ...prev]);
      return data[0];
    } catch (err) {
      console.error('Error adding resource:', err);
      throw err;
    }
  };

  const deleteResource = async (id) => {
    if (!user) throw new Error('You must be logged in to delete a resource');

    try {
      const { error: deleteError } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Security: ensure user owns the resource

      if (deleteError) throw deleteError;

      // Update local state
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting resource:', err);
      throw err;
    }
  };

  return (
    <ResourceContext.Provider value={{ 
      resources, 
      loading, 
      error, 
      addResource, 
      deleteResource,
      refreshResources: fetchResources 
    }}>
      {children}
    </ResourceContext.Provider>
  );
};

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};
