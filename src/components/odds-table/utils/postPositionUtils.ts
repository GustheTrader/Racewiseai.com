
// Map to convert post position to standard colors
export const getPostPositionColor = (position: number): string => {
  switch (position) {
    case 1: return "#DC2626"; // red-600
    case 2: return "#FFFFFF"; // white
    case 3: return "#2563EB"; // blue-600
    case 4: return "#FACC15"; // yellow-400
    case 5: return "#16A34A"; // green-600
    case 6: return "#000000"; // black
    case 7: return "#F97316"; // orange-500
    case 8: return "#EC4899"; // pink-500
    case 9: return "#10B981"; // emerald-500
    case 10: return "#9333EA"; // purple-600
    case 11: return "#84CC16"; // lime-500
    case 12: return "#9CA3AF"; // gray-400
    case 13: return "#9F1239"; // rose-800
    case 14: return "#14B8A6"; // teal-500
    case 15: return "#4338CA"; // indigo-700
    case 16: return "#F59E0B"; // amber-500
    default: return "#3B82F6"; // blue-500 (default)
  }
};

export const getPostPositionTextColor = (position: number): string => {
  return position === 2 || position === 4 || position === 12 ? "text-black" : "text-white";
};
