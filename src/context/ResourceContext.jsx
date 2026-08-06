import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
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
      const data = await api.get('/resources');
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
      const data = await api.post('/resources', resourceData);
      
      // Update local state
      setResources(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding resource:', err);
      throw err;
    }
  };

  const updateResource = async (id, resourceData) => {
    if (!user) throw new Error('You must be logged in to update a resource');

    try {
      const data = await api.put(`/resources/${id}`, resourceData);

      // Update local state
      setResources(prev => prev.map(r => String(r.id) === String(id) ? { ...r, ...resourceData, ...(data || {}) } : r));
      return data;
    } catch (err) {
      console.error('Error updating resource:', err);
      throw err;
    }
  };

  const deleteResource = async (id) => {
    if (!user) throw new Error('You must be logged in to delete a resource');

    try {
      await api.delete(`/resources/${id}`);

      // Update local state
      setResources(prev => prev.filter(r => String(r.id) !== String(id)));
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
      updateResource,
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
