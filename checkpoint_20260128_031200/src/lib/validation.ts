/**
 * Blueberry Math Analyzer 3.0 - Data Validation Utilities
 * Ensures mathematical accuracy and data integrity according to specifications
 */

import type { ProcessedStudent, ClassMetrics, ValidationResult, TrafficLightStatus } from '@/types/blueberry';

/**
 * Validates average calculation according to mathematical rules
 * CRITICAL: Must include ALL students in calculation, even those with 0 activities
 */
export function validateAverage(
  totalActivities: number,
  totalStudents: number,
  calculatedAverage: number
): ValidationResult {
  // Validation 1: Class must have students
  if (totalStudents === 0) {
    return {
      isValid: false,
      error: 'Turma sem alunos - não é possível calcular média'
    };
  }

  // Validation 2: If there are activities, average cannot be zero
  if (totalActivities > 0 && calculatedAverage === 0) {
    return {
      isValid: false,
      error: 'Média não pode ser zero quando existem atividades registradas'
    };
  }

  // Validation 3: Calculate expected average and compare
  const expectedAverage = totalActivities / totalStudents;
  const difference = Math.abs(calculatedAverage - expectedAverage);

  // Allow small tolerance for rounding (0.01)
  if (difference > 0.01) {
    return {
      isValid: false,
      error: `Inconsistência matemática: média calculada (${calculatedAverage.toFixed(2)}) ≠ média esperada (${expectedAverage.toFixed(2)})`
    };
  }

  return { isValid: true };
}

/**
 * Calculates class average including ALL students (even those with 0 activities)
 * This is the irrefutable mathematical rule as specified in requirements
 */
export function calculateClassAverage(
  students: ProcessedStudent[],
  activityKey: keyof ProcessedStudent = 'total_activities'
): number {
  if (students.length === 0) {
    return 0;
  }

  const totalActivities = students.reduce(
    (sum, student) => sum + (student[activityKey] as number),
    0
  );

  const average = totalActivities / students.length;

  // Validate the calculation
  const validation = validateAverage(totalActivities, students.length, average);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  return average;
}

/**
 * Validates time data consistency
 */
export function validateTimeData(
  timeMinutes: number,
  activities: number
): ValidationResult {
  if (timeMinutes < 0) {
    return {
      isValid: false,
      error: 'Tempo não pode ser negativo'
    };
  }

  if (activities < 0) {
    return {
      isValid: false,
      error: 'Número de atividades não pode ser negativo'
    };
  }

  // If there are activities, time should ideally be > 0 (though could be very fast)
  if (activities > 0 && timeMinutes === 0) {
    return {
      isValid: false,
      error: 'Atividades registradas mas tempo igual a zero - dados inconsistentes'
    };
  }

  return { isValid: true };
}

/**
 * Validates activity count accuracy
 */
export function validateActivityCount(
  correct: number,
  incorrect: number,
  abandoned: number,
  total: number
): ValidationResult {
  if (correct < 0 || incorrect < 0 || abandoned < 0 || total < 0) {
    return {
      isValid: false,
      error: 'Valores de atividades não podem ser negativos'
    };
  }

  const calculatedTotal = correct + incorrect + abandoned;

  if (total !== calculatedTotal) {
    return {
      isValid: false,
      error: `Inconsistência: total (${total}) ≠ soma (${correct} + ${incorrect} + ${abandoned} = ${calculatedTotal})`
    };
  }

  return { isValid: true };
}

/**
 * Validates accuracy percentage
 */
export function validateAccuracy(
  correct: number,
  total: number,
  accuracyPercent: number
): ValidationResult {
  if (total === 0) {
    return {
      isValid: true // No activities means accuracy is undefined, which is fine
    };
  }

  const expectedAccuracy = (correct / total) * 100;
  const difference = Math.abs(accuracyPercent - expectedAccuracy);

  // Allow tolerance of 0.01 for rounding
  if (difference > 0.01) {
    return {
      isValid: false,
      error: `Inconsistência: acurácia calculada (${accuracyPercent.toFixed(2)}%) ≠ esperada (${expectedAccuracy.toFixed(2)}%)`
    };
  }

  return { isValid: true };
}

/**
 * Validates traffic light distribution sums to 100%
 */
