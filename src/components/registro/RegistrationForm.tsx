"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { WarningCircle, ArrowRight } from "@phosphor-icons/react";
import { submitRegistration } from "@/app/registro/actions";
import { initialRegistrationState } from "@/app/registro/state";
import { ParishCombobox } from "./ParishCombobox";

type ParishGroup = {
  decanato: string;
  zonaPastoral: string;
  options: { id: string; name: string; locality: string }[];
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
      <WarningCircle size={15} weight="fill" />
      {message}
    </p>
  );
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean);
  return parts.join(" ");
}

function validateAge(value: string): string | undefined {
  if (!value) return undefined;
  const age = Number(value);
  if (!Number.isInteger(age) || age < 15 || age > 30) {
    return "Este es un evento para jóvenes: ingresa una edad entre 15 y 30 años.";
  }
  return undefined;
}

function validateEmail(value: string): string | undefined {
  if (!value) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Ingresa un correo electrónico válido.";
  }
  return undefined;
}

function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) {
    return "Ingresa un número de celular a 10 dígitos.";
  }
  return undefined;
}

function validateEmergencyPhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, "");
  if (digits.length > 0 && digits.length !== 10) {
    return "Ingresa un número a 10 dígitos, o deja el campo vacío.";
  }
  return undefined;
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-[12px] border bg-surface px-4 py-3 text-foreground",
    "placeholder:text-muted-foreground/70",
    "focus:outline-none focus:ring-2 focus:ring-offset-0",
    hasError
      ? "border-red-400 focus:ring-red-300"
      : "border-border focus:ring-accent/40 focus:border-accent",
  ].join(" ");
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold uppercase tracking-wide text-accent-contrast transition-transform active:scale-[0.98] disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Enviando..." : "Confirmar registro"}
      {!pending && <ArrowRight size={18} weight="bold" />}
    </button>
  );
}

export function RegistrationForm({ parishGroups }: { parishGroups: ParishGroup[] }) {
  const [state, formAction] = useActionState(submitRegistration, initialRegistrationState);
  const [belongsToGroup, setBelongsToGroup] = useState(state.values.belongs_to_group ?? "");
  const [phone, setPhone] = useState(formatPhone(state.values.phone ?? ""));
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState(
    formatPhone(state.values.emergency_contact_phone ?? "")
  );
  const [emergencyPhoneTouched, setEmergencyPhoneTouched] = useState(false);
  const [age, setAge] = useState(state.values.age ?? "");
  const [ageTouched, setAgeTouched] = useState(false);
  const [email, setEmail] = useState(state.values.email ?? "");
  const [emailTouched, setEmailTouched] = useState(false);

  const ageError = ageTouched ? validateAge(age) : state.errors.age;
  const emailError = emailTouched ? validateEmail(email) : state.errors.email;
  const phoneError = phoneTouched ? validatePhone(phone) : state.errors.phone;
  const emergencyPhoneError = emergencyPhoneTouched
    ? validateEmergencyPhone(emergencyPhone)
    : state.errors.emergency_contact_phone;

  return (
    <form action={formAction} className="space-y-10" noValidate>
      <fieldset className="space-y-5">
        <legend className="font-display text-lg font-bold uppercase">Tus datos</legend>

        <div>
          <label htmlFor="full_name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Nombre completo
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            defaultValue={state.values.full_name}
            className={inputClass(!!state.errors.full_name)}
          />
          <FieldError message={state.errors.full_name} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="age" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Edad
            </label>
            <input
              id="age"
              name="age"
              type="number"
              inputMode="numeric"
              min={15}
              max={30}
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
            <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Correo electrónico <span className="font-normal text-muted-foreground">(opcional)</span>
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

      <fieldset className="space-y-5">
        <legend className="font-display text-lg font-bold uppercase">Tu grupo</legend>

        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ¿Perteneces a un grupo o parroquia?
          </span>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "yes", label: "Sí" },
              { value: "no", label: "No" },
            ].map((option) => (
              <label
                key={option.value}
                className={[
                  "flex cursor-pointer items-center justify-center rounded-[12px] border px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors",
                  belongsToGroup === option.value
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-foreground hover:bg-surface-muted",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="belongs_to_group"
                  value={option.value}
                  checked={belongsToGroup === option.value}
                  onChange={(e) => setBelongsToGroup(e.target.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          <FieldError message={state.errors.belongs_to_group} />
        </div>

        {belongsToGroup === "yes" && (
          <div>
            <label htmlFor="parish_id" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Parroquia o grupo juvenil
            </label>
            <ParishCombobox
              groups={parishGroups}
              name="parish_id"
              id="parish_id"
              defaultValue={state.values.parish_id}
              hasError={!!state.errors.parish_id}
            />
            <FieldError message={state.errors.parish_id} />
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-lg font-bold uppercase">
          Contacto de emergencia <span className="font-normal text-muted-foreground">(opcional)</span>
        </legend>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="emergency_contact_name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nombre
            </label>
            <input
              id="emergency_contact_name"
              name="emergency_contact_name"
              type="text"
              defaultValue={state.values.emergency_contact_name}
              className={inputClass(false)}
            />
          </div>
          <div>
            <label htmlFor="emergency_contact_phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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

      <fieldset className="space-y-5">
        <legend className="font-display text-lg font-bold uppercase">
          Notas <span className="font-normal text-muted-foreground">(opcional)</span>
        </legend>
        <div>
          <label htmlFor="notes" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Alergias o indicaciones especiales
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={state.values.notes}
            className={inputClass(false)}
          />
        </div>
      </fieldset>

      <SubmitButton />
    </form>
  );
}
