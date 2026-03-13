#!/usr/bin/env bash
set -eo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

step() { echo -e "\n${BLUE}▸ $1${NC}"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; ((PASS++)); }
fail() { echo -e "${RED}✗ $1${NC}"; ((FAIL++)); }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; ((WARN++)); }

echo -e "${BLUE}╔══════════════════════════════╗"
echo -e "║   MyDay Evaluation Suite     ║"
echo -e "╚══════════════════════════════╝${NC}"

# ── 1. Code Quality: ESLint ─────────────────────────────────────────────────
step "Code Quality — ESLint"
if npm run lint --silent 2>&1; then
    ok "ESLint passed (no errors)"
else
    fail "ESLint reported errors"
fi

# ── 2. Unit & Integration Tests + Coverage ──────────────────────────────────
step "Unit & Integration Tests — Vitest + Coverage"
if npm run test:coverage -- --reporter=verbose 2>&1; then
    ok "All tests passed"
else
    fail "Test suite failed — check output above"
fi

# ── 3. Security: npm audit ───────────────────────────────────────────────────
step "Security Scan — npm audit"
AUDIT_OUTPUT=$(npm audit --audit-level=high --json 2>/dev/null || true)
HIGH=$(echo "$AUDIT_OUTPUT" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
    try{const j=JSON.parse(d); console.log(j.metadata?.vulnerabilities?.high||0);}catch{console.log(0);}
  });
" 2>/dev/null || echo "0")
CRITICAL=$(echo "$AUDIT_OUTPUT" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
    try{const j=JSON.parse(d); console.log(j.metadata?.vulnerabilities?.critical||0);}catch{console.log(0);}
  });
" 2>/dev/null || echo "0")

if [ "$CRITICAL" -gt 0 ]; then
    fail "npm audit: $CRITICAL critical vulnerabilities found"
elif [ "$HIGH" -gt 0 ]; then
    warn "npm audit: $HIGH high-severity vulnerabilities found (run 'npm audit' for details)"
else
    ok "npm audit: no high/critical vulnerabilities"
fi

# ── 4. E2E Tests (optional) ──────────────────────────────────────────────────
step "E2E Tests — Playwright (optional)"
if command -v playwright &>/dev/null || npx playwright --version &>/dev/null 2>&1; then
    if npx playwright test 2>&1; then
        ok "Playwright E2E tests passed"
    else
        fail "Playwright E2E tests failed"
    fi
else
    warn "Playwright not installed — skipping E2E (run: npx playwright install)"
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}══════════════════════════════${NC}"
echo -e "  Passed : ${GREEN}${PASS}${NC}"
echo -e "  Failed : ${RED}${FAIL}${NC}"
echo -e "  Warned : ${YELLOW}${WARN}${NC}"
echo -e "${BLUE}══════════════════════════════${NC}"

if [ "$FAIL" -gt 0 ]; then
    echo -e "${RED}Evaluation FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}Evaluation PASSED${NC}"
    exit 0
fi
