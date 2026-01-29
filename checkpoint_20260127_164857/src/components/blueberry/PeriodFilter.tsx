/**
 * Blueberry Math Analyzer 3.0 - Time Period Filter Component
 *
 * Allows user to select time period for data viewing:
 * - Last 24 hours
 * - Last 7 days (week)
 * - Last 30 days (month)
 * - Last 90 days (quarter)
 *
 * IMPORTANT NOTE:
 * The traffic light status (Vermelho/Amarelo/Verde) is ALWAYS based on 7-day data,
 * regardless of which time filter is selected. The filter only affects the data shown,
 * not the classification criteria.
 */

'use client';

import { Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppStore } from '@/store/app';
import { TIME_PERIOD_CONFIG } from '@/types/blueberry';

export function PeriodFilter() {
  const selectedPeriod = useAppStore((state) => state.selectedPeriod);
  const setSelectedPeriod = useAppStore((state) => state.setSelectedPeriod);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Período de Análise</h3>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    O status do semáforo (Vermelho/Amarelo/Verde) é sempre baseado nos últimos 7 dias,
                    conforme o Protocolo SESI Bahia. O filtro selecionado afeta apenas os dados
                    exibidos para análise.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(TIME_PERIOD_CONFIG).map(([key, config]) => (
              <Button
                key={key}
                variant={selectedPeriod === key ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod(key as any)}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <span className="text-sm font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">
                  {config.days === 1 ? '24h' : `${config.days} dias`}
                </span>
              </Button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Os dados exibidos referem-se às atividades realizadas no período selecionado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
