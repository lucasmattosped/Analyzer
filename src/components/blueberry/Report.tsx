/**
 * Blueberry Math Analyzer 3.0 - Monthly Report
 *
 * Displays comprehensive monthly report including:
 * - Engagement metrics
 * - Learning outcomes
 * - Critical difficulties
 * - Traffic light distribution
 * - Recommended actions
 * - Responsibility info
 */

'use client';

import { Users, Clock, BookOpen, TrendingUp, AlertTriangle, CheckCircle, XCircle, Target, User, Calendar, FileText } from 'lucide-react';

interface ReportProps {
  schoolName: string;
  className: string;
  month: string;
  year: string;
  data: {
    activeStudents: number;
    totalStudents: number;
    studentsAbove60min: number;
    averageMinutes: number;
    currentMastery: number;
    masteryChange: number;
    retentionRate: number;
    commonDifficulties: { description: string; percentage: number }[];
    greenPercent: number;
    yellowPercent: number;
    redPercent: number;
    teacherName: string;
  };
}

export function Report({ schoolName, className, month, year, data }: ReportProps) {
  // Funções auxiliares para recomendações
  const getRecommendedAction = (data: any): string => {
    const redPercent = data.redPercent;
    const adherence = data.studentsAbove60min / data.totalStudents;

    if (redPercent > 30 || adherence < 0.5) {
      return 'Realizar ritual de 5 min focado em microtópico crítico';
    } else if (data.currentMastery < 70 && adherence >= 0.7) {
      return 'Reforço conceitual no tema da semana';
    } else {
      return 'Manter rotina e monitorar evolução';
    }
  };

  const getTargetAudience = (data: any): string => {
    const redPercent = data.redPercent;

    if (redPercent > 30) {
      return `Alunos vermelhos (${data.redPercent.toFixed(0)}%)`;
    } else {
      return 'Turma completa';
    }
  };

  const getGoal = (data: any): string => {
    const redPercent = data.redPercent;

    if (redPercent > 30) {
      return 'Reduzir vermelhos para <20%';
    } else if (data.currentMastery < 70) {
      return 'Atingir ≥75% de domínio';
    } else {
      return 'Consolidar ganhos e identificar novas oportunidades';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900" style={{ fontSize: '18px', fontWeight: 700 }}>
              Relatório Mensal
            </h3>
            <p className="text-sm text-gray-600" style={{ fontSize: '13px', fontWeight: 400 }}>
              Período analisado: Último mês
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Escola</p>
            <p className="text-sm font-bold text-blue-700">{schoolName}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Turma</p>
            <p className="text-sm font-bold text-purple-700">{className}</p>
          </div>
          <div className="text-center p-4 bg-green-50 border border-green-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Período</p>
            <p className="text-sm font-bold text-green-700">{month}/{year}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Data de atualização:</p>
            <p className="text-sm font-semibold text-gray-900">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Responsável:</p>
            <p className="text-sm font-semibold text-gray-900">{data.teacherName}</p>
          </div>
        </div>
      </div>

      {/* Seção A - ADESÃO */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">ADESÃO (Engajamento)</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Alunos Ativos</p>
            <p className="text-2xl font-bold text-blue-700">
              {data.activeStudents}/{data.totalStudents}
            </p>
            <p className="text-xs text-green-600 font-medium">
              {((data.activeStudents/data.totalStudents)*100).toFixed(1)}%
            </p>
          </div>

          <div className="text-center p-4 bg-green-50 border border-green-100 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Com ≥60min</p>
            <p className="text-2xl font-bold text-green-700">
              {data.studentsAbove60min}/{data.totalStudents}
            </p>
            <p className="text-xs text-green-600 font-medium">
              {((data.studentsAbove60min/data.totalStudents)*100).toFixed(1)}%
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Tempo Médio</p>
            <p className="text-2xl font-bold text-purple-700">
              {data.averageMinutes.toFixed(1)}min
            </p>
            <p className="text-xs text-gray-600">Por aluno</p>
          </div>
        </div>
      </div>

      {/* Seção B - APRENDIZAGEM */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">APRENDIZAGEM (Resultado)</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 border border-green-100 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Domínio Médio</p>
            <p className="text-2xl font-bold text-green-700">
              {data.currentMastery.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600">Do tema</p>
          </div>

          <div className="text-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className={`w-5 h-5 ${data.masteryChange >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <p className="text-xs text-gray-600 mb-1">Evolução</p>
            <p className="text-2xl font-bold text-blue-700">
              {data.masteryChange >= 0 ? '+' : ''}{data.masteryChange.toFixed(1)} pp
            </p>
            <p className={`text-xs font-medium ${data.masteryChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.masteryChange >= 0 ? 'Positiva' : 'Negativa'}
            </p>
          </div>

          <div className="text-center p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Retenção</p>
            <p className="text-2xl font-bold text-amber-700">
              {data.retentionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600">D+7/D+21</p>
          </div>
        </div>
      </div>

      {/* Seção C - PONTOS DE ATENÇÃO */}
      {data.commonDifficulties.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
            <div className="w-8 h-8 bg-amber-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900">PONTOS DE ATENÇÃO (Top 3 Fragilidades)</h4>
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
                {data.commonDifficulties.slice(0, 3).map((diff, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-500">{i + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{diff.description}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
                        {diff.percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seção D - SEMÁFORO DA TURMA */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">SEMÁFORO DA TURMA</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xs font-semibold text-green-800 mb-1">VERDE</p>
            <p className="text-2xl font-bold text-green-800">
              {data.greenPercent.toFixed(0)}%
            </p>
            <p className="text-sm font-medium text-green-700">Rotina consolidada</p>
          </div>

          <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-xs font-semibold text-amber-800 mb-1">AMARELO</p>
            <p className="text-2xl font-bold text-amber-800">
              {data.yellowPercent.toFixed(0)}%
            </p>
            <p className="text-sm font-medium text-amber-700">Sinal de alerta</p>
          </div>

          <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-xs font-semibold text-red-800 mb-1">VERMELHO</p>
            <p className="text-2xl font-bold text-red-800">
              {data.redPercent.toFixed(0)}%
            </p>
            <p className="text-sm font-medium text-red-700">Crítico — intervenção</p>
          </div>
        </div>
      </div>

      {/* Seção E - AÇÃO RECOMENDADA */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">AÇÃO RECOMENDADA</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-blue-700">Ação</p>
            </div>
            <p className="text-base text-gray-900">{getRecommendedAction(data)}</p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-semibold text-purple-700">Público-alvo</p>
            </div>
            <p className="text-base text-gray-900">{getTargetAudience(data)}</p>
          </div>

          <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-green-700">Meta</p>
            </div>
            <p className="text-base text-gray-900">{getGoal(data)}</p>
          </div>
        </div>
      </div>

      {/* Seção F - RESPONSABILIDADE */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">RESPONSABILIDADE</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-blue-700">Responsável</p>
            </div>
            <p className="text-base text-gray-900">{data.teacherName}</p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-semibold text-purple-700">Data de Envio</p>
            </div>
            <p className="text-base text-gray-900">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
