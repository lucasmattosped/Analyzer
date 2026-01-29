/**
 * Blueberry Math Analyzer - Main Page
 * Fixed - Version Stable
 */
'use client';

import { useEffect } from 'react';
import { LogOut, RefreshCw, BarChart3, Users, Clock, Activity, Target } from 'lucide-react';
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
import { Report } from '@/components/blueberry/Report';
import { DashboardAnalitico } from '@/components/blueberry/DashboardAnalitico';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { processStudentData } from '@/lib/traffic-light';
import { validateClassDataset, validateClassMetrics, calculateClassAverage } from '@/lib/validation';
import type { ClassAnalysis } from '@/types/blueberry';
import { findCriticalDifficulties, generateClassRecommendation, calculateTrafficLightDistribution } from '@/lib/traffic-light';
import { calculateAverageMastery } from '@/lib/retention';

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const {
    selectedClass,
    selectedPeriod,
    students,
    classAnalysis,
    isLoading,
    error,
    setStudents,
    setClassAnalysis,
    setIsLoading,
    setError,
    setSelectedClass
  } = useAppStore();

  const token = useAuthStore((state) => state.credentials.token);
  const cookies = useAuthStore((state) => state.credentials.cookies);
  const schoolName = useAuthStore((state) => state.credentials.school?.name) || 'Escola não informada';
  const teacherName = useAuthStore((state) => state.userName) || 'Professor';

  // Load students when class is selected
  useEffect(() => {
    if (selectedClass && token) {
      loadStudents();
    } else {
      // Clear data when no class is selected
      setStudents([]);
      setClassAnalysis(null);
    }
  }, [selectedClass, selectedPeriod, token]);

  const loadStudents = async () => {
    if (!selectedClass || !token) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const days =
        selectedPeriod === 'last_24h' ? 1 :
        selectedPeriod === 'last_week' ? 7 :
        selectedPeriod === 'last_month' ? 30 :
        selectedPeriod === 'last_3months' ? 90 :
        30;

      const response = await fetch('/api/blueberry/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          cookies,
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

      // Validate dataset
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
      recommendation,
      students: studentsData
    };

    // Validate metrics
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '24px', fontWeight: 700 }}>Blueberry Math Analyzer 3.0</h1>
                <p className="text-sm text-gray-600" style={{ fontSize: '13px', fontWeight: 400 }}>Análise Pedagógica Fiel à API</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
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
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-6">
                  <div className="flex items-center justify-center gap-4 text-gray-600">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-base font-medium">Carregando dados da turma...</span>
                  </div>
                </div>
              )}

              {/* Dashboard Content */}
              {!isLoading && students.length > 0 && classAnalysis && (
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 lg:w-[600px] bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium text-sm">
                      Dashboard Analítico
                    </TabsTrigger>
                    <TabsTrigger value="students" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium text-sm">
                      Análise Individual
                    </TabsTrigger>
                    <TabsTrigger value="report" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium text-sm">
                      Relatório Mensal
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard" className="space-y-6 mt-6">
                    <ClassDashboard />
                  </TabsContent>

                  <TabsContent value="students" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {students.map((student, index) => (
                        <StudentCard key={index} student={student} />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="report" className="space-y-6">
                    <Report
                      schoolName={schoolName}
                      className={selectedClass.name}
                      month={new Date().toLocaleDateString('pt-BR', { month: 'long' })}
                      year={new Date().getFullYear().toString()}
                      data={{
                        activeStudents: students.filter(s => s.time_spent_minutes > 0).length,
                        totalStudents: students.length,
                        studentsAbove60min: students.filter(s => s.time_spent_minutes >= 60).length,
                        averageMinutes: calculateClassAverage(students, 'time_spent_minutes'),
                        currentMastery: calculateAverageMastery(students),
                        masteryChange: 0,
                        retentionRate: 0,
                        commonDifficulties: classAnalysis.critical_difficulties.map(d => ({
                          description: d,
                          percentage: students.filter(s => s.difficulties.includes(d)).length / students.length * 100
                        })),
                        greenPercent: classAnalysis.traffic_light.green_percent,
                        yellowPercent: classAnalysis.traffic_light.yellow_percent,
                        redPercent: classAnalysis.traffic_light.red_percent,
                        teacherName: teacherName
                      }}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-gray-900 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>
            Blueberry Math Analyzer 3.0 - Sistema de Análise Pedagógica
          </p>
          <p className="text-xs text-gray-600" style={{ fontSize: '12px', fontWeight: 400 }}>
            Dados fornecidos 100% pela API oficial Blueberry Math • Classificação baseada no Protocolo SESI Bahia
          </p>
        </div>
      </footer>
    </div>
  );
}
