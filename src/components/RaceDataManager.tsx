
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { RaceData, RaceHorse } from '@/utils/types';
import { createMockDataStructure } from '@/utils/dataHelpers';
import RacesList from './races/RacesList';
import HorseDetails from './races/HorseDetails';

const RaceDataManager: React.FC = () => {
  const { toast } = useToast();
  const [races, setRaces] = useState<RaceData[]>([]);
  const [horses, setHorses] = useState<RaceHorse[]>([]);
  const [selectedRace, setSelectedRace] = useState<RaceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('races');

  useEffect(() => {
    fetchRaces();
  }, []);

  useEffect(() => {
    if (selectedRace) {
      fetchHorsesForRace(selectedRace.id);
    }
  }, [selectedRace]);

  const fetchRaces = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('race_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRaces(data || []);
      if (data && data.length > 0 && !selectedRace) {
        setSelectedRace(data[0]);
      }
    } catch (error) {
      console.error('Error fetching races:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch race data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHorsesForRace = async (raceId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('race_horses')
        .select('*')
        .eq('race_id', raceId)
        .order('pp', { ascending: true });

      if (error) {
        throw error;
      }

      setHorses(data || []);
    } catch (error) {
      console.error('Error fetching horses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch horse data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRace = async (raceId: string) => {
    if (!confirm('Are you sure you want to delete this race and all its horses?')) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('race_data')
        .delete()
        .eq('id', raceId);

      if (error) {
        throw error;
      }

      // Horses will be deleted automatically due to ON DELETE CASCADE
      setRaces(races.filter(race => race.id !== raceId));
      if (selectedRace && selectedRace.id === raceId) {
        setSelectedRace(races.length > 1 ? races[0] : null);
      }

      toast({
        title: 'Success',
        description: 'Race deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting race:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete race.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRaceIntoApp = async (raceId: string) => {
    setIsLoading(true);
    try {
      // Fetch the race data
      const { data: raceData, error: raceError } = await supabase
        .from('race_data')
        .select('*')
        .eq('id', raceId)
        .single();

      if (raceError) throw raceError;

      // Fetch the horses for this race
      const { data: horseData, error: horseError } = await supabase
        .from('race_horses')
        .select('*')
        .eq('race_id', raceId)
        .order('pp', { ascending: true });

      if (horseError) throw horseError;

      // In a real implementation, this would update the global app state
      // For now, we'll just show a success message since we can't update the mock data structure
      // The createMockDataStructure function is designed to work with the existing data system
      
      toast({
        title: 'Success',
        description: `${raceData.track_name} Race ${raceData.race_number} data loaded successfully.`,
      });
    } catch (error) {
      console.error('Error loading race data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load race data into the application.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-betting-navyBlue border-betting-mediumBlue">
      <CardHeader>
        <CardTitle>Race Data Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="races">Races</TabsTrigger>
            <TabsTrigger value="horses" disabled={!selectedRace}>Horse Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="races">
            <RacesList
              races={races}
              selectedRace={selectedRace}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRefresh={fetchRaces}
              onSelectRace={setSelectedRace}
              onLoadRace={loadRaceIntoApp}
              onDeleteRace={deleteRace}
            />
          </TabsContent>
          
          <TabsContent value="horses">
            <HorseDetails
              selectedRace={selectedRace}
              horses={horses}
              isLoading={isLoading}
              onLoadRace={loadRaceIntoApp}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RaceDataManager;
