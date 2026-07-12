export interface TechService {
  id: string;
  title: string;
  description: string;
  iconName: string; // Used to dynamically render Lucide icons
  category: "development" | "consulting" | "design" | "hardware" | "ai";
  features: string[];
  technologies: string[];
  enterpriseScale: string;
}

export interface InternshipTrack {
  id: string;
  title: string;
  abbreviation: string; // e.g. "NIT", "SOD"
  tags: string[]; // e.g. ["Open", "Remote", "3 Months"]
  contentSummary: string;
  syllabus: string[];
  mentors: string[];
  skillsAquired: string[];
}

export interface AcademicSupport {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  deliverables: string[];
}

export interface TrainingProgram {
  id: string;
  title: string;
  audience: string; // "TVET" or "University"
  level: string; // e.g., "Levels 3, 4, 5" or "Advanced System Engineering"
  duration: string;
  description: string;
  modules: string[];
  outcomes: string[];
}

export interface PartnershipRequest {
  companyName: string;
  contactName: string;
  email: string;
  projectScope: string;
  budgetRange: string;
  selectedServices: string[];
}

export interface InternshipApplication {
  fullName: string;
  email: string;
  trackId: string;
  educationLevel: "TVET" | "University" | "Self-taught";
  institution: string;
  experienceLevel: string;
  statement: string;
}

export interface PartnershipRecord {
  companyName: string;
  contactName: string;
  email: string;
  projectScope: string;
  budgetRange: string;
  selectedServices: string[];
  createdAt: string;
}

export interface ApplicationRecord {
  fullName: string;
  email: string;
  trackId: string;
  educationLevel?: string;
  institution?: string;
  experienceLevel?: string;
  statement?: string;
  createdAt: string;
}

export interface Partnership {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  project_scope: string;
  budget_range: string;
  selected_services: string[];
  created_at: string;
  status?: string;
  notes?: string;
}

export interface Application {
  id: number;
  full_name: string;
  email: string;
  track_id: string;
  education_level: string;
  institution: string;
  experience_level: string;
  statement: string;
  created_at: string;
  status?: string;
  notes?: string;
}

export interface DashboardStats {
  total: {
    partnerships: number;
    applications: number;
  };
  today: {
    partnerships: number;
    applications: number;
  };
  recent: {
    partnerships: Partnership[];
    applications: Application[];
  };
}

export interface DataTableColumn {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

export interface DataTableProps {
  data: any[];
  columns: DataTableColumn[];
  onView: (item: any) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
  searchPlaceholder?: string;
  searchFields?: string[];
  loading?: boolean;
  emptyMessage?: string;
  showRowNumbers?: boolean;
  pageSize?: number; // Number of items per page (default: 10)
}
