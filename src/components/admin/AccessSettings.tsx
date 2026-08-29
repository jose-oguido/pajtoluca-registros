"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle, EnvelopeSimple, Key, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import { updateAccountAction, updateEmailSettingsAction, updateStaffCodeAction } from "@/app/admin/accesos/actions";
import { initialAccessSettingsState } from "@/app/admin/accesos/state";
import type { StaffRegistrationType } from "@/lib/registration-types";

const inputClass =
  "w-full rounded-[12px] border border-border bg-surface px-3.5 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";

type StateMessageProps = {
  status: "idle" | "success" | "error";
  message?: string;
};

function StateMessage({ status, message }: StateMessageProps) {
  if (status === "idle" || !message) return null;
  const success = status === "success";
  return (
    <p className={`mt-3 flex items-center gap-1.5 text-sm ${success ? "text-emerald-700" : "text-red-600"}`} role={success ? "status" : "alert"}>
      {success ? <CheckCircle size={15} weight="fill" /> : <WarningCircle size={15} weight="fill" />}
      {message}
    </p>
  );
}

function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-contrast transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Guardando..." : children}
    </button>
  );
}

function AccountForm({ username }: { username: string }) {
  const [state, formAction] = useActionState(updateAccountAction, initialAccessSettingsState);
  return (
    <form action={formAction} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <label htmlFor="account-username" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Usuario</label>
        <input id="account-username" name="username" defaultValue={username} autoComplete="username" className={inputClass} />
      </div>
      <div>
        <label htmlFor="current-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contraseña actual</label>
        <input id="current-password" name="current_password" type="password" autoComplete="current-password" className={inputClass} />
      </div>
      <div>
        <label htmlFor="new-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nueva contraseña <span className="normal-case tracking-normal">(opcional)</span></label>
        <input id="new-password" name="new_password" type="password" autoComplete="new-password" className={inputClass} />
      </div>
      <div>
        <label htmlFor="confirm-new-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirmar nueva contraseña</label>
        <input id="confirm-new-password" name="confirm_new_password" type="password" autoComplete="new-password" className={inputClass} />
      </div>
      <div className="flex items-end">
        <SubmitButton>Guardar cuenta</SubmitButton>
      </div>
      <div className="sm:col-span-2"><StateMessage {...state} /></div>
    </form>
  );
}

function StaffCodeForm({ type, label, configured }: { type: StaffRegistrationType; label: string; configured: boolean }) {
  const boundAction = updateStaffCodeAction.bind(null, type);
  const [state, formAction] = useActionState(boundAction, initialAccessSettingsState);
  return (
    <article className="rounded-[14px] bg-surface-muted p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{label}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {configured ? "Código configurado. Al guardarlo se sustituye sin mostrar el anterior." : "Todavía no tiene un código activo."}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${configured ? "bg-emerald-100 text-emerald-800" : "bg-gold-soft text-secondary"}`}>
          {configured ? "Activo" : "Pendiente"}
        </span>
      </div>
      <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" noValidate>
        <div className="min-w-0 flex-1">
          <label htmlFor={`code-${type}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{configured ? "Reemplazar código" : "Nuevo código"}</label>
          <input id={`code-${type}`} name="access_code" type="password" autoComplete="new-password" className={inputClass} />
        </div>
        <SubmitButton>{configured ? "Reemplazar" : "Activar"}</SubmitButton>
      </form>
      <StateMessage {...state} />
    </article>
  );
}

function EmailSettingsForm({ configured, fromEmail }: { configured: boolean; fromEmail: string }) {
  const [state, formAction] = useActionState(updateEmailSettingsAction, initialAccessSettingsState);
  return (
    <form action={formAction} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
      <div>
        <label htmlFor="resend-api-key" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Clave API de Resend</label>
        <input id="resend-api-key" name="resend_api_key" type="password" autoComplete="new-password" className={inputClass} />
        <p className="mt-1.5 text-xs text-muted-foreground">
          {configured ? "Configurada. Déjala vacía para conservar la actual." : "Necesaria para activar el envío manual y automático."}
        </p>
      </div>
      <div>
        <label htmlFor="resend-from-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remitente</label>
        <input id="resend-from-email" name="resend_from_email" type="text" defaultValue={fromEmail} className={inputClass} />
        <p className="mt-1.5 text-xs text-muted-foreground">Usa una dirección o formato autorizado en tu cuenta de Resend.</p>
      </div>
      <div className="flex items-end"><SubmitButton>Guardar correo</SubmitButton></div>
      <div className="sm:col-span-2"><StateMessage {...state} /></div>
    </form>
  );
}

export function AccessSettings({
  username,
  staffCodes,
  emailSettings,
}: {
  username: string;
  staffCodes: { type: StaffRegistrationType; label: string; configured: boolean }[];
  emailSettings: { configured: boolean; fromEmail: string };
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-[20px] border border-border bg-surface p-5 shadow-lg shadow-secondary/5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary"><ShieldCheck size={20} weight="fill" /></span>
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">Cuenta de administrador</h2>
            <p className="mt-1 text-sm text-muted-foreground">La contraseña se guarda con hash en la base de datos, nunca en archivos del proyecto.</p>
          </div>
        </div>
        <AccountForm username={username} />
      </section>
      <section className="rounded-[20px] border border-border bg-surface p-5 shadow-lg shadow-secondary/5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"><Key size={20} weight="fill" /></span>
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">Códigos de registro staff</h2>
            <p className="mt-1 text-sm text-muted-foreground">Cada código define automáticamente el tipo de registro; no se revela después de guardarlo.</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {staffCodes.map((staffCode) => <StaffCodeForm key={staffCode.type} {...staffCode} />)}
        </div>
      </section>
      <section className="rounded-[20px] border border-border bg-surface p-5 shadow-lg shadow-secondary/5 sm:p-6 lg:col-span-2">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-secondary"><EnvelopeSimple size={20} weight="fill" /></span>
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">Correo a coordinadores</h2>
            <p className="mt-1 text-sm text-muted-foreground">Envía el CSV manualmente desde Métricas y, por cada decanato, se envía una versión actualizada al llegar a 20, 40, 60 o más registros.</p>
          </div>
        </div>
        <EmailSettingsForm {...emailSettings} />
      </section>
    </div>
  );
}