export function validateTrafficLightDistribution(
  greenPercent: number,
  yellowPercent: number,
  redPercent: number
): ValidationResult {
  const total = greenPercent + yellowPercent + redPercent;
  const difference = Math.abs(total - 100);

  // Allow tolerance of 0.01 for rounding
  if (difference > 0.01) {
    return {
      isValid: false,
      error: `Distribuição de semáforo não soma 100%: ${total.toFixed(2)}%`
    };
  }

  if (greenPercent < 0 || yellowPercent < 0 || redPercent < 0) {
    return {
      isValid: false,
      error: 'Porcentagens não podem ser negativas'
    };
  }

  if (greenPercent > 100 || yellowPercent > 100 || redPercent > 100) {
    return {
      isValid: false,
      error: 'Porcentagens não podem exceder 100%'
    };
  }

  return { isValid: true };
}

/**
 * Validates adherence percentage calculation
 */
export function validateAdherence(
  studentsWithTarget: number,
  totalStudents: number,
  adherencePercent: number
): ValidationResult {
  if (totalStudents === 0) {
    return {
      isValid: false,
      error: 'Turma sem alunos - não é possível calcular adesão'
    };
  }

  const expectedAdherence = (studentsWithTarget / totalStudents) * 100;
  const difference = Math.abs(adherencePercent - expectedAdherence);

  // Allow tolerance of 0.01 for rounding
  if (difference > 0.01) {
    return {
      isValid: false,
      error: `Inconsistência na adesão: calculada (${adherencePercent.toFixed(2)}%) ≠ esperada (${expectedAdherence.toFixed(2)}%)`
    };
  }

  return { isValid: true };
}

/**
 * Complete validation for class metrics
 */
export function validateClassMetrics(
  students: ProcessedStudent[],
  metrics: ClassMetrics
): ValidationResult {
  // Validate average activities
  const avgActivitiesValidation = validateAverage(
    students.reduce((sum, s) => sum + s.total_activities, 0),
    students.length,
    metrics.avg_activities
  );
  if (!avgActivitiesValidation.isValid) {
    return avgActivitiesValidation;
  }

  // Validate average time
  const avgTimeValidation = validateAverage(
    students.reduce((sum, s) => sum + s.time_spent_minutes, 0),
    students.length,
    metrics.avg_time_minutes
  );
  if (!avgTimeValidation.isValid) {
    return avgTimeValidation;
  }

  // Calculate adherence (students with >= 60 minutes in last 7 days)
  const studentsWithTargetTime = students.filter(s => s.time_spent_minutes >= 60).length;
  const adherenceValidation = validateAdherence(
    studentsWithTargetTime,
    students.length,
    metrics.adherence_percent
  );
  if (!adherenceValidation.isValid) {
    return adherenceValidation;
  }

  return { isValid: true };
}

/**
 * Validates that all required fields are present in student data
 */
export function validateStudentData(student: Partial<ProcessedStudent>): ValidationResult {
  if (!student.student_id || student.student_id === 'sem-id') {
    return {
      isValid: false,
      error: 'Estudante sem ID válido'
    };
  }

  if (!student.student_name || student.student_name.trim() === '') {
    return {
      isValid: false,
      error: 'Estudante sem nome'
    };
  }

  // Validate activity counts
  const activityValidation = validateActivityCount(
    student.correct_count ?? 0,
    student.incorrect_count ?? 0,
    student.abandoned_count ?? 0,
    student.total_activities ?? 0
  );
  if (!activityValidation.isValid) {
    return activityValidation;
  }

  // Validate time
  const timeValidation = validateTimeData(
    student.time_spent_minutes ?? 0,
    student.total_activities ?? 0
  );
  if (!timeValidation.isValid) {
    return timeValidation;
  }

  return { isValid: true };
}

/**
 * Validates the entire class dataset before display
 * This is the gatekeeper function that prevents inconsistent data from being shown
 */
export function validateClassDataset(
  students: ProcessedStudent[]
): ValidationResult {
  if (students.length === 0) {
    return {
      isValid: false,
      error: 'Nenhum aluno encontrado na turma'
    };
  }

  // Validate each student
  for (const student of students) {
    const validation = validateStudentData(student);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `Erro no aluno ${student.student_name}: ${validation.error}`
      };
    }
  }

  return { isValid: true };
}
