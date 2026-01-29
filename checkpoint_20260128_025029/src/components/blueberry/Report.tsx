'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

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
  const [isGenerating, setIsGenerating] = useState(false);

  // Gerar PDF
  const generatePDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Header - Título principal
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('BLUEBERRY MATH — RELATÓRIO MENSAL', 105, yPos, { align: 'center' });
      yPos += 15;

      // Subtítulo com informações
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const subtitle = `${schoolName} | Turma: ${className} | Mês: ${month}/${year}`;
      doc.text(subtitle, 105, yPos, { align: 'center' });
      yPos += 15;

      // Seção A - ADESÃO
      yPos += 10;
      doc.setDrawColor('#2563eb');
      doc.setFillColor('#2563eb');
      doc.roundedRect(15, yPos, 180, 8, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('A) ADESÃO (Engajamento)', 18, yPos + 5);
      yPos += 15;

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Alunos ativos na semana: ${data.activeStudents}/${data.totalStudents} (${((data.activeStudents/data.totalStudents)*100).toFixed(1)}%)`, 18, yPos);
      yPos += 7;
      doc.text(`• Alunos com ≥60 min: ${data.studentsAbove60min}/${data.totalStudents} (${((data.studentsAbove60min/data.totalStudents)*100).toFixed(1)}%)`, 18, yPos);
      yPos += 7;
      doc.text(`• Minutos médios por aluno: ${data.averageMinutes.toFixed(1)} min`, 18, yPos);
      yPos += 12;

      // Seção B - APRENDIZAGEM
      doc.setDrawColor('#10b981');
      doc.setFillColor('#10b981');
      doc.roundedRect(15, yPos, 180, 8, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('B) APRENDIZAGEM (Resultado)', 18, yPos + 5);
      yPos += 15;

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Domínio médio (tema): ${data.currentMastery.toFixed(1)}%`, 18, yPos);
      yPos += 7;
      doc.text(`• Evolução vs semana anterior: ${data.masteryChange >= 0 ? '+' : ''}${data.masteryChange.toFixed(1)} pp`, 18, yPos);
      yPos += 7;
      doc.text(`• Retenção (D+7/D+21): ${data.retentionRate.toFixed(1)}%`, 18, yPos);
      yPos += 12;

      // Seção C - PONTOS DE ATENÇÃO
      doc.setDrawColor('#f59e0b');
      doc.setFillColor('#f59e0b');
      doc.roundedRect(15, yPos, 180, 8, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('C) PONTOS DE ATENÇÃO (Top 3 Fragilidades)', 18, yPos + 5);
      yPos += 15;

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      data.commonDifficulties.slice(0, 3).forEach((diff, i) => {
        doc.text(`${i + 1}. ${diff.description} — ${diff.percentage.toFixed(1)}% dos alunos com dificuldade`, 18, yPos);
        yPos += 7;
      });
      yPos += 12;

      // Seção D - SEMÁFORO DA TURMA
      doc.setDrawColor('#2563eb');
      doc.setFillColor('#2563eb');
      doc.roundedRect(15, yPos, 180, 8, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('D) SEMÁFORO DA TURMA', 18, yPos + 5);
      yPos += 15;

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`• VERDE: ${data.greenPercent.toFixed(0)}% (Rotina consolidada)`, 18, yPos);
      yPos += 7;
      doc.text(`• AMARELO: ${data.yellowPercent.toFixed(0)}% (Sinal de alerta)`, 18, yPos);
      yPos += 7;
      doc.text(`• VERMELHO: ${data.redPercent.toFixed(0)}% (Crítico — intervenção em 48h)`, 18, yPos);
      yPos += 12;

      // Seção E - AÇÃO RECOMENDADA
      doc.setDrawColor('#0ea5e9');
      doc.setFillColor('#0ea5e9');
      doc.roundedRect(15, yPos, 180, 8, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('E) AÇÃO RECOMENDADA', 18, yPos + 5);
      yPos += 15;

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Ação: ${getRecommendedAction(data)}`, 18, yPos);
      yPos += 7;
      doc.text(`• Público-alvo: ${getTargetAudience(data)}`, 18, yPos);
      yPos += 7;
      doc.text(`• Meta: ${getGoal(data)}`, 18, yPos);
      yPos += 12;

      // Seção F - RESPONSABILIDADE
      doc.setDrawColor('#374151');
      doc.setFillColor('#374151');
      doc.roundedRect(15, yPos, 180, 8, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('F) RESPONSABILIDADE', 18, yPos + 5);
      yPos += 15;

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Responsável: ${data.teacherName}`, 18, yPos);
      yPos += 7;
      doc.text(`• Data de Envio: ${new Date().toLocaleDateString('pt-BR')}`, 18, yPos);

      // Salvar PDF
      const filename = `Relatorio_${className.replace(/\s+/g, '_')}_${month}_${year}.pdf`;
      doc.save(filename);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Gerar Excel
  const generateExcel = () => {
    setIsGenerating(true);
    try {
      const worksheetData = [
        ['BLUEBERRY MATH — RELATÓRIO MENSAL'],
        [`${schoolName} | Turma: ${className} | Mês: ${month}/${year}`],
        [],
        ['A) ADESÃO (Engajamento)'],
        [`Alunos ativos na semana: ${data.activeStudents}/${data.totalStudents} (${((data.activeStudents/data.totalStudents)*100).toFixed(1)}%)`],
        [`Alunos com ≥60 min: ${data.studentsAbove60min}/${data.totalStudents} (${((data.studentsAbove60min/data.totalStudents)*100).toFixed(1)}%)`],
        [`Minutos médios por aluno: ${data.averageMinutes.toFixed(1)} min`],
        [],
        ['B) APRENDIZAGEM (Resultado)'],
        [`Domínio médio (tema): ${data.currentMastery.toFixed(1)}%`],
        [`Evolução vs semana anterior: ${data.masteryChange >= 0 ? '+' : ''}${data.masteryChange.toFixed(1)} pp`],
        [`Retenção (D+7/D+21): ${data.retentionRate.toFixed(1)}%`],
        [],
        ['C) PONTOS DE ATENÇÃO (Top 3 Fragilidades)'],
        ...data.commonDifficulties.slice(0, 3).map((diff, i) =>
          [`${i + 1}. ${diff.description} — ${diff.percentage.toFixed(1)}% dos alunos com dificuldade`]
        ),
        [],
        ['D) SEMÁFORO DA TURMA'],
        [`VERDE: ${data.greenPercent.toFixed(0)}% (Rotina consolidada)`],
        [`AMARELO: ${data.yellowPercent.toFixed(0)}% (Sinal de alerta)`],
        [`VERMELHO: ${data.redPercent.toFixed(0)}% (Crítico — intervenção em 48h)`],
        [],
        ['E) AÇÃO RECOMENDADA'],
        [`Ação: ${getRecommendedAction(data)}`],
        [`Público-alvo: ${getTargetAudience(data)}`],
        [`Meta: ${getGoal(data)}`],
        [],
        ['F) RESPONSABILIDADE'],
        [`Responsável: ${data.teacherName}`],
        [`Data de Envio: ${new Date().toLocaleDateString('pt-BR')}`]
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

      const filename = `Relatorio_${className.replace(/\s+/g, '_')}_${month}_${year}.xlsx`;
      XLSX.writeFile(workbook, filename);

    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
    <Card className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Analítico</h2>
        <p className="text-sm text-gray-600">
          Data de atualização: {new Date().toLocaleDateString('pt-BR')} | Período analisado: Último mês
        </p>
        <p className="text-sm text-gray-600">
          {schoolName} | {className} | {month}/{year}
        </p>
      </div>

      <div className="space-y-4">
        {/* Seção A - ADESÃO */}
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-blue-500">A)</span>
            <h3 className="text-lg font-semibold text-blue-700">ADESÃO (Engajamento)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Alunos ativos na semana:</span>
              </p>
              <p className="text-xl font-bold text-blue-700">
                {data.activeStudents}/{data.totalStudents} ({((data.activeStudents/data.totalStudents)*100).toFixed(1)}%)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Alunos com ≥60 min:</span>
              </p>
              <p className="text-xl font-bold text-blue-700">
                {data.studentsAbove60min}/{data.totalStudents} ({((data.studentsAbove60min/data.totalStudents)*100).toFixed(1)}%)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Minutos médios por aluno:</span>
              </p>
              <p className="text-xl font-bold text-blue-700">
                {data.averageMinutes.toFixed(1)} min
              </p>
            </div>
          </div>
        </div>

        {/* Seção B - APRENDIZAGEM */}
        <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-green-500">B)</span>
            <h3 className="text-lg font-semibold text-green-700">APRENDIZAGEM (Resultado)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Domínio médio (tema):</span>
              </p>
              <p className="text-xl font-bold text-green-700">
                {data.currentMastery.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Evolução vs semana anterior:</span>
              </p>
              <p className={`text-xl font-bold ${data.masteryChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {data.masteryChange >= 0 ? '+' : ''}{data.masteryChange.toFixed(1)} pp
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Retenção (D+7/D+21):</span>
              </p>
              <p className="text-xl font-bold text-green-700">
                {data.retentionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Seção C - PONTOS DE ATENÇÃO */}
        <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-yellow-500">C)</span>
            <h3 className="text-lg font-semibold text-yellow-700">PONTOS DE ATENÇÃO (Top 3 Fragilidades)</h3>
          </div>
          <div className="space-y-2">
            {data.commonDifficulties.slice(0, 3).map((diff, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-lg font-bold text-yellow-500">{i + 1}.</span>
                <div>
                  <p className="font-semibold text-gray-800">{diff.description}</p>
                  <p className="text-sm text-gray-600">
                    {diff.percentage.toFixed(1)}% dos alunos com dificuldade
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção D - SEMÁFORO DA TURMA */}
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-blue-500">D)</span>
            <h3 className="text-lg font-semibold text-blue-700">SEMÁFORO DA TURMA</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-100 rounded-lg">
              <p className="text-xs font-semibold text-green-700">VERDE</p>
              <p className="text-2xl font-bold text-green-700">{data.greenPercent.toFixed(0)}%</p>
              <p className="text-xs text-gray-600">Rotina consolidada</p>
            </div>
            <div className="text-center p-4 bg-yellow-100 rounded-lg">
              <p className="text-xs font-semibold text-yellow-700">AMARELO</p>
              <p className="text-2xl font-bold text-yellow-700">{data.yellowPercent.toFixed(0)}%</p>
              <p className="text-xs text-gray-600">Sinal de alerta</p>
            </div>
            <div className="text-center p-4 bg-red-100 rounded-lg">
              <p className="text-xs font-semibold text-red-700">VERMELHO</p>
              <p className="text-2xl font-bold text-red-700">{data.redPercent.toFixed(0)}%</p>
              <p className="text-xs text-gray-600">Crítico — intervenção em 48h</p>
            </div>
          </div>
        </div>

        {/* Seção E - AÇÃO RECOMENDADA */}
        <div className="rounded-lg border-l-4 border-cyan-500 bg-cyan-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-cyan-500">E)</span>
            <h3 className="text-lg font-semibold text-cyan-700">AÇÃO RECOMENDADA</h3>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Ação:</span>
              </p>
              <p className="font-medium text-gray-900">{getRecommendedAction(data)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Público-alvo:</span>
              </p>
              <p className="font-medium text-gray-900">{getTargetAudience(data)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Meta:</span>
              </p>
              <p className="font-medium text-gray-900">{getGoal(data)}</p>
            </div>
          </div>
        </div>

        {/* Seção F - RESPONSABILIDADE */}
        <div className="rounded-lg border-l-4 border-gray-700 bg-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-gray-700">F)</span>
            <h3 className="text-lg font-semibold text-gray-700">RESPONSABILIDADE</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Responsável:</span>
              </p>
              <p className="font-medium text-gray-900">{data.teacherName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Data de Envio:</span>
              </p>
              <p className="font-medium text-gray-900">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <div></div>
        <div className="flex gap-3">
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Gerando...' : 'Exportar PDF'}
          </Button>
          <Button
            onClick={generateExcel}
            disabled={isGenerating}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>
    </Card>
  );
}
