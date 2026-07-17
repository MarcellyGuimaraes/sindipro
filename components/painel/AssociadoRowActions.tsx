"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Trash2 } from "lucide-react";
import {
  updateAssociadoPassword,
  setAssociadoStatus,
  deleteAssociado,
} from "@/app/painel-diretoria/(dashboard)/associados/actions";

/**
 * Bloco de status + ações de um associado: badge ativo/inativo, data de
 * criação, ativar/inativar, trocar senha (revela um campo inline) e excluir.
 * Cada clique chama uma Server Action própria — a validação de papel/força
 * de senha acontece lá, no servidor.
 *
 * É um único item flex da linha da lista (coluna própria, empilhada
 * internamente) — evitar aninhar outro flex-wrap com basis-full aqui dentro
 * do flex-wrap da lista: o Chromium resolve mal esse aninhamento e força os
 * itens a ocuparem a largura toda, quebrando o alinhamento da linha.
 */
export function AssociadoRowActions({
  id,
  status,
  createdAtLabel,
}: {
  id: string;
  status: "ativo" | "inativo";
  createdAtLabel: string;
}) {
  const router = useRouter();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onToggleStatus() {
    const next = status === "ativo" ? "inativo" : "ativo";
    if (
      next === "inativo" &&
      !window.confirm("Inativar este associado? Ele perde o acesso imediatamente.")
    ) {
      return;
    }
    setStatusSaving(true);
    const result = await setAssociadoStatus({ userId: id, status: next });
    setStatusSaving(false);
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  async function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaving(true);
    const result = await updateAssociadoPassword({ userId: id, password });
    setPasswordSaving(false);
    if (!result.ok) {
      setPasswordError(result.fieldErrors?.password ?? result.error);
      return;
    }
    setPassword("");
    setPasswordOpen(false);
    router.refresh();
  }

  async function onDelete() {
    if (
      !window.confirm(
        "Excluir este associado? A conta de acesso e o perfil são apagados e não podem ser desfeitos."
      )
    ) {
      return;
    }
    setDeleting(true);
    const result = await deleteAssociado({ userId: id });
    setDeleting(false);
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 sm:shrink-0 sm:items-end">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
            status === "ativo" ? "bg-brand text-white" : "bg-black/5 text-black/50"
          }`}
        >
          {status === "ativo" ? "Ativo" : "Inativo"}
        </span>

        <span className="hidden shrink-0 text-sm text-black/45 sm:block">
          {createdAtLabel}
        </span>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onToggleStatus}
            disabled={statusSaving}
            aria-pressed={status === "ativo"}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              status === "ativo"
                ? "text-black/55 hover:bg-black/5 hover:text-black"
                : "bg-brand/10 text-brand hover:bg-brand/15"
            }`}
          >
            {status === "ativo" ? "Inativar" : "Ativar"}
          </button>

          <button
            type="button"
            onClick={() => setPasswordOpen((v) => !v)}
            aria-expanded={passwordOpen}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-brand transition hover:bg-brand/5"
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Trocar senha
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-black/55 transition hover:bg-black/5 hover:text-black disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Excluir
          </button>
        </div>
      </div>

      {passwordOpen && (
        <form
          onSubmit={onSubmitPassword}
          className="flex w-full flex-wrap items-center gap-2 rounded-xl bg-black/[0.03] p-3"
        >
          <label htmlFor={`pwd-${id}`} className="sr-only">
            Nova senha
          </label>
          <input
            id={`pwd-${id}`}
            type="text"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nova senha (mín. 10, com maiúscula/minúscula/número)"
            className="min-w-[16rem] flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
          />
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPasswordOpen(false);
                setPassword("");
                setPasswordError(null);
              }}
              className="text-sm font-medium text-black/55 hover:text-black"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={passwordSaving}
              className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
            >
              {passwordSaving ? "Salvando…" : "Salvar senha"}
            </button>
          </div>
          {passwordError && (
            <p role="alert" className="w-full text-sm font-medium text-black">
              {passwordError}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
