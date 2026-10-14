import { createClient } from "@supabase/supabase-js";
import { carregarEnvLocal } from "./lib/env-de-teste";

const env = carregarEnvLocal();

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ORG_ID = "ca6eef24-3dbb-4b76-ba8c-32a8ff17ea63";
const USER_ID = "d406835a-ef5c-4fd5-ba69-127a97451a90";

async function main() {
  console.log("🚀 Semeando dados realistas de demonstração para o usuário...");

  // 1. Atualizar Organização
  await admin
    .from("organizations")
    .update({
      display_name: "KaelSolutions",
      legal_name: "KaelSolutions Tecnologia & IA Ltda",
      country: "BR",
      currency: "BRL",
      timezone: "America/Sao_Paulo",
      locale: "pt-BR",
      status: "active",
      onboarded_at: new Date().toISOString(),
    } as never)
    .eq("id", ORG_ID);
  console.log("✅ Organização atualizada: KaelSolutions");

  // 2. Atualizar Nome do Usuário
  await admin.auth.admin.updateUserById(USER_ID, {
    user_metadata: { full_name: "Rafael Kael" },
  });
  console.log("✅ Usuário atualizado: Rafael Kael");

  // 3. Sessão de WhatsApp Conectada
  const { data: existingSession } = await admin
    .from("channel_sessions")
    .select("id")
    .eq("organization_id", ORG_ID)
    .maybeSingle<{ id: string }>();

  let sessionId = existingSession?.id;
  if (!sessionId) {
    const { data: newSession, error: sessErr } = await admin
      .from("channel_sessions")
      .insert({
        organization_id: ORG_ID,
        provider: "waha",
        engine: "NOWEB",
        waha_session_name: "ks-whatsapp-oficial",
        phone_number: "+5511998765432",
        display_name: "KS Atendimento IA (Comercial)",
        status: "WORKING",
        webhook_path_token: "ks_tok_" + Math.random().toString(36).substring(2, 12),
        webhook_secret_encrypted: "\\x00",
        last_health_check_at: new Date().toISOString(),
      } as never)
      .select("id")
      .single<{ id: string }>();
    if (sessErr) throw sessErr;
    sessionId = newSession.id;
  } else {
    await admin
      .from("channel_sessions")
      .update({
        status: "WORKING",
        phone_number: "+5511998765432",
        display_name: "KS Atendimento IA (Comercial)",
        last_health_check_at: new Date().toISOString(),
        archived_at: null,
      } as never)
      .eq("id", sessionId);
  }
  console.log("✅ Sessão WhatsApp conectada (WORKING):", sessionId);

  // 4. Agente de IA Comercial
  const { data: existingAgent } = await admin
    .from("ai_agents")
    .select("id")
    .eq("organization_id", ORG_ID)
    .maybeSingle<{ id: string }>();

  let agentId = existingAgent?.id;
  if (!agentId) {
    const { data: newAgent, error: agErr } = await admin
      .from("ai_agents")
      .insert({
        organization_id: ORG_ID,
        name: "Sofia — Especialista Comercial",
        description: "Qualificação inteligente de leads, tira-dúvidas e agendamento de reuniões comerciais via WhatsApp.",
        channel: "whatsapp",
        model: "anthropic/claude-sonnet-4-6",
        is_active: true,
        is_default: true,
        kind: "rag_bot",
        operation_mode: "automatic",
        system_prompt: "Você é a Sofia, consultora comercial da KaelSolutions. Apresente os recursos do KS Atendimento IA de forma consultiva e cordial.",
      } as never)
      .select("id")
      .single<{ id: string }>();
    if (agErr) throw agErr;
    agentId = newAgent.id;
  }
  console.log("✅ Agente de IA criado/ativo:", agentId);

  // 5. Funil Comercial
  const { data: existingPipe } = await admin
    .from("crm_pipelines")
    .select("id")
    .eq("organization_id", ORG_ID)
    .maybeSingle<{ id: string }>();

  let pipelineId = existingPipe?.id;
  if (!pipelineId) {
    const { data: newPipe, error: pipeErr } = await admin
      .from("crm_pipelines")
      .insert({
        organization_id: ORG_ID,
        name: "Funil Comercial — Vendas & IA",
        slug: "comercial-vendas",
        description: "Pipeline de aquisição e implantação de agentes de IA para clientes corporativos.",
        is_default: true,
        position: 1000,
      } as never)
      .select("id")
      .single<{ id: string }>();
    if (pipeErr) throw pipeErr;
    pipelineId = newPipe.id;
  } else {
    await admin
      .from("crm_pipelines")
      .update({
        name: "Funil Comercial — Vendas & IA",
        slug: "comercial-vendas",
        description: "Pipeline de aquisição e implantação de agentes de IA para clientes corporativos.",
      } as never)
      .eq("id", pipelineId);
  }
  console.log("✅ Funil Comercial configurado:", pipelineId);

  // Limpar estágios antigos para reconstruir padrão profissional
  await admin.from("crm_leads").delete().eq("organization_id", ORG_ID);
  await admin.from("crm_stages").delete().eq("pipeline_id", pipelineId);

  const STAGES_DATA = [
    { name: "Novos Leads", slug: "novos-leads", position: 1000, color: "#3b82f6", agent_stage_hint: "new" },
    { name: "Qualificação IA", slug: "qualificacao-ia", position: 2000, color: "#8b5cf6", agent_stage_hint: "qualifying" },
    { name: "Demonstração", slug: "demonstracao", position: 3000, color: "#06b6d4", agent_stage_hint: "qualified" },
    { name: "Proposta Enviada", slug: "proposta-enviada", position: 4000, color: "#f59e0b", agent_stage_hint: "negotiating" },
    { name: "Negociação", slug: "negociacao", position: 5000, color: "#ea580c" },
    { name: "Fechado", slug: "fechado", position: 6000, color: "#10b981", is_won: true, agent_stage_hint: "won" },
    { name: "Perdido", slug: "perdido", position: 7000, color: "#ef4444", is_lost: true, agent_stage_hint: "lost" },
  ];

  const stagesMap: Record<string, string> = {};
  for (const st of STAGES_DATA) {
    const { data: stRow, error: stErr } = await admin
      .from("crm_stages")
      .insert({
        organization_id: ORG_ID,
        pipeline_id: pipelineId,
        name: st.name,
        slug: st.slug,
        position: st.position,
        color: st.color,
        is_won: st.is_won ?? false,
        is_lost: st.is_lost ?? false,
        agent_stage_hint: st.agent_stage_hint ?? null,
      } as never)
      .select("id")
      .single<{ id: string }>();
    if (stErr) throw stErr;
    stagesMap[st.slug] = stRow.id;
  }
  console.log("✅ Estágios criados:", Object.keys(stagesMap));

  // 6. Contatos Realistas
  await admin.from("messages").delete().eq("organization_id", ORG_ID);
  await admin.from("conversations").delete().eq("organization_id", ORG_ID);
  await admin.from("contacts").delete().eq("organization_id", ORG_ID);

  const CONTACTS = [
    {
      name: "Mariana Siqueira",
      display_name: "Mariana Siqueira (OdontoPrime)",
      phone: "+5511982345678",
      email: "mariana@odontoprime.com.br",
      tags: ["inbound-ads", "clinica", "decisor"],
    },
    {
      name: "Carlos Eduardo Mendes",
      display_name: "Carlos Mendes (LogBrasil)",
      phone: "+5511991234567",
      email: "carlos.mendes@logbrasil.com.br",
      tags: ["enterprise", "logistica", "prioritario"],
    },
    {
      name: "Dra. Camila Guimarães",
      display_name: "Dra. Camila Guimarães",
      phone: "+5531964567890",
      email: "camila@dermatosaude.med.br",
      tags: ["indicacao", "saude", "agendamento"],
    },
    {
      name: "Rodrigo Alencar",
      display_name: "Rodrigo Alencar (Alfa Construtora)",
      phone: "+5521973456789",
      email: "rodrigo@alfaconstrutora.com.br",
      tags: ["imobiliario", "alto-valor"],
    },
    {
      name: "Juliana Prado",
      display_name: "Juliana Prado (FarmaMais)",
      phone: "+5511946789012",
      email: "juliana@farmamais.com.br",
      tags: ["varejo", "whatsapp"],
    },
    {
      name: "Bruno Fontes",
      display_name: "Bruno Fontes (AutoTech)",
      phone: "+5519937890123",
      email: "bruno@autotech.com.br",
      tags: ["recorrencia", "saas"],
    },
    {
      name: "Amanda Vasconcelos",
      display_name: "Amanda Vasconcelos (NovaEra)",
      phone: "+5581928901234",
      email: "amanda@novaerafin.com.br",
      tags: ["financas", "segurança"],
    },
    {
      name: "Felipe Rocha",
      display_name: "Dr. Felipe Rocha (Rocha Advocacia)",
      phone: "+5541955678901",
      email: "felipe@rochaadvogados.com.br",
      tags: ["juridico", "triagem"],
    },
  ];

  const contactIds: Record<string, string> = {};
  for (const c of CONTACTS) {
    const { data: ctRow, error: ctErr } = await admin
      .from("contacts")
      .insert({
        organization_id: ORG_ID,
        name: c.name,
        display_name: c.display_name,
        phone_number: c.phone,
        email: c.email,
        tags: c.tags,
        source: "whatsapp",
      } as never)
      .select("id")
      .single<{ id: string }>();
    if (ctErr) throw ctErr;
    contactIds[c.name] = ctRow.id;
  }
  console.log("✅ Contatos inseridos:", Object.keys(contactIds).length);

  // 7. Oportunidades no CRM (Leads nos estágios)
  const LEADS_DATA = [
    {
      title: "OdontoPrime — Automatização de Agendamentos e Follow-up",
      contactName: "Mariana Siqueira",
      stageSlug: "negociacao",
      valueCents: 450_000,
      tags: ["clinica", "ia-agendamento"],
      ownerKind: "user",
      ownerUserId: USER_ID,
    },
    {
      title: "LogBrasil — Central de Atendimento 50 atendentes WhatsApp IA",
      contactName: "Carlos Eduardo Mendes",
      stageSlug: "proposta-enviada",
      valueCents: 1480_000,
      tags: ["enterprise", "custom-api"],
      ownerKind: "user",
      ownerUserId: USER_ID,
    },
    {
      title: "Alfa Construtora — Atendimento Rápido a Compradores e Corretores",
      contactName: "Rodrigo Alencar",
      stageSlug: "demonstracao",
      valueCents: 890_000,
      tags: ["imobiliario", "demonstracao-agendada"],
      ownerKind: "user",
      ownerUserId: USER_ID,
    },
    {
      title: "Clínica Dermato & Saúde — Recepção Virtual 24/7",
      contactName: "Dra. Camila Guimarães",
      stageSlug: "fechado",
      valueCents: 320_000,
      tags: ["saude", "implantado"],
      ownerKind: "user",
      ownerUserId: USER_ID,
      status: "won",
      closedAt: new Date(Date.now() - 3600_000 * 24).toISOString(),
    },
    {
      title: "FarmaMais — Chatbot de Status de Entrega e Pedidos",
      contactName: "Juliana Prado",
      stageSlug: "novos-leads",
      valueCents: 1200_000,
      tags: ["ecommerce", "waha-api"],
      ownerKind: "ai",
      ownerAgentId: agentId,
    },
    {
      title: "AutoTech — Recuperação Ativa de Clientes Inativos",
      contactName: "Bruno Fontes",
      stageSlug: "demonstracao",
      valueCents: 670_000,
      tags: ["saas", "follow-up"],
      ownerKind: "user",
      ownerUserId: USER_ID,
    },
    {
      title: "NovaEra Finanças — Triagem Inteligente com Handoff para Consultor",
      contactName: "Amanda Vasconcelos",
      stageSlug: "qualificacao-ia",
      valueCents: 950_000,
      tags: ["financas", "ia-ativa"],
      ownerKind: "ai",
      ownerAgentId: agentId,
    },
    {
      title: "Rocha Advocacia — Qualificação Preliminar de Processos",
      contactName: "Felipe Rocha",
      stageSlug: "qualificacao-ia",
      valueCents: 540_000,
      tags: ["juridico"],
      ownerKind: "ai",
      ownerAgentId: agentId,
    },
  ];

  for (const ld of LEADS_DATA) {
    const isWon = ld.status === "won";
    const closedAt = ld.closedAt ?? null;
    await admin.from("crm_leads").insert({
      organization_id: ORG_ID,
      pipeline_id: pipelineId,
      stage_id: stagesMap[ld.stageSlug]!,
      contact_id: contactIds[ld.contactName],
      title: ld.title,
      value_cents: ld.valueCents,
      currency: "BRL",
      status: isWon ? "won" : "open",
      closed_at: closedAt,
      tags: ld.tags,
      owner_kind: ld.ownerKind,
      owner_user_id: ld.ownerKind === "user" ? ld.ownerUserId : null,
      owner_agent_id: ld.ownerKind === "ai" ? ld.ownerAgentId : null,
      created_at: new Date(Date.now() - 3600_000 * 48).toISOString(),
    } as never);
  }
  console.log("✅ Leads comerciais criados no pipeline:", LEADS_DATA.length);

  // 8. Conversas e Mensagens no WhatsApp (Inbox Vivo)
  const CONVOS = [
    {
      contactName: "Mariana Siqueira",
      status: "open",
      unread: 1,
      preview: "Pode ser amanhã às 14h sim! Combinado.",
      messages: [
        { dir: "inbound", body: "Olá! Gostaria de saber como funciona o atendimento automático com IA para clínicas.", minAgo: 60 },
        { dir: "outbound", body: "Olá Mariana! Tudo bem? Sou a Sofia da KaelSolutions. Nosso sistema integra nativamente ao seu WhatsApp, permitindo qualificar pacientes, tirar dúvidas sobre procedimentos e agendar consultas direto na sua agenda. Quantos atendimentos vocês realizam por dia atualmente?", minAgo: 58 },
        { dir: "inbound", body: "Temos cerca de 80 a 100 contatos por dia, a equipe de recepção fica bem sobrecarregada.", minAgo: 45 },
        { dir: "outbound", body: "Excelente! Nesse volume, a automação com a nossa IA reduz em média 70% da carga da recepção e responde aos pacientes em menos de 10 segundos. Gostaria de ver uma demonstração de 15 minutos amanhã às 14h ou 16h?", minAgo: 30 },
        { dir: "inbound", body: "Pode ser amanhã às 14h sim! Combinado.", minAgo: 5 },
      ],
    },
    {
      contactName: "Carlos Eduardo Mendes",
      status: "open",
      unread: 0,
      preview: "Excelente Rafael, já acionei nosso time de TI para a call.",
      messages: [
        { dir: "inbound", body: "Boa tarde Rafael, recebemos a proposta comercial da KS. Temos algumas dúvidas técnicas sobre o webhook.", minAgo: 180 },
        { dir: "outbound", body: "Boa tarde Carlos! Perfeito. Nossos webhooks enviam eventos em tempo real com HMAC e payload JSON estruturado para qualquer endpoint seu.", minAgo: 150 },
        { dir: "inbound", body: "Excelente Rafael, já acionei nosso time de TI para a call.", minAgo: 120 },
      ],
    },
    {
      contactName: "Rodrigo Alencar",
      status: "ai_handling",
      unread: 0,
      preview: "Sofia enviou o link da apresentação comercial.",
      messages: [
        { dir: "inbound", body: "Boa tarde, vocês atendem loteamentos e construtoras?", minAgo: 240 },
        { dir: "outbound", body: "Boa tarde Rodrigo! Sim, temos agentes de IA treinados especificamente para mercado imobiliário com catálogo de unidades e simulação de parcelas.", minAgo: 235 },
      ],
    },
    {
      contactName: "Dra. Camila Guimarães",
      status: "resolved",
      unread: 0,
      preview: "Muito obrigada pelo suporte, tudo configurado perfeitamente!",
      messages: [
        { dir: "inbound", body: "Oi pessoal, só passando para avisar que a equipe adorou o painel de atendimento!", minAgo: 1440 },
        { dir: "outbound", body: "Ficamos muito felizes em saber, Dra. Camila! Qualquer necessidade estamos sempre à disposição.", minAgo: 1400 },
        { dir: "inbound", body: "Muito obrigada pelo suporte, tudo configurado perfeitamente!", minAgo: 1380 },
      ],
    },
    {
      contactName: "Amanda Vasconcelos",
      status: "open",
      unread: 2,
      preview: "Qual o prazo médio de implantação da ferramenta?",
      messages: [
        { dir: "inbound", body: "Olá! Vi o anúncio de vocês no Instagram sobre CRM com WhatsApp.", minAgo: 25 },
        { dir: "inbound", body: "Qual o prazo médio de implantação da ferramenta?", minAgo: 24 },
      ],
    },
  ];

  for (const cv of CONVOS) {
    const contactId = contactIds[cv.contactName]!;
    const lastMsgTime = new Date(Date.now() - cv.messages[cv.messages.length - 1]!.minAgo * 60_000).toISOString();

    const { data: convRow, error: convErr } = await admin
      .from("conversations")
      .insert({
        organization_id: ORG_ID,
        contact_id: contactId,
        channel_session_id: sessionId,
        channel: "whatsapp",
        status: cv.status,
        last_message_at: lastMsgTime,
        last_message_preview: cv.preview,
        unread_count_for_assignee: cv.unread,
        assigned_to_user_id: USER_ID,
        assignee_kind: "user",
        tags: ["whatsapp", "comercial"],
      } as never)
      .select("id")
      .single<{ id: string }>();
    if (convErr) throw convErr;

    for (let i = 0; i < cv.messages.length; i++) {
      const msg = cv.messages[i]!;
      const msgTime = new Date(Date.now() - msg.minAgo * 60_000).toISOString();
      await admin.from("messages").insert({
        organization_id: ORG_ID,
        conversation_id: convRow.id,
        channel_session_id: sessionId,
        contact_id: contactId,
        external_id: `demo-${convRow.id}-${i}-${Date.now()}`,
        direction: msg.dir,
        status: "delivered",
        type: "text",
        body: msg.body,
        sent_via: msg.dir === "outbound" ? "crm" : "external_device",
        sent_at: msgTime,
        created_at: msgTime,
      } as never);
    }
  }
  console.log("✅ Conversas e mensagens reais semeadas no Inbox!");

  console.log("\n🎉 CONCLUÍDO COM SUCESSO! A aplicação agora tem a aparência e vida de um SaaS já lançado e ativo.");
}

main().catch((err) => {
  console.error("❌ Erro ao semear:", err);
  process.exit(1);
});
