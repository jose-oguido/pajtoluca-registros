"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { WarningCircle, ArrowRight, X } from "@phosphor-icons/react";
import { submitStaffRegistration } from "@/app/registro-staff/actions";
import { initialStaffRegistrationState } from "@/app/registro-staff/state";
import { formatPhone, validatePhone } from "@/lib/phone";
import { ParishCombobox } from "./ParishCombobox";

type ParishGroup = {
  decanato: string;
  zonaPastoral: string;
  options: { id: string; name: string; locality: string }[];
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 flex items-center gap-1.5 text-xs text-red-600">
      <WarningCircle size={13} weight="fill" />
      {message}
    </p>
  );
}

function validateAge(value: string): string | undefined {
  if (!value) return undefined;
  const age = Number(value);
  if (!Number.isInteger(age) || age < 12 || age > 45) {
    return "Ingresa una edad entre 12 y 45 años.";
  }
  return undefined;
}

function validateEmail(value: string): string | undefined {
  if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Ingresa un correo electrónico válido.";
  }
  return undefined;
}

function validateEmergencyName(value: string): string | undefined {
  if (value.trim().length < 3) {
    return "Escribe el nombre de tu contacto de emergencia.";
  }
  return undefined;
}

function validateEmergencyPhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) {
    return "Ingresa un número de contacto de emergencia a 10 dígitos.";
  }
  return undefined;
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-[12px] border bg-surface px-3.5 py-2 text-foreground",
    "placeholder:text-muted-foreground/70",
    "focus:outline-none focus:ring-2 focus:ring-offset-0",
    hasError
      ? "border-red-400 focus:ring-red-300"
      : "border-border focus:ring-accent/40 focus:border-accent",
  ].join(" ");
}

function ModalSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-contrast transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Enviando..." : "Confirmar"}
      {!pending && <ArrowRight size={18} weight="bold" />}
    </button>
  );
}

