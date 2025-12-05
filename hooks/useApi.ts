import { useState, useCallback } from 'react';
import {
  bookLendingApi,
  type LeaderboardEntry,
  type StatisticsResponse
} from '@/lib/api/bookLendingApi';

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get leaderboard data
   */
  const getLeaderboard = useCallback(async (limit: number = 10): Promise<LeaderboardEntry[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bookLendingApi.getLeaderboard(limit);

      if (!response.success) {
        throw new Error('Failed to fetch leaderboard');
      }

      return response.data;
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get top borrowers
   */
  const getTopBorrowers = useCallback(async (limit: number = 10): Promise<LeaderboardEntry[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bookLendingApi.getTopBorrowers(limit);

      if (!response.success) {
        throw new Error('Failed to fetch top borrowers');
      }

      return response.data;
    } catch (err: any) {
      console.error('Error fetching top borrowers:', err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get total books count
   */
  const getTotalBooks = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bookLendingApi.getTotalBooks();

      if (!response.success) {
        throw new Error('Failed to fetch total books');
      }

      return response.data.totalBooks;
    } catch (err: any) {
      console.error('Error fetching total books:', err);
      setError(err.message);
      return '0';
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get total loans count
   */
  const getTotalLoans = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bookLendingApi.getTotalLoans();

      if (!response.success) {
        throw new Error('Failed to fetch total loans');
      }

      return response.data.totalLoans;
    } catch (err: any) {
      console.error('Error fetching total loans:', err);
      setError(err.message);
      return '0';
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get statistics (total books and loans)
   */
  const getStatistics = useCallback(async (): Promise<{ totalBooks: string; totalLoans: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bookLendingApi.getStatistics();

      if (!response.success) {
        throw new Error('Failed to fetch statistics');
      }

      return response.data;
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      setError(err.message);
      return { totalBooks: '0', totalLoans: '0' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check API health
   */
  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await bookLendingApi.healthCheck();
      return response.status === 'ok';
    } catch (err) {
      console.error('Health check failed:', err);
      return false;
    }
  }, []);

  /**
   * Check API status
   */
  const checkStatus = useCallback(async () => {
    try {
      return await bookLendingApi.getStatus();
    } catch (err) {
      console.error('Status check failed:', err);
      return null;
    }
  }, []);

  return {
    isLoading,
    error,
    getLeaderboard,
    getTopBorrowers,
    getTotalBooks,
    getTotalLoans,
    getStatistics,
    checkHealth,
    checkStatus
  };
}
