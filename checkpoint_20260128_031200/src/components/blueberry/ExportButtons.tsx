'use client';

import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

interface ExportButtonsProps {
  data: any;
  fileNamePrefix: string;
  onGeneratePDF: () => Promise<void>;
  onGenerateExcel: () => Promise<void>;
}

export function ExportButtons({ data, fileNamePrefix, onGeneratePDF, onGenerateExcel }: ExportButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePDF = async () => {
    setIsGenerating(true);
    try {
      await onGeneratePDF();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para detalhes.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExcel = async () => {
    setIsGenerating(true);
    try {
      await onGenerateExcel();
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      alert('Erro ao gerar Excel. Verifique o console para detalhes.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={handlePDF}
        disabled={isGenerating}
        className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white"
      >
        <Download className="w-4 h-4 mr-2" />
        {isGenerating ? 'Gerando...' : 'Exportar PDF'}
      </Button>
      <Button
        onClick={handleExcel}
        disabled={isGenerating}
        variant="outline"
        className="border-[#0ea5e9] text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Exportar Excel
      </Button>
    </div>
  );
}
