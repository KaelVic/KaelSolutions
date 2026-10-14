import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

function conferir(api: string, regraAusente = false) {
  const bin = mkdtempSync(path.join(tmpdir(), "kit-sem-release-"));
  const stub = (nome: string, corpo: string) =>
    writeFileSync(path.join(bin, nome), `#!/usr/bin/env bash\n${corpo}\n`, { mode: 0o755 });
  stub("git", "printf 'https://github.com/revenda/crm.git\\n'");
  stub("curl", api);
  const baseline = readFileSync("supabase/baseline.sql", "utf8");
  const regras = [
    ...baseline.matchAll(/create\s+policy\s+"?([^"\s]+)"?\s+on\s+"?public"?\."?([^"\s;]+)"?/gim),
  ].map((m) => m[1] + "|" + m[2]);
  const tabelas = [...new Set(regras.map((r) => r.split("|")[1]))].join("\n");
  stub(
    "docker",
    'case "$*" in *"select c.relname"*) printf \'%s\\n\' \'' +
      tabelas +
      "';; *) printf '%s\\n' '" +
      (regraAusente ? "" : regras.join("\n")) +
      "';; esac",
  );
  const ambiente = path.join(bin, "ambiente.sh");
  writeFileSync(
    ambiente,
    ["git", "curl", "docker"]
      .map(
        (nome) =>
          nome +
          "() {\n" +
          readFileSync(path.join(bin, nome), "utf8").replace(/^#![^\n]*\n/, "") +
          "\n}\n",
      )
      .join("\n"),
  );
  const caminhoBash = ambiente
    .replace(/\\/g, "/")
    .replace(/^([A-Za-z]):/, (_, drive: string) => "/" + drive.toLowerCase());
  try {
    const bash =
      process.platform === "win32"
        ? path.join(process.env.ProgramFiles ?? "C:/Program Files", "Git/bin/bash.exe")
        : "bash";
    return execFileSync(
      bash,
      ["scripts/conferir-isolamento-do-kit.sh", "container-teste", "postgres"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: "pipe",
        env: {
          ...process.env,
          PATH: `${bin}${path.delimiter}${process.env.PATH}`,
          BASH_ENV: caminhoBash,
          GH_TOKEN: "",
          CONFERENCIA_KIT_RELEASE: "",
          KAELSOLUTIONS_RELEASES_LATEST_URL: "",
        },
      },
    );
  } finally {
    rmSync(bin, { recursive: true, force: true });
  }
}

describe("conferência de atualização antes da primeira release do fork", () => {
  it("lista vazia confirmada permite instalação nova e ainda mede o checkout", () => {
    const saida = conferir("printf '[]'");
    expect(saida).toContain("update.sh deste checkout");
    expect(saida).toContain("nenhuma versão anterior instalada");
  });
  it("falha de API continua fechando o gate", () => {
    expect(() => conferir("exit 22")).toThrow();
  });
  it("lista vazia não esconde regra ausente no banco", () => {
    expect(() => conferir("printf '[]'", true)).toThrow();
  });
});
