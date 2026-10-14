---
impacto: nada_mudou
secao: corrigido
titulo: Instalação na VPS usa o repositório e as imagens corretos, com atendimento e isolamento de tarefas corrigidos
---

Corrige as URLs de clone e a procedência OCI para o repositório publicado, e alinha os nomes e o namespace minúsculo das imagens do Compose com a publicação no GHCR.

Recupera correções de atendimento, opt-out, automações, agenda e isolamento do responsável de tarefas, com migrations idempotentes e testes de regressão. Restaura a marca configurada nas telas existentes e corrige contraste sem redesenhar o layout.

O gate de atualização mantém a conferência do checkout e distingue a primeira instalação, sem releases anteriores confirmadas pela API, de falhas de rede ou de regras de isolamento.
