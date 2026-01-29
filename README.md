# Sistema de Checkpoints - Blueberry Math Analyzer 3.0

## 📋 O que são Checkpoints?

Checkpoints são snapshots instantâneos do estado do projeto. Eles permitem:
- ✅ Voltar ao estado anterior se algo der errado
- ✅ Experimentar features sem medo de quebrar código
- ✅ Documentar evolução do projeto ao longo do tempo
- ✅ Restaurar funcionalidades que foram removidas

---

## 🚀 Como Usar

### Criar um Novo Checkpoint

```bash
bash create-checkpoint.sh "Descrição do checkpoint"
```

**Exemplos:**
```bash
# Checkpoint simples
bash create-checkpoint.sh

# Com descrição
bash create-checkpoint.sh "Login direto implementado"

# Com descrição detalhada
bash create-checkpoint.sh "Sistema de semáforo SESI Bahia integrado com validação matemática"
```

**O que é salvo:**
- Todos os arquivos críticos do projeto
- Diretórios: `src/app/api/blueberry`, `src/components/blueberry`, `src/lib`, `src/store`, `src/types`
- Arquivo `MANIFESTO.md` com descrição do estado
- Data e timestamp

### Restaurar Checkpoint

**Opção 1: Restaurar o checkpoint mais recente**
```bash
bash restore-checkpoint.sh
```

**Opção 2: Restaurar checkpoint específico**
```bash
bash restore-checkpoint.sh checkpoint_YYYYMMDD_HHMMSS
```

**Exemplo:**
```bash
bash restore-checkpoint.sh checkpoint_20260127_143814
```

### Listar Checkpoints Disponíveis

```bash
ls -lht /home/z/my-project/checkpoints/
```

**Saída mostra:**
- Data de criação
- Tamanho do checkpoint
- Nome/ID

---

## 📂 Estrutura dos Checkpoints

```
checkpoints/
├── README.md                          # Este arquivo
├── checkpoint_20260127_143814/      # Snapshot específico
│   ├── MANIFESTO.md                # Documentação do estado
│   ├── src/
│   │   ├── app/
│   │   ├── components/blueberry/
│   │   ├── lib/
│   │   ├── store/
│   │   └── types/
│   └── package.json
└── checkpoint_20260127_151234/
    ├── MANIFESTO.md
    └── src/
        └── ...
```

---

## 🔍 O que é Salvo por Checkpoint

### Arquivos Críticos (Individuais)
- `src/app/page.tsx` - Página principal
- `src/app/layout.tsx` - Layout da aplicação
- `src/app/api/blueberry/login/route.ts` - API de login
- `src/app/api/blueberry/classes/route.ts` - API de turmas
- `src/app/api/blueberry/students/route.ts` - API de alunos
- `src/app/api/blueberry/kcs/route.ts` - API de componentes de conhecimento
- `src/components/blueberry/LoginForm.tsx` - Formulário de login
- `src/components/blueberry/ClassSelector.tsx` - Seletor de turmas
- `src/components/blueberry/PeriodFilter.tsx` - Filtro de período
- `src/components/blueberry/StudentCard.tsx` - Card de aluno
- `src/components/blueberry/ClassDashboard.tsx` - Dashboard da turma
- `src/store/auth.ts` - Store de autenticação
- `src/store/app.ts` - Store da aplicação
- `src/lib/validation.ts` - Utilitários de validação
- `src/lib/traffic-light.ts` - Utilitários de semáforo
- `src/types/blueberry.ts` - Tipos TypeScript
- `package.json` - Dependências do projeto

### Diretórios Completos
- `src/app/api/blueberry/` - Todas as APIs Blueberry
- `src/components/blueberry/` - Todos os componentes Blueberry
- `src/lib/` - Todos os utilitários
- `src/store/` - Todas as stores Zustand
- `src/types/` - Todos os tipos

---

## ⚠️ Boas Práticas

