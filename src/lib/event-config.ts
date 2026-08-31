// Datos centrales del evento. Edita este archivo para actualizar textos,
// fecha, sede o contacto sin tocar el resto del sitio.
export const eventConfig = {
  name: "JAJ",
  fullName: "Jornada Arquidiocesana de la Juventud",
  edition: "XII",
  year: "2026",
  organizer: "PAJ Toluca",
  date: "Sábado 10 de octubre de 2026",
  dateShort: "10 oct. 2026",
  scheduleText: "7:00 - 16:00 hrs.",
  location: "Toluca, Estado de México",
  venueName: "Seminario Diocesano de Toluca",
  // Ya incluye "Toluca" (viene en venueName), por eso aquí no se repite.
  venueAddress: "Seminario Diocesano de Toluca, Estado de México",
  capacity: 15000,
  contactEmail: "registro@pajtoluca.org",
  contactPhone: "+52 722 000 0000",
  // OJO: esta fecha era correcta cuando el evento era el 14 de noviembre.
  // Ahora el evento es el 10 de octubre, así que este cierre de registro
  // (31 de octubre) queda DESPUÉS del evento. Actualízalo a una fecha real
  // antes del 10 de octubre.
  registrationDeadline: "31 de octubre de 2026",
} as const;

// Reemplaza estos "#" con los enlaces reales de cada red social.
export const socialLinks = {
  instagram: "https://www.instagram.com/paj.toluca?igsi=MW1lNG11c2JxOWhkYw==",
  facebook: "https://www.facebook.com/share/1Fd4zYdFZF/",
  tiktok: "https://www.tiktok.com/@paj.toluca?_r=1&_t=ZS-99KVrMuwIbd",
  youtube: "https://www.youtube.com/@pajtoluca",
} as const;
