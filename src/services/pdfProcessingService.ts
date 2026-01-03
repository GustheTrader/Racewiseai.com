export const processMockPDFData = async (fileName: string) => {
  // Minimal stub to satisfy imports during typechecking/build.
  return {
    data: {
      trackName: "Unknown Track",
      raceNumber: 1,
      horses: [
        { pp: 1, name: "Mock Horse 1", jockey: "J. Rider", trainer: "T. Trainer", mlOdds: 3.5 },
        { pp: 2, name: "Mock Horse 2", jockey: "A. Rider", trainer: "B. Trainer", mlOdds: 4.2 },
      ],
    },
  } as const;
};
