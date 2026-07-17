"use client";

import { useState } from "react";
import { updateOwnPassword } from "@/app/(site)/area/conta/actions";

const inputCls =
  "h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-base text-black outline-none transition placeholder:text-black/40 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30";

export function AreaContaForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setDone(false);

    const result = await updateOwnPassword({ currentPassword, newPassword, confirmPassword });

    if (!result.ok) {
      setErrors(result.fieldErrors ?? { form: result.error });
      setSaving(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaving(false);
    setDone(true);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4" noValidate>
      <div>
        <label
          htmlFor="currentPassword"
          className="mb-1.5 block text-sm font-medium text-black"
        >
          Senha atual
        </label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={inputCls}
        />
        {errors.currentPassword && <ErrorText>{errors.currentPassword}</ErrorText>}
      </div>

      <div>
        <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-black">
          Nova senha
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputCls}
        />
        {errors.newPassword ? (
          <ErrorText>{errors.newPassword}</ErrorText>
        ) : (
          <p className="mt-1 text-sm text-black/50">
            Mínimo 10 caracteres, com maiúscula, minúscula e número.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-sm font-medium text-black"
        >
          Confirmar nova senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputCls}
        />
        {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
      </div>

      {errors.form && <ErrorText>{errors.form}</ErrorText>}

      {done && (
        <p
          role="status"
          className="rounded-xl bg-brand/5 px-3 py-2 text-sm font-medium text-black ring-1 ring-brand/20"
        >
          Senha alterada. Se você estava com sessão aberta em outro dispositivo ou
          navegador, ela foi encerrada — só esta continua ativa.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Salvando…" : "Trocar senha"}
      </button>
    </form>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-1 border-l-2 border-brand pl-2 text-sm font-medium text-black">
      {children}
    </p>
  );
}
