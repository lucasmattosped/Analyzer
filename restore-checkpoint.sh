#!/bin/bash
# ============================================
# Sistema de Restauração - Blueberry Math Analyzer 3.0
# ============================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/home/z/my-project"
CHECKPOINT_DIR="/home/z/my-project/checkpoints"

# Se nenhum argumento, usar o último checkpoint
if [ -z "$1" ]; then
    # Encontrar o checkpoint mais recente
    LATEST_CHECKPOINT=$(ls -t "$CHECKPOINT_DIR" | head -1)
    if [ -z "$LATEST_CHECKPOINT" ]; then
        echo -e "${RED}❌ ERRO: Nenhum checkpoint encontrado${NC}"
        exit 1
    fi
    CHECKPOINT_ID="$LATEST_CHECKPOINT"
    echo -e "${YELLOW}📋 Nenhum ID fornecido, usando o checkpoint mais recente${NC}"
else
    CHECKPOINT_ID="$1"
fi

CHECKPOINT_PATH="$CHECKPOINT_DIR/$CHECKPOINT_ID"

if [ ! -d "$CHECKPOINT_PATH" ]; then
    echo -e "${RED}❌ ERRO: Checkpoint não encontrado${NC}"
    echo -e "${YELLOW}Checkpoint procurado: $CHECKPOINT_ID${NC}"
    echo ""
    echo -e "${YELLOW}Checkpoints disponíveis:${NC}"
    ls -1 "$CHECKPOINT_DIR" | nl -n -s'. '
    exit 1
fi

echo -e "${GREEN}🔄 RESTAURANDO CHECKPOINT${NC}"
echo -e "${BLUE}ID: $CHECKPOINT_ID${NC}"

# Mostrar MANIFESTO se existir
if [ -f "$CHECKPOINT_PATH/MANIFESTO.md" ]; then
    echo ""
    echo -e "${YELLOW}--- MANIFESTO ---${NC}"
    cat "$CHECKPOINT_PATH/MANIFESTO.md"
    echo -e "${YELLOW}-------------------${NC}"
    echo ""
fi

# Perguntar confirmação
echo -e "${YELLOW}⚠️  Isso vai sobrescrever os arquivos atuais do projeto!${NC}"
read -p "Continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}❌ Restauração cancelada${NC}"
    exit 0
fi

echo -e "${GREEN}Restaurando arquivos...${NC}"

# Restaurar arquivos
FILES_RESTORED=0
restore_file() {
    local src="$1"
    local dst="$2"
    if [ -f "$src" ]; then
        cp "$src" "$dst"
        echo -e "${GREEN}  ✓${NC} $dst"
        ((FILES_RESTORED++))
    else
        echo -e "${YELLOW}  ⚠${NC} $dst (arquivo não existe no checkpoint)"
    fi
}

# Restaurar diretórios
restore_dir() {
    local src="$1"
    local dst="$2"
    if [ -d "$src" ]; then
        rm -rf "$dst"
        cp -r "$src" "$dst"
        echo -e "${GREEN}  📁${NC} $dst"
        ((FILES_RESTORED++))
    else
        echo -e "${YELLOW}  ⚠${NC} $dst (diretório não existe no checkpoint)"
    fi
}

# Restaurar arquivos críticos
restore_file "$CHECKPOINT_PATH/src/app/page.tsx" "$PROJECT_DIR/src/app/page.tsx"
restore_file "$CHECKPOINT_PATH/src/app/layout.tsx" "$PROJECT_DIR/src/app/layout.tsx"
restore_file "$CHECKPOINT_PATH/src/app/api/blueberry/login/route.ts" "$PROJECT_DIR/src/app/api/blueberry/login/route.ts"
restore_file "$CHECKPOINT_PATH/src/app/api/blueberry/classes/route.ts" "$PROJECT_DIR/src/app/api/blueberry/classes/route.ts"
restore_file "$CHECKPOINT_PATH/src/app/api/blueberry/students/route.ts" "$PROJECT_DIR/src/app/api/blueberry/students/route.ts"
restore_file "$CHECKPOINT_PATH/src/app/api/blueberry/kcs/route.ts" "$PROJECT_DIR/src/app/api/blueberry/kcs/route.ts"
restore_file "$CHECKPOINT_PATH/src/components/blueberry/LoginForm.tsx" "$PROJECT_DIR/src/components/blueberry/LoginForm.tsx"
restore_file "$CHECKPOINT_PATH/src/components/blueberry/ClassSelector.tsx" "$PROJECT_DIR/src/components/blueberry/ClassSelector.tsx"
restore_file "$CHECKPOINT_PATH/src/components/blueberry/PeriodFilter.tsx" "$PROJECT_DIR/src/components/blueberry/PeriodFilter.tsx"
restore_file "$CHECKPOINT_PATH/src/components/blueberry/StudentCard.tsx" "$PROJECT_DIR/src/components/blueberry/StudentCard.tsx"
restore_file "$CHECKPOINT_PATH/src/components/blueberry/ClassDashboard.tsx" "$PROJECT_DIR/src/components/blueberry/ClassDashboard.tsx"
restore_file "$CHECKPOINT_PATH/src/store/auth.ts" "$PROJECT_DIR/src/store/auth.ts"
restore_file "$CHECKPOINT_PATH/src/store/app.ts" "$PROJECT_DIR/src/store/app.ts"
restore_file "$CHECKPOINT_PATH/src/lib/validation.ts" "$PROJECT_DIR/src/lib/validation.ts"
restore_file "$CHECKPOINT_PATH/src/lib/traffic-light.ts" "$PROJECT_DIR/src/lib/traffic-light.ts"
restore_file "$CHECKPOINT_PATH/src/types/blueberry.ts" "$PROJECT_DIR/src/types/blueberry.ts"
restore_file "$CHECKPOINT_PATH/package.json" "$PROJECT_DIR/package.json"

# Limpar cache
echo ""
echo -e "${YELLOW}Limpando cache...${NC}"
rm -rf "$PROJECT_DIR/.next"
echo -e "${GREEN}  ✓${NC} Cache removido"

echo ""
echo -e "${GREEN}✅ RESTAURAÇÃO COMPLETA!${NC}"
echo -e "${GREEN}Total restaurado: ${NC}$FILES_RESTORED itens"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo -e "${BLUE}1. Executar 'bun run lint' para verificar código${NC}"
echo -e "${BLUE}2. Aguardar o servidor Next.js recompilar${NC}"
echo -e "${BLUE}3. Verificar funcionalidade no Preview Panel${NC}"
