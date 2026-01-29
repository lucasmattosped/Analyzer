# 📝 Guia de Logging Automático - Blueberry Math Analyzer

## 🎯 O que É

Sistema que **registra automaticamente** todas as ações, mudanças e dados dos professores que usam o Blueberry Math Analyzer.

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────┐
│  Aplicação Next.js                         │
│  ├── API Routes (Backend)                 │
│  │   ├── Login                            │
│  │   ├── Fetch Courses                     │
│  │   └── Fetch Students                    │
│  └── Frontend (page.tsx)                │
└─────────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  Worklog.md (Registro de Atividades)    │
└─────────────────────────────────────────────────┘
```

---

## 📋 Passo 1: Criar Estrutura de Logging

### 1.1. Diretório do Worklog

```bash
/home/z/my-project/worklog.md
```

### 1.2. Formato do Worklog

Cada tarefa tem uma seção padronizada:

```markdown
---
Task ID: 1
Agent: Z.ai Code
Task: Descrição da tarefa

Work Log:
- Ação 1 realizada
- Ação 2 realizada
- Ação 3 realizada

Stage Summary:
- Resultados da tarefa
- Arquivos modificados
- Status final
```

---

## 🔍 Passo 2: Logging no Backend (API Routes)

### 2.1. Exemplo Prático - Login API

**Arquivo:** `/src/app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ============================================
    // LOGGING - Registrar tentativa de login
    // ============================================
    console.log('=== BLUEBERRY MATH LOGIN ===');
    console.log('URL: https://dashboard.school.blueberrymath.com/api/login');
    console.log('Email:', email);
    console.log('Timestamp:', new Date().toISOString());
    
    const loginResponse = await fetch('https://dashboard.school.blueberrymath.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginResponse.json();
    
    // ============================================
    // LOGGING - Registrar resposta da API
    // ============================================
    console.log('Response status:', loginResponse.status);
    console.log('Response data:', {
      status: loginData.status,
      hasToken: !!loginData.data?.token,
      tokenPreview: loginData.data?.token ? loginData.data.token.substring(0, 30) + '...' : 'none',
      hasSettings: !!loginData.data?.settings,
      delegatedSchoolsCount: loginData.data?.delegatedSchools?.length || 0,
    });
    console.log('============================');
    // ============================================

    if (loginData.status !== 'success') {
      console.error('LOGIN FAILED:', loginData.message);
      return NextResponse.json(
        { error: loginData.message || 'Falha no login' },
        { status: 401 }
      );
    }

    const { token, delegatedSchools } = loginData.data;
    const school = delegatedSchools?.[0] || null;

    return NextResponse.json({
      status: 'success',
      data: {
        token,
        school,
      },
    });

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
```

### 2.2. Exemplo - API de Students

**Arquivo:** `/src/app/api/blueberry/course/[courseGuid]/students/route.ts`

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseGuid: string }> }
) {
  const resolvedParams = await params;
  
  // ============================================
  // LOGGING - Registrar requisição de dados
  // ============================================
  console.log('=== BLUEBERRY MATH ANALYZER 2.0 ===');
  console.log('Course GUID:', resolvedParams.courseGuid);
  console.log('Search params:', request.nextUrl.searchParams.toString());
  console.log('Timestamp:', new Date().toISOString());
  
  // ... processamento ...
  
  console.log('Response data:', {
    status: studentsData.status,
    usersCount: studentsData.data?.users?.length || 0,
  });
  console.log('============================');
}
```

---

## 📝 Passo 3: Atualizar Worklog Automáticamente

### 3.1. Quando Atualizar o Worklog

A **cada vez que você**:
- Modifica código
- Corrige um erro
- Adiciona nova feature
- Resolve um problema

Você **DEVE** atualizar o worklog:

```bash
cat >> /home/z/my-project/worklog.md << 'EOF'

---
Task ID: XX
Agent: Z.ai Code
Task: Descrição breve

Work Log:
- Ação 1 concreta
- Ação 2 concreta
- Ação 3 concreta

Stage Summary:
- Resultados
- Arquivos modificados
EOF
```

### 3.2. Exemplo Real - Como Faço

```bash
# Depois de corrigir um erro no login
cat >> /home/z/my-project/worklog.md << 'EOF'

---
Task ID: 27
Agent: Z.ai Code
Task: Fix favicon 404 error

Work Log:
- User reported 404 Not Found for favicon.ico
- Browser was attempting to load favicon automatically
- Created favicon.ico by copying logo.svg
- Updated layout.tsx to reference both favicon.ico and logo.svg

Changes Made:
1. Created favicon.ico file:
   - Copied logo.svg as favicon.ico in /public directory
   - Uses existing logo as favicon

2. Updated layout.tsx:
   - Added favicon.ico reference for browser compatibility
   - Kept logo.svg for modern browsers

Stage Summary:
- 404 error resolved by creating favicon.ico
- Layout updated to reference both icon types
- Build successful with no errors
- Application should now load without 404s
EOF
```

---

## 🔧 Passo 4: Criar Sistema de Checkpoints

### 4.1. Por que Checkpoints?

- ✅ **Segurança:** Pode voltar se algo der errado
- ✅ **Experimentação:** Testar features sem medo
- ✅ **Documentação:** Registra evolução do projeto
- ✅ **Colaboração:** Outros devs veem o que foi feito

### 4.2. Scripts de Checkpoint

**Criar checkpoint:**
```bash
bash create-checkpoint.sh "Descrição do estado atual"
```

**Listar checkpoints:**
```bash
ls -la checkpoints/
```

**Restaurar checkpoint:**
```bash
bash restore-checkpoint.sh checkpoint_ID
```

### 4.3. Estrutura de Checkpoints

```
checkpoints/
├── README.md                          # Guia de uso
├── checkpoint_20260127_143814/      # Snapshot específico
│   ├── MANIFESTO.md                # Documentação
│   ├── src/
│   │   ├── app/
│   │   ├── lib/
│   │   └── components/
│   └── package.json
```

---

## 📊 Passo 5: O Que É Logado Automaticamente

### 5.1. Login dos Professores

**Informações capturadas:**
- ✅ Email (parcial - primeiros 30 chars)
- ✅ Timestamp do login
- ✅ Status da resposta (200, 401, 500)
- ✅ Se o token foi recebido
- ✅ Token preview (segurança - só 30 chars)
- ✅ Se settings foram recebidos
- ✅ Quantidade de escolas delegadas
- ✅ Dados da escola principal (nome, GUID)

**Onde fica:** `console.log` do servidor
**Como ver:** No terminal onde roda `bun run dev`

### 5.2. Fetch de Cursos/Turmas

**Informações capturadas:**
- ✅ Token usado
- ✅ Timestamp da requisição
- ✅ URL da API chamada
- ✅ Status da resposta HTTP
- ✅ Quantidade de cursos retornados
- ✅ Dados de cada curso (GUID, nome, grade)

**Onde fica:** `console.log` da API `/api/blueberry/courses`

### 5.3. Fetch de Alunos

**Informações capturadas:**
- ✅ Course GUID solicitado
- ✅ Período de dias (7, 30, 90)
- ✅ Timestamp da requisição
- ✅ Status da resposta
- ✅ Quantidade de alunos retornados
- ✅ Dados de métricas calculadas
- ✅ Distribuição por semáforo (VERDE, AMARELO, VERMELHO)
- ✅ Recomendações de intervenção

**Onde fica:** `console.log` da API `/api/blueberry/course/[courseGuid]/students`

---

## 🚀 Passo 6: Implementação em Outro Chat

### 6.1. Copiar para Outro Chat do Z.AI

**Passo 1:** No chat do Z.AI, você digita:

```
Criei um sistema de logging automático como no Blueberry Math Analyzer 3.0. Quero que você implemente isso para o projeto XYZ.

O sistema deve:
1. Registrar login de usuários no worklog.md
2. Logar todas as chamadas de API no console
3. Criar sistema de checkpoints
4. Atualizar worklog.md automaticamente após cada mudança

Vou te enviar os scripts de checkpoint que uso.
```

**Passo 2:** Depois, você envia os scripts:

```bash
# Conteúdo de create-checkpoint.sh
#!/bin/bash

CHECKPOINT_DIR="/home/seu-projeto/checkpoints"
# ... restante do script ...

# Conteúdo de restore-checkpoint.sh
#!/bin/bash

CHECKPOINT_DIR="/home/seu-projeto/checkpoints"
# ... restante do script ...
```

### 6.2. Instrução Detalhada para o AI

**Texto para enviar ao Z.AI:**

```
Implemente um sistema completo de logging automático para o projeto Blueberry Math Analyzer 3.0 com as seguintes características:

1. WORKLOG AUTOMÁTICO
   - Crie arquivo worklog.md na raiz do projeto
   - Cada tarefa deve adicionar uma nova seção com formato padronizado
   - Use sempre Task ID sequencial (1, 2, 3, ...)
   - Inclua: Work Log e Stage Summary

2. LOGGING DE API
   - Adicione console.log em todas as API routes
   - Log timestamps, parâmetros, status de resposta
   - Não logue senhas ou dados sensíveis completos
   - Use previews (ex: token.substring(0, 30) + '...')

3. LOGGING NO CONSOLE
   - Log início de cada operação com === TÍTULO ===
   - Log parâmetros principais
   - Log resultados/respostas
   - Termine com ============================
   - Log erros com console.error()

4. SISTEMA DE CHECKPOINTS
   - Crie script create-checkpoint.sh
   - Crie script restore-checkpoint.sh
   - Salve arquivos críticos: page.tsx, layout.tsx, API routes
   - Salve diretórios completos: src/app, src/lib, src/components
   - Crie MANIFESTO.md com informações do estado
   - Use timestamps nos nomes dos checkpoints

5. ATUALIZAÇÃO AUTOMÁTICA
   - Após cada mudança no código, execute:
     cat >> worklog.md << 'EOF'
     
---
Task ID: XX
Agent: AI Nome
Task: Descrição

Work Log:
- Arquivos modificados
- Mudanças implementadas

Stage Summary:
- Resultado da tarefa
- Comandos executados
EOF

FORMATO PADRIZADO:
---
Task ID: NUMERO
Agent: NOME_DO_AGENTE
Task: DESCRIÇÃO_BREVE

Work Log:
- Ação 1 concreta realizada
- Ação 2 concreta realizada
- Ação 3 concreta realizada

Stage Summary:
- Resultado final
- Arquivos que foram modificados
- Status do sistema
EOF

6. VERIFICAÇÃO
   - Sempre verifique se o servidor está rodando (HTTP 200)
   - Execute bun run lint para garantir 0 erros
   - Atualize worklog.md após qualquer bug corrigido
   - Crie checkpoint antes de mudanças arriscadas
```

---

## 📚 Passo 7: Scripts Prontos para Copiar

### 7.1. Script de Checkpoint (create-checkpoint.sh)

```bash
#!/bin/bash
# ============================================
# Sistema de Checkpoints
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SNAPSHOT_DIR="/home/SEU-PROJETO/checkpoints"
DESCRIPTION="${1:-Checkpoint sem descrição}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CHECKPOINT_NAME="checkpoint_${TIMESTAMP}"

mkdir -p "$SNAPSHOT_DIR"
CHECKPOINT_PATH="$SNAPSHOT_DIR/$CHECKPOINT_NAME"
mkdir -p "$CHECKPOINT_PATH"

echo -e "${GREEN}📸 CRIANDO CHECKPOINT${NC}"
echo -e "ID: $CHECKPOINT_NAME"
echo -e "Descrição: $DESCRIPTION"

# Copiar arquivos críticos
CRITICAL_FILES=(
    "src/app/page.tsx"
    "src/app/layout.tsx"
    "src/app/api/auth/login/route.ts"
    "src/app/api/blueberry/courses/route.ts"
    "src/app/api/blueberry/course/[courseGuid]/students/route.ts"
)

FILES_COPIED=0
for FILE in "${CRITICAL_FILES[@]}"; do
    if [ -f "/home/SEU-PROJETO/$FILE" ]; then
        mkdir -p "$CHECKPOINT_PATH/$(dirname "$FILE")"
        cp "/home/SEU-PROJETO/$FILE" "$CHECKPOINT_PATH/$FILE"
        echo -e "${GREEN}  ✓${NC} $FILE"
        ((FILES_COPIED++))
    fi
done

echo -e "${GREEN}✅ COMPLETO: $FILES_COPIED arquivos${NC}"
```

### 7.2. Script de Restauração (restore-checkpoint.sh)

```bash
#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SNAPSHOT_DIR="/home/SEU-PROJETO/checkpoints"

if [ -z "$1" ]; then
    echo -e "${YELLOW}❌ ERRO: Informe o ID do checkpoint${NC}"
    exit 1
fi

CHECKPOINT_ID="$1"
CHECKPOINT_PATH="$SNAPSHOT_DIR/$CHECKPOINT_ID"

if [ ! -d "$CHECKPOINT_PATH" ]; then
    echo -e "${YELLOW}❌ ERRO: Checkpoint não encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}🔄 RESTAURANDO $CHECKPOINT_ID${NC}"

# Restaurar arquivos
FILES_RESTORED=0
restore_file() {
    local src="$1"
    local dst="$2"
    if [ -f "$src" ]; then
        cp "$src" "$dst"
        echo -e "${GREEN}  ✓${NC} $dst"
        ((FILES_RESTORED++))
    fi
}

restore_file "$CHECKPOINT_PATH/src/app/page.tsx" "/home/SEU-PROJETO/src/app/page.tsx"
restore_file "$CHECKPOINT_PATH/src/app/layout.tsx" "/home/SEU-PROJETO/src/app/layout.tsx"
restore_file "$CHECKPOINT_PATH/src/app/api/auth/login/route.ts" "/home/SEU-PROJETO/src/app/api/auth/login/route.ts"

# Limpar cache
rm -rf /home/SEU-PROJETO/.next

echo -e "${GREEN}✅ COMPLETO: $FILES_RESTORED arquivos restaurados${NC}"
```

---

## ✅ Resumo

### O Que É Logado:

1. **Login dos Professores**
   - Email (parcial)
   - Timestamp
   - Status (sucesso/erro)
   - Token gerado
   - Escolas disponíveis

2. **Cursos/Turmas**
   - Lista de turmas
   - Número de alunos
   - IDs das turmas

3. **Alunos e Métricas**
   - Desempenho individual
   - Distribuição por semáforo
   - Recomendações

4. **Evolução do Projeto**
   - Tarefas executadas
   - Erros corrigidos
   - Features adicionadas
   - Timestamp de cada mudança

### Como Implementar:

1. **Copie os scripts** acima para o seu chat do Z.AI
2. **Envie a instrução detalhada** ao AI
3. **Forneça os scripts de checkpoint** adaptados para seu projeto
4. **Peça**:
   - Criação do worklog.md
   - Logging em todas as APIs
   - Atualização automática após mudanças
   - Sistema de checkpoints

---

## 🎯 Dica Importante

**O segredo do sucesso é:**

1. **Seja específico** na sua requisição ao AI
2. **Forneça exemplos de código** reais
3. **Use o formato padronizado** que mostrei acima
4. **Peça verificação** do servidor e lint após mudanças
5. **Documente no worklog** tudo que for feito

**Prompt pronto para copiar e enviar:**

```
Crie um sistema de logging automático para o Blueberry Math Analyzer 3.0 com as seguintes características:

1. WORKLOG AUTOMÁTICO
   - Crie worklog.md na raiz do projeto
   - Use formato padronizado com Task ID, Work Log, Stage Summary
   - Atualize automaticamente após cada tarefa

2. LOGGING DE API NO CONSOLE
   - Adicione console.log em todas as API routes
   - Log timestamp, parâmetros, status de resposta
   - Use === TÍTULO === no início
   - Use ============================ no final
   - Log erros com console.error()

3. LOGGING DE LOGIN
   - Capture: email (parcial), timestamp, status, token preview
   - Capture: quantidades de cursos/escolas
   - NÃO logue senha completa

4. LOGGING DE CURSOS E ALUNOS
   - Capture: course GUID, período, timestamp
   - Capture: número de alunos, métricas calculadas
   - Capture: distribuição por semáforo

5. SISTEMA DE CHECKPOINTS
   - Crie scripts create-checkpoint.sh e restore-checkpoint.sh
   - Salve arquivos críticos e diretórios
   - Crie MANIFESTO.md com informações do estado
   - Use timestamps nos nomes

6. ATUALIZAÇÃO AUTOMÁTICA
   - Após cada mudança, execute:
     cat >> worklog.md << 'EOF'
     
---
Task ID: XX
Agent: Z.ai Code
Task: Descrição da tarefa

Work Log:
- Arquivo modificado: X
- Mudança: Y adicionada
- Bug corrigido: Z resolvido

Stage Summary:
- Resultado final
- Arquivos que foram modificados
- Status do sistema após mudança
EOF

7. VERIFICAÇÃO
   - Execute bun run lint (deve ter 0 erros)
   - Verifique se servidor responde HTTP 200
   - Atualize worklog.md após qualquer bug corrigido
   - Crie checkpoint antes de mudanças de risco

Implemente isso seguindo os padrões do Next.js 16 com App Router, TypeScript, e Turbopack.
```

---

**Boa sorte com o projeto no outro chat! 🚀**
