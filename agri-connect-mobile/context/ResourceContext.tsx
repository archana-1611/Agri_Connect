import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_RESOURCES } from '../constants/DemoData';

type Resource = any;

type ResourceContextType = {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  addResource: (resourceData: any) => Promise<Resource>;
  deleteResource: (id: string | number) => Promise<void>;
  refreshResources: () => Promise<void>;
};

const ResourceContext = createContext<ResourceContextType>({} as ResourceContextType);

export const ResourceProvider = ({ children }: { children: ReactNode }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, demoMode } = useAuth();

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      let dbResources: any[] = [];
      let fetchFailed = false;

      // Only attempt supabase fetch if not in demoMode and supabase is configured
      if (!demoMode && process.env.EXPO_PUBLIC_SUPABASE_URL) {
        try {
          const { data, error: fetchError } = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });

          if (fetchError) throw fetchError;
          dbResources = data || [];
        } catch (err) {
          console.warn('Supabase fetch failed, falling back to demo resources:', err);
          fetchFailed = true;
        }
      } else {
        fetchFailed = true;
      }

      // Load locally added items from AsyncStorage
      const stored = await AsyncStorage.getItem('local_resources');
      const localAdded = stored ? JSON.parse(stored) : [];

      // Load local deletions from AsyncStorage
      const deletedStored = await AsyncStorage.getItem('deleted_resource_ids');
      const deletedIds = deletedStored ? JSON.parse(deletedStored) : [];

      // Combine datasets: if demoMode or supabase failed/has no data, use the preloaded Tamil Nadu dataset
      const baseResources = (demoMode || fetchFailed || dbResources.length === 0) 
        ? DEMO_RESOURCES 
        : dbResources;

      const combined = [...localAdded, ...baseResources];

      // Filter out deleted items and ensure uniqueness
      const uniqueMap = new Map();
      combined.forEach(r => {
        if (!deletedIds.includes(r.id) && !deletedIds.includes(String(r.id))) {
          uniqueMap.set(String(r.id), r);
        }
      });

      const finalResources = Array.from(uniqueMap.values()).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setResources(finalResources);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [demoMode]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const addResource = async (resourceData: any) => {
    if (!user) throw new Error('You must be logged in to add a resource');

    const newResource = {
      ...resourceData,
      id: `local-res-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString()
    };

    // If standard mode, attempt Supabase insert first
    if (!demoMode && process.env.EXPO_PUBLIC_SUPABASE_URL) {
      try {
        const { data, error: insertError } = await supabase
          .from('resources')
          .insert([{ ...resourceData, user_id: user.id }])
          .select();

        if (insertError) throw insertError;
        
        const inserted = data[0];
        setResources(prev => [inserted, ...prev]);
        return inserted;
      } catch (err) {
        console.warn('Supabase add failed, inserting locally:', err);
      }
    }

    // Save to AsyncStorage local_resources
    try {
      const stored = await AsyncStorage.getItem('local_resources');
      const localList = stored ? JSON.parse(stored) : [];
      const updatedList = [newResource, ...localList];
      await AsyncStorage.setItem('local_resources', JSON.stringify(updatedList));

      // Append to state
      setResources(prev => [newResource, ...prev]);
      return newResource;
    } catch (err) {
      console.error('Failed to save resource locally:', err);
      throw err;
    }
  };

  const deleteResource = async (id: string | number) => {
    if (!user) throw new Error('You must be logged in to delete a resource');

    // If standard mode, attempt Supabase delete
    if (!demoMode && typeof id === 'number' && process.env.EXPO_PUBLIC_SUPABASE_URL) {
      try {
        const { error: deleteError } = await supabase
          .from('resources')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (!deleteError) {
          setResources(prev => prev.filter(r => r.id !== id));
          return;
        }
      } catch (err) {
        console.warn('Supabase delete failed, applying local deletion:', err);
      }
    }

    // Track local deletions via AsyncStorage
    try {
      const deletedStored = await AsyncStorage.getItem('deleted_resource_ids');
      const deletedList = deletedStored ? JSON.parse(deletedStored) : [];
      if (!deletedList.includes(String(id))) {
        deletedList.push(String(id));
        await AsyncStorage.setItem('deleted_resource_ids', JSON.stringify(deletedList));
      }

      // Remove from local_resources list in AsyncStorage as well
      const stored = await AsyncStorage.getItem('local_resources');
      if (stored) {
        const localList = JSON.parse(stored);
        const filteredList = localList.filter((r: any) => String(r.id) !== String(id));
        await AsyncStorage.setItem('local_resources', JSON.stringify(filteredList));
      }

      // Filter out from local state
      setResources(prev => prev.filter(r => String(r.id) !== String(id)));
    } catch (err) {
      console.error('Failed to record resource deletion locally:', err);
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
