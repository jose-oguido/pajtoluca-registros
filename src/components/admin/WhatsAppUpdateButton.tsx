"use client";

import { useActionState, useMemo } from "react";
import { ArrowSquareOut, ChatCircleText, WarningCircle } from "@phosphor-icons/react";
import { prepareParishUpdateLinkAction } from "@/app/admin/dashboard/actions";
import { initialParishUpdateLinkState } from "@/app/admin/dashboard/state";
import { eventConfig } from "@/lib/event-config";

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/).find(Boolean) ?? "";
}

export function WhatsAppUpdateButton({
  registrationId,
  fullName,
  phone,
}: {
  registrationId: number;
  fullName: string;
  phone: string;
}) {
  const action = useMemo(
    () => prepareParishUpdateLinkAction.bind(null, registrationId),
    [registrationId]
  );
  const [state, formAction, isPending] = useActionState(action, initialParishUpdateLinkState);
  const phoneDigits = phone.replace(/\D/g, "");

  function openWhatsApp() {
    if (state.status !== "success" || !state.token || phoneDigits.length !== 10) return;

    const updateUrl = `${window.location.origin}/actualizar-datos/${state.token}`;
    const message = [
      `¡Hola${firstName(fullName) ? `, ${firstName(fullName)}` : ""}! Esperamos que estés muy bien.`,
      "",
      "Te saludamos de la *Pastoral de Adolescentes y Jóvenes de Toluca*.",
      "",
      `Estamos afinando los registros para la *${eventConfig.edition} ${eventConfig.name}* y queremos pedirte un pequeño apoyo.`,
      "",
      "*¿Nos ayudas indicando la parroquia a la que acudes normalmente o la que te queda más cerca?*",
      "Puedes actualizar este dato rápidamente aquí:",
      "",
      updateUrl,
      "",
      "*¡Muchas gracias por ayudarnos!*",
      "Nos alegra mucho contar contigo.",
    ].join("\n");
    window.open(`https://wa.me/52${phoneDigits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  if (phoneDigits.length !== 10) {
    return <p className="text-xs text-red-600">No hay un teléfono válido para enviar WhatsApp.</p>;
  }

  if (state.status === "success" && state.token) {
    return (
      <button
        type="button"
        onClick={openWhatsApp}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#123026] transition-colors hover:bg-[#1fb85a] sm:w-auto"
      >
        <ChatCircleText size={17} weight="fill" aria-hidden="true" />
        Abrir WhatsApp
        <ArrowSquareOut size={15} weight="bold" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div>
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#123026] transition-colors hover:bg-[#1fb85a] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <ChatCircleText size={17} weight="fill" aria-hidden="true" />
          {isPending ? "Preparando…" : "Preparar WhatsApp"}
        </button>
      </form>
      {state.status === "error" && (
        <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-red-600">
          <WarningCircle size={15} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      )}
    </div>
  );
}
