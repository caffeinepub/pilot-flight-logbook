export function parseTime(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  
  const hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;
  
  return hours * 60 + minutes;
}

export function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function calculateTotalHours(takeoffTime: string, landingTime: string): number {
  if (!takeoffTime || !landingTime) return 0;
  
  const takeoffMinutes = parseTime(takeoffTime);
  const landingMinutes = parseTime(landingTime);
  
  let difference = landingMinutes - takeoffMinutes;
  
  // Handle flights crossing midnight
  if (difference < 0) {
    difference += 24 * 60;
  }
  
  return difference;
}
