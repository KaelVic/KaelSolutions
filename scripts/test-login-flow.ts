import { createClient } from "@supabase/supabase-js";
import { carregarEnvLocal } from "./lib/env-de-teste";

const env = carregarEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "admin@kaelsolutions.com.br",
    password: "Senha@123456",
  });
  if (error || !data.session) {
    console.error("Login failed:", error);
    process.exit(1);
  }
  console.log("Logged in successfully! Access token:", data.session.access_token.slice(0, 20) + "...");

  const res = await fetch("http://localhost:3000/app", {
    headers: {
      Cookie: `sb-kaelsolutions-auth=${data.session.access_token}; active_org=ca6eef24-3dbb-4b76-ba8c-32a8ff17ea63`,
    },
    redirect: "manual",
  });
  console.log("Response status for /app:", res.status);
  console.log("Location header (if any):", res.headers.get("location"));
  const text = await res.text();
  console.log("Body snippet:", text.slice(0, 400));
}

main().catch(console.error);
