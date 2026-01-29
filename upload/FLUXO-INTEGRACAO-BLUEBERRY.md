# 📘 Fluxo Completo de Integração com API Blueberry Math

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Autenticação](#autenticação)
3. [Obtenção de Cursos](#obtenção-de-cursos)
4. [Obtenção de Dados dos Alunos](#obtenção-de-dados-dos-alunos)
5. [Cálculo de Métricas](#cálculo-de-métricas)
6. [Implementação Completa Backend](#implementação-completa-backend)
7. [Implementação Completa Frontend](#implementação-completa-frontend)
8. [Troubleshooting](#troubleshooting)
9. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    BLUEBERRY MATH ANALYZER                      │
│                    (Sua Aplicação Next.js)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Autenticação                                                │
│     POST /api/auth/login                                        │
│     ↓                                                           │
│     Envia email + password para API Blueberry                   │
│     ↓                                                           │
│     Recebe token + school + professor GUID                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Obtenção de Cursos                                           │
│     GET /api/blueberry/courses                                   │
│     ↓                                                           │
│     Usa token para buscar turmas do professor                    │
│     ↓                                                           │
│     Lista de cursos com GUID, nome, etc.                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Obtenção de Dados dos Alunos ⭐                              │
│     GET /api/blueberry/course/[guid]/students                    │
│     ↓                                                           │
│     Busca alunos de uma turma específica                        │
│     ↓                                                           │
│     Recebe dados + atividades + métricas                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Cálculo de Métricas                                          │
│     Usa calculator-engine.ts                                     │
│     ↓                                                           │
│     Calcula médias, progresso, status SESI                       │
│     ↓                                                           │
│     Apresenta no dashboard                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Autenticação

### Backend API: `/api/auth/login`

**Arquivo:** `src/app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validar campos
    if (!email || !password) {
      return NextResponse.json({
        status: 'error',
        message: 'Email e senha são obrigatórios'
      }, { status: 400 });
    }

    // Chamar API Blueberry Math
    const blueberryResponse = await fetch(
      'https://dashboard.school.blueberrymath.com/api/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (!blueberryResponse.ok) {
      const errorData = await blueberryResponse.json();
      return NextResponse.json({
        status: 'error',
        message: errorData.message || 'Erro na autenticação'
      }, { status: blueberryResponse.status });
    }

    const data = await blueberryResponse.json();

    // Resposta da API Blueberry contém:
    // - token: string (JWT para autenticação)
    // - school: object (dados da escola)
    // - professor: object (dados do professor)
    // - professor.guid: string (identificador único do professor)

    return NextResponse.json({
      status: 'success',
      data: {
        token: data.token,
        school: data.school,
        professor: {
          guid: data.professor.guid,
          name: data.professor.name,
          email: data.professor.email,
        },
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
```

### Frontend: Uso da API de Login

```typescript
// Exemplo de chamada no frontend
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.status === 'success') {
      // Salvar dados de autenticação
      localStorage.setItem('blueberry_auth', JSON.stringify(result.data));

      // Atualizar estado da aplicação
      setAuthData(result.data);

      // Buscar cursos
      await fetchCourses(result.data.token);
    } else {
      // Mostrar erro
      setError(result.message);
    }
  } catch (error) {
    console.error('Erro:', error);
    setError('Erro ao fazer login');
  }
};
```

---

## 📚 Obtenção de Cursos

### Backend API: `/api/blueberry/courses`

**Arquivo:** `src/app/api/blueberry/courses/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extrair token da query string
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        status: 'error',
        message: 'Token de autenticação é obrigatório'
      }, { status: 401 });
    }

    // Chamar API Blueberry Math
    const coursesResponse = await fetch(
      'https://dashboard.school.blueberrymath.com/api/front/courses?hasBlueBerry=1',
      {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Accept': 'application/json',
        },
      }
    );

    if (!coursesResponse.ok) {
      return NextResponse.json({
        status: 'error',
        message: 'Erro ao buscar cursos'
      }, { status: coursesResponse.status });
    }

    const data = await coursesResponse.json();

    // A resposta contém uma lista de cursos/turmas
    return NextResponse.json({
      status: 'success',
      data: {
        courses: data, // Array de objetos de curso
      },
    });

  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
```

### Estrutura de Dados de Curso

```typescript
interface Course {
  guid: string;          // Identificador único do curso
  name: string;           // Nome da turma
  grade: string;         // Ano/Série
  school: string;        // Nome da escola
  blueberryEnabled: boolean;
  createdAt: string;
}
```

### Frontend: Uso da API de Cursos

```typescript
const fetchCourses = async (token: string) => {
  try {
    const response = await fetch(`/api/blueberry/courses?token=${token}`);

    const result = await response.json();

    if (result.status === 'success') {
      setCourses(result.data.courses);

      // Se houver um curso salvo, selecioná-lo automaticamente
      const savedCourseGuid = localStorage.getItem('selectedCourse');
      if (savedCourseGuid) {
        const course = result.data.courses.find(
          (c: Course) => c.guid === savedCourseGuid
        );
        if (course) {
          setSelectedCourse(course);
          await fetchCourseStudents(course.guid, token);
        }
      }
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

---

## 👨‍🎓 Obtenção de Dados dos Alunos ⭐

Este é o **ponto mais importante** da integração!

### Backend API: `/api/blueberry/course/[courseGuid]/students`

**Arquivo:** `src/app/api/blueberry/course/[courseGuid]/students/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseGuid: string }> }
) {
  try {
    // Obter o GUID do curso da URL
    const resolvedParams = await params;
    const courseGuid = resolvedParams.courseGuid;

    // Extrair token e filtro de dias da query string
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const daysParam = searchParams.get('days') || '30';
    const lang = searchParams.get('lang') || 'pt';

    if (!token) {
      return NextResponse.json({
        status: 'error',
        message: 'Token de autenticação é obrigatório'
      }, { status: 401 });
    }

    if (!courseGuid) {
      return NextResponse.json({
        status: 'error',
        message: 'GUID do curso é obrigatório'
      }, { status: 400 });
    }

    // Validar filtro de dias (aceita: 1, 7, 30, 90)
    const validDays = ['1', '7', '30', '90'];
    if (!validDays.includes(daysParam)) {
      return NextResponse.json({
        status: 'error',
        message: 'Filtro de dias inválido. Use: 1, 7, 30 ou 90'
      }, { status: 400 });
    }

    // Chamar API Blueberry Math para obter alunos
    // IMPORTANTE: Use este endpoint EXATO
    const apiUrl = `https://dashboard.school.blueberrymath.com/api/blueberry/teacher/${courseGuid}/students?days=${daysParam}&lang=${lang}`;

    console.log('Fetching students from:', apiUrl);

    const studentsResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Accept': 'application/json',
      },
    });

    if (!studentsResponse.ok) {
      const errorText = await studentsResponse.text();
      console.error('Erro ao buscar alunos:', errorText);

      return NextResponse.json({
        status: 'error',
        message: `Erro ao buscar alunos: ${studentsResponse.status}`,
        details: errorText,
      }, { status: studentsResponse.status });
    }

    const studentsData = await studentsResponse.json();

    // Estrutura da resposta da API Blueberry:
    // {
    //   students: [
    //     {
    //       guid: string,
    //       name: string,
    //       email: string,
    //       activities: Activity[],
    //       metrics: StudentMetrics
    //     }
    //   ],
    //   course: {
    //     guid: string,
    //     name: string
    //   }
    // }

    return NextResponse.json({
      status: 'success',
      data: studentsData,
    });

  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
```

### Estrutura de Dados dos Alunos

```typescript
interface Student {
  guid: string;
  name: string;
  email?: string;
  activities: Activity[];
  metrics: StudentMetrics;
}

interface Activity {
  guid: string;
  type: string;              // 'exercise', 'game', 'challenge'
  name: string;
  status: string;           // 'completed', 'in-progress', 'not-started'
  score?: number;
  timeSpent?: number;       // em minutos
  completedAt?: string;
  startedAt?: string;
  attempts?: number;
}

interface StudentMetrics {
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  averageScore?: number;
  totalTimeSpent?: number;
  lastActivity?: string;
}
```

### Frontend: Uso da API de Alunos

```typescript
const fetchCourseStudents = async (
  courseGuid: string,
  token: string,
  days: string = '30'
) => {
  try {
    setLoading(true);

    const response = await fetch(
      `/api/blueberry/course/${courseGuid}/students?token=${token}&days=${days}`
    );

    const result = await response.json();

    if (result.status === 'success') {
      setCourseData(result.data);

      // Salvar seleção
      localStorage.setItem('selectedCourse', courseGuid);
      localStorage.setItem('selectedCourseDays', days);

      // Processar e calcular métricas adicionais
      const processedStudents = processStudentData(result.data.students);
      setStudents(processedStudents);
    } else {
      setError(result.message || 'Erro ao buscar alunos');
    }
  } catch (error) {
    console.error('Erro:', error);
    setError('Erro ao carregar dados dos alunos');
  } finally {
    setLoading(false);
  }
};

// Função para processar dados e calcular métricas
const processStudentData = (students: Student[]) => {
  return students.map(student => {
    // Calcular métricas personalizadas
    const totalActivities = student.activities.length;
    const completedActivities = student.activities.filter(
      a => a.status === 'completed'
    ).length;
    const averageScore = calculateAverageScore(student.activities);

    return {
      ...student,
      metrics: {
        ...student.metrics,
        completionRate: (completedActivities / totalActivities) * 100,
        averageScore,
      },
    };
  });
};

const calculateAverageScore = (activities: Activity[]): number => {
  const scoredActivities = activities
    .filter(a => a.score !== undefined && a.score !== null);

  if (scoredActivities.length === 0) return 0;

  const sum = scoredActivities.reduce((acc, a) => acc + (a.score || 0), 0);
  return Math.round((sum / scoredActivities.length) * 10) / 10;
};
```

### ⚠️ Pontos Críticos na Obtenção de Alunos

#### 1. **Endpoint Correto**

```typescript
// ✅ CORRETO
const apiUrl = `https://dashboard.school.blueberrymath.com/api/blueberry/teacher/${courseGuid}/students?days=${daysParam}&lang=${lang}`;

// ❌ INCORRETO - não inclua o GUID do professor
const apiUrl = `https://dashboard.school.blueberrymath.com/api/blueberry/teacher/${professorGuid}/course/${courseGuid}/students?days=${daysParam}`;
```

#### 2. **Filtro de Dias**

O parâmetro `days` é obrigatório e aceita apenas:
- `"1"` - Últimas 24 horas
- `"7"` - Últimos 7 dias
- `"30"` - Últimos 30 dias (padrão)
- `"90"` - Últimos 90 dias

#### 3. **Header de Autorização**

```typescript
// ✅ CORRETO
headers: {
  'Authorization': token,  // Apenas o token, sem "Bearer"
  'Accept': 'application/json',
}

// ❌ INCORRETO
headers: {
  'Authorization': `Bearer ${token}`,  // Não use "Bearer"
  'Accept': 'application/json',
}
```

#### 4. **Tratamento de Erros**

Sempre verifique o status da resposta:

```typescript
if (!studentsResponse.ok) {
  const errorText = await studentsResponse.text();
  console.error('Detalhes do erro:', errorText);

  // Retorne informações úteis para debug
  return NextResponse.json({
    status: 'error',
    message: `Erro ${studentsResponse.status} ao buscar alunos`,
    details: errorText,
  }, { status: studentsResponse.status });
}
```

---

## 📊 Cálculo de Métricas

### Calculator Engine: Protocolo SESI Bahia

**Arquivo:** `src/lib/calculator-engine.ts`

```typescript
/**
 * Calcula o status do aluno baseado no Protocolo SESI Bahia
 */
export interface SESIMetrics {
  status: 'excelente' | 'bom' | 'atenção' | 'crítico';
  score: number;
  completionRate: number;
  averageScore: number;
  activityLevel: 'alto' | 'moderado' | 'baixo' | 'inativo';
  recommendations: string[];
}

export function calculateSESIMetrics(
  activities: Activity[],
  days: number
): SESIMetrics {
  // 1. Atividades completadas
  const completedActivities = activities.filter(
    a => a.status === 'completed'
  );

  // 2. Taxa de conclusão
  const completionRate = activities.length > 0
    ? (completedActivities.length / activities.length) * 100
    : 0;

  // 3. Média de pontuação
  const scoredActivities = completedActivities.filter(
    a => a.score !== undefined && a.score !== null
  );

  const averageScore = scoredActivities.length > 0
    ? scoredActivities.reduce((acc, a) => acc + (a.score || 0), 0) / scoredActivities.length
    : 0;

  // 4. Tempo total gasto
  const totalTimeSpent = activities.reduce(
    (acc, a) => acc + (a.timeSpent || 0),
    0
  );

  // 5. Nível de atividade
  const activitiesPerDay = completedActivities.length / days;

  let activityLevel: SESIMetrics['activityLevel'];
  if (completedActivities.length === 0) {
    activityLevel = 'inativo';
  } else if (activitiesPerDay >= 2) {
    activityLevel = 'alto';
  } else if (activitiesPerDay >= 1) {
    activityLevel = 'moderado';
  } else {
    activityLevel = 'baixo';
  }

  // 6. Calcular score geral (0-100)
  const score = calculateOverallScore({
    completionRate,
    averageScore,
    activityLevel,
  });

  // 7. Determinar status
  let status: SESIMetrics['status'];
  if (score >= 80) {
    status = 'excelente';
  } else if (score >= 60) {
    status = 'bom';
  } else if (score >= 40) {
    status = 'atenção';
  } else {
    status = 'crítico';
  }

  // 8. Gerar recomendações
  const recommendations = generateRecommendations({
    status,
    completionRate,
    averageScore,
    activityLevel,
  });

  return {
    status,
    score: Math.round(score),
    completionRate: Math.round(completionRate),
    averageScore: Math.round(averageScore * 10) / 10,
    activityLevel,
    recommendations,
  };
}

function calculateOverallScore(metrics: {
  completionRate: number;
  averageScore: number;
  activityLevel: string;
}): number {
  // Pesos: Conclusão (40%), Nota (40%), Atividade (20%)
  const completionScore = metrics.completionRate * 0.4;

  const averageScoreNormalized = (metrics.averageScore / 100) * 40;

  const activityScoreMap: Record<string, number> = {
    'alto': 20,
    'moderado': 15,
    'baixo': 10,
    'inativo': 0,
  };

  const activityScore = activityScoreMap[metrics.activityLevel] || 0;

  return completionScore + averageScoreNormalized + activityScore;
}

function generateRecommendations(metrics: {
  status: string;
  completionRate: number;
  averageScore: number;
  activityLevel: string;
}): string[] {
  const recommendations: string[] = [];

  if (metrics.completionRate < 50) {
    recommendations.push('Incentivar o aluno a concluir mais atividades');
  }

  if (metrics.averageScore < 60) {
    recommendations.push('Revisar conceitos fundamentais com o aluno');
  }

  if (metrics.activityLevel === 'baixo' || metrics.activityLevel === 'inativo') {
    recommendations.push('Aumentar a frequência de uso da plataforma');
  }

  if (metrics.status === 'excelente') {
    recommendations.push('Considerar desafios avançados para o aluno');
  }

  return recommendations;
}

/**
 * Calcula métricas agregadas para uma turma inteira
 */
export function calculateClassMetrics(students: Student[]): {
  totalStudents: number;
  activeStudents: number;
  averageClassScore: number;
  statusDistribution: {
    excelente: number;
    bom: number;
    atenção: number;
    crítico: number;
  };
} {
  if (students.length === 0) {
    return {
      totalStudents: 0,
      activeStudents: 0,
      averageClassScore: 0,
      statusDistribution: {
        excelente: 0,
        bom: 0,
        atenção: 0,
        crítico: 0,
      },
    };
  }

  const metrics = students.map(student =>
    calculateSESIMetrics(student.activities, 30)
  );

  const activeStudents = metrics.filter(
    m => m.activityLevel !== 'inativo'
  ).length;

  const averageClassScore =
    metrics.reduce((acc, m) => acc + m.score, 0) / metrics.length;

  const statusDistribution = {
    excelente: metrics.filter(m => m.status === 'excelente').length,
    bom: metrics.filter(m => m.status === 'bom').length,
    atenção: metrics.filter(m => m.status === 'atenção').length,
    crítico: metrics.filter(m => m.status === 'crítico').length,
  };

  return {
    totalStudents: students.length,
    activeStudents,
    averageClassScore: Math.round(averageClassScore),
    statusDistribution,
  };
}
```

---

## 🖥️ Implementação Completa Backend

### Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── route.ts
│   │   └── blueberry/
│   │       ├── courses/
│   │       │   └── route.ts
│   │       └── course/
│   │           └── [courseGuid]/
│   │               └── students/
│   │                   └── route.ts
│   └── page.tsx
├── lib/
│   ├── calculator-engine.ts
│   └── types.ts
└── components/
    └── ui/
```

### Tipos TypeScript Compartilhados

**Arquivo:** `src/lib/types.ts`

```typescript
// Autenticação
export interface AuthData {
  token: string;
  school: School;
  professor: Professor;
}

export interface School {
  guid: string;
  name: string;
  cnpj?: string;
}

export interface Professor {
  guid: string;
  name: string;
  email: string;
}

// Cursos
export interface Course {
  guid: string;
  name: string;
  grade?: string;
  school?: string;
  blueberryEnabled: boolean;
  createdAt?: string;
}

// Alunos
export interface Student {
  guid: string;
  name: string;
  email?: string;
  activities: Activity[];
  metrics: StudentMetrics;
}

export interface Activity {
  guid: string;
  type: 'exercise' | 'game' | 'challenge';
  name: string;
  status: 'completed' | 'in-progress' | 'not-started';
  score?: number;
  timeSpent?: number;
  completedAt?: string;
  startedAt?: string;
  attempts?: number;
}

export interface StudentMetrics {
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  averageScore?: number;
  totalTimeSpent?: number;
  lastActivity?: string;
}

// Métricas SESI
export interface SESIMetrics {
  status: 'excelente' | 'bom' | 'atenção' | 'crítico';
  score: number;
  completionRate: number;
  averageScore: number;
  activityLevel: 'alto' | 'moderado' | 'baixo' | 'inativo';
  recommendations: string[];
}

// Dashboard
export interface CourseData {
  course: Course;
  students: Student[];
}

export interface ClassMetrics {
  totalStudents: number;
  activeStudents: number;
  averageClassScore: number;
  statusDistribution: {
    excelente: number;
    bom: number;
    atenção: number;
    crítico: number;
  };
}
```

---

## 🎨 Implementação Completa Frontend

### Componente Principal (Dashboard)

**Arquivo:** `src/app/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course {
  guid: string;
  name: string;
  grade?: string;
}

interface Student {
  guid: string;
  name: string;
  metrics: {
    totalActivities: number;
    completedActivities: number;
    averageScore?: number;
  };
}

interface SESIMetrics {
  status: 'excelente' | 'bom' | 'atenção' | 'crítico';
  score: number;
  completionRate: number;
}

export default function Dashboard() {
  const [authData, setAuthData] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [sesiMetrics, setSesiMetrics] = useState<SESIMetrics[]>([]);
  const [daysFilter, setDaysFilter] = useState('30');
  const [loading, setLoading] = useState(false);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  // Carregar sessão salva
  useEffect(() => {
    if (isSessionLoaded) return;

    const loadSession = async () => {
      const savedAuth = localStorage.getItem('blueberry_auth');
      const savedCourseGuid = localStorage.getItem('selectedCourse');

      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth);
          setAuthData(parsed);

          if (parsed.token) {
            // Buscar cursos
            const coursesResponse = await fetch(
              `/api/blueberry/courses?token=${parsed.token}`
            );
            const coursesResult = await coursesResponse.json();

            if (coursesResult.status === 'success') {
              setCourses(coursesResult.data.courses);

              // Selecionar curso salvo
              if (savedCourseGuid) {
                const courseObj = coursesResult.data.courses.find(
                  (c: Course) => c.guid === savedCourseGuid
                );
                if (courseObj) {
                  setSelectedCourse(courseObj);
                  await fetchCourseStudents(courseObj.guid, parsed.token);
                }
              }
            }
          }
        } catch (e) {
          console.error('Erro ao carregar sessão:', e);
        }
      }

      setIsSessionLoaded(true);
    };

    loadSession();
  }, [isSessionLoaded]);

  // Buscar alunos de um curso
  const fetchCourseStudents = async (
    courseGuid: string,
    token: string,
    days?: string
  ) => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/blueberry/course/${courseGuid}/students?token=${token}&days=${days || daysFilter}`
      );

      const result = await response.json();

      if (result.status === 'success') {
        setStudents(result.data.students || []);

        // Calcular métricas SESI para cada aluno
        const metrics = result.data.students.map((student: Student) => {
          const completedCount = student.metrics.completedActivities;
          const totalCount = student.metrics.totalActivities;
          const avgScore = student.metrics.averageScore || 0;

          let status: 'excelente' | 'bom' | 'atenção' | 'crítico';
          let score = 0;

          if (totalCount > 0) {
            const completionRate = (completedCount / totalCount) * 100;
            score = (completionRate * 0.6) + (avgScore * 0.4);

            if (score >= 80) status = 'excelente';
            else if (score >= 60) status = 'bom';
            else if (score >= 40) status = 'atenção';
            else status = 'crítico';
          } else {
            status = 'crítico';
            score = 0;
          }

          return {
            ...student,
            sesiMetrics: {
              status,
              score: Math.round(score),
              completionRate: totalCount > 0
                ? Math.round((completedCount / totalCount) * 100)
                : 0,
              averageScore: avgScore,
              activityLevel: completedCount > 0 ? 'moderado' : 'inativo',
              recommendations: [],
            },
          };
        });

        setSesiMetrics(metrics);
      } else {
        console.error('Erro ao buscar alunos:', result.message);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mudar curso selecionado
  const handleCourseChange = async (courseGuid: string) => {
    const course = courses.find((c) => c.guid === courseGuid);
    if (course && authData) {
      setSelectedCourse(course);
      localStorage.setItem('selectedCourse', courseGuid);
      await fetchCourseStudents(courseGuid, authData.token);
    }
  };

  // Mudar filtro de dias
  const handleDaysChange = async (days: string) => {
    setDaysFilter(days);
    localStorage.setItem('selectedCourseDays', days);

    if (selectedCourse && authData) {
      await fetchCourseStudents(selectedCourse.guid, authData.token, days);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('blueberry_auth');
    localStorage.removeItem('selectedCourse');
    localStorage.removeItem('selectedCourseDays');
    setAuthData(null);
    setCourses([]);
    setSelectedCourse(null);
    setStudents([]);
    setSesiMetrics([]);
    setIsSessionLoaded(false);
  };

  if (!authData || !isSessionLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Carregando...</p>
          <Button
            onClick={() => (window.location.href = '/login')}
            className="mt-4"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blueberry Math Analyzer</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </header>

        {/* Seleção de Curso */}
        {courses.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Turma
                </label>
                <Select
                  value={selectedCourse?.guid || ''}
                  onValueChange={handleCourseChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.guid} value={course.guid}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Período
                </label>
                <Select value={daysFilter} onValueChange={handleDaysChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Últimas 24 horas</SelectItem>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Métricas da Turma */}
        {selectedCourse && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedCourse.name} - Resumo da Turma
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {students.length}
                </div>
                <div className="text-sm text-gray-600">Total de Alunos</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {sesiMetrics.filter((m) => m.score >= 60).length}
                </div>
                <div className="text-sm text-gray-600">Alunos em Bom/Excelente</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {sesiMetrics.filter((m) => m.score < 60).length}
                </div>
                <div className="text-sm text-gray-600">Alunos em Atenção</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    sesiMetrics.reduce((acc, m) => acc + m.score, 0) /
                      (sesiMetrics.length || 1)
                  )}
                </div>
                <div className="text-sm text-gray-600">Média da Turma</div>
              </div>
            </div>
          </Card>
        )}

        {/* Lista de Alunos */}
        {loading ? (
          <div className="text-center py-8">
            <p>Carregando dados...</p>
          </div>
        ) : students.length > 0 ? (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Alunos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-center py-3 px-4">Atividades</th>
                    <th className="text-center py-3 px-4">Concluídas</th>
                    <th className="text-center py-3 px-4">Média</th>
                    <th className="text-center py-3 px-4">Status SESI</th>
                    <th className="text-center py-3 px-4">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sesiMetrics.map((student, index) => (
                    <tr key={student.guid || index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        {student.name}
                      </td>
                      <td className="text-center py-3 px-4">
                        {student.metrics.totalActivities}
                      </td>
                      <td className="text-center py-3 px-4">
                        {student.metrics.completedActivities}
                      </td>
                      <td className="text-center py-3 px-4">
                        {student.metrics.averageScore?.toFixed(1) || '-'}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            student.sesiMetrics?.status === 'excelente'
                              ? 'bg-green-100 text-green-800'
                              : student.sesiMetrics?.status === 'bom'
                              ? 'bg-blue-100 text-blue-800'
                              : student.sesiMetrics?.status === 'atenção'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {student.sesiMetrics?.status || '-'}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 font-bold">
                        {student.sesiMetrics?.score || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center text-gray-500">
            Selecione uma turma para ver os dados dos alunos
          </Card>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          © 2025 Blueberry Math Analyzer v3.0
        </footer>
      </div>
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### Problema: "Erro ao buscar alunos - 401 Unauthorized"

**Causas Possíveis:**
1. Token expirado
2. Token inválido
3. Header de autorização incorreto

**Solução:**

```typescript
// Backend: Verificar token
if (!token) {
  return NextResponse.json({
    status: 'error',
    message: 'Token de autenticação é obrigatório'
  }, { status: 401 });
}

// Frontend: Token expirado - fazer logout e pedir novo login
const fetchCourseStudents = async (courseGuid: string, token: string) => {
  const response = await fetch(
    `/api/blueberry/course/${courseGuid}/students?token=${token}&days=30`
  );

  if (response.status === 401) {
    // Token expirado
    handleLogout();
    window.location.href = '/login';
    return;
  }

  // ... resto do código
};
```

### Problema: "Erro ao buscar alunos - 404 Not Found"

**Causas Possíveis:**
1. GUID do curso inválido
2. Endpoint incorreto
3. Curso não pertence ao professor

**Solução:**

```typescript
// Verificar se o GUID está correto
console.log('Buscando alunos do curso:', courseGuid);

// Usar o endpoint correto
const apiUrl = `https://dashboard.school.blueberrymath.com/api/blueberry/teacher/${courseGuid}/students`;

// Não use (INCORRETO):
// const apiUrl = `https://dashboard.school.blueberrymath.com/api/blueberry/teacher/${professorGuid}/course/${courseGuid}/students`;
```

### Problema: "Filtro de dias inválido"

**Causas Possíveis:**
1. Valor do parâmetro `days` não é válido

**Solução:**

```typescript
// Validar filtro de dias
const validDays = ['1', '7', '30', '90'];

if (!validDays.includes(daysParam)) {
  return NextResponse.json({
    status: 'error',
    message: 'Filtro de dias inválido. Use: 1, 7, 30 ou 90'
  }, { status: 400 });
}
```

### Problema: "Array de alunos vazio"

**Causas Possíveis:**
1. Turma sem alunos
2. Filtro de dias muito restrito (ex: "1" dia)
3. Alunos sem atividades no período

**Solução:**

```typescript
// Verificar se há alunos no período
if (studentsData.students.length === 0) {
  console.warn('Nenhum aluno encontrado com atividades no período');
  console.warn('Tente aumentar o filtro de dias para 30 ou 90');

  // Mesmo assim, retorne o array vazio
  return NextResponse.json({
    status: 'success',
    data: {
      students: [],
      course: studentsData.course,
    },
  });
}

// No frontend, mostre mensagem apropriada
{students.length === 0 && (
  <div className="text-center py-8 text-gray-500">
    <p>Nenhum aluno encontrado com atividades neste período.</p>
    <p className="text-sm mt-2">
      Tente aumentar o filtro para 30 ou 90 dias.
    </p>
  </div>
)}
```

### Problema: "Métricas com valor 0"

**Causas Possíveis:**
1. Alunos sem atividades completadas
2. Divisão por zero ao calcular médias

**Solução:**

```typescript
// Ao calcular média, verificar se há atividades com pontuação
const averageScore = scoredActivities.length > 0
  ? scoredActivities.reduce((acc, a) => acc + (a.score || 0), 0) /
    scoredActivities.length
  : 0;  // Retorna 0 em vez de NaN

// Ao calcular taxa de conclusão
const completionRate = activities.length > 0
  ? (completedActivities.length / activities.length) * 100
  : 0;  // Retorna 0 em vez de Infinity
```

---

## 📝 Exemplos Práticos

### Exemplo 1: Buscar todos os cursos do professor

```bash
# 1. Fazer login e obter token
curl -X POST https://dashboard.school.blueberrymath.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"professor@escola.com","password":"senha123"}'

# Resposta: {"token":"abc123...","school":{...},"professor":{...}}

# 2. Usar o token para buscar cursos
curl -X GET 'https://dashboard.school.blueberrymath.com/api/front/courses?hasBlueBerry=1' \
  -H "Authorization: abc123..." \
  -H "Accept: application/json"

# Resposta: [{"guid":"course-1","name":"Turma A",...}, ...]
```

### Exemplo 2: Buscar alunos de uma turma específica

```bash
# 1. Usar o GUID do curso obtido no passo anterior
COURSE_GUID="course-1"

# 2. Buscar alunos dos últimos 30 dias
curl -X GET "https://dashboard.school.blueberrymath.com/api/blueberry/teacher/${COURSE_GUID}/students?days=30&lang=pt" \
  -H "Authorization: abc123..." \
  -H "Accept: application/json"

# Resposta: {"students":[{...}, {...}],"course":{...}}
```

### Exemplo 3: Integração completa no seu projeto

```typescript
// 1. Criar função utilitária para fazer requisições
async function blueberryFetch<T>(
  endpoint: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `https://dashboard.school.blueberrymath.com${endpoint}`,
    {
      ...options,
      headers: {
        'Authorization': token,
        'Accept': 'application/json',
        ...options?.headers,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// 2. Criar funções específicas
export async function login(email: string, password: string) {
  return blueberryFetch<{
    token: string;
    school: any;
    professor: any;
  }>(
    '/api/login',
    '',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }
  );
}

export async function getCourses(token: string) {
  return blueberryFetch<{ courses: Course[] }>(
    '/api/front/courses?hasBlueBerry=1',
    token
  );
}

export async function getStudents(
  token: string,
  courseGuid: string,
  days: '1' | '7' | '30' | '90' = '30'
) {
  return blueberryFetch<{
    students: Student[];
    course: Course;
  }>(
    `/api/blueberry/teacher/${courseGuid}/students?days=${days}&lang=pt`,
    token
  );
}

// 3. Usar no componente
export function useBlueberryData() {
  const [auth, setAuth] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const login = async (email: string, password: string) => {
    const data = await fetchLogin(email, password);
    setAuth(data);
    localStorage.setItem('blueberry_auth', JSON.stringify(data));
  };

  const loadCourses = async () => {
    if (!auth?.token) return;

    const data = await fetchCourses(auth.token);
    setCourses(data.courses);
  };

  const loadStudents = async (courseGuid: string, days = '30') => {
    if (!auth?.token) return;

    const data = await fetchStudents(auth.token, courseGuid, days as any);
    setStudents(data.students);
  };

  return { auth, courses, students, login, loadCourses, loadStudents };
}
```

---

## ✅ Checklist de Implementação

Use este checklist para garantir que sua integração está completa:

- [ ] **Autenticação**
  - [ ] API de login criada (`/api/auth/login`)
  - [ ] Token salvo no localStorage
  - [ ] Tratamento de erro de credenciais
  - [ ] Logout implementado

- [ ] **Cursos**
  - [ ] API de cursos criada (`/api/blueberry/courses`)
  - [ ] Dropdown de seleção de turma
  - [ ] Salvar turma selecionada no localStorage
  - [ ] Carregar turma salva ao iniciar

- [ ] **Alunos** ⭐
  - [ ] API de alunos criada (`/api/blueberry/course/[guid]/students`)
  - [ ] Endpoint correto: `/api/blueberry/teacher/{guid}/students`
  - [ ] Filtro de dias implementado (1, 7, 30, 90)
  - [ ] Header de autorização correto (sem "Bearer")
  - [ ] Tratamento de erros completo
  - [ ] Log detalhado para debug

- [ ] **Métricas**
  - [ ] Calculator engine implementada
  - [ ] Status SESI calculado (excelente, bom, atenção, crítico)
  - [ ] Taxa de conclusão calculada
  - [ ] Média de pontuação calculada
  - [ ] Métricas agregadas da turma

- [ ] **UI/UX**
  - [ ] Loading states
  - [ ] Mensagens de erro
  - [ ] Feedback visual (cores por status)
  - [ ] Responsividade (mobile/desktop)
  - [ ] Acessibilidade (labels, ARIA)

- [ ] **Debugging**
  - [ ] Console.log em endpoints críticos
  - [ ] Log de erros detalhado
  - [ ] Tratamento de casos edge
  - [ ] Validação de dados

---

## 📞 Suporte

Se você tiver problemas durante a implementação:

1. **Verifique os logs do console** - Erros detalhados podem revelar o problema
2. **Use o DevTools** - Aba Network para ver as requisições e respostas
3. **Valide os parâmetros** - Confira que o token, GUID e days estão corretos
4. **Teste isoladamente** - Teste cada API separadamente com curl ou Postman

### Logs Importantes

```typescript
// No backend
console.log('[Courses] Buscando cursos para token:', token.substring(0, 10) + '...');
console.log('[Students] Buscando alunos do curso:', courseGuid, 'dias:', days);
console.log('[Students] API URL:', apiUrl);
console.log('[Students] Response status:', studentsResponse.status);

// No frontend
console.log('Auth data loaded:', authData ? 'YES' : 'NO');
console.log('Courses loaded:', courses.length);
console.log('Selected course:', selectedCourse);
console.log('Students loaded:', students.length);
```

---

## 🎉 Conclusão

Este documento cobre todo o fluxo de integração com a API Blueberry Math, com foco especial na obtenção dos dados dos alunos, que é o ponto crítico mencionado.

**Pontos-chave para lembrar:**

1. ✅ Use o endpoint correto: `/api/blueberry/teacher/{courseGuid}/students`
2. ✅ Não inclua o GUID do professor na URL
3. ✅ O header de autorização deve ter apenas o token (sem "Bearer")
4. ✅ O parâmetro `days` é obrigatório (1, 7, 30, ou 90)
5. ✅ Trate todos os erros e retorne informações úteis para debug
6. ✅ Valide todos os parâmetros antes de fazer as requisições
7. ✅ Use logs extensivos durante o desenvolvimento

Com este guia, você deve conseguir implementar a integração completa e obter todos os dados necessários dos alunos da Blueberry Math!

---

**Versão:** 3.0
**Última atualização:** 2025
**Compatível com:** Next.js 16, TypeScript 5, API Blueberry Math
