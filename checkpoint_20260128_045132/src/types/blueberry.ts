/**
 * Blueberry Math Analyzer 3.0 - Type Definitions
 * Based on official Blueberry Math API responses
 */

export type TimePeriod = 'last_24h' | 'last_week' | 'last_month' | 'last_quarter';

export const TIME_PERIOD_CONFIG: Record<TimePeriod, { days: number; label: string }> = {
  last_24h: { days: 1, label: 'Últimas 24h' },
  last_week: { days: 7, label: 'Última semana' },
  last_month: { days: 30, label: 'Último mês' },
  last_quarter: { days: 90, label: 'Último trimestre' }
};

export type TrafficLightStatus = 'VERMELHO' | 'AMARELO' | 'VERDE';

export interface BlueberryClass {
  guid: string;
  name: string;
  hasBlueBerry?: boolean;
}

export interface ActivityData {
  ok: number;
  ko: number;
  unfinished: number;
  total: number;
}

export interface NeedHelpLoPhase {
  description?: string;
  reason?: string;
  kcGuid?: string;
}

export interface BlueberryStudent {
  guid: string;
  name: string;
  lastname: string;
  totalTimeInSeconds: number;
  activities: ActivityData;
  masteredKcs: number;
  forgottenKcs: number;
  needHelpLoPhase: NeedHelpLoPhase[];
}

export interface ProcessedStudent {
  student_id: string;
  student_name: string;
  time_spent_minutes: number;
  correct_count: number;
  incorrect_count: number;
  abandoned_count: number;
  total_activities: number;
  difficulties: string[];
  mastered_kcs: number;
  forgotten_kcs: number;
  status: TrafficLightStatus;
}

export interface StudentMetrics {
  time_minutes: number;
  activities: number;
  accuracy: number;
  status: TrafficLightStatus;
}

export interface InterventionPlan {
  level: string;
  action: string;
  duration: string;
  focus: string;
}

export interface StudentAnalysis {
  student_name: string;
  period: TimePeriod;
  metrics: StudentMetrics;
  difficulties: string[];
  intervention: InterventionPlan;
}

export interface ClassMetrics {
  avg_activities: number;
  avg_time_minutes: number;
  adherence_percent: number;
}

export interface TrafficLightDistribution {
  green_percent: number;
  yellow_percent: number;
  red_percent: number;
}

export interface ClassAnalysis {
  class_name: string;
  class_guid: string;
  period: TimePeriod;
  total_students: number;
  metrics: ClassMetrics;
  traffic_light: TrafficLightDistribution;
  critical_difficulties: string[];
  recommendation: string;
  students: ProcessedStudent[];
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface AuthCredentials {
  token: string;
  cookies?: string;
}
