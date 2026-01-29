/**
 * Blueberry Math Analyzer 3.0 - Main Page
 *
 * Complete educational analytics dashboard with:
 * - Authentication via Blueberry Math credentials
 * - Class selection
 * - Time period filtering
 * - Individual student analysis
 * - Collective class analysis
 * - Traffic light classification based on SESI Bahia protocol
 */

'use client';

import { useEffect } from 'react';
import { LogOut, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { LoginForm } from '@/components/blueberry/LoginForm';
import { ClassSelector } from '@/components/blueberry/ClassSelector';
import { PeriodFilter } from '@/components/blueberry/PeriodFilter';
import { StudentCard } from '@/components/blueberry/StudentCard';
import { ClassDashboard } from '@/components/blueberry/ClassDashboard';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { processStudentData } from '@/lib/traffic-light';
import { validateClassDataset, validateClassMetrics, calculateClassAverage } from '@/lib/validation';
import type { ClassAnalysis } from '@/types/blueberry';
import { findCriticalDifficulties, generateClassRecommendation, calculateTrafficLightDistribution } from '@/lib/traffic-light';

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const {
    selectedClass,
    selectedPeriod,
    students,
    isLoading,
    error,
    setStudents,
    setClassAnalysis,
    setIsLoading,
    setError,
    setSelectedClass
  } = useAppStore();

  const credentials = useAuthStore((state) => state.credentials);

  // Load students when class is selected
  useEffect(() => {
    if (selectedClass && credentials?.token) {
      loadStudents();
    } else {
      // Clear data when no class is selected
      setStudents([]);
      setClassAnalysis(null);
    }
  }, [selectedClass, selectedPeriod, credentials?.token]);

  const loadStudents = async () => {
    if (!selectedClass || !credentials?.token) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const days =
        selectedPeriod === 'last_24h' ? 1 :
        selectedPeriod === 'last_week' ? 7 :
        selectedPeriod === 'last_month' ? 30 :
        90;

      const response = await fetch('/api/blueberry/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: credentials.token,
          cookies: credentials.cookies,
          userAgent: credentials.userAgent,
          baggage: credentials.baggage,
          classGuid: selectedClass.guid,
          days
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar alunos');
      }

      // Process student data
      const processedStudents = data.students.map(processStudentData);

      // Validate the dataset
      const validation = validateClassDataset(processedStudents);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      setStudents(processedStudents);

      // Calculate class analysis
      const classAnalysis = calculateClassAnalysis(selectedClass.name, selectedClass.guid, selectedPeriod, processedStudents);
      setClassAnalysis(classAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar alunos');
      setStudents([]);
      setClassAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateClassAnalysis = (
    className: string,
    classGuid: string,
    period: string,
    studentsData: any[]
  ): ClassAnalysis => {
    const totalStudents = studentsData.length;

    // Calculate averages (including ALL students, even those with 0 activities)
    const avgActivities = calculateClassAverage(studentsData, 'total_activities');
    const avgTimeMinutes = calculateClassAverage(studentsData, 'time_spent_minutes');

    // Calculate adherence (students with >= 60 minutes in last 7 days)
    // Note: This always uses 7-day data for adherence, regardless of selected period
    const studentsWithTargetTime = studentsData.filter(s => s.time_spent_minutes >= 60).length;
    const adherencePercent = (studentsWithTargetTime / totalStudents) * 100;

    // Calculate traffic light distribution
    const distribution = calculateTrafficLightDistribution(studentsData);

    // Find critical difficulties
    const difficulties = findCriticalDifficulties(studentsData, 5);
    const criticalDifficulties = difficulties.map(d => d.difficulty);

    // Generate recommendation
    const recommendation = generateClassRecommendation(
      distribution.green_percent,
      distribution.yellow_percent,
      distribution.red_percent
    );

    const analysis: ClassAnalysis = {
      class_name: className,
      class_guid: classGuid,
      period: period as any,
      total_students: totalStudents,
      metrics: {
        avg_activities: avgActivities,
        avg_time_minutes: avgTimeMinutes,
        adherence_percent: adherencePercent
      },
      traffic_light: {
        green_percent: distribution.green_percent,
        yellow_percent: distribution.yellow_percent,
        red_percent: distribution.red_percent
      },
      critical_difficulties: criticalDifficulties,
      recommendation: recommendation,
      students: studentsData
    };

    // Validate the metrics
    const metricsValidation = validateClassMetrics(studentsData, analysis.metrics);
    if (!metricsValidation.isValid) {
      console.error('Metrics validation failed:', metricsValidation.error);
    }

    return analysis;
  };

  const handleLogout = () => {
    logout();
    setSelectedClass(null);
    setStudents([]);
    setClassAnalysis(null);
    setError('');
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Blueberry Math Analyzer 3.0</h1>
                <p className="text-xs text-muted-foreground">Análise Pedagógica Fiel à API</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Class Selection */}
          <section>
            <ClassSelector />
          </section>

          {/* Show content when class is selected */}
          {selectedClass && (
            <>
              <Separator />

              {/* Period Filter */}
              <section>
                <PeriodFilter />
              </section>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Carregando dados da turma...</span>
                  </div>
                </div>
              )}

              {/* Dashboard Content */}
              {!isLoading && students.length > 0 && (
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="dashboard">Dashboard Coletivo</TabsTrigger>
                    <TabsTrigger value="students">Análise Individual</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard" className="space-y-6 mt-6">
                    <ClassDashboard />
                  </TabsContent>

                  <TabsContent value="students" className="space-y-6 mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      {students.map((student) => (
                        <StudentCard key={student.student_id} student={student} />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t py-6 bg-muted/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            Blueberry Math Analyzer 3.0 - Sistema de Análise Pedagógica
          </p>
          <p className="text-xs">
            Dados fornecidos 100% pela API oficial Blueberry Math • Classificação baseada no Protocolo SESI Bahia
          </p>
        </div>
      </footer>
    </div>
  );
}
