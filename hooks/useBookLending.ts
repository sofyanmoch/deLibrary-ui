import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { web3Provider } from '../lib/web3/provider';

export interface Book {
  id: number;
  lender: string;
  title: string;
  author: string;
  isbn: string;
  condition: number;
  depositAmount: string;
  duration: number;
  pickupPoint: string;
  isAvailable: boolean;
  timesLent: number;
}

export interface Loan {
  id: number;
  bookId: number;
  borrower: string;
  depositPaid: string;
  startTime: number;
  deadline: number;
  status: number;
  returnedAt: number;
}

export function useBookLending() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listBook = useCallback(async (
    title: string,
    author: string,
    isbn: string,
    condition: number,
    depositAmount: string,
    duration: number,
    pickupPoint: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = web3Provider.getBookLendingContract();
      const depositInWei = ethers.parseEther(depositAmount);
      const durationInSeconds = duration * 24 * 60 * 60;

      const tx = await contract.listBook(
        title,
        author,
        isbn,
        condition,
        depositInWei,
        durationInSeconds,
        pickupPoint
      );

      const receipt = await tx.wait();
      
      // Get book ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          return contract.interface.parseLog(log)?.name === 'BookListed';
        } catch {
          return false;
        }
      });

      let bookId = 0;
      if (event) {
        const parsed = contract.interface.parseLog(event);
        bookId = Number(parsed?.args?.bookId || 0);
      }

      return { success: true, bookId, txHash: receipt.hash };
    } catch (err: any) {
      console.error('Error listing book:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const borrowBook = useCallback(async (bookId: number, depositAmount: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = web3Provider.getBookLendingContract();
      const depositInWei = ethers.parseEther(depositAmount);

      const tx = await contract.borrowBook(bookId, {
        value: depositInWei
      });

      const receipt = await tx.wait();

      return { success: true, txHash: receipt.hash };
    } catch (err: any) {
      console.error('Error borrowing book:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const returnBook = useCallback(async (loanId: number, conditionAfter: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = web3Provider.getBookLendingContract();

      const tx = await contract.returnBook(loanId, conditionAfter);
      const receipt = await tx.wait();

      return { success: true, txHash: receipt.hash };
    } catch (err: any) {
      console.error('Error returning book:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBook = useCallback(async (bookId: number): Promise<Book | null> => {
    try {
      const contract = web3Provider.getBookLendingContract();
      const book = await contract.getBook(bookId);

      return {
        id: Number(book.id),
        lender: book.lender,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        condition: Number(book.condition),
        depositAmount: ethers.formatEther(book.depositAmount),
        duration: Number(book.duration),
        pickupPoint: book.pickupPoint,
        isAvailable: book.isAvailable,
        timesLent: Number(book.timesLent)
      };
    } catch (err: any) {
      console.error('Error getting book:', err);
      return null;
    }
  }, []);

  const getAllBooks = useCallback(async (): Promise<Book[]> => {
    try {
      const contract = web3Provider.getBookLendingContract();
      const totalBooks = await contract.getTotalBooks();
      
      const books: Book[] = [];
      for (let i = 1; i <= Number(totalBooks); i++) {
        const book = await getBook(i);
        if (book) books.push(book);
      }

      return books;
    } catch (err: any) {
      console.error('Error getting all books:', err);
      return [];
    }
  }, [getBook]);

  const getUserBooks = useCallback(async (userAddress: string): Promise<Book[]> => {
    try {
      const contract = web3Provider.getBookLendingContract();
      const bookIds = await contract.getUserBooks(userAddress);
      
      const books: Book[] = [];
      for (const id of bookIds) {
        const book = await getBook(Number(id));
        if (book) books.push(book);
      }

      return books;
    } catch (err: any) {
      console.error('Error getting user books:', err);
      return [];
    }
  }, [getBook]);

  const getUserLoans = useCallback(async (userAddress: string) => {
    try {
      const contract = web3Provider.getBookLendingContract();
      const loanIds = await contract.getUserLoans(userAddress);
      
      const loans = [];
      for (const id of loanIds) {
        const loan = await contract.getLoan(Number(id));
        const book = await getBook(Number(loan.bookId));
        
        loans.push({
          id: Number(loan.id),
          bookId: Number(loan.bookId),
          bookTitle: book?.title || 'Unknown',
          borrower: loan.borrower,
          depositPaid: ethers.formatEther(loan.depositPaid),
          startTime: Number(loan.startTime),
          deadline: Number(loan.deadline),
          status: Number(loan.status),
          returnedAt: Number(loan.returnedAt)
        });
      }

      return loans;
    } catch (err: any) {
      console.error('Error getting user loans:', err);
      return [];
    }
  }, [getBook]);

  const setUsername = useCallback(async (username: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = web3Provider.getBookLendingContract();

      const tx = await contract.setUsername(username);
      const receipt = await tx.wait();

      return { success: true, txHash: receipt.hash };
    } catch (err: any) {
      console.error('Error setting username:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserProfile = useCallback(async (userAddress: string) => {
    try {
      const contract = web3Provider.getBookLendingContract();
      const profile = await contract.getUserProfile(userAddress);

      return {
        username: profile.username,
        booksLent: Number(profile.booksLent),
        booksBorrowed: Number(profile.booksBorrowed),
        totalEarnings: profile.totalEarnings.toString(),
        isRegistered: profile.isRegistered
      };
    } catch (err: any) {
      console.error('Error getting user profile:', err);
      return null;
    }
  }, []);

  return {
    isLoading,
    error,
    listBook,
    borrowBook,
    returnBook,
    getBook,
    getAllBooks,
    getUserBooks,
    getUserLoans,
    setUsername,
    getUserProfile
  };
}