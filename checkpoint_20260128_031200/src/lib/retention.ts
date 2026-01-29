/**
 * Blueberry Math Analyzer 3.0 - Retention Analysis (D+7/D+21)
 *
 * Calculates learning retention based on knowledge components (KCs)
 * following the pedagogical handbook (p.15-18).
 *
 * Retention Metrics:
 * - D+7: KCs still mastered after 7 days
 * - D+21: KCs still mastered after 21 days
 */

import type { ProcessedStudent } from '@/types/blueberry';

export interface RetentionCurve {
  retention_d7: number;      // Percentage of KCs retained at D+7
  retention_d21: number;     // Percentage of KCs retained at D+21
  insight: string;           // Pedagogical insight
  alert: boolean;            // True if retention < 60%
  total_kcs_mastered: number; // Total KCs mastered at D0
}

/**
 * Analyzes retention curve based on students' KC mastery data
 * Formula: Retention = (KCs mastered after N days) / (KCs mastered at D0) * 100
 *
 * @param studentsData - Array of processed students with KC data
 * @returns Retention metrics with insight and alert status
 */
export function analyzeRetentionCurve(studentsData: ProcessedStudent[]): RetentionCurve {
  if (!studentsData || studentsData.length === 0) {
    return {
      retention_d7: 0,
      retention_d21: 0,
      insight: 'Sem dados disponíveis para análise de retenção',
      alert: false,
      total_kcs_mastered: 0
    };
  }

  // Calculate total KCs mastered (D0)
  const totalKCsMastered = studentsData.reduce((sum, student) => {
    return sum + (student.mastered_kcs || 0);
  }, 0);

  // Calculate total KCs forgotten (used as proxy for retention loss)
  const totalKCsForgotten = studentsData.reduce((sum, student) => {
    return sum + (student.forgotten_kcs || 0);
  }, 0);

  if (totalKCsMastered === 0) {
    return {
      retention_d7: 0,
      retention_d21: 0,
      insight: 'Nenhum conhecimento dominado ainda (D0) - aguardando mais dados',
      alert: false,
      total_kcs_mastered: 0
    };
  }

  // Estimate retention rates
  // D+7: Assume 85% of forgotten KCs were forgotten in first 7 days
  const d7Retained = totalKCsMastered - Math.round(totalKCsForgotten * 0.85);
  const retentionD7 = (d7Retained / totalKCsMastered) * 100;

  // D+21: All forgotten KCs are gone
  const d21Retained = totalKCsMastered - totalKCsForgotten;
  const retentionD21 = (d21Retained / totalKCsMastered) * 100;

  // Generate pedagogical insight based on D+7 retention
  const { insight, alert } = generateRetentionInsight(retentionD7);

  return {
    retention_d7: Math.round(retentionD7 * 10) / 10,  // Round to 1 decimal
    retention_d21: Math.round(retentionD21 * 10) / 10,
    insight,
    alert,
    total_kcs_mastered: totalKCsMastered
  };
}

/**
 * Generates pedagogical insight based on retention rate
 * Based on SESI pedagogical handbook guidelines:
 * - ≥60% (D+7) = Meta atingida
 * - 50-59% (D+7) = Atenção — revisão espaçada insuficiente
 * - <50% (D+7) = Crítico — gaps graves identificados
 */
function generateRetentionInsight(retentionD7: number): { insight: string; alert: boolean } {
  if (retentionD7 >= 70) {
    return {
      insight: `Retenção D+7 excelente (${Math.round(retentionD7)}%) — conhecimento consolidado`,
      alert: false
    };
  } else if (retentionD7 >= 60) {
    return {
      insight: `Retenção D+7 dentro da meta (${Math.round(retentionD7)}%) — conhecimento estável`,
      alert: false
    };
  } else if (retentionD7 >= 50) {
    return {
      insight: `Retenção D+7 em atenção (${Math.round(retentionD7)}%) — revisão espaçada insuficiente`,
      alert: true
    };
  } else {
    return {
      insight: `Retenção D+7 crítica (${Math.round(retentionD7)}%) — gaps graves identificados`,
      alert: true
    };
  }
}

/**
 * Calculates average mastery rate across all students
 */
export function calculateAverageMastery(studentsData: ProcessedStudent[]): number {
  if (!studentsData || studentsData.length === 0) {
    return 0;
  }

  const totalMastery = studentsData.reduce((sum, student) => {
    return sum + (student.mastered_kcs || 0);
  }, 0);

  return Math.round((totalMastery / studentsData.length) * 10) / 10;
}

/**
 * Calculates forgetting rate (percentage of mastered KCs that were forgotten)
 */
export function calculateForgettingRate(studentsData: ProcessedStudent[]): number {
  if (!studentsData || studentsData.length === 0) {
    return 0;
  }

  const totalMastered = studentsData.reduce((sum, student) => {
    return sum + (student.mastered_kcs || 0);
  }, 0);

  const totalForgotten = studentsData.reduce((sum, student) => {
    return sum + (student.forgotten_kcs || 0);
  }, 0);

  if (totalMastered === 0) {
    return 0;
  }

  return Math.round((totalForgotten / totalMastered) * 100 * 10) / 10;
}
