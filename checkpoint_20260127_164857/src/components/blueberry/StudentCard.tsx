/**
 * Blueberry Math Analyzer 3.0 - Student Individual Analysis Card
 *
 * Displays individual student data including:
 * - Traffic light status (based on 7-day time period)
 * - Time spent, activities completed
 * - Accuracy metrics
 * - Difficulties identified
 * - Intervention recommendations
 */

'use client';

import { User, Clock, CheckCircle, XCircle, AlertTriangle, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import type { ProcessedStudent, TrafficLightStatus } from '@/types/blueberry';
import {
  getTrafficLightBgClass,
  getTrafficLightTextClass,
  getTrafficLightBorderClass,
  getInterventionPlan
} from '@/lib/traffic-light';

interface StudentCardProps {
  student: ProcessedStudent;
}

export function StudentCard({ student }: StudentCardProps) {
  const intervention = getInterventionPlan(student.status);
  const accuracy =
    student.total_activities > 0
      ? ((student.correct_count / student.total_activities) * 100).toFixed(1)
      : '0.0';

  const getStatusIcon = (status: TrafficLightStatus) => {
    switch (status) {
      case 'VERDE':
        return <CheckCircle className="h-5 w-5" />;
      case 'AMARELO':
        return <AlertTriangle className="h-5 w-5" />;
      case 'VERMELHO':
        return <XCircle className="h-5 w-5" />;
    }
  };

  return (
    <Card
      className={`w-full ${getTrafficLightBorderClass(student.status)} border-l-4`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{student.student_name}</CardTitle>
              <p className="text-xs text-muted-foreground font-mono">
                ID: {student.student_id.slice(0, 8)}...
              </p>
            </div>
          </div>
          <Badge
            className={`${getTrafficLightBgClass(student.status)} ${getTrafficLightTextClass(
              student.status
            )} flex items-center gap-1`}
          >
            {getStatusIcon(student.status)}
            {student.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time and Activities */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Tempo Total
            </div>
            <p className="text-lg font-semibold">{student.time_spent_minutes.toFixed(0)} min</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              Atividades
            </div>
            <p className="text-lg font-semibold">{student.total_activities}</p>
          </div>
        </div>

        {/* Accuracy */}
        {student.total_activities > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Acurácia</span>
              <span className="font-semibold">{accuracy}%</span>
            </div>
            <Progress value={parseFloat(accuracy)} className="h-2" />
          </div>
        )}

        <Separator />

        {/* Activity Breakdown */}
        {student.total_activities > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-xs text-green-600 dark:text-green-400">Corretas</p>
              <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                {student.correct_count}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
              <p className="text-xs text-red-600 dark:text-red-400">Incorretas</p>
              <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                {student.incorrect_count}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Abandonadas</p>
              <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
                {student.abandoned_count}
              </p>
            </div>
          </div>
        )}

        {/* KCs */}
        {(student.mastered_kcs > 0 || student.forgotten_kcs > 0) && (
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <p className="text-xs text-blue-600 dark:text-blue-400">Dominados</p>
              <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                {student.mastered_kcs}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <p className="text-xs text-orange-600 dark:text-orange-400">Esquecidos</p>
              <p className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                {student.forgotten_kcs}
              </p>
            </div>
          </div>
        )}

        {/* Difficulties */}
        {student.difficulties.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Dificuldades Identificadas</p>
            <div className="flex flex-wrap gap-1.5">
              {student.difficulties.map((difficulty, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs max-w-[200px] truncate">
                        {difficulty}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{difficulty}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}

        {/* Intervention Plan */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 space-y-2">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Intervenção Recomendada
          </p>
          <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
            <p>
              <span className="font-medium">Nível:</span> {intervention.level}
            </p>
            <p>
              <span className="font-medium">Ação:</span> {intervention.action}
            </p>
            <p>
              <span className="font-medium">Duração:</span> {intervention.duration}
            </p>
            <p>
              <span className="font-medium">Foco:</span> {intervention.focus}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
