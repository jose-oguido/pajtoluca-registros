// Coordinadores de decanato de jóvenes tomados del Directorio 2026.
// En las filas con dos nombres sólo se incluyó a quien está marcado como
// "jóvenes"; para la fila sin etiqueta se confirmó María Belén Mercado Molina.
const ARCHDIOCESAN_TEAM_NAMES = [
  "Armando Vences Morán",
  "José María Mena Nieto",
  "Penélope Gabriela Reyes Aupart",
  "Itzel Sandoval Moreno",
  "César Ignacio Hernández Romero",
  "Maurilio Alfredo Gutiérrez Mejía",
  "César López",
  "Veronica Castañeda Segura",
  "Edgar Marín Rojas",
  "Jaime Eduardo Valeriano",
  "Eduardo Aguilar Díaz",
  "Carlos Valdez Victoria",
  "Nicole Catherine Alvarado Martínez",
  "María Belén Mercado Molina",
  "Fernanda García Esquivel",
  "Jose Ortega Guido",
  "Ana Laura Alvarez Becerril"
] as const;

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const archdiocesanTeamNameSet = new Set(ARCHDIOCESAN_TEAM_NAMES.map(normalizeName));

export function isArchdiocesanTeamMember(fullName: string): boolean {
  return archdiocesanTeamNameSet.has(normalizeName(fullName));
}
