'use client';

import { Card } from '@/components/ui/card';
import { ExportButtons } from '@/components/blueberry/ExportButtons';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface ReportProps {
  schoolName: string;
  className: string;
  month: string;
  year: string;
  students: any[];  // Lista de alunos para Excel
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
  // Cores do Blueberry Math
  const colors = {
    primary: '#1e40af',
    secondary: '#0ea5e9',
    success: '#10b981',
    warning: '#f59e0b',
    dark: '#1f2937',
  };

  // Gerar PDF
  const generatePDF = async () => {
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
    doc.setFillColor(colors.primary);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, yPos, 180, 8, 'F');
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
    doc.setFillColor(colors.success);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, yPos, 180, 8, 'F');
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
    doc.setFillColor(colors.warning);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, yPos, 180, 8, 'F');
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
    doc.setFillColor(colors.primary);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, yPos, 180, 8, 'F');
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
    doc.setFillColor(colors.secondary);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, yPos, 180, 8, 'F');
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
    doc.setFillColor(colors.dark);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, yPos, 180, 8, 'F');
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
  };

  // Gerar Excel com 3 worksheets (Alunos, Turma, Conteúdos Críticos)
  const generateExcel = async () => {
    // Worksheet 1: Alunos
    const studentsHeaders: string[] = ['Largura', 'Descrição'];
    for (let i = 1; i <= students.length; i++) {
      studentsHeaders.push(`ID do Aluno ${i}`);
    }
    
    const studentsData: any[] = [
      ['Alunos'],
      [`${schoolName} | Turma: ${className} | Mês: ${month}/${year}`],
      [students.length],
      'ID do Aluno extraído do nome do arquivo PDF'
    ];
    
    // Adicionar dados de cada aluno
    students.forEach(student => {
      const studentRow: string[] = [];
      studentRow.push((student.student_name || student.name || '').split(' ')[0]); // ID do Aluno (primeiro nome)
      studentRow.push(student.time_spent_minutes?.toFixed(0) || '0'); // Tempo (min)
      
      // Calcular acertos (%)
      const total = student.total_activities || 0;
      const correct = student.correct_count || 0;
      const accuracy = total > 0 ? (correct / total * 100).toFixed(0) : '0';
      studentRow.push(accuracy); // Acertos (%)
      
      studentRow.push(total.toString()); // Atividades Totais
      
      // Status Individual
      const time = student.time_spent_minutes || 0;
      let status = 'VERDE';
      if (time < 30) status = 'VERMELHO';
      else if (time < 60) status = 'AMARELO';
      studentRow.push(status); // Status Individual
      
      studentsData.push(studentRow);
    });
    
    const worksheet1 = XLSX.utils.aoa_to_sheet([...studentsHeaders, ...studentsData]);
    
    // Worksheet 2: Turma
    const classData = [
      ['Turma'],
      [`${schoolName} | Turma: ${className}`],
      [],
      ['Indicador'],
      ['30'],
      ['Nome do indicador/métrica'],
      ['Valor'],
      ['Descrição']
    ];
    
    const classMetrics: any[] = [
      ['Engajamento'],
      ['Verde (≥60 min)'],
      [data.studentsAbove60min],
      [`Alunos com ≥60 min na turma (${data.greenPercent.toFixed(1)}% da turma)`],
      [],
      ['Engajamento'],
      ['Amarelo (30-59 min)'],
      [data.studentsAbove60min - students.filter((s: any) => {
        const t = s.time_spent_minutes || 0;
        return t >= 30 && t < 60;
      }).length],
      [`Alunos com 30-59 min na turma`],
      [],
      ['Engajamento'],
      ['Vermelho (<30 min)'],
      [students.filter((s: any) => (s.time_spent_minutes || 0) < 30).length],
      [`Alunos com <30 min na turma`],
      [],
      ['Aprendizagem'],
      ['Domínio médio'],
      [data.currentMastery.toFixed(1)],
      [],
      [],
      ['Aprendizagem'],
      ['Evolução'],
      [data.masteryChange >= 0 ? '+' : '' + data.masteryChange.toFixed(1) + ' pp'],
      [],
      [],
      ['Desempenho'],
      ['Tempo médio (min)'],
      [data.averageMinutes.toFixed(1)],
      [],
      [],
      ['Semáforo'],
      ['Verde'],
      [data.greenPercent.toFixed(0)],
      [],
      ['Semáforo'],
      ['Amarelo'],
      [data.yellowPercent.toFixed(0)],
      [],
      ['Semáforo'],
      ['Vermelho'],
      [data.redPercent.toFixed(0)],
      [],
      ['Ação Recomendada'],
      ['Ação'],
      [getRecommendedAction(data)],
      [],
      ['Ação Recomendada'],
      ['Público-alvo'],
      [getTargetAudience(data)],
      [],
      ['Ação Recomendada'],
      ['Meta'],
      [getGoal(data)],
      []
    ];
    
    const worksheet2 = XLSX.utils.aoa_to_sheet(classData);
    
    // Worksheet 3: Conteúdos Críticos
    const criticalData: any[] = [
      ['Conteúdos Críticos'],
      [],
      [],
      ['Dificuldades Mais Frequentes'],
      [],
      [],
      ...data.commonDifficulties.map((diff, i) => [
        `Dificuldade #${i + 1}`,
        diff.description,
        `${diff.percentage.toFixed(1)}% dos alunos`
      ]),
      [],
      [],
      ['Conteúdos Esquecidos'],
      [],
      [],
      ['Top 3 Esquecidos'],
      [],
      [],
      ...data.commonDifficulties.slice(0, 3).map((diff, i) => [
        `Esquecido #${i + 1}`,
        diff.description,
        `${(100 - diff.percentage).toFixed(1)}% de retenção`
      ]),
      []
    ];
    
    const worksheet3 = XLSX.utils.aoa_to_sheet(criticalData);
    
    // Criar workbook com 3 worksheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'Alunos');
    XLSX.utils.book_append_sheet(workbook, worksheet2, 'Turma');
    XLSX.utils.book_append_sheet(workbook, worksheet3, 'Conteúdos Críticos');
    
    const filename = `Relatorio_${className.replace(/\s+/g, '_')}_${month}_${year}.xlsx`;
    XLSX.writeFile(workbook, filename);
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
          {schoolName} | Turma: {className} | Mês: {month}/{year}
        </p>
      </div>

      <div className="space-y-4">
        {/* Seção A - ADESÃO (CARD BRANCO COM TÍTULO COLORIDO) */}
        <div className="border-l-4 border-[#3b82f6] bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-[#3b82f6]">A)</span>
            <h3 className="text-lg font-semibold text-[#1e40af]">ADESÃO (Engajamento)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Alunos ativos na semana:</span>
              </p>
              <p className="text-xl font-bold text-gray-900">
                {data.activeStudents}/{data.totalStudents} ({((data.activeStudents/data.totalStudents)*100).toFixed(1)}%)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Alunos com ≥60 min:</span>
              </p>
              <p className="text-xl font-bold text-gray-900">
                {data.studentsAbove60min}/{data.totalStudents} ({((data.studentsAbove60min/data.totalStudents)*100).toFixed(1)}%)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Minutos médios por aluno:</span>
              </p>
              <p className="text-xl font-bold text-gray-900">
                {data.averageMinutes.toFixed(1)} min
              </p>
            </div>
          </div>
        </div>

        {/* Seção B - APRENDIZAGEM (CARD BRANCO COM TÍTULO COLORIDO) */}
        <div className="border-l-4 border-[#10b981] bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-[#10b981]">B)</span>
            <h3 className="text-lg font-semibold text-[#047857]">APRENDIZAGEM (Resultado)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Domínio médio (tema):</span>
              </p>
              <p className="text-xl font-bold text-gray-900">
                {data.currentMastery.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Evolução vs semana anterior:</span>
              </p>
              <p className={`text-xl font-bold ${data.masteryChange >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                {data.masteryChange >= 0 ? '+' : ''}{data.masteryChange.toFixed(1)} pp
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Retenção (D+7/D+21):</span>
              </p>
              <p className="text-xl font-bold text-gray-900">
                {data.retentionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Seção C - PONTOS DE ATENÇÃO (CARD BRANCO COM TÍTULO COLORIDO) */}
        <div className="border-l-4 border-[#f59e0b] bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-[#f59e0b]">C)</span>
            <h3 className="text-lg font-semibold text-[#b45309]">PONTOS DE ATENÇÃO (Top 3 Fragilidades)</h3>
          </div>
          <div className="space-y-2">
            {data.commonDifficulties.slice(0, 3).map((diff, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-lg font-bold text-[#f59e0b]">{i + 1}.</span>
                <div>
                  <p className="font-semibold text-gray-900">{diff.description}</p>
                  <p className="text-sm text-gray-600">
                    {diff.percentage.toFixed(1)}% dos alunos com dificuldade
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção D - SEMÁFORO DA TURMA (CARD BRANCO COM TÍTULO COLORIDO) */}
        <div className="border-l-4 border-[#1e40af] bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-[#1e40af]">D)</span>
            <h3 className="text-lg font-semibold text-[#1e40af]">SEMÁFORO DA TURMA</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#dcfce7] rounded-lg">
              <p className="text-xs font-semibold text-[#166534]">VERDE</p>
              <p className="text-2xl font-bold text-[#166534]">{data.greenPercent.toFixed(0)}%</p>
              <p className="text-xs text-gray-600">Rotina consolidada</p>
            </div>
            <div className="text-center p-4 bg-[#fef3c7] rounded-lg">
              <p className="text-xs font-semibold text-[#92400e]">AMARELO</p>
              <p className="text-2xl font-bold text-[#92400e]">{data.yellowPercent.toFixed(0)}%</p>
              <p className="text-xs text-gray-600">Sinal de alerta</p>
            </div>
            <div className="text-center p-4 bg-[#fee2e2] rounded-lg">
              <p className="text-xs font-semibold text-[#991b1b]">VERMELHO</p>
              <p className="text-2xl font-bold text-[#991b1b]">{data.redPercent.toFixed(0)}%</p>
              <p className="text-xs text-gray-600">Crítico — intervenção em 48h</p>
            </div>
          </div>
        </div>

        {/* Seção E - AÇÃO RECOMENDADA (CARD BRANCO COM TÍTULO COLORIDO) */}
        <div className="border-l-4 border-[#0ea5e9] bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-[#0ea5e9]">E)</span>
            <h3 className="text-lg font-semibold text-[#075985]">AÇÃO RECOMENDADA</h3>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Ação:</span>
              </p>
              <p className="font-medium text-gray-900">{getRecommendedAction(data)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Público-alvo:</span>
              </p>
              <p className="font-medium text-gray-900">{getTargetAudience(data)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Meta:</span>
              </p>
              <p className="font-medium text-gray-900">{getGoal(data)}</p>
            </div>
          </div>
        </div>

        {/* Seção F - RESPONSABILIDADE (CARD BRANCO COM TÍTULO COLORIDO) */}
        <div className="border-l-4 border-[#1f2937] bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-[#1f2937]">F)</span>
            <h3 className="text-lg font-semibold text-[#1f2937]">RESPONSABILIDADE</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Responsável:</span>
              </p>
              <p className="font-medium text-gray-900">{data.teacherName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Data de Envio:</span>
              </p>
              <p className="font-medium text-gray-900">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <div></div>
        <ExportButtons
          data={data}
          fileNamePrefix={`Relatorio_${className.replace(/\s+/g, '_')}_${month}_${year}`}
          onGeneratePDF={generatePDF}
          onGenerateExcel={generateExcel}
        />
      </div>
    </Card>
  );
}
