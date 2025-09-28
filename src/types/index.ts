export interface Location {
  id: string;
  name: string;
  color: string;
}

export interface CheckListItem {
  id: string;
  label: string;
  completed: boolean;
  mandatory: boolean;
}

export interface CheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  locationId: string;
  observations: string;
  checklistItems: CheckListItem[];
}

export interface PlannedCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  locationId: string;
  notes: string;
}
