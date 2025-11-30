'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BookOpen, PlusCircle, Wallet, TrendingUp, Clock, MapPin, CheckCircle, AlertTriangle, BookMarked, User, Coins, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useBookLending, type Book } from '@/hooks/useBookLending';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  message: string;
  type: NotificationType;
}

interface LoanWithDetails {
  id: number;
  bookId: number;
  bookTitle: string;
  borrower: string;
  depositPaid: string;
  startTime: number;
  deadline: number;
  status: number;
  returnedAt: number;
  daysLeft: number;
}

export default function DeLibrary() {
  const { isConnected, walletAddress, tokenBalance, connectWallet, disconnectWallet, refreshBalances } = useWeb3();
  const { 
    isLoading, 
    listBook, 
    borrowBook, 
    returnBook, 
    getAllBooks, 
    getUserBooks, 
    getUserLoans 
  } = useBookLending();

  const [books, setBooks] = useState<Book[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [myLoans, setMyLoans] = useState<LoanWithDetails[]>([]);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithDetails | null>(null);
  const [returnCondition, setReturnCondition] = useState('1');

  const [listBookForm, setListBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    condition: '1',
    depositAmount: '',
    duration: '14',
    pickupPoint: ''
  });

  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Load books when connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      loadAllData();
    }
  }, [isConnected, walletAddress]);

  const loadAllData = async () => {
    setLoadingBooks(true);
    try {
      // Load all books
      const allBooks = await getAllBooks();
      setBooks(allBooks);

      // Load user's books
      const userBooks = await getUserBooks(walletAddress);
      setMyBooks(userBooks);

      // Load user's loans
      const userLoans = await getUserLoans(walletAddress);
      const loansWithDays = userLoans.map((loan: any) => {
        const now = Math.floor(Date.now() / 1000);
        const daysLeft = Math.max(0, Math.ceil((loan.deadline - now) / 86400));
        return { ...loan, daysLeft };
      });
      setMyLoans(loansWithDays);

      // Refresh token balance
      await refreshBalances();
    } catch (err) {
      console.error('Error loading data:', err);
      showNotification('Error loading data from blockchain', 'error');
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      showNotification('Wallet connected successfully!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to connect wallet', 'error');
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setBooks([]);
    setMyBooks([]);
    setMyLoans([]);
    showNotification('Wallet disconnected', 'info');
  };

  const handleListBook = async () => {
    if (!listBookForm.title || !listBookForm.author || !listBookForm.depositAmount || !listBookForm.pickupPoint) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    try {
      const result = await listBook(
        listBookForm.title,
        listBookForm.author,
        listBookForm.isbn,
        parseInt(listBookForm.condition),
        listBookForm.depositAmount,
        parseInt(listBookForm.duration),
        listBookForm.pickupPoint
      );

      if (result.success) {
        showNotification('Book listed successfully! 🎉', 'success');
        setIsListDialogOpen(false);
        setListBookForm({
          title: '',
          author: '',
          isbn: '',
          condition: '1',
          depositAmount: '',
          duration: '14',
          pickupPoint: ''
        });
        
        // Reload data
        await loadAllData();
      } else {
        showNotification(result.error || 'Failed to list book', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error listing book', 'error');
    }
  };

  const handleBorrowBook = async (book: Book) => {
    try {
      const result = await borrowBook(book.id, book.depositAmount);

      if (result.success) {
        showNotification(`Successfully borrowed "${book.title}"! 📚`, 'success');
        await loadAllData();
      } else {
        showNotification(result.error || 'Failed to borrow book', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error borrowing book', 'error');
    }
  };

  const handleReturnBook = async (loan: LoanWithDetails) => {
    setSelectedLoan(loan);
  };

  const confirmReturnBook = async () => {
    if (!selectedLoan) return;

    try {
      const result = await returnBook(selectedLoan.id, parseInt(returnCondition));

      if (result.success) {
        showNotification('Book returned successfully! You earned BOOK tokens! 🎁', 'success');
        setSelectedLoan(null);
        await loadAllData();
      } else {
        showNotification(result.error || 'Failed to return book', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error returning book', 'error');
    }
  };

  const getConditionColor = (condition: number) => {
    const colors = ['bg-green-100 text-green-800', 'bg-blue-100 text-blue-800', 'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800'];
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  const getConditionText = (condition: number) => {
    const texts = ['Mint', 'Good', 'Fair', 'Damaged'];
    return texts[condition] || 'Unknown';
  };

  const getStatusColor = (status: number) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-red-100 text-red-800', 'bg-orange-100 text-orange-800'];
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: number) => {
    const texts = ['Active', 'Returned', 'Late', 'Disputed'];
    return texts[status] || 'Unknown';
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    return `${days} days`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  deLibrary
                </h1>
                <p className="text-xs text-gray-500">Decentralized Book Lending</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isConnected && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-lg">
                  <Coins className="w-5 h-5 text-purple-600" />
                  <div className="text-sm">
                    <div className="font-bold text-purple-900">{parseFloat(tokenBalance).toFixed(2)} BOOK</div>
                    <div className="text-xs text-gray-600">Token Balance</div>
                  </div>
                </div>
              )}
              
              {!isConnected ? (
                <Button 
                  onClick={handleConnectWallet} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wallet className="w-4 h-4 mr-2" />
                  )}
                  Connect Wallet
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <p className="text-sm font-mono text-gray-700">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDisconnectWallet}>
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top">
          <Alert className={`${
            notification.type === 'success' ? 'border-green-500 bg-green-50' : 
            notification.type === 'error' ? 'border-red-500 bg-red-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            <AlertDescription className="font-medium">
              {notification.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4 max-w-md">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Welcome to deLibrary</h2>
              <p className="text-gray-600">
                Lend and borrow books on the blockchain. Earn BOOK tokens for every transaction!
              </p>
              <Button 
                onClick={handleConnectWallet} 
                size="lg" 
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-4"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Wallet className="w-5 h-5 mr-2" />
                )}
                Connect Your Wallet to Start
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="browse" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white">
                <TabsTrigger value="browse">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Books
                </TabsTrigger>
                <TabsTrigger value="mybooks">
                  <BookMarked className="w-4 h-4 mr-2" />
                  My Books
                </TabsTrigger>
                <TabsTrigger value="myloans">
                  <Clock className="w-4 h-4 mr-2" />
                  My Loans
                </TabsTrigger>
              </TabsList>

              <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    List New Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>List a New Book</DialogTitle>
                    <DialogDescription>
                      Fill in the details to list your book for lending
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Book Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Harry Potter"
                          value={listBookForm.title}
                          onChange={(e) => setListBookForm({...listBookForm, title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="author">Author *</Label>
                        <Input
                          id="author"
                          placeholder="e.g., J.K. Rowling"
                          value={listBookForm.author}
                          onChange={(e) => setListBookForm({...listBookForm, author: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        placeholder="e.g., 9780439708180"
                        value={listBookForm.isbn}
                        onChange={(e) => setListBookForm({...listBookForm, isbn: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="condition">Book Condition *</Label>
                        <Select value={listBookForm.condition} onValueChange={(value) => setListBookForm({...listBookForm, condition: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Mint (Like New)</SelectItem>
                            <SelectItem value="1">Good</SelectItem>
                            <SelectItem value="2">Fair</SelectItem>
                            <SelectItem value="3">Damaged</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="depositAmount">Deposit Amount (ETH) *</Label>
                        <Input
                          id="depositAmount"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 0.1"
                          value={listBookForm.depositAmount}
                          onChange={(e) => setListBookForm({...listBookForm, depositAmount: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Lending Duration (days) *</Label>
                        <Select value={listBookForm.duration} onValueChange={(value) => setListBookForm({...listBookForm, duration: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="14">14 days</SelectItem>
                            <SelectItem value="21">21 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickupPoint">Pickup Point *</Label>
                        <Input
                          id="pickupPoint"
                          placeholder="e.g., Cafe Kopi Bandung"
                          value={listBookForm.pickupPoint}
                          onChange={(e) => setListBookForm({...listBookForm, pickupPoint: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Rewards Info:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• You'll earn 10 BOOK tokens when book is returned</li>
                        <li>• Borrower earns 2 BOOK tokens for on-time return</li>
                        <li>• 5% late penalty per day after deadline</li>
                        <li>• 50% damage penalty if book is returned damaged</li>
                      </ul>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsListDialogOpen(false)} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={handleListBook} disabled={isLoading} className="bg-gradient-to-r from-purple-600 to-blue-600">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Listing...
                        </>
                      ) : (
                        'List Book'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <TabsContent value="browse" className="space-y-4">
              {loadingBooks ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : books.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Books Available</h3>
                    <p className="text-gray-500">Be the first to list a book!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <Card key={book.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{book.title}</CardTitle>
                            <CardDescription className="mt-1">by {book.author}</CardDescription>
                          </div>
                          <Badge className={getConditionColor(book.condition)}>
                            {getConditionText(book.condition)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Deposit:</span>
                          <span className="font-bold text-purple-600">{book.depositAmount} ETH</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{formatDuration(book.duration)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {book.pickupPoint}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-1" />
                          Lender: {book.lender.slice(0, 6)}...{book.lender.slice(-4)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Lent {book.timesLent} times
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          disabled={!book.isAvailable || isLoading || book.lender.toLowerCase() === walletAddress.toLowerCase()}
                          onClick={() => handleBorrowBook(book)}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : book.lender.toLowerCase() === walletAddress.toLowerCase() ? (
                            'Your Book'
                          ) : book.isAvailable ? (
                            <>
                              <BookOpen className="w-4 h-4 mr-2" />
                              Borrow Book
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              Currently Borrowed
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="mybooks" className="space-y-4">
              {loadingBooks ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : myBooks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookMarked className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Books Listed Yet</h3>
                    <p className="text-gray-500 mb-4">Start earning BOOK tokens by listing your books!</p>
                    <Button onClick={() => setIsListDialogOpen(true)} className="bg-gradient-to-r from-purple-600 to-blue-600">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      List Your First Book
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myBooks.map((book) => (
                    <Card key={book.id} className="border-purple-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{book.title}</CardTitle>
                            <CardDescription>{book.author}</CardDescription>
                          </div>
                          <Badge className={getConditionColor(book.condition)}>
                            {getConditionText(book.condition)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Deposit:</span>
                          <span className="font-bold text-purple-600">{book.depositAmount} ETH</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <Badge variant={book.isAvailable ? "default" : "secondary"}>
                            {book.isAvailable ? 'Available' : 'Borrowed'}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Lent {book.timesLent} times
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                          <span className="text-green-800 font-medium">
                            Earned: {book.timesLent * 10} BOOK tokens
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="myloans" className="space-y-4">
              {loadingBooks ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : myLoans.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Loans</h3>
                    <p className="text-gray-500 mb-4">Browse available books to start borrowing!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myLoans.map((loan) => (
                    <Card key={loan.id} className="border-blue-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{loan.bookTitle}</CardTitle>
                            <CardDescription>Loan ID: #{loan.id}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(loan.status)}>
                            {getStatusText(loan.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Deposit Paid</p>
                            <p className="font-bold text-purple-600">{loan.depositPaid} ETH</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Days Left</p>
                            <p className="font-bold text-blue-600">{loan.daysLeft} days</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="font-medium">{new Date(loan.startTime * 1000).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Deadline</p>
                            <p className="font-medium">{new Date(loan.deadline * 1000).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        {loan.status === 0 && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                              <AlertTriangle className="w-4 h-4 inline mr-1" />
                              Return on time to earn 2 BOOK tokens and get full deposit refund!
                            </p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="gap-2">
                        {loan.status === 0 && (
                          <Button 
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            onClick={() => handleReturnBook(loan)}
                            disabled={isLoading}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Return Book
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Return Book Dialog */}
      <Dialog open={selectedLoan !== null} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Book</DialogTitle>
            <DialogDescription>
              Select the condition of the book after use
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="returnCondition">Book Condition After Use</Label>
              <Select value={returnCondition} onValueChange={setReturnCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Mint (Like New)</SelectItem>
                  <SelectItem value="1">Good</SelectItem>
                  <SelectItem value="2">Fair</SelectItem>
                  <SelectItem value="3">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>If returned damaged (50% penalty from deposit)</li>
                <li>If returned late (5% penalty per day)</li>
                <li>Return on time with good condition to earn 2 BOOK tokens!</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLoan(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={confirmReturnBook}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Returning...
                </>
              ) : (
                'Confirm Return'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              © 2024 deLibrary. Powered by Blockchain Technology.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Sepolia Testnet</span>
              <span>•</span>
              <span>Smart Contracts Verified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}