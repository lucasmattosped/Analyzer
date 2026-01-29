/**
 * Blueberry Math Analyzer 3.0 - Application Data Store
 * Uses Zustand for state management
 */

import { create } from 'zustand';
import type {
  BlueberryClass,
  ProcessedStudent,
  ClassAnalysis,
  TimePeriod
} from '@/types/blueberry';

interface AppState {
  // Classes
  classes: BlueberryClass[];
  selectedClass: BlueberryClass | null;

  // Students
  students: ProcessedStudent[];
  classAnalysis: ClassAnalysis | null;

  // UI State
  selectedPeriod: TimePeriod;
  isLoading: boolean;
  error: string | null;

  // Actions
  setClasses: (classes: BlueberryClass[]) => void;
  setSelectedClass: (cls: BlueberryClass | null) => void;
  setStudents: (students: ProcessedStudent[]) => void;
  setClassAnalysis: (analysis: ClassAnalysis | null) => void;
  setSelectedPeriod: (period: TimePeriod) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  classes: [],
  selectedClass: null,
  students: [],
  classAnalysis: null,
  selectedPeriod: 'last_week',
  isLoading: false,
  error: null,

  // Actions
  setClasses: (classes) => set({ classes }),
  setSelectedClass: (cls) => set({ selectedClass: cls }),
  setStudents: (students) => set({ students }),
  setClassAnalysis: (analysis) => set({ classAnalysis: analysis }),
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  clearData: () =>
    set({
      classes: [],
      selectedClass: null,
      students: [],
      classAnalysis: null,
      isLoading: false,
      error: null
    })
}));
