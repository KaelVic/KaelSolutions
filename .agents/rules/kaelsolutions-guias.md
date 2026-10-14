---
trigger: always_on
description: Guias do assistente do KaelSolutions — quando usar cada um
---

Este repositório embute guias (skills em `.agents/skills/`) para situações recorrentes. Quando o pedido
casar, carregue o guia antes de agir — a pessoa pode não saber que ele existe:

- instalar, subir, atualizar, consertar a instalação numa VPS, domínio, Supabase, WhatsApp
  que não conecta → `kaelsolutions-instalar`
- usar o CRM no dia a dia, encontrar uma tela, entender um fluxo ou configurar algo pela interface → `kaelsolutions-operacao`
- configurar o CRM para um cliente ou nicho (clínica, imobiliária, serviços, curso, loja,
  escritório de advocacia): agentes, roteadores, follow-ups, base de conhecimento → `kaelsolutions-cliente-novo`
- desempenho, conversão, custo de IA, funil, relatório, "o agente está vendendo?" → `kaelsolutions-metricas`
- o agente responde errado, passa tudo para humano, não usa a agenda, melhorar o prompt → `kaelsolutions-prompt`
- contribuir, corrigir um bug, abrir ou atualizar um PR, migration, conflito com a main → `kaelsolutions-contribuir`
  (rode `bash .agents/skills/kaelsolutions-contribuir/scripts/quem-sou.sh` primeiro: se disser
  `mantenedor`, este guia fica quieto)
- criar extensão, plugin, módulo ou tema de nicho; "isto é núcleo ou extensão?" → `kaelsolutions-extensao`

Escrevendo código aqui: `kaelsolutions-doutrina` (as regras que mais custam) e `sistema-vivo` (o gate
de arquitetura). A doutrina completa é o `CLAUDE.md` da raiz; o contrato portável é o `AGENTS.md`.
