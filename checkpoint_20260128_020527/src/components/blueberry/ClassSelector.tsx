/**
 * Blueberry Math Analyzer 3.0 - Class Selection Component
 */

'use client';

import { useEffect } from 'react';
import { GraduationCap, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import type { BlueberryClass } from '@/types/blueberry';

export function ClassSelector() {
  const {
    classes,
    selectedClass,
    isLoading,
    error,
    setClasses,
    setSelectedClass,
    setIsLoading,
    setError
  } = useAppStore();

  const token = useAuthStore((state) => state.credentials.token);
  const cookies = useAuthStore((state) => state.credentials.cookies);

  // Load classes on component mount
  useEffect(() => {
    loadClasses();
  }, [token]);

  const loadClasses = async () => {
    if (!token) {
      setError('Token de autenticação não encontrado');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/blueberry/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          cookies
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar turmas');
      }

      setClasses(data.classes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar turmas');
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = (cls: BlueberryClass) => {
    setSelectedClass(cls);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Carregando turmas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {cookies && '\n\nDica: Se o erro persistir, tente fornecer cookies manualmente no formulário de login.'}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={loadClasses} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (classes.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-12 text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Nenhuma turma encontrada.
            {cookies && (
              <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                Se suas turmas não aparecem, tente fornecer cookies manualmente
                no campo opcional do formulário de login.
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Verifique suas credenciais e tente novamente.
            </p>
          </p>
          <Button onClick={loadClasses} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Selecione uma Turma</h3>
          <p className="text-sm text-muted-foreground">
            {classes.length} {classes.length === 1 ? 'turma disponível' : 'turmas disponíveis'}
          </p>
        </div>
        <Button onClick={loadClasses} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => {
          const isSelected = selectedClass?.guid === cls.guid;

          return (
            <Card
              key={cls.guid}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleClassSelect(cls)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <GraduationCap className="h-5 w-5 flex-shrink-0 text-primary" />
                    <CardTitle className="text-base truncate">
                      {cls.name}
                    </CardTitle>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {cls.guid.slice(0, 8)}...
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
