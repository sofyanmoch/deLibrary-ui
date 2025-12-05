"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import type { LeaderboardEntry } from '@/lib/api/bookLendingApi';

interface LeaderboardProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function Leaderboard({
  limit = 10,
  autoRefresh = false,
  refreshInterval = 30000
}: LeaderboardProps) {
  const { getLeaderboard, getTopBorrowers, isLoading } = useApi();
  const [lenders, setLenders] = useState<LeaderboardEntry[]>([]);
  const [borrowers, setBorrowers] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'lenders' | 'borrowers'>('lenders');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchLeaderboards = async () => {
    const [lendersData, borrowersData] = await Promise.all([
      getLeaderboard(limit),
      getTopBorrowers(limit)
    ]);

    setLenders(lendersData);
    setBorrowers(borrowersData);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchLeaderboards();

    if (autoRefresh) {
      const interval = setInterval(fetchLeaderboards, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [limit, autoRefresh, refreshInterval]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderLeaderboard = (entries: LeaderboardEntry[], type: 'lenders' | 'borrowers') => {
    if (entries.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No {type} yet. Be the first!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.address}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              entry.rank <= 3 ? 'bg-accent/50 border-accent' : 'bg-card border-border'
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center justify-center w-10">
                {getRankIcon(entry.rank)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {entry.username && entry.username !== 'Anonymous' ? (
                    <p className="font-semibold truncate">{entry.username}</p>
                  ) : (
                    <p className="text-muted-foreground truncate">Anonymous</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {formatAddress(entry.address)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={entry.rank <= 3 ? 'default' : 'secondary'}>
                {type === 'lenders' ? entry.booksLent : entry.booksBorrowed} books
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Leaderboard
            </CardTitle>
            <CardDescription>
              Top contributors to the community
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeaderboards}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'lenders' | 'borrowers')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="lenders">Top Lenders</TabsTrigger>
            <TabsTrigger value="borrowers">Top Borrowers</TabsTrigger>
          </TabsList>

          <TabsContent value="lenders" className="mt-0">
            {renderLeaderboard(lenders, 'lenders')}
          </TabsContent>

          <TabsContent value="borrowers" className="mt-0">
            {renderLeaderboard(borrowers, 'borrowers')}
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
