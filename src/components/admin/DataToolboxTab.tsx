import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileUp, Download, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { PipelineResult, Horse } from "@/types/DataToolboxTypes";
import { processHandicapping, convertToCSV, convertToXML, fileToBase64, downloadFile } from "@/utils/dataToolboxUtils";
import { parseMorningCard, parseRacingDigest, parseBackupEntries } from "@/integrations/geminiService";
import { toast } from "sonner";

export const DataToolboxTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRace, setSelectedRace] = useState<number>(0);

  const handleFileUpload = async (file: File, parserType: "morning" | "digest" | "backup") => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(file);

      let result: PipelineResult;
      if (parserType === "morning") {
        result = await parseMorningCard({
          pdfData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      } else if (parserType === "digest") {
        result = await parseRacingDigest({
          pdfData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      } else {
        result = await parseBackupEntries({
          pdfData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      }

      // Process handicapping
      const processedResult = processHandicapping(result);
      setResults(processedResult);
      toast.success(`Successfully parsed ${processedResult.races.length} races`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse file";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!results) return;
    const csv = convertToCSV(results);
    downloadFile(csv, `${results.track}-${results.date}-handicapping.csv`, "text/csv");
    toast.success("CSV downloaded");
  };

  const handleDownloadXML = () => {
    if (!results) return;
    const xml = convertToXML(results);
    downloadFile(xml, `${results.track}-${results.date}-handicapping.xml`, "application/xml");
    toast.success("XML downloaded");
  };

  if (!results) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ParseCard
            title="Morning Card Parser"
            description="Parse full racing cards from PDFs or web sources"
            icon="🌅"
            isLoading={isLoading}
            onFileSelect={(file) => handleFileUpload(file, "morning")}
          />
          <ParseCard
            title="Racing Digest Parser"
            description="Extract race data from Today's Racing Digest PDFs"
            icon="📰"
            isLoading={isLoading}
            onFileSelect={(file) => handleFileUpload(file, "digest")}
          />
          <ParseCard
            title="Backup Entries Parser"
            description="Fallback parser for complete card coverage"
            icon="📋"
            isLoading={isLoading}
            onFileSelect={(file) => handleFileUpload(file, "backup")}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="races">Races</TabsTrigger>
        <TabsTrigger value="rankings">Rankings</TabsTrigger>
        <TabsTrigger value="export">Export</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Parsed Data Summary</CardTitle>
            <CardDescription>{results.track} - {results.date}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{results.races.length}</div>
                <div className="text-sm text-gray-500">Total Races</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {results.races.reduce((acc, r) => acc + r.horses.length, 0)}
                </div>
                <div className="text-sm text-gray-500">Total Horses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {results.races.map(r => r.horses[0]?.modelOdds).filter(Boolean).length}
                </div>
                <div className="text-sm text-gray-500">With Model Odds</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {results.groundingSources?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Sources</div>
              </div>
            </div>

            {results.groundingSources && results.groundingSources.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Grounding Sources</h4>
                <ul className="space-y-1">
                  {results.groundingSources.map((source, idx) => (
                    <li key={idx} className="text-sm text-blue-600 hover:underline">
                      <a href={source.uri} target="_blank" rel="noopener noreferrer">
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => {
                setResults(null);
                setError(null);
              }}
              variant="outline"
              className="w-full mt-4"
            >
              Parse Another File
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="races" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {results.races.map((race) => (
            <Button
              key={race.number}
              variant={selectedRace === race.number ? "default" : "outline"}
              onClick={() => setSelectedRace(race.number)}
              className="w-full"
            >
              Race {race.number}
            </Button>
          ))}
        </div>

        {results.races[selectedRace] && (
          <Card>
            <CardHeader>
              <CardTitle>Race {results.races[selectedRace].number}</CardTitle>
              <CardDescription>
                {results.races[selectedRace].distance} - {results.races[selectedRace].surface}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>PP</TableHead>
                      <TableHead>Horse</TableHead>
                      <TableHead>Jockey</TableHead>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Model Odds</TableHead>
                      <TableHead>Win %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.races[selectedRace].horses.map((horse: Horse) => (
                      <TableRow key={horse.programNumber}>
                        <TableCell>
                          <Badge>{horse.rank}</Badge>
                        </TableCell>
                        <TableCell>{horse.programNumber}</TableCell>
                        <TableCell className="font-semibold">{horse.name}</TableCell>
                        <TableCell>{horse.jockey}</TableCell>
                        <TableCell>{horse.trainer}</TableCell>
                        <TableCell>{horse.modelScore.toFixed(1)}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {horse.modelOdds}
                        </TableCell>
                        <TableCell>{horse.winPercentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="rankings" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Rated Horses by Track</CardTitle>
            <CardDescription>Model Score Rankings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {results.races.map((race) => (
                <div key={race.number}>
                  <h3 className="font-semibold mb-3">Race {race.number}</h3>
                  <div className="space-y-2">
                    {race.horses
                      .sort((a, b) => b.modelScore - a.modelScore)
                      .slice(0, 5)
                      .map((horse) => (
                        <div key={horse.programNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-semibold">
                              #{horse.programNumber} {horse.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {horse.jockey} / {horse.trainer}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{horse.modelScore.toFixed(1)}</div>
                            <div className="text-sm text-green-600">{horse.modelOdds}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="export" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                CSV Export
              </CardTitle>
              <CardDescription>35-column spreadsheet format</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Includes all handicapping metrics, past performances, and model scores.
              </p>
              <Button onClick={handleDownloadCSV} className="w-full">
                Download CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                XML Export
              </CardTitle>
              <CardDescription>Structured XML format</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Structured XML with race conditions and horse details.
              </p>
              <Button onClick={handleDownloadXML} className="w-full">
                Download XML
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

interface ParseCardProps {
  title: string;
  description: string;
  icon: string;
  isLoading: boolean;
  onFileSelect: (file: File) => void;
}

const ParseCard = ({ title, description, icon, isLoading, onFileSelect }: ParseCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="text-3xl mb-2">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <label className="w-full">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
            <FileUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">
              {isLoading ? "Processing..." : "Click to upload PDF"}
            </p>
            <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
          </div>
          <input
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
            disabled={isLoading}
          />
        </label>
      </CardContent>
    </Card>
  );
};