### Quando Criar Checkpoints
1. **Antes de grandes mudanças**
   ```bash
   bash create-checkpoint.sh "Antes de refatorar sistema de validação"
   ```

2. **Após features importantes**
   ```bash
   bash create-checkpoint.sh "Login direto implementado com sucesso"
   ```

3. **Quando algo está funcionando bem**
   ```bash
   bash create-checkpoint.sh "Versão estável - todas as funcionalidades testadas"
   ```

4. **Antes de experimentar algo arriscado**
   ```bash
   bash create-checkpoint.sh "Versão funcional antes de tentar nova arquitetura"
   ```

### Quando Restaurar Checkpoints
1. **Quando algo quebrou**
   ```bash
   bash restore-checkpoint.sh
   ```

2. **Quando querer descartar experimentos**
   ```bash
   bash restore-checkpoint.sh checkpoint_estavel_anterior
   ```

3. **Quando a funcionalidade principal parou de funcionar**
   ```bash
   bash restore-checkpoint.sh checkpoint_ultima_versao_funcional
   ```

---

## 🔄 Fluxo de Trabalho Sugerido

```
1. Criar checkpoint do estado atual
   ↓
2. Fazer mudanças/experimentos
   ↓
3. Testar as mudanças
   ↓
4a. Se funcionou → Criar novo checkpoint
   ↓
4b. Se falhou → Restaurar checkpoint anterior
   ↓
5. Repetir
```

---

## 📝 Comandos Rápidos

### Criar checkpoint rápido
```bash
bash create-checkpoint.sh
```

### Restaurar último checkpoint
```bash
bash restore-checkpoint.sh
```

### Ver checkpoints disponíveis
```bash
ls -lht /home/z/my-project/checkpoints/
```

### Limpar checkpoints antigos (manual)
```bash
# Remover checkpoint específico
rm -rf /home/z/my-project/checkpoints/checkpoint_ID

# Remover checkpoints mais antigos que X dias (ex: 30 dias)
find /home/z/my-project/checkpoints/ -type d -mtime +30 -exec rm -rf {} \;
```

---

## ⚠️ Limitações

- Os checkpoints **não incluem** arquivos temporários e cache
- O cache `.next/` sempre é recriado após restauração
- Checkpoints ocupam espaço em disco (~1-5MB cada)
- **NÃO faça commit** da pasta `checkpoints/` no Git (adicionar ao .gitignore)

---

## 🛠️ Solução de Problemas

### Erro: "Nenhum checkpoint encontrado"
- Verifique se a pasta `/home/z/my-project/checkpoints/` existe
- Crie um checkpoint primeiro: `bash create-checkpoint.sh`

### Erro: "Checkpoint não encontrado"
- Liste os checkpoints disponíveis: `ls /home/z/my-project/checkpoints/`
- Use o ID exato do checkpoint

### Erro de permissão
```bash
chmod +x create-checkpoint.sh restore-checkpoint.sh
```

### Arquivos não são restaurados
- Verifique se os arquivos existem no checkpoint: `ls -la checkpoints/checkpoint_ID/`
- Confirme se está no diretório correto do projeto

---

## 💡 Dicas

1. **Use descrições descritivas** no checkpoint
   - ✅ "Login direto implementado"
   - ❌ "checkpoint 1"

2. **Crie checkpoint antes de mudanças grandes**
   - Melhor prevenir do que remediar

3. **Mantenha checkpoints de versões estáveis**
   - Use como base de retorno seguro

4. **Limpe checkpoints antigos periodicamente**
   - Economiza espaço em disco

5. **Documente checkpoints importantes no worklog.md**
   - Facilita encontrar versões específicas depois

---

## 📚 Documentação Relacionada

- `worklog.md` - Registro detalhado de todas as tarefas
- `COMO-FAZER-LOGGING.md` - Guia de logging automático
- `Processo e Playbook.docx` - Playbook do projeto

---

**Última atualização:** Janeiro 2025
**Versão:** 1.0
