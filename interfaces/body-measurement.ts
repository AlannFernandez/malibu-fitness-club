export interface BodyMeasurement {
  id: string;
  user_id: string;
  weight: number;
  height: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  bicep?: number;
  thigh?: number;
  measurement_date: string;
  notes?: string;
  created_at?: string;
}
