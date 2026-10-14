import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const modos = new Map(
  execFileSync("git", ["ls-files", "--stage"], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 })
    .trim()
    .split("\n")
    .map((linha) => {
      const [metadados, arquivo] = linha.split("\t");
      return [arquivo, metadados?.split(" ")[0]];
    }),
);

describe("scripts de instalação e hooks conservam execução no clone Linux", () => {
  it.each([
    "ubuntu-production-installer.sh",
    "ubuntu-local-installer.sh",
    "hostgator-setup-kit/install.sh",
    "hostgator-setup-kit/update.sh",
    ".agents/skills/kaelsolutions-contribuir/scripts/hooks/pre-commit",
    ".agents/skills/kaelsolutions-contribuir/scripts/hooks/pre-push",
    ".claude/skills/kaelsolutions-contribuir/scripts/hooks/pre-commit",
    ".claude/skills/kaelsolutions-contribuir/scripts/hooks/pre-push",
  ])("%s é executável no Git, independentemente do sistema do dev", (arquivo) => {
    expect(
      modos.get(arquivo),
      "sem 100755, o clone Linux recusa executar o script ou ignora o hook",
    ).toBe("100755");
  });
});
