export interface User {
  id: string;
  name: string;
  role: 'student' | 'manager';
  blocked?: boolean;
}

export interface Task {
  id: number;
  name: string;
  weight: number;
  grade?: number | null;
  reported: boolean;
  reported_date?: string | null;
}

export interface ManagerData {
  students: {
    id: string;
    name: string;
    password?: string;
    birth_date?: string;
    blocked?: boolean;
    grades: Record<number, number | null>;
  }[];
  tasks: {
    id: number;
    name: string;
    weight: number;
  }[];
}

export interface SettingsData {
  support_contact: string;
  login_bg_url: string;
  header_bg_url: string;
  primary_color: string;
}
