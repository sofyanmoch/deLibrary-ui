// API service for BookLending backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface LeaderboardEntry {
  rank: number;
  address: string;
  username: string;
  booksLent?: string;
  booksBorrowed?: string;
}

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
  total: number;
}

export interface TotalBooksResponse {
  success: boolean;
  data: {
    totalBooks: string;
  };
}

export interface TotalLoansResponse {
  success: boolean;
  data: {
    totalLoans: string;
  };
}

export interface StatisticsResponse {
  success: boolean;
  data: {
    totalBooks: string;
    totalLoans: string;
  };
}

export interface ApiStatusResponse {
  success: boolean;
  status: string;
  contractInitialized: boolean;
  contractAddress: string;
}

export class BookLendingApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get top lenders leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<LeaderboardResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/booklending/leaderboard?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get top borrowers leaderboard
   */
  async getTopBorrowers(limit: number = 10): Promise<LeaderboardResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/booklending/leaderboard/borrowers?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching top borrowers:', error);
      throw error;
    }
  }

  /**
   * Get total number of books
   */
  async getTotalBooks(): Promise<TotalBooksResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/booklending/total-books`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching total books:', error);
      throw error;
    }
  }

  /**
   * Get total number of loans
   */
  async getTotalLoans(): Promise<TotalLoansResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/booklending/total-loans`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching total loans:', error);
      throw error;
    }
  }

  /**
   * Get statistics (total books and loans)
   */
  async getStatistics(): Promise<StatisticsResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/booklending/statistics`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  /**
   * Check API service status
   */
  async getStatus(): Promise<ApiStatusResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/booklending/status`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching API status:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
}

// Singleton instance
export const bookLendingApi = new BookLendingApi();
