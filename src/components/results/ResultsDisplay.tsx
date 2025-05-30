
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { RefreshCw, Search } from 'lucide-react';
import { RaceResult } from '@/types/RaceResultTypes';

interface ResultsDisplayProps {
  results: RaceResult[];
  selectedResult: RaceResult | null;
  setSelectedResult: (result: RaceResult) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  selectedResult,
  setSelectedResult,
  onRefresh,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  const filteredResults = results.filter(result => 
    result.track_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.race_number.toString().includes(searchQuery)
  );

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <span className="flex h-9 w-9 items-center justify-center">...</span>
                </PaginationItem>
              )}
            </>
          )}
          
          {pageNumbers.map(number => (
            <PaginationItem key={number}>
              <PaginationLink 
                isActive={currentPage === number}
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <span className="flex h-9 w-9 items-center justify-center">...</span>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search results..."
            className="pl-8 bg-betting-dark text-white border-betting-mediumBlue"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
          className="ml-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-md border border-betting-mediumBlue overflow-hidden">
          <Table>
            <TableHeader className="bg-betting-dark">
              <TableRow>
                <TableHead className="text-gray-300">Track</TableHead>
                <TableHead className="text-gray-300">Race</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-400">
                    {isLoading ? 'Loading results...' : 'No race results found.'}
                  </TableCell>
                </TableRow>
              ) : (
                currentResults.map((result) => (
                  <TableRow 
                    key={result.id} 
                    className={`hover:bg-betting-dark/50 cursor-pointer ${selectedResult?.id === result.id ? 'bg-betting-dark/70' : ''}`}
                    onClick={() => setSelectedResult(result)}
                  >
                    <TableCell className="font-medium">{result.track_name}</TableCell>
                    <TableCell>{result.race_number}</TableCell>
                    <TableCell>{formatDate(result.race_date)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {renderPagination()}
        </div>
        
        <div>
          {selectedResult ? (
            <Card className="bg-betting-dark border-betting-mediumBlue h-full overflow-hidden">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3">
                  {selectedResult.track_name} - Race {selectedResult.race_number}
                </h3>
                <div className="text-sm text-gray-400 mb-4">
                  Imported on {formatDate(selectedResult.created_at)}
                </div>
                
                <div className="bg-betting-navyBlue p-4 rounded-md overflow-auto max-h-[500px]">
                  {selectedResult.results_data && (
                    <div className="space-y-4">
                      <h4 className="text-md font-medium">Final Results</h4>
                      {selectedResult.results_data.finishOrder ? (
                        <Table>
                          <TableHeader className="bg-betting-dark/50">
                            <TableRow>
                              <TableHead className="text-gray-300">Position</TableHead>
                              <TableHead className="text-gray-300">Horse</TableHead>
                              <TableHead className="text-gray-300">Jockey</TableHead>
                              <TableHead className="text-gray-300">Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedResult.results_data.finishOrder.map((horse: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{horse.position || (index + 1)}</TableCell>
                                <TableCell>{horse.name}</TableCell>
                                <TableCell>{horse.jockey || 'N/A'}</TableCell>
                                <TableCell>{horse.time || 'N/A'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-4 text-gray-400">
                          No finish order data available
                        </div>
                      )}
                      
                      {selectedResult.results_data.payouts && Object.keys(selectedResult.results_data.payouts).length > 0 ? (
                        <div className="mt-4">
                          <h4 className="text-md font-medium mb-2">Payouts</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(selectedResult.results_data.payouts).map(([bet, payout]: [string, any]) => (
                              <div key={bet} className="bg-betting-dark/30 p-3 rounded-md">
                                <div className="font-medium">{bet}</div>
                                <div className="text-green-400">${typeof payout === 'number' ? payout.toFixed(2) : payout}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400">
                          No payout data available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full border border-dashed border-betting-mediumBlue rounded-md p-8">
              <p className="text-gray-400 text-center">
                Select a race result to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
