/**
 * Blueberry Math Analyzer 3.0 - Class Collective Analysis Dashboard
 *
 * Displays collective class metrics including:
 * - Average activities and time per student
 * - Adherence percentage
 * - Traffic light distribution
 * - Critical difficulties across the class
 * - Overall recommendations
 */

'use client';

import { Users, Clock, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useAppStore } from '@/store/app';
import {
  findCriticalDifficulties,
  generateClassRecommendation,
  calculateTrafficLightDistribution
} from '@/lib/traffic-light';
import type { ClassAnalysis } from '@/types/blueberry';

export function ClassDashboard() {
  const { classAnalysis, students } = useAppStore();

  if (!classAnalysis || !students || students.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            Selecione uma turma para ver a análise coletiva
          </p>
        </CardContent>
      </Card>
    );
  }

  const distribution = calculateTrafficLightDistribution(students);
  const criticalDifficulties = findCriticalDifficulties(students, 5);

  return (
    <div className="space-y-4">
      {/* Class Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{classAnalysis.class_name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Análise do período: {classAnalysis.period}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              <Users className="h-3 w-3 mr-1" />
              {classAnalysis.total_students} alunos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Recommendation */}
          <div
            className={`p-4 rounded-lg ${
              distribution.red_percent > 50
                ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900'
                : distribution.yellow_percent > 40
                  ? 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900'
                  : 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900'
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Recomendação:</p>
                <p className="text-sm mt-1">{classAnalysis.recommendation}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Average Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Média de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{classAnalysis.metrics.avg_activities.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Atividades por aluno</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-2 bg-muted rounded-full overflow-hidden cursor-help">
                      <Progress
                        value={Math.min(classAnalysis.metrics.avg_activities * 10, 100)}
                        className="h-full"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      Cálculo: total de atividades ({students.reduce((sum, s) => sum + s.total_activities, 0)}) ÷
                      total de alunos ({students.length})
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Average Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Tempo Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{classAnalysis.metrics.avg_time_minutes.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Minutos por aluno</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-2 bg-muted rounded-full overflow-hidden cursor-help">
                      <Progress
                        value={Math.min(classAnalysis.metrics.avg_time_minutes, 100)}
                        className="h-full"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      Cálculo: tempo total ({students.reduce((sum, s) => sum + s.time_spent_minutes, 0).toFixed(0)} min) ÷
                      total de alunos ({students.length})
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Adherence */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Adesão (≥60 min)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{classAnalysis.metrics.adherence_percent.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(distribution.green_count)} de {classAnalysis.total_students} alunos
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <Progress
                  value={classAnalysis.metrics.adherence_percent}
                  className="h-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Light Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="h-4 rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 transition-all duration-300"
                style={{ width: `${distribution.green_percent}%` }}
                title={`Verde: ${distribution.green_count} alunos (${distribution.green_percent.toFixed(1)}%)`}
              />
              <div
                className="bg-yellow-500 transition-all duration-300"
                style={{ width: `${distribution.yellow_percent}%` }}
                title={`Amarelo: ${distribution.yellow_count} alunos (${distribution.yellow_percent.toFixed(1)}%)`}
              />
              <div
                className="bg-red-500 transition-all duration-300"
                style={{ width: `${distribution.red_percent}%` }}
                title={`Vermelho: ${distribution.red_count} alunos (${distribution.red_percent.toFixed(1)}%)`}
              />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">VERDE</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {distribution.green_count}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {distribution.green_percent.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">AMARELO</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {distribution.yellow_count}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  {distribution.yellow_percent.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">VERMELHO</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {distribution.red_count}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {distribution.red_percent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Difficulties */}
      {criticalDifficulties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dificuldades Mais Frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalDifficulties.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm font-medium truncate">{item.difficulty}</span>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {item.count} aluno{item.count !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
