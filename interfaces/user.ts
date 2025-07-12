export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: string;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_owner?: boolean | null;
  gender?: Gender | null;
  birth_date?: string | null;
}

type Gender = 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
