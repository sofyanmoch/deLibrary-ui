"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, BookMarked, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';

interface StatisticsProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function Statistics({
  autoRefresh = false,
  refreshInterval = 30000
}: StatisticsProps) {
  const { getStatistics, isLoading } = useApi();
  const [totalBooks, setTotalBooks] = useState('0');
  const [totalLoans, setTotalLoans] = useState('0');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStatistics = async () => {
    const stats = await getStatistics();
    setTotalBooks(stats.totalBooks);
    setTotalLoans(stats.totalLoans);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchStatistics();

    if (autoRefresh) {
      const interval = setInterval(fetchStatistics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const stats = [
    {
      title: 'Total Books',
      value: totalBooks,
      description: 'Books available in the library',
      icon: BookOpen,
      color: 'text-blue-500'
    },
    {
      title: 'Total Loans',
      value: totalLoans,
      description: 'Books borrowed so far',
      icon: BookMarked,
      color: 'text-green-500'
    },
    {
      title: 'Active Rate',
      value: totalBooks === '0' ? '0%' : `${Math.round((parseInt(totalLoans) / parseInt(totalBooks)) * 100)}%`,
      description: 'Loan to book ratio',
      icon: TrendingUp,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Platform Statistics</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStatistics}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </p>
    </div>
  );
}
