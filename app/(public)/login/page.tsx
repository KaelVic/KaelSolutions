import Link from "next/link";

import { EntrarComGoogle } from "@/components/auth/EntrarComGoogle";
import { LoginForm } from "@/components/auth/LoginForm";
import { marcaDaSaida } from "@/lib/branding/saida";
import { createClient } from "@/lib/supabase/server";
import { idiomaDoVisitante } from "@/lib/i18n/idiomaAnonimo";
import { traduzir } from "@/lib/i18n/dicionario";

export const metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string; error?: string }>;
}) {
  const { next, reset, error } = await searchParams;
  // Fora da árvore de `app/app/layout.tsx` — sem `IdiomaProvider` do lado do
  // servidor (o cliente já tem o seu, montado em `app/(public)/layout.tsx`).
  // Quase nunca há sessão aqui (é a própria tela de entrar), mas resolve do
  // mesmo jeito por segurança — `user` opcional.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const idioma = await idiomaDoVisitante(
    (user?.user_metadata?.locale as string | undefined) ?? null,
  );
  const t = (texto: string) => traduzir(texto, idioma);
  const marca = await marcaDaSaida(null);

  return (
    <div className="relative space-y-6 rounded-3xl border border-white/60 bg-white/85 p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/85 dark:shadow-black/60">
      {/* Linha de brilho sutil no topo do card */}
      <div className="pointer-events-none absolute -top-px left-1/2 -translate-x-1/2 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-cyan-600 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300 shadow-xs">
          <svg className="h-3.5 w-3.5 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" fill="currentColor" fillOpacity="0.25" />
            <path d="M19 18L19.8 19.8L22 20.5L19.8 21.2L19 23L18.2 21.2L16 20.5L18.2 19.8L19 18Z" fill="currentColor" />
            <path d="M5 2L5.8 3.8L8 4.5L5.8 5.2L5 7L4.2 5.2L2 4.5L4.2 3.8L5 2Z" fill="currentColor" />
          </svg>
          <span>{marca.nome || "KS Atendimento IA"}</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t("Entrar")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("Acesse seu painel inteligente de atendimento")}
        </p>
      </div>
      {reset === "success" && (
        <div
          className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm"
          role="status"
        >
          {t("Senha redefinida com sucesso. Entre com a nova senha.")}
        </div>
      )}
      {error === "link_invalido" && (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {t("Link inválido ou expirado. Peça um novo em Recuperar senha ou refaça o cadastro.")}
        </div>
      )}
      {/*
        Os dois avisos abaixo chegaram por frentes diferentes e falam de erros
        diferentes — o merge os pôs no mesmo lugar, e ficar com um só apagaria um
        diagnóstico inteiro da tela de login.
      */}
      {error === "convite_invalido" && (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {t(
            "Sua conta foi confirmada, mas o convite não vale mais — ele expirou ou foi emitido para outro e-mail. Peça um novo a quem te convidou. Não criamos uma empresa nova para você, porque não era isso que você estava fazendo.",
          )}
        </div>
      )}
      {error === "cadastro_por_convite" && (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {t(
            "Sua conta foi confirmada, mas esta instalação aceita cadastro apenas por convite — então não criamos uma empresa para você. Peça um convite a quem administra o sistema; o link dele já traz tudo o que falta.",
          )}
        </div>
      )}
      {error === "template_padrao" && (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {t(
            "Este link veio do modelo de e-mail padrão do Supabase, que não fecha o acesso nesta instalação — pedir outro link não resolve. Quem administra o sistema precisa configurar os modelos de e-mail: na nuvem do Supabase, com ",
          )}
          <code>marca-emails.sh</code>
          {t(
            "; num Supabase próprio, apontando GOTRUE_MAILER_TEMPLATES_* para as rotas /email-templates/ do app.",
          )}
        </div>
      )}
      {error === "provisionamento" && (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {t(
            "Sua conta foi confirmada, mas houve um erro ao preparar seu ambiente. Tente entrar novamente em instantes.",
          )}
        </div>
      )}
      {/*
        As duas recusas da entrada com Google, separadas de propósito: uma é
        falha da volta (o `code` não virou sessão), a outra é desistência de
        quem estava do outro lado. A mesma mensagem para as duas mandaria a
        pessoa "tentar de novo" quando ela só fechou a tela — e procurar
        defeito onde não há.
      */}
      {error === "entrada_com_google" && (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {t(
            "Não foi possível concluir a entrada com o Google. Tente novamente — se acontecer de novo, entre com e-mail e senha.",
          )}
        </div>
      )}
      {error === "entrada_com_google_cancelada" && (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {t("A entrada com o Google foi cancelada antes de terminar. Nada mudou na sua conta.")}
        </div>
      )}
      {/* A terceira recusa da entrada com Google: a conta está confirmada, mas o
          acesso dela foi retirado. Não é convite inválido (não havia convite
          nenhum) nem falha do Google — é decisão de quem administra, e a tela
          diz exatamente isso, em vez de mandar a pessoa "tentar de novo". */}
      {error === "acesso_revogado" && (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {t(
            "O acesso desta conta foi retirado por quem administra o sistema — então não criamos uma empresa nova para você. Se o acesso deveria continuar, peça a quem administra para restaurá-lo; se você está entrando em outra equipe, peça um convite.",
          )}
        </div>
      )}
      <LoginForm next={next} />
      <EntrarComGoogle next={next} />
      <div className="space-y-2 text-center text-sm">
        <p>
          <Link
            href="/login/forgot"
            className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {t("Esqueci minha senha")}
          </Link>
        </p>
        <p className="text-muted-foreground">
          {t("Não tem conta?")}{" "}
          <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
            {t("Criar conta")}
          </Link>
        </p>
      </div>
    </div>
  );
}
