"use client";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { MagnifyingGlass } from "@/lib/ui/icons";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/i18n/useT";
import { CommandPalette } from "@/components/shell/CommandPalette";

export function SearchTrigger() {
  const t = useT();
  const [open, setOpen] = useState(false);

  // `enableOnFormTags`: o atalho precisa funcionar com o cursor dentro do
  // composer do inbox, que é onde o operador passa o dia.
  useHotkeys("mod+k", () => setOpen(true), { preventDefault: true, enableOnFormTags: true });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="group relative flex w-full max-w-md items-center justify-between gap-2.5 rounded-xl border border-border/70 bg-muted/40 px-3.5 py-1.5 text-xs text-muted-foreground shadow-xs transition-all duration-200 hover:border-cyan-500/40 hover:bg-background hover:text-foreground hover:shadow-sm"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <MagnifyingGlass size={14} className="text-muted-foreground/70 transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-400" aria-hidden />
          <span className="hidden md:inline font-normal">{t("Buscar conversas, contatos...")}</span>
          <span className="md:hidden font-normal">{t("Buscar...")}</span>
        </span>
        <kbd className="ml-2 hidden items-center gap-0.5 rounded-md border border-border/60 bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground/90 shadow-2xs md:inline-flex">
          <span className="text-[11px] leading-none">⌘</span>K
        </kbd>
      </Button>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}
