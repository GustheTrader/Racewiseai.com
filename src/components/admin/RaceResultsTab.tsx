import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, BarChart3, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RaceResult {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  results_data: any;
  source_url: string;
  created_at: string;
  updated_at: string;
}

export const RaceResultsTab = () => {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [tracks, setTracks] = useState<string[]>([]);

  // Load race results
  useEffect(() => {
    loadResults();
  }, [selectedDate, selectedTrack]);

  // Load unique tracks
  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const { data, error } = await supabase
        .from("race_results")
        .select("track_name")
        .order("track_name");

      if (error) throw error;

      const uniqueTracks = [...new Set(data?.map((r: any) => r.track_name) || [])];
      setTracks(uniqueTracks as string[]);
    } catch (error) {
      console.error("Failed to load tracks:", error);
    }
  };

  const loadResults = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("race_results")
        .select("*")
        .eq("race_date", selectedDate)
        .order("race_number");

      if (selectedTrack) {
        query = query.eq("track_name", selectedTrack);
      }

      const { data, error } = await query;

      if (error) throw error;
      setResults((data || []) as RaceResult[]);
    } catch (error) {
      toast.error("Failed to load race results");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatOdds = (odds: string) => {
    if (!odds) return "N/A";
    // Parse odds like "2-1" to display nicely
    return odds;
  };

  const calculatePayouts = (result: RaceResult) => {
    const data = result.results_data;
    if (!data) return null;

    return {
      winOdds: data.winning_odds,
      placePayout: data.place_horse ? `${data.place_horse} @ ${data.place_odds}` : "N/A",
      showPayout: data.show_horse ? `${data.show_horse} @ ${data.show_odds}` : "N/A",
      exacta: data.exacta_payout,
      trifecta: data.trifecta_payout,
      superfecta: data.superfecta_payout,
    };
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Race Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="track">Track (Optional)</Label>
              <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                <SelectTrigger id="track">
                  <SelectValue placeholder="All Tracks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tracks</SelectItem>
                  {tracks.map((track) => (
                    <SelectItem key={track} value={track}>
                      {track}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Races</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">With Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.filter((r) => r.results_data?.winning_odds).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Win Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {results
                  .reduce(
                    (acc, r) => acc + (r.results_data?.pool_totals?.win || 0),
                    0
                  )
                  .toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {new Date(results[0].updated_at).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Race Results</CardTitle>
          <CardDescription>
            {results.length === 0
              ? "No results found for the selected date"
              : `Showing ${results.length} races`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : results.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No race results available for this date</AlertDescription>
            </Alert>
          ) : (
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="payouts">Payouts</TabsTrigger>
                <TabsTrigger value="pools">Pool Data</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Track</TableHead>
                        <TableHead>Race #</TableHead>
                        <TableHead>Winner</TableHead>
                        <TableHead>Win Odds</TableHead>
                        <TableHead>Place</TableHead>
                        <TableHead>Show</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => {
                        const payouts = calculatePayouts(result);
                        return (
                          <TableRow key={result.id}>
                            <TableCell className="font-semibold">
                              {result.track_name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{result.race_number}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {result.results_data?.winning_horse || "N/A"}
                            </TableCell>
                            <TableCell className="text-green-600 font-bold">
                              {formatOdds(result.results_data?.winning_odds)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {result.results_data?.place_horse}
                            </TableCell>
                            <TableCell className="text-sm">
                              {result.results_data?.show_horse}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {result.results_data?.time_of_race || "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="payouts">
                <div className="space-y-4">
                  {results.map((result) => {
                    const payouts = calculatePayouts(result);
                    return (
                      <Card key={result.id} className="bg-gray-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            {result.track_name} - Race {result.race_number}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-gray-600">Win</div>
                              <div className="text-lg font-bold">
                                {payouts?.winOdds || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Exacta</div>
                              <div className="text-lg font-bold">
                                {payouts?.exacta || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Trifecta</div>
                              <div className="text-lg font-bold">
                                {payouts?.trifecta || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Superfecta</div>
                              <div className="text-lg font-bold">
                                {payouts?.superfecta || "N/A"}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="pools">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Race</TableHead>
                        <TableHead>Win Pool</TableHead>
                        <TableHead>Place Pool</TableHead>
                        <TableHead>Show Pool</TableHead>
                        <TableHead>Exacta Pool</TableHead>
                        <TableHead>Carryover</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>
                            {result.track_name} R{result.race_number}
                          </TableCell>
                          <TableCell>
                            $
                            {(result.results_data?.pool_totals?.win || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            $
                            {(result.results_data?.pool_totals?.place || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            $
                            {(result.results_data?.pool_totals?.show || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            $
                            {(result.results_data?.pool_totals?.exacta || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {result.results_data?.pool_totals?.carryover
                              ? `$${result.results_data.pool_totals.carryover.toLocaleString()}`
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
