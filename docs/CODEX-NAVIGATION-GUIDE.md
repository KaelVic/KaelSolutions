# Navegação para agentes no KaelSolutions

Leia `CLAUDE.md` antes de modificar código. O índice de documentação é `docs/index.md`.

1. API e isolamento: `app/api/v1/`, `lib/auth/require-role.ts` e `lib/supabase/`.
2. Atendimento e automações: `lib/agent-engine/`, `lib/automation/` e `workers/`.
3. Instalação e atualização: `hostgator-setup-kit/`, `docker-compose.prod.yml` e `docs/runbooks/deploy.md`.
4. Banco: migrations novas e apêndices idempotentes em `supabase/baseline.sql`; nunca edite migrations aplicadas.
5. Verificação: scripts de `package.json`, workflows de `.github/workflows/` e testes de `tests/`.

Para revisar um diff, registre o commit de base e o commit testado, leia `git diff`, relacione os testes às mudanças e declare qualquer verificação ainda pendente. Interfaces existentes devem preservar o layout salvo autorização explícita para redesenho.
