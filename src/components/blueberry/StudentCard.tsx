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

import { User, Clock, CheckCircle, XCircle, AlertTriangle, BookOpen, Brain, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
        return <CheckCircle className="h-4 w-4" />;
      case 'AMARELO':
        return <AlertTriangle className="h-4 w-4" />;
      case 'VERMELHO':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColors = (status: TrafficLightStatus) => {
    switch (status) {
      case 'VERDE':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          iconBg: 'bg-green-100',
          badgeBg: 'bg-green-100',
          badgeText: 'text-green-800'
        };
      case 'AMARELO':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          iconBg: 'bg-amber-100',
          badgeBg: 'bg-amber-100',
          badgeText: 'text-amber-800'
        };
      case 'VERMELHO':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          iconBg: 'bg-red-100',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-800'
        };
    }
  };

  const colors = getStatusColors(student.status);

  return (
    <div
      className={`bg-white border ${colors.border} rounded-lg shadow-sm p-6 border-l-4`}
      style={{ marginBottom: '24px' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-gray-900 truncate" style={{ fontSize: '16px', fontWeight: 700 }}>
              {student.student_name}
            </h4>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              ID: {student.student_id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <Badge
          className={`${colors.badgeBg} ${colors.badgeText} border-0 flex items-center gap-1.5 font-medium`}
        >
          {getStatusIcon(student.status)}
          {student.status}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Time */}
        <div className="text-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Tempo Total</p>
          <p className="text-xl font-bold text-blue-700">
            {student.time_spent_minutes.toFixed(0)}min
          </p>
        </div>

        {/* Activities */}
        <div className="text-center p-3 bg-purple-50 border border-purple-100 rounded-lg">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Atividades</p>
          <p className="text-xl font-bold text-purple-700">
            {student.total_activities}
          </p>
        </div>
      </div>

      {/* Accuracy */}
      {student.total_activities > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Acurácia</span>
            <span className="text-lg font-bold text-gray-900">{accuracy}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <Progress value={parseFloat(accuracy)} className="h-full" />
          </div>
        </div>
      )}

      <Separator className="my-4" />

      {/* Activity Breakdown */}
      {student.total_activities > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-green-50 border border-green-100 rounded-lg">
            <p className="text-xs font-semibold text-green-700 mb-1">Corretas</p>
            <p className="text-lg font-bold text-green-800">
              {student.correct_count}
            </p>
          </div>
          <div className="text-center p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-xs font-semibold text-red-700 mb-1">Incorretas</p>
            <p className="text-lg font-bold text-red-800">
              {student.incorrect_count}
            </p>
          </div>
          <div className="text-center p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs font-semibold text-amber-700 mb-1">Abandonadas</p>
            <p className="text-lg font-bold text-amber-800">
              {student.abandoned_count}
            </p>
          </div>
        </div>
      )}

      {/* KCs */}
      {(student.mastered_kcs > 0 || student.forgotten_kcs > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Brain className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs font-semibold text-blue-700 mb-1">Dominados</p>
            <p className="text-lg font-bold text-blue-800">
              {student.mastered_kcs}
            </p>
          </div>
          <div className="text-center p-3 bg-orange-50 border border-orange-100 rounded-lg">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <RefreshCw className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-xs font-semibold text-orange-700 mb-1">Esquecidos</p>
            <p className="text-lg font-bold text-orange-800">
              {student.forgotten_kcs}
            </p>
          </div>
        </div>
      )}

      {/* Difficulties */}
      {student.difficulties.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">Dificuldades Identificadas</p>
          <div className="flex flex-wrap gap-1.5">
            {student.difficulties.map((difficulty, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-700 bg-white max-w-[200px] truncate">
                      {difficulty}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm text-gray-900">{difficulty}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

      {/* Intervention Plan */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-sm font-bold text-blue-800" style={{ fontWeight: 600 }}>
            Intervenção Recomendada
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-xs font-medium text-blue-700">Nível:</span>
            <span className="text-xs text-blue-900 ml-1">{intervention.level}</span>
          </div>
          <div>
            <span className="text-xs font-medium text-blue-700">Duração:</span>
            <span className="text-xs text-blue-900 ml-1">{intervention.duration}</span>
          </div>
          <div className="col-span-2">
            <span className="text-xs font-medium text-blue-700">Ação:</span>
            <span className="text-xs text-blue-900 ml-1">{intervention.action}</span>
          </div>
          <div className="col-span-2">
            <span className="text-xs font-medium text-blue-700">Foco:</span>
            <span className="text-xs text-blue-900 ml-1">{intervention.focus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
