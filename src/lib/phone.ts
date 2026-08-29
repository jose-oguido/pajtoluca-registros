export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean);
  return parts.join(" ");
}

export function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) {
    return "Ingresa un número de celular a 10 dígitos.";
  }
  return undefined;
}
