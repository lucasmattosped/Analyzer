/**
 * Blueberry Math Analyzer 3.0 - Class Collective Analysis Dashboard
 *
 * Displays collective class metrics including:
 * - Average activities and time per student
 * - Adherence percentage
 * - Traffic light distribution
 * - Critical difficulties across class
 * - Overall recommendations
 */

'use client';

import { Users, Clock, BookOpen, TrendingUp, AlertCircle, CheckCircle, XCircle, Target, AlertTriangle } from 'lucide-react';
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
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              Selecione uma turma para ver a análise coletiva
            </p>
          </div>
        </div>
      </div>
    );
  }

  const distribution = calculateTrafficLightDistribution(students);
  const criticalDifficulties = findCriticalDifficulties(students, 5);

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900" style={{ fontSize: '18px', fontWeight: 600 }}>
                {classAnalysis.class_name}
              </h3>
              <p className="text-sm text-gray-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                Análise do período: {classAnalysis.period}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="border-blue-300 bg-blue-50 text-blue-700 font-medium"
          >
            <Users className="h-3 w-3 mr-1" />
            {classAnalysis.total_students} alunos
          </Badge>
        </div>

        {/* Recommendation */}
        <div
          className={`p-4 rounded-lg border ${
            distribution.red_percent > 50
              ? 'bg-red-50 border-red-200'
              : distribution.yellow_percent > 40
                ? 'bg-amber-50 border-amber-200'
                : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              distribution.red_percent > 50
                ? 'bg-red-100'
                : distribution.yellow_percent > 40
                  ? 'bg-amber-100'
                  : 'bg-green-100'
            }`}>
              <Target className={`h-4 w-4 ${
                distribution.red_percent > 50
                  ? 'text-red-600'
                  : distribution.yellow_percent > 40
                    ? 'text-amber-600'
                    : 'text-green-600'
              }`} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900 mb-1">Recomendação:</p>
              <p className="text-sm text-gray-700" style={{ fontSize: '14px', fontWeight: 400 }}>
                {classAnalysis.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Métricas Gerais</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Average Activities */}
          <div className="text-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Média de Atividades</p>
            <p className="text-2xl font-bold text-blue-700">
              {classAnalysis.metrics.avg_activities.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Por aluno</p>
          </div>

          {/* Average Time */}
          <div className="text-center p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Tempo Médio</p>
            <p className="text-2xl font-bold text-purple-700">
              {classAnalysis.metrics.avg_time_minutes.toFixed(1)}min
            </p>
            <p className="text-xs text-gray-500">Por aluno</p>
          </div>

          {/* Adherence */}
          <div className="text-center p-4 bg-green-50 border border-green-100 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Adesão (≥60 min)</p>
            <p className="text-2xl font-bold text-green-700">
              {classAnalysis.metrics.adherence_percent.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">
              {Math.round(students.filter(s => s.time_spent_minutes >= 60).length)} de {classAnalysis.total_students}
            </p>
          </div>
        </div>
      </div>

      {/* Traffic Light Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Semáforo da Turma</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Green */}
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xs font-semibold text-green-800 mb-1">VERDE</p>
            <p className="text-2xl font-bold text-green-800">
              {distribution.green_count}
            </p>
            <p className="text-sm font-medium text-green-700">
              {distribution.green_percent.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600 mt-1">Rotina consolidada</p>
          </div>

          {/* Yellow */}
          <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-xs font-semibold text-amber-800 mb-1">AMARELO</p>
            <p className="text-2xl font-bold text-amber-800">
              {distribution.yellow_count}
            </p>
            <p className="text-sm font-medium text-amber-700">
              {distribution.yellow_percent.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600 mt-1">Sinal de alerta</p>
          </div>

          {/* Red */}
          <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-xs font-semibold text-red-800 mb-1">VERMELHO</p>
            <p className="text-2xl font-bold text-red-800">
              {distribution.red_count}
            </p>
            <p className="text-sm font-medium text-red-700">
              {distribution.red_percent.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600 mt-1">Crítico — intervenção</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-6 rounded-full overflow-hidden flex cursor-help border border-gray-200">
                  <div
                    className="bg-green-500 hover:bg-green-600 transition-colors"
                    style={{ width: `${distribution.green_percent}%` }}
                  />
                  <div
                    className="bg-amber-500 hover:bg-amber-600 transition-colors"
                    style={{ width: `${distribution.yellow_percent}%` }}
                  />
                  <div
                    className="bg-red-500 hover:bg-red-600 transition-colors"
                    style={{ width: `${distribution.red_percent}%` }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-sm">
                  <p className="text-green-700">Verde: {distribution.green_count} alunos ({distribution.green_percent.toFixed(1)}%)</p>
                  <p className="text-amber-700">Amarelo: {distribution.yellow_count} alunos ({distribution.yellow_percent.toFixed(1)}%)</p>
                  <p className="text-red-700">Vermelho: {distribution.red_count} alunos ({distribution.red_percent.toFixed(1)}%)</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Critical Difficulties */}
      {criticalDifficulties.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Dificuldades Mais Frequentes</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">#</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Dificuldade</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Alunos</th>
                </tr>
              </thead>
              <tbody>
                {criticalDifficulties.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-gray-500">{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{item.difficulty}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline" className="border-gray-300 text-gray-700">
                        {item.count} aluno{item.count !== 1 ? 's' : ''}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