export function StaffRegistrationForm({ parishGroups }: { parishGroups: ParishGroup[] }) {
  const [state, formAction] = useActionState(submitStaffRegistration, initialStaffRegistrationState);
  const formRef = useRef<HTMLFormElement>(null);
  const [phone, setPhone] = useState(formatPhone(state.values.phone ?? ""));
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState(
    formatPhone(state.values.emergency_contact_phone ?? "")
  );
  const [emergencyPhoneTouched, setEmergencyPhoneTouched] = useState(false);
  const [emergencyName, setEmergencyName] = useState(state.values.emergency_contact_name ?? "");
  const [emergencyNameTouched, setEmergencyNameTouched] = useState(false);
  const [age, setAge] = useState(state.values.age ?? "");
  const [ageTouched, setAgeTouched] = useState(false);
  const [email, setEmail] = useState(state.values.email ?? "");
  const [emailTouched, setEmailTouched] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [lastHandledState, setLastHandledState] = useState(state);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const ageError = ageTouched
    ? validateAge(age) ?? clientErrors.age
    : clientErrors.age ?? state.errors.age;
  const emailError = emailTouched
    ? validateEmail(email) ?? clientErrors.email
    : clientErrors.email ?? state.errors.email;
  const phoneError = phoneTouched
    ? validatePhone(phone) ?? clientErrors.phone
    : clientErrors.phone ?? state.errors.phone;
  const emergencyPhoneError = emergencyPhoneTouched
    ? validateEmergencyPhone(emergencyPhone) ?? clientErrors.emergency_contact_phone
    : clientErrors.emergency_contact_phone ?? state.errors.emergency_contact_phone;
  const emergencyNameError = emergencyNameTouched
    ? validateEmergencyName(emergencyName) ?? clientErrors.emergency_contact_name
    : clientErrors.emergency_contact_name ?? state.errors.emergency_contact_name;

  function clearClientError(field: string) {
    setClientErrors((current) => {
      if (!current[field]) return current;
      const { [field]: _removed, ...remaining } = current;
      return remaining;
    });
  }

  function openCodeModalAfterValidation() {
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const errors: Record<string, string> = {};
    const fullName = String(formData.get("full_name") ?? "").trim();
    const formAge = String(formData.get("age") ?? "").trim();
    const formPhone = String(formData.get("phone") ?? "").trim();
    const formEmail = String(formData.get("email") ?? "").trim();
    const formEmergencyName = String(formData.get("emergency_contact_name") ?? "").trim();
    const formEmergencyPhone = String(formData.get("emergency_contact_phone") ?? "").trim();
    const parishId = String(formData.get("parish_id") ?? "").trim();

    if (fullName.length < 3) {
      errors.full_name = "Escribe tu nombre completo.";
    }

    const ageValidationError = validateAge(formAge);
    if (!formAge || ageValidationError) {
      errors.age = ageValidationError ?? "Ingresa una edad entre 12 y 45 años.";
    }

    const phoneValidationError = validatePhone(formPhone);
    if (phoneValidationError) {
      errors.phone = phoneValidationError;
    }

    const emailValidationError = validateEmail(formEmail);
    if (emailValidationError) {
      errors.email = emailValidationError;
    }

    if (!parishId) {
      errors.parish_id = "Selecciona tu parroquia de la lista.";
    }

    const emergencyPhoneValidationError = validateEmergencyPhone(formEmergencyPhone);
    if (emergencyPhoneValidationError) {
      errors.emergency_contact_phone = emergencyPhoneValidationError;
    }

    const emergencyNameValidationError = validateEmergencyName(formEmergencyName);
    if (emergencyNameValidationError) {
      errors.emergency_contact_name = emergencyNameValidationError;
    }

    setAgeTouched(true);
    setPhoneTouched(true);
    setEmailTouched(true);
    setEmergencyNameTouched(true);
    setEmergencyPhoneTouched(true);
    setClientErrors(errors);

    if (Object.keys(errors).length === 0) {
      setCodeModalOpen(true);
    }
  }

  // If the code was wrong, bring the modal back up so they can retry
  // without having to click "Confirmar registro" again. Adjusting state
  // during render (rather than in an effect) avoids an extra commit.
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state.errors.access_code) setCodeModalOpen(true);
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4" noValidate>
      <fieldset className="space-y-2.5">
        <legend className="font-display text-base font-bold uppercase">Tus datos</legend>

        <div>
          <label htmlFor="full_name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Nombre completo
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            defaultValue={state.values.full_name}
            onChange={() => clearClientError("full_name")}
            className={inputClass(!!(clientErrors.full_name ?? state.errors.full_name))}
          />
          <FieldError message={clientErrors.full_name ?? state.errors.full_name} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="age" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Edad
            </label>
            <input
              id="age"
              name="age"
              type="number"
              inputMode="numeric"
              min={12}
              max={45}
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                setAgeTouched(true);
              }}
              className={inputClass(!!ageError)}
            />
            <FieldError message={ageError} />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Teléfono celular
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="55 1234 5678"
              value={phone}
              onChange={(e) => {
                setPhone(formatPhone(e.target.value));
                setPhoneTouched(true);
              }}
              className={inputClass(!!phoneError)}
            />
            <FieldError message={phoneError} />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailTouched(true);
            }}
            className={inputClass(!!emailError)}
          />
          <FieldError message={emailError} />
        </div>
      </fieldset>

      <fieldset className="space-y-2.5">
        <legend className="font-display text-base font-bold uppercase">Tu parroquia</legend>

        <div>
          <label htmlFor="parish_id" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ¿A qué parroquia perteneces?
          </label>
          <ParishCombobox
            groups={parishGroups}
            name="parish_id"
            id="parish_id"
            defaultValue={state.values.parish_id}
            hasError={!!(clientErrors.parish_id ?? state.errors.parish_id)}
          />
          <FieldError message={clientErrors.parish_id ?? state.errors.parish_id} />
        </div>
      </fieldset>

      <fieldset className="space-y-2.5">
        <legend className="font-display text-base font-bold uppercase">
          Contacto de emergencia
        </legend>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="emergency_contact_name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nombre
            </label>
            <input
              id="emergency_contact_name"
              name="emergency_contact_name"
              type="text"
              value={emergencyName}
              onChange={(e) => {
                setEmergencyName(e.target.value);
                setEmergencyNameTouched(true);
              }}
              className={inputClass(!!emergencyNameError)}
            />
            <FieldError message={emergencyNameError} />
          </div>
          <div>
            <label htmlFor="emergency_contact_phone" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Teléfono
            </label>
            <input
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              type="tel"
              inputMode="numeric"
              placeholder="55 1234 5678"
              value={emergencyPhone}
              onChange={(e) => {
                setEmergencyPhone(formatPhone(e.target.value));
                setEmergencyPhoneTouched(true);
              }}
              className={inputClass(!!emergencyPhoneError)}
            />
            <FieldError message={emergencyPhoneError} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-2.5">
        <legend className="font-display text-base font-bold uppercase">
          Notas <span className="font-normal text-muted-foreground">(opcional)</span>
        </legend>
        <div>
          <label htmlFor="notes" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Alergias o indicaciones especiales
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={state.values.notes}
            className={inputClass(false)}
          />
        </div>
      </fieldset>

      <button
        type="button"
        onClick={openCodeModalAfterValidation}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-contrast transition-transform active:scale-[0.98] sm:w-auto"
      >
        Confirmar registro
        <ArrowRight size={18} weight="bold" />
      </button>

      {codeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-dark/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCodeModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-[20px] border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                Código de acceso
              </h2>
              <button
                type="button"
                onClick={() => setCodeModalOpen(false)}
                aria-label="Cerrar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Te lo comparte el líder de tu equipo (staff o ministros extraordinarios).
            </p>

            <div className="mt-4">
              <label htmlFor="access_code" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Código
              </label>
              <input
                id="access_code"
                name="access_code"
                type="text"
                autoComplete="off"
                autoFocus
                defaultValue={state.values.access_code}
                className={inputClass(!!state.errors.access_code)}
              />
              <FieldError message={state.errors.access_code} />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setCodeModalOpen(false)}
                className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-surface-muted"
              >
                Cancelar
              </button>
              <ModalSubmitButton />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
