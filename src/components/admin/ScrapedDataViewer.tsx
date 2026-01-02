import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Filter, Database, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';

interface RaceData {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  race_conditions: string | null;
  created_at: string;
}

interface OddsData {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  horse_name: string;
  horse_number: number;
  win_odds: string | null;
  scraped_at: string;
}

interface RaceResult {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  results_data: Record<string, unknown>;
  created_at: string;
}

type DataType = 'races' | 'odds' | 'results';

const ScrapedDataViewer: React.FC = () => {
  const [dataType, setDataType] = useState<DataType>('races');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [tracks, setTracks] = useState<string[]>([]);
  
  const [races, setRaces] = useState<RaceData[]>([]);
  const [odds, setOdds] = useState<OddsData[]>([]);
  const [results, setResults] = useState<RaceResult[]>([]);

  const fetchTracks = async () => {
    const { data: raceData } = await supabase
      .from('race_data')
      .select('track_name')
      .order('track_name');
    
    const { data: oddsData } = await supabase
      .from('odds_data')
      .select('track_name')
      .order('track_name');

    const allTracks = new Set<string>();
    raceData?.forEach(r => allTracks.add(r.track_name));
    oddsData?.forEach(o => allTracks.add(o.track_name));
    
    setTracks(Array.from(allTracks).sort());
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (dataType === 'races') {
        let query = supabase
          .from('race_data')
          .select('*')
          .order('race_date', { ascending: false })
          .limit(100);
        
        if (selectedTrack !== 'all') {
          query = query.eq('track_name', selectedTrack);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        setRaces(data || []);
      } else if (dataType === 'odds') {
        let query = supabase
          .from('odds_data')
          .select('*')
          .order('scraped_at', { ascending: false })
          .limit(200);
        
        if (selectedTrack !== 'all') {
          query = query.eq('track_name', selectedTrack);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        setOdds(data || []);
      } else if (dataType === 'results') {
        let query = supabase
          .from('race_results')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (selectedTrack !== 'all') {
          query = query.eq('track_name', selectedTrack);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        setResults(data || []);
      }
      
      toast.success(`Loaded ${dataType} data`);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  useEffect(() => {
    fetchData();
  }, [dataType, selectedTrack]);

  const filteredRaces = races.filter(r => 
    r.track_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.race_conditions?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOdds = odds.filter(o => 
    o.track_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.horse_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResults = results.filter(r => 
    r.track_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Scraped Data Viewer</CardTitle>
          </div>
          <Button 
            onClick={fetchData} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={dataType} onValueChange={(v) => setDataType(v as DataType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="races">Races</SelectItem>
                <SelectItem value="odds">Odds</SelectItem>
                <SelectItem value="results">Results</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={selectedTrack} onValueChange={setSelectedTrack}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Tracks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tracks</SelectItem>
              {tracks.map(track => (
                <SelectItem key={track} value={track}>{track}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <Badge variant="outline" className="text-sm">
            {dataType === 'races' && `${filteredRaces.length} races`}
            {dataType === 'odds' && `${filteredOdds.length} odds records`}
            {dataType === 'results' && `${filteredResults.length} results`}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {tracks.length} tracks available
          </Badge>
        </div>

        {/* Data Tables */}
        <div className="rounded-md border border-border overflow-hidden">
          {dataType === 'races' && (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Track</TableHead>
                  <TableHead>Race #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRaces.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No race data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRaces.map(race => (
                    <TableRow key={race.id}>
                      <TableCell className="font-medium">{race.track_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">R{race.race_number}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(race.race_date)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">
                        {race.race_conditions || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(race.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {dataType === 'odds' && (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Track</TableHead>
                  <TableHead>Race #</TableHead>
                  <TableHead>Horse #</TableHead>
                  <TableHead>Horse Name</TableHead>
                  <TableHead>Win Odds</TableHead>
                  <TableHead>Scraped At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOdds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No odds data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOdds.map(odd => (
                    <TableRow key={odd.id}>
                      <TableCell className="font-medium">{odd.track_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">R{odd.race_number}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/20 text-primary">#{odd.horse_number}</Badge>
                      </TableCell>
                      <TableCell>{odd.horse_name}</TableCell>
                      <TableCell className="font-mono font-bold text-green-500">
                        {odd.win_odds || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(odd.scraped_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {dataType === 'results' && (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Track</TableHead>
                  <TableHead>Race #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Results Preview</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No results data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map(result => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.track_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">R{result.race_number}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(result.race_date)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <code className="text-xs bg-muted p-1 rounded truncate block">
                          {JSON.stringify(result.results_data).slice(0, 80)}...
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(result.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapedDataViewer;
