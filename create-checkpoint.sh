#!/bin/bash
# ============================================
# Sistema de Checkpoints - Blueberry Math Analyzer 3.0
# ============================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/home/z/my-project"
CHECKPOINT_DIR="/home/z/my-project/checkpoints"
DESCRIPTION="${1:-Checkpoint sem descrição}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CHECKPOINT_NAME="checkpoint_${TIMESTAMP}"

mkdir -p "$CHECKPOINT_DIR"
CHECKPOINT_PATH="$CHECKPOINT_DIR/$CHECKPOINT_NAME"
mkdir -p "$CHECKPOINT_PATH"

echo -e "${GREEN}📸 CRIANDO CHECKPOINT${NC}"
echo -e "${BLUE}ID: $CHECKPOINT_NAME${NC}"
echo -e "${BLUE}Descrição: $DESCRIPTION${NC}"
echo ""

# Remover checkpoint antigo se existir e for o mesmo
if [ -d "$CHECKPOINT_PATH" ]; then
    rm -rf "$CHECKPOINT_PATH"
    echo -e "${YELLOW}  ⚠${NC} Checkpoint existente substituído"
fi

mkdir -p "$CHECKPOINT_PATH"

# Arquivos críticos individuais
CRITICAL_FILES=(
    "src/app/page.tsx"
    "src/app/layout.tsx"
    "src/app/api/blueberry/login/route.ts"
    "src/app/api/blueberry/classes/route.ts"
    "src/app/api/blueberry/students/route.ts"
    "src/app/api/blueberry/kcs/route.ts"
    "src/components/blueberry/LoginForm.tsx"
    "src/components/blueberry/ClassSelector.tsx"
    "src/components/blueberry/PeriodFilter.tsx"
    "src/components/blueberry/StudentCard.tsx"
    "src/components/blueberry/ClassDashboard.tsx"
    "src/store/auth.ts"
    "src/store/app.ts"
    "src/lib/validation.ts"
    "src/lib/traffic-light.ts"
    "src/types/blueberry.ts"
    "package.json"
)

FILES_COPIED=0
for FILE in "${CRITICAL_FILES[@]}"; do
    if [ -f "$PROJECT_DIR/$FILE" ]; then
        mkdir -p "$CHECKPOINT_PATH/$(dirname "$FILE")"
        cp "$PROJECT_DIR/$FILE" "$CHECKPOINT_PATH/$FILE" 2>/dev/null && {
            echo -e "${GREEN}  ✓${NC} $FILE"
            ((FILES_COPIED++))
        } || echo -e "${YELLOW}  ⚠${NC} $FILE (erro na cópia)"
    fi
done

echo ""

# Diretórios completos
DIRECTORIES=(
    "src/app/api/blueberry"
    "src/components/blueberry"
    "src/lib"
    "src/store"
    "src/types"
)

DIRS_COPIED=0
for DIR in "${DIRECTORIES[@]}"; do
    if [ -d "$PROJECT_DIR/$DIR" ]; then
        rm -rf "$CHECKPOINT_PATH/$DIR" 2>/dev/null
        cp -r "$PROJECT_DIR/$DIR/" "$CHECKPOINT_PATH/$DIR/" 2>/dev/null && {
            echo -e "${GREEN}  📁${NC} $DIR/"
            ((DIRS_COPIED++))
        } || echo -e "${YELLOW}  ⚠${NC} $DIR/ (erro na cópia)"
    fi
done

echo ""

# Criar MANIFESTO.md
cat > "$CHECKPOINT_PATH/MANIFESTO.md" << EOF
# Checkpoint $CHECKPOINT_NAME

**Descrição:** $DESCRIPTION
**Data:** $(date +"%d/%m/%Y %H:%M:%S")
**Arquivos copiados:** $FILES_COPIED
**Diretórios copiados:** $DIRS_COPIED

## Conteúdo
EOF

for FILE in "${CRITICAL_FILES[@]}"; do
    if [ -f "$PROJECT_DIR/$FILE" ]; then
        echo "- $FILE" >> "$CHECKPOINT_PATH/MANIFESTO.md"
    fi
done

for DIR in "${DIRECTORIES[@]}"; do
    if [ -d "$PROJECT_DIR/$DIR" ]; then
        echo "- $DIR/" >> "$CHECKPOINT_PATH/MANIFESTO.md"
    fi
done

echo -e "${GREEN}  📋${NC} MANIFESTO.md"

echo ""
echo -e "${GREEN}✅ CHECKPOINT CRIADO COM SUCESSO!${NC}"
echo -e "${GREEN}Total: ${NC}$FILES_COPIED arquivos + $DIRS_COPIED diretórios"
echo -e "${BLUE}Local: $CHECKPOINT_PATH${NC}"
echo ""
echo -e "${YELLOW}Para restaurar este checkpoint:${NC}"
echo -e "${BLUE}bash restore-checkpoint.sh $CHECKPOINT_NAME${NC}"
