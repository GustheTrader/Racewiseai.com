
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Clock, Users, Trophy, RefreshCw } from 'lucide-react';
import { useStatpalRealtime } from '@/hooks/useStatpalRealtime';
import { format } from 'date-fns';

const StatpalRealtimeDashboard: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<'usa' | 'uk' | undefined>(undefined);
  const [selectedTrack, setSelectedTrack] = useState<string | undefined>(undefined);
  
  const { races, horses, results, isLoading, error } = useStatpalRealtime({
    country: selectedCountry,
    trackName: selectedTrack
  });

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return <Badge className="bg-green-600">Live</Badge>;
      case 'finished':
        return <Badge className="bg-gray-600">Finished</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-600">Upcoming</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const getHorsesForRace = (raceId: string) => {
    return horses.filter(horse => horse.statpal_race_id === raceId);
  };

  const getResultsForRace = (raceId: string) => {
    return results.filter(result => result.statpal_race_id === raceId);
  };

  const uniqueTracks = [...new Set(races.map(race => race.track_name))];

  if (error) {
    return (
      <Card className="border-red-500">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading data: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Statpal Live Race Data
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Country:</span>
              <Select value={selectedCountry || 'all'} onValueChange={(value) => 
                setSelectedCountry(value === 'all' ? undefined : value as 'usa' | 'uk')
              }>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="usa">USA</SelectItem>
                  <SelectItem value="uk">UK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Track:</span>
              <Select value={selectedTrack || 'all'} onValueChange={(value) => 
                setSelectedTrack(value === 'all' ? undefined : value)
              }>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks</SelectItem>
                  {uniqueTracks.map(track => (
                    <SelectItem key={track} value={track}>{track}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Active Races</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {races.filter(r => r.status === 'live').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Total Horses</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {horses.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Finished Races</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {results.filter(r => r.position === 1).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="races" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="races">Races ({races.length})</TabsTrigger>
              <TabsTrigger value="horses">Horses ({horses.length})</TabsTrigger>
              <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="races" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Track</TableHead>
                      <TableHead>Race</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Entries</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {races.map((race) => (
                      <TableRow key={race.id}>
                        <TableCell className="font-medium">
                          <div>
                            {race.track_name}
                            <div className="text-xs text-gray-500 uppercase">
                              {race.country}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{race.race_name || `Race ${race.statpal_race_id}`}</TableCell>
                        <TableCell>
                          {format(new Date(race.race_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{race.race_time || '-'}</TableCell>
                        <TableCell>{race.distance || '-'}</TableCell>
                        <TableCell>{getStatusBadge(race.status)}</TableCell>
                        <TableCell>
                          {getHorsesForRace(race.statpal_race_id).length}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="horses" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horse</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Jockey</TableHead>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Age/Gender</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {horses.slice(0, 50).map((horse) => (
                      <TableRow key={horse.id}>
                        <TableCell className="font-medium">{horse.horse_name}</TableCell>
                        <TableCell>{horse.number || '-'}</TableCell>
                        <TableCell>{horse.jockey_name || '-'}</TableCell>
                        <TableCell>{horse.trainer_name || '-'}</TableCell>
                        <TableCell>{horse.weight || '-'}</TableCell>
                        <TableCell>
                          {horse.age && horse.gender 
                            ? `${horse.age}${horse.gender.charAt(0).toUpperCase()}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{horse.rating || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Horse</TableHead>
                      <TableHead>Jockey</TableHead>
                      <TableHead>Starting Price</TableHead>
                      <TableHead>Distance Behind</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.slice(0, 50).map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <Badge variant={result.position === 1 ? 'default' : 'outline'}>
                            {result.position || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{result.horse_name}</TableCell>
                        <TableCell>{result.jockey_name || '-'}</TableCell>
                        <TableCell>
                          {result.starting_price ? `${result.starting_price}` : '-'}
                        </TableCell>
                        <TableCell>{result.distance_behind || '-'}</TableCell>
                        <TableCell>{result.time_taken || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatpalRealtimeDashboard;
