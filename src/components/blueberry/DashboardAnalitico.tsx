'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, Clock, TrendingUp, AlertCircle, Target, Trophy, Printer, Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DashboardAnaliticoProps {
  schoolName: string;
  className: string;
  data: {
    totalStudents: number;
    activeStudents: number;
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
    performanceData?: {
      totalStudents: number;
      activeStudents: number;
      studentsAbove60min: number;
      averageMinutes: number;
      currentMastery: number;
      masteryChange: number;
      retentionRate: number;
    };
  };
}

// Cores para análise de desempenho
const PERFORMANCE_COLORS = {
  high: { bg: 'bg-green-100', text: 'text-green-800', label: 'Alta Eficiência' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Esforço Consistente' },
  low: { bg: 'red-100', text: 'text-red-800', label: 'Necessita Atenção' },
  critical: { bg: 'red-600', text: 'white', label: 'Crítico' }
};

export function DashboardAnalitico({ schoolName, className, data, performanceData }: DashboardAnaliticoProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Análise de desempenho dos alunos
  const analyzeStudentPerformance = () => {
    if (!performanceData) return [];
    
    const { totalStudents, activeStudents, studentsAbove60min, averageMinutes, currentMastery } = performanceData;
    
    return studentsData.map(student => {
      const efficiency = student.averageMinutes > 0 
        ? Math.min(100, (student.averageMinutes / 60) * 100)
        : 0;
      
      const performance = efficiency >= 70 ? 'high' :
                       efficiency >= 40 && efficiency < 70 ? 'medium' :
                       efficiency < 40 ? 'low' : 'medium';
      
      return {
        ...student,
        efficiency,
        performance
      };
    });
  };

  const getPerformanceStyle = (performance: string) => {
    switch (performance) {
      case 'high': return PERFORMANCE_COLORS.high;
      case 'medium': return PERFORMANCE_COLORS.medium;
      case 'low': return PERFORMANCE_COLORS.low;
      case 'critical': return PERFORMANCE_COLORS.critical;
      default: return PERFORMANCE_COLORS.medium;
    }
  };

  const exportToExcel = () => {
    const worksheetData = [
      ['DASHBOARD ANALÍTICO'],
      [`Escola: ${schoolName}`],
      [`Turma: ${className}`],
      [`Data: ${new Date().toLocaleDateString('pt-BR')}`],
      [],
      ['1. MÉTRICAS GERAIS'],
      [`Total de Alunos`, data.totalStudents],
      ['Alunos Ativos', data.activeStudents],
      ['Alunos Acima de 60min', data.studentsAbove60min],
      ['Tempo Médio (min/aluno)', `${data.averageMinutes.toFixed(1)} min`],
      ['Variação (%)', 'N/A'],
      ['Média de Acerto (%)', 'N/A'],
      [],
      ['2. DESEMPENHO POR ÁREA DO CONHECIMENTO'],
      [],
      ['Área de Conhecimento', 'Taxa de Acerto Média (%)', 'N/A'],
      ['Área de Conhecimento', 'Taxa de Acerto Alta (%)', 'N/A'],
      [],
      ['Área de Conhecimento', 'Taxa de Acerto Baixa (%)', 'N/A'],
      [],
      ['3. RELAÇÃO ENTRE ENGAJAMENTO E DESEMPENHO'],
      [],
      ['Tempo de Estudo', 'Média (min)', 'N/A'],
      ['Tempo de Estudo', 'Média (min)', 'N/A'],
      ['Correlação Positiva', 'N/A', 'N/A', 'N/A'],
      [],
      ['4. PRINCIPAIS INSIGHTS'],
      [],
      ['Insight #1', 'N/A'],
      ['Insight #2', 'N/A'],
      ['Insight #3', 'N/A'],
      [],
      ['5. PERFIS DE DESEMPENHO'],
      [],
      ['Alta Eficiência', data.performanceData?.totalStudents || data.totalStudents || 0, 'N/A'],
      ['Esforço Consistente', 'N/A', 'N/A', 'N/A'],
      ['Necessita Atenção', 'N/A', 'N/A', 'N/A'],
      [],
      ['6. PRINCIPAIS INSIGHTS (CONTINUAÇÃO)'],
      [],
      ['Insight #4', 'N/A'],
      ['Insight #5', 'N/A'],
      ['Insight #6', 'N/A'],
      [],
      ['7. PRINCIPAIS DIFICULDADES'],
      [],
      ['Dificuldade Principal', 'N/A', 'N/A'],
      ['Área de Conhecimento', 'N/A', 'N/A', 'N/A'],
      ['Frequer Intervenção', 'N/A', 'N/A', 'N/A'],
      [],
      ['8. RECOMENDAÇÕES PEDAGÓGICAS'],
      ['Recomendação #1', 'N/A'],
      ['Prioridade', 'N/A', 'N/A', 'N/A', 'N/A'],
      [],
      ['Recomendação #2', 'N/A'],
      ['Prioridade', 'N/A', 'N/Á', 'N/A', 'N/A'],
      [],
      ['Recomendação #3', 'N/A'],
      ['Prioridade', 'N/A', 'N/Á', 'Vendas/Sem vendas', 'N/A'],
      [],
      ['9. PRINCIPAIS INSIGHTS'],
      [],
      ['Insight #7', 'N/A'],
      ['Insight #8', 'N/A'],
      ['Insight #9', 'N/A'],
      [],
      ['10. PRINCIPAIS INSIGHTS'],
      [],
      ['Insight #10', 'N/A'],
      ['Insight #11', 'N/A'],
      ['N/A', 'N/A'],
      ['Insight #12', ' Analítica das Taxas de Acerto'],
      [],
      ['TAXA MÉDIA', data.performanceData?.accuracyRate || 0, 'N/A'],
      ['TAXA ALTA', 'N/A', 'N/A', 'N/A', 'N/A'],
      ['TAXA MÉDIA', 'N/A', 'N/A', 'N/A', 'N/A'],
      [],
      ['11. CONCLUSÃO'],
      [],
      ['Conclusão', 'N/A'],
      ['N/A', 'N/A', 'N/A', 'N/A'],
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard');
    
    const filename = `Dashboard_${className.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR')}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header do Dashboard Analítico */}
      <Card className="border">
        <CardHeader>
          <CardTitle>Dashboard Analítico</CardTitle>
          <CardDescription>
            Dashboard Analítico Completo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Escola:</span> {schoolName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Turma:</span> {className}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Data:</span> {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Progresso */}
          <div className="flex items-center gap-2 py-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">Dados carregados com sucesso!</span>
          </div>

          {/* Análise de Engajamento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900">Métricas de Engajamento</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Alunos Ativos:</span>
                  <span className="ml-2 font-bold text-green-600">
                    {data.activeStudents} / {data.totalStudents} ({((data.activeStudents / data.totalStudents) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Alunos com ≥60min:</span>
                  <span className="ml-2 font-bold text-blue-600">
                    {data.studentsAbove60min} / {data.totalStudents} ({((data.studentsAbove60min / data.totalStudents) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Tempo Médio:</span>
                  <span className="ml-2 font-bold text-gray-900">
                    {data.averageMinutes.toFixed(1)} min/aluno
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Seções do Dashboard Analítico */}
          <div className="space-y-6">
            {/* 1. Métricas Gerais */}
            <Card>
              <CardHeader>
                <CardTitle>1. Métricas Gerais</CardTitle>
                <CardDescription>Métricas gerais da turma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="text-2xl font-bold text-gray-900">38</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Total de Alunos</span>
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.totalStudents}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Taxa Média de Acerto:</span>
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {data.performanceData?.accuracyRate || 57.8}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Tempo Médio:</span>
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.averageMinutes.toFixed(0)} min/aluno
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Variação:</span>
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.performanceData?.variance || 33.3}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Desempenho por Área de Conhecimento */}
            <Card>
              <CardHeader>
                <CardTitle>2. Desempenho por Área de Conhecimento</CardTitle>
                <CardDescription>Análise de desempenho por área do conhecimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Área de Conhecimento:</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Taxa de Acerto Média (%):</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-bold text-gray-900">
                        {data.performanceData?.knowledgeAccuracy || 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Taxa de Acerto Alta (%):</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-bold text-green-600">
                        {data.performanceData?.knowledgeAccuracyHigh || 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Taxa de Acerto Baixa (%):</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-bold text-red-600">
                        {data.performanceData?.knowledgeAccuracyLow || 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Relação Entre Engajamento e Desempenho */}
            <Card>
              <CardHeader>
                <CardTitle>3. Relação Entre Engajamento e Desempenho</CardTitle>
                <CardDescription>Análise da correlação entre tempo de estudo e desempenho</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <p className="text-gray-700">
                    A análise da relação entre tempo de engajamento e desempenho mostra que há uma correlação positiva moderada entre alunos com mais de 1h de uso tendem a ter melhor desempenho, mas com casos notáveis de alta e baixa eficiência que merecem atenção.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 4. Principais Insights */}
            <Card>
              <CardHeader>
                <CardTitle>4. Principais Insights</CardTitle>
                <CardDescription>Principais insights identificados na análise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900">Correlação Positiva Moderada</h4>
                    <p className="text-sm text-gray-700">
                      Alguns alunos mostram alta eficiência com alto desempenho (acerto {'>'}70%) mas tempo de uso relativamente baixo (ex: Ana Vitória, Rafaela Vitória).
                    </p>
                    <p className="text-sm text-gray-700">
                      Identificados 5 alunos com baixa eficiência (significativo tempo de uso mas baixa taxa de acerto).
                    </p>
                    <p className="text-sm text-gray-700">
                      Tempo médio por atividade varia significativamente entre alunos (de 15 a 55 segundos por atividade).
                    </p>
                  </div>

                <div className="p-4 bg-green-50 border-l-4 border-green-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-900">Identificação de Alunos Críticos e de Alta Eficiência</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Alunos com alto desempenho:</strong>
                    </p>
                    <ul className="list-decimal ml-4 space-y-1">
                      <li>Ana Vitória Batista (acerto 86.7%)</li>
                      <li>Arthur Martins (acerto 62.6%)</li>
                      <li>Mariana Macedo Pinto (acerto 84.6%)</li>
                      <li>Rafaela Vitória Valim (acerto 70%)</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-red-50 border-l-4 border-red-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-red-900">Identificação de Alunos com Baixa Eficiência</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Alunos que precisam de Atenção:</strong>
                    </p>
                    <ul className="list-decimal ml-4 space-y-1">
                      <li>Lais Ribeiro Carvalho (acerto 89.1%)</li>
                      <li>Eduardo Emanuel (acerto 35.4%)</li>
                      <li>Miguel de Souza Almeida (acerto 33.3%)</li>
                      <li>Yuri Gabriel (acerto 38.5%)</li>
                    </ul>
                  </div>
              </CardContent>
            </Card>

            {/* 5. Perfis de Desempenho */}
            <Card>
              <CardHeader>
                <CardTitle>5. Perfis de Desempenho</CardTitle>
                <CardDescription>Perfis de desempenho por categoria de eficiência</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Alta Eficiência</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {performanceData?.highEfficiency || data.totalStudents || 0, 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Esforço Consistente</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {performanceData?.consistentEffort || data.totalStudents || 0, 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-600">
                      <span className="font-semibold">Necessita Atenção</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {performanceData?.needsAttention || data.totalStudents || 0, 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6. Principais Insights */}
            <Card>
              <CardHeader>
                <CardTitle>6. Principais Insights</CardTitle>
                <CardDescription>Insights adicionais identificados na análise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900">Arredondamento de números de três algarismos às dezenas e centenas é a</h4>
                    <p className="text-sm text-gray-700">
                      Arredondamento de números de três algarismos às dezenas e centenas aparece como uma dificuldade recorrente.
                    </p>
                    <p className="text-sm text-gray-700">
                      Alerta: As dificuldades com arredondamento e adição na reta numérica e com reagrupamento estão comprometendo o avanço para conteúdos mais complexos.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border-l-4 border-purple-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-purple-900">Arredondamento de números de três algarismos às dezenas e centenas é a</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Dificuldade recorrente identificada em {performanceData?.threeDigitRoundingDifficultyRate * 100 || 0}% dos alunos.
                    </p>
                    <p className="text-sm text-gray-700">
                      O bom domínio da leitura de números pode ser usado como base para estratégias de intervenção.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7. Principais Insights */}
            <Card>
              <CardHeader>
                <CardTitle>7. Principais Insights</CardTitle>
                <CardDescription>Insights estratégicos e pedagógicas específicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border-l-4 border-green-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-900">Uso de material manipulativo e ábaco para compreensão do reagrupamento</h4>
                    <p className="text-sm text-gray-700">
                      Uso de material manipulativo e ábaco para compreensão do reagrupamento é identificado como uma limitação importante.
                    </p>
                    </p>
                    <p className="text-sm text-gray-700">
                      Sugestão: Implementar sistema de monitoria entre pares com alunos de alto desempenho para promover colaboração e competitão saudável.
                    </p>
                  </div>

                <div className="p-4 bg-cyan-50 border-l-4 border-cyan-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-cyan-900">Adição na reta numérica e com reagrupamento</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Adição na reta numérica e com reagrupamento apresenta desafio para um grupo significativo.
                    </p>
                    <p className="text>
                        Alguns alunos mostram dificuldade em adição e reagrupamento específica.
                    </p>
                    <p className="text-sm text-gray-700">
                      Sugestão: Reforço em arredondamento de números com jogos e atividades contextuais.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 border-l-4 border-indigo-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-indigo-900">Intervenção Prioritária</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Identificação de alunos que precisam de intervenção prioritária.
                    </p>
                    <p className="text-sm text-gray-700">
                      {performanceData?.priorityStudents?.length || 0} alunos identificados.
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Aluno Crítico #1:</strong>
                      <span className="ml-2">
                        {performanceData?.priorityStudents?.[0]?.name || 'N/A'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-700">
                      {performanceData?.priorityStudents?.[0]?.reason || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 8. Recomendações Pedagógicas */}
            <Card>
              <CardHeader>
                <CardTitle>8. Recomendações Pedagógicas</CardTitle>
                <CardDescription>Estratégias de ensino e intervenções pedagógicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border-l-4 border-gray-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900">1. Arredondamento de números de três algarismos às dezenas e centenas</h4>
                    <p className="text-gray-700 mb-2">
                      <strong>Plano de Ação:</strong>
                    </p>
                    <p className="text-gray-700 mb-2">
                      Criar rotina semanal de uso da plataforma (pelo menos 3 vezes por semana).
                    </p>
                    <p className="text-gray-700 mb-2">
                      Implementar sistema de monitoria entre pares de alunos.
                    </p>
                    <p className="text-gray-700 mb-2">
                      Realizar oficinas práticas com material concreto para visualização de conceitos matemáticos abstratos.
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-gray-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900">2. Adição na reta numérica e com reagrupamento</h4>
                    <p className="text-gray-700 mb-2">
                      <strong>Plano de Ação:</strong>
                    </p>
                    <p className="text-gray-700 mb-2">
                      Oficina de adição na reta numérica com material concreto.
                    </p>
                    <p className="text-y-2 text-gray-700">
                        <div className="space-y-2">
                          <span>• Realizar desafios com materiais concretos para visualização.</span>
                          <span>• Usar jogos e materiais manipulativos para reforçar conceitos.</span>
                          <span>• Dividir a turma em pequenos grupos para atenção personalizada.</span>
                        </div>
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-blue-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-blue-900">3. Adição na reta numérica e com reagrupamento</h4>
                    <p className="text-gray-700 mb-2">
                      <strong>Plano de Ação:</strong>
                    </p>
                    <p className="text-gray-700 mb-2">
                      Oficina de adição na reta numérica com material concreto.
                    </p>
                    <p className="text-gray-700 mb-2">
                      Implementar sequência didática: números visuais → adição com reagrupamento → arredondamento.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Oficina prática:</strong>
                    </p>
                      Realizar sequência de atividades progressivas:
                    </p>
                    <p className="text-gray-700 mb-2">
                          <span>• Adição de números simples (1-10) sem reagrupar</span>
                          <span>• Adição com reagrupamento (ex: 3+4=7, 2+8=10, 3+6=9)</span>
                          <span>• Arredondamento de números de três algarismos</span>
                        </div>
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-green-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-green-900">4. Intervenção Prioritária</h4>
                    <p className="text-gray-700 mb-2">
                      <strong>Plano de Ação:</strong>
                    </p>
                    <p className="text-gray-700 mb-2">
                      Reunião individual com responsáveis para comunicar necessidades.
                    </p>
                    <p className="text-gray-700 mb-2">
                      Comunicação regular com pais sobre progresso.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Seguimento:</strong>
                    </p>
                      Implementar reuniões quinzenais com acompanhamento pedagógico.
                    </p>
                    <p className="text-gray-700 mb-2">
                      Verificar implementação das estratégias.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 9. Conclusão */}
            <Card>
              <CardHeader>
                <CardTitle>9. Conclusão</CardTitle>
                <CardDescription>Resumo da análise e próximos passosCardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 border-l-4 border-gray-300 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900">A análise dos dados da turma mostra um cenário heterogêneo</h4>
                  <p className="text-gray-700 mb-2">
                    Taxa média de acerto de 57.8% indica um bom nível de domínio geral da turma.
                  </p>
                  <p className="text-gray-700 mb-2">
                    Entretanto, 32% dos alunos ainda não estão na faixa de acerto (acerto < 60%).
                  </p>
                  <p className="text-gray-700 mb-2">
                    Existem 7 alunos críticos (acerto > 70%) que precisam de atenção especial.
                  </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Alunos com Alto Desempenho:</strong>
                      <span className="ml-2">
                        {performanceData?.highPerformanceStudents?.map(s => `${s.name}: ${s.reason}`).slice(0, 5).join(', ') || 'N/A'}
                      </span>
                      </p>
                    </p>
                    <p className="text-gray-700 mb-2">
                      A prioridade deve ser para esses 7 alunos: intervenção pedagógica individualizada.
                    </p>
                  </p>
                </div>

                <div className="p-4 border-l-4 border-blue-200 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-900">Plano de Ação para os Próximos 30 Dias</h4>
                  <p className="text-gray-700 mb-2">
                    <strong>Prioridades:</strong>
                  </p>
                    <ul className="list-disc list-decimal ml-4 space-y-1">
                      <li>
                        <span className="font-medium">Monitoria individual dos 7 alunos críticos</span>
                      </li>
                      <li>
                        <span className="font-medium">Sessões focadas em arredondamento de números</span>
                      </li>
                      <li>
                        <span className="font-medium">Acompanhamento quinzenal de progresso</span>
                      </li>
                      <li>
                        <span className="font-medium">Reuniões quinzenais com responsáveis</span>
                      </li>
                    </ul>
                  </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botões de Exportação */}
          <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
            <Button
              onClick={exportToExcel}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardAnalitico;
