/**
 * Blueberry Math Analyzer 3.0 - Traffic Light Classification
 * Implements the SESI Bahia protocol for student intervention classification
 *
 * CRITICAL RULE: Traffic light status is ALWAYS based on 7-day time period,
 * regardless of which time filter the user selects for viewing data.
 */

import type {
  TrafficLightStatus,
  ProcessedStudent,
  StudentAnalysis,
  InterventionPlan,
  StudentMetrics
} from '@/types/blueberry';

/**
 * SESI Bahia Protocol Constants
 * These are the exact thresholds defined in the protocol (Page 4)
 */
const SESI_BAHIA_THRESHOLDS = {
  VERMELHO_MAX_MINUTES: 29, // < 30 minutes
  AMARELO_MIN_MINUTES: 30, // 30-59 minutes
  AMARELO_MAX_MINUTES: 59,
  VERDE_MIN_MINUTES: 60    // >= 60 minutes
} as const;

/**
 * Determines traffic light status based on time spent in LAST 7 DAYS
 * This is the definitive rule from the SESI Bahia protocol
 */
export function determineTrafficLightStatus(
  timeInMinutesLast7Days: number
): TrafficLightStatus {
  if (timeInMinutesLast7Days < SESI_BAHIA_THRESHOLDS.VERMELHO_MAX_MINUTES + 1) {
    return 'VERMELHO';
  }

  if (
    timeInMinutesLast7Days >= SESI_BAHIA_THRESHOLDS.AMARELO_MIN_MINUTES &&
    timeInMinutesLast7Days <= SESI_BAHIA_THRESHOLDS.AMARELO_MAX_MINUTES
  ) {
    return 'AMARELO';
  }

  return 'VERDE';
}

/**
 * Gets intervention plan based on traffic light status
 * According to SESI Bahia protocol (Page 4)
 */
export function getInterventionPlan(status: TrafficLightStatus): InterventionPlan {
  switch (status) {
    case 'VERMELHO':
      return {
        level: 'NIVEL_3',
        action: 'Recuperação guiada',
        duration: '10 minutos/dia por 3 dias',
        focus: '1 microtópico por vez'
      };

    case 'AMARELO':
      return {
        level: 'NIVEL_2',
        action: 'Reforço direcionado',
        duration: 'Conforme necessidade',
        focus: '8 itens do mesmo tipo, meta 6/8 acertos'
      };

    case 'VERDE':
      return {
        level: 'NIVEL_1',
        action: 'Desafio e transferência',
        duration: 'Continuado',
        focus: 'Desafio semanal + bloco de transferência'
      };
  }
}

/**
 * Calculates accuracy percentage
 */
export function calculateAccuracy(
  correct: number,
  total: number
): number {
  if (total === 0) return 0;
  return (correct / total) * 100;
}

/**
 * Creates student metrics object
 */
export function createStudentMetrics(
  timeMinutes: number,
  activities: number,
  correct: number
): StudentMetrics {
  const accuracy = calculateAccuracy(correct, activities);
  const status = determineTrafficLightStatus(timeMinutes);

  return {
    time_minutes: timeMinutes,
    activities: activities,
    accuracy: accuracy,
    status: status
  };
}

/**
 * Creates complete student analysis
 * Note: This uses the 7-day time for traffic light status, regardless of period parameter
 */
export function createStudentAnalysis(
  studentName: string,
  period: string,
  timeMinutes: number,
  activities: number,
  correct: number,
  difficulties: string[]
): StudentAnalysis {
  const metrics = createStudentMetrics(timeMinutes, activities, correct);
  const intervention = getInterventionPlan(metrics.status);

  return {
    student_name: studentName,
    period: period as any,
    metrics: metrics,
    difficulties: difficulties,
    intervention: intervention
  };
}

/**
 * Process raw student data from API
 * Converts Blueberry Math API response to our internal format
 */
export function processStudentData(
  rawStudent: any
): ProcessedStudent {
  // Convert seconds to minutes
  const timeMinutes = (rawStudent.totalTimeInSeconds || 0) / 60;

  // Extract activity data
  const activities = rawStudent.activities || {};
  const correct = activities.ok || 0;
  const incorrect = activities.ko || 0;
  const abandoned = activities.unfinished || 0;
  const total = activities.total || (correct + incorrect + abandoned);

  // Extract difficulties
  const difficulties: string[] = [];
  const needHelpLoPhase = rawStudent.needHelpLoPhase || [];
  for (const item of needHelpLoPhase) {
    if (item.description) {
      difficulties.push(item.description);
    } else if (item.reason) {
      difficulties.push(item.reason);
    }
  }

  // Determine traffic light status (based on time in 7 days)
  const status = determineTrafficLightStatus(timeMinutes);

  // Build student name
  const firstName = rawStudent.name || '';
  const lastName = rawStudent.lastname || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Aluno sem nome';

  return {
    student_id: rawStudent.guid || 'sem-id',
    student_name: fullName,
    time_spent_minutes: parseFloat(timeMinutes.toFixed(2)),
    correct_count: correct,
    incorrect_count: incorrect,
    abandoned_count: abandoned,
    total_activities: total,
    difficulties: difficulties,
    mastered_kcs: rawStudent.masteredKcs || 0,
    forgotten_kcs: rawStudent.forgottenKcs || 0,
    status: status
  };
}

