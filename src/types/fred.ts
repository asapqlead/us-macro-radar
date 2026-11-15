export interface FredSeriesInfo {
  id: string;
  realtime_start: string;
  realtime_end: string;
  title: string;
  observation_start: string;
  observation_end: string;
  frequency: string;
  frequency_short: string;
  units: string;
  units_short: string;
  seasonal_adjustment: string;
  seasonal_adjustment_short: string;
  last_updated: string;
  popularity: number;
  notes?: string;
}

export interface FredSeriesResponse {
  realtime_start: string;
  realtime_end: string;
  seriess: FredSeriesInfo[];
}

export interface FredObservationRaw {
  realtime_start: string;
  realtime_end: string;
  date: string;
  value: string; // "." indicates missing/holiday
}

export interface FredObservationsResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: FredObservationRaw[];
}

export interface FredObservationPoint {
  date: string;
  value: number;
}

export interface FredFetchOptions {
  observation_start?: string;
  observation_end?: string;
  frequency?: "d" | "w" | "bw" | "m" | "q" | "sa" | "a";
  units?: "lin" | "chg" | "ch1" | "pch" | "pc1" | "pca" | "cch" | "cca" | "log";
  aggregation_method?: "avg" | "sum" | "eop";
  sort_order?: "asc" | "desc";
  limit?: number;
}
