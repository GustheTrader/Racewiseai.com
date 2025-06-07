
// Enhanced vibrant post position colors
export const getRunnerColorByPosition = (position: number): string => {
  switch (position) {
    case 1: return "#EF4444"; // bright red
    case 2: return "#F8FAFC"; // bright white
    case 3: return "#3B82F6"; // bright blue
    case 4: return "#FDE047"; // bright yellow
    case 5: return "#22C55E"; // bright green
    case 6: return "#1F2937"; // dark black
    case 7: return "#FB923C"; // bright orange
    case 8: return "#F472B6"; // bright pink
    case 9: return "#34D399"; // bright emerald
    case 10: return "#A855F7"; // bright purple
    case 11: return "#A3E635"; // bright lime
    case 12: return "#9CA3AF"; // gray
    case 13: return "#BE123C"; // dark rose
    case 14: return "#06B6D4"; // bright cyan
    case 15: return "#6366F1"; // bright indigo
    case 16: return "#F59E0B"; // bright amber
    default: return "#3B82F6"; // bright blue (default)
  }
};