/**
 * Calculates traffic light distribution for a class
 */
export function calculateTrafficLightDistribution(
  students: ProcessedStudent[]
): {
  green_count: number;
  yellow_count: number;
  red_count: number;
  green_percent: number;
  yellow_percent: number;
  red_percent: number;
} {
  const total = students.length;

  if (total === 0) {
    return {
      green_count: 0,
      yellow_count: 0,
      red_count: 0,
      green_percent: 0,
      yellow_percent: 0,
      red_percent: 0
    };
  }

  const green_count = students.filter(s => s.status === 'VERDE').length;
  const yellow_count = students.filter(s => s.status === 'AMARELO').length;
  const red_count = students.filter(s => s.status === 'VERMELHO').length;

  return {
    green_count,
    yellow_count,
    red_count,
    green_percent: (green_count / total) * 100,
    yellow_percent: (yellow_count / total) * 100,
    red_percent: (red_count / total) * 100
  };
}

/**
 * Gets color for traffic light status (for UI rendering)
 */
export function getTrafficLightColor(status: TrafficLightStatus): string {
  switch (status) {
    case 'VERDE':
      return '#22c55e'; // green-500
    case 'AMARELO':
      return '#eab308'; // yellow-500
    case 'VERMELHO':
      return '#ef4444'; // red-500
  }
}

/**
 * Gets background color class for traffic light status
 */
export function getTrafficLightBgClass(status: TrafficLightStatus): string {
  switch (status) {
    case 'VERDE':
      return 'bg-green-500';
    case 'AMARELO':
      return 'bg-yellow-500';
    case 'VERMELHO':
      return 'bg-red-500';
  }
}

/**
 * Gets text color class for traffic light status
 */
export function getTrafficLightTextClass(status: TrafficLightStatus): string {
  switch (status) {
    case 'VERDE':
      return 'text-green-600 dark:text-green-400';
    case 'AMARELO':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'VERMELHO':
      return 'text-red-600 dark:text-red-400';
  }
}

/**
 * Gets border color class for traffic light status
 */
export function getTrafficLightBorderClass(status: TrafficLightStatus): string {
  switch (status) {
    case 'VERDE':
      return 'border-green-500';
    case 'AMARELO':
      return 'border-yellow-500';
    case 'VERMELHO':
      return 'border-red-500';
  }
}

/**
 * Finds critical difficulties across all students
 * Returns difficulties that appear most frequently
 */
export function findCriticalDifficulties(
  students: ProcessedStudent[],
  topN: number = 5
): Array<{ difficulty: string; count: number }> {
  const difficultyCount = new Map<string, number>();

  // Count occurrences
  for (const student of students) {
    for (const difficulty of student.difficulties) {
      const count = difficultyCount.get(difficulty) || 0;
      difficultyCount.set(difficulty, count + 1);
    }
  }

  // Sort by frequency (descending)
  const sorted = Array.from(difficultyCount.entries())
    .map(([difficulty, count]) => ({ difficulty, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);

  return sorted;
}

/**
 * Generates class recommendation based on traffic light distribution
 */
export function generateClassRecommendation(
  greenPercent: number,
  yellowPercent: number,
  redPercent: number
): string {
  if (redPercent > 50) {
    return `Intervenção urgente necessária: ${redPercent.toFixed(0)}% dos alunos em situação crítica (Vermelho)`;
  }

  if (redPercent > 20) {
    return `Recuperação guiada necessária para ${redPercent.toFixed(0)}% dos alunos (Vermelho)`;
  }

  if (yellowPercent > 40) {
    return `Reforço direcionado recomendado para ${yellowPercent.toFixed(0)}% dos alunos (Amarelo)`;
  }

  if (greenPercent > 70) {
    return 'Turma com bom desempenho: manter desafios e monitorar evolução';
  }

  return 'Monitorar indicadores e reforçar práticas consolidadas';
}
