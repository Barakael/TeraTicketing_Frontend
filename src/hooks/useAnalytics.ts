import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { Analytics } from '../types';

interface AnalyticsFilters {
  department_id?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
}

const useAnalytics = (filters: AnalyticsFilters = {}) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });

        const response = await axios.get(`${API_BASE_URL}/api/analytics?${params.toString()}`);
        
        if (response.data && response.data.success) {
          setAnalytics(response.data.data);
        } else {
          setError(response.data?.message || 'Failed to fetch analytics');
        }
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [JSON.stringify(filters)]);

  return { analytics, loading, error };
};

export default useAnalytics;
