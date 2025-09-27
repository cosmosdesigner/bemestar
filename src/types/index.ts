export interface Location {
  id: string;
  name: string;
  color: string;
}

export interface CheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  locationId: string;
  observations: string;
}

export interface PlannedCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  locationId: string;
  notes: string;
}
