import db from "./db";

export type Decanato = {
  id: string;
  name: string;
  zona_pastoral: string;
  coordinator_name: string | null;
  coordinator_email: string | null;
  coordinator_phone: string | null;
  sort_order: number;
};

export type Parish = {
  id: string;
  name: string;
  locality: string;
  decanato_id: string;
  sort_order: number;
};

export type ParishWithDecanato = Parish & {
  decanato: string;
  zonaPastoral: string;
};

function nextParishId(): string {
  const row = db.prepare(`SELECT id FROM parishes ORDER BY id DESC LIMIT 1`).get() as
    | { id: string }
    | undefined;
  const nextNumber = row ? Number(row.id.slice(1)) + 1 : 1;
  return `p${String(nextNumber).padStart(3, "0")}`;
}

function nextDecanatoId(): string {
  const row = db.prepare(`SELECT id FROM decanatos ORDER BY id DESC LIMIT 1`).get() as
    | { id: string }
    | undefined;
  const nextNumber = row ? Number(row.id.slice(1)) + 1 : 1;
  return `d${String(nextNumber).padStart(2, "0")}`;
}

export function getDecanatos(): Decanato[] {
  return db.prepare(`SELECT * FROM decanatos ORDER BY sort_order ASC, name ASC`).all() as Decanato[];
}

export function getDecanatoById(id: string): Decanato | undefined {
  return db.prepare(`SELECT * FROM decanatos WHERE id = ?`).get(id) as Decanato | undefined;
}

export function getDecanatoByName(name: string): Decanato | undefined {
  return db.prepare(`SELECT * FROM decanatos WHERE name = ?`).get(name) as Decanato | undefined;
}

export function getParishesByDecanato(decanatoId: string): Parish[] {
  return db
    .prepare(`SELECT * FROM parishes WHERE decanato_id = ? ORDER BY sort_order ASC, name ASC`)
    .all(decanatoId) as Parish[];
}

export function getDirectory(): { decanato: Decanato; parishes: Parish[] }[] {
  const decanatos = getDecanatos();
  return decanatos.map((decanato) => ({
    decanato,
    parishes: getParishesByDecanato(decanato.id),
  }));
}

export function getParishesGroupedForForm(): {
  decanato: string;
  zonaPastoral: string;
  options: { id: string; name: string; locality: string }[];
}[] {
  return getDirectory()
    .filter((group) => group.parishes.length > 0)
    .map(({ decanato, parishes }) => ({
      decanato: decanato.name,
      zonaPastoral: decanato.zona_pastoral,
      options: parishes.map((p) => ({ id: p.id, name: p.name, locality: p.locality })),
    }));
}

export function findParishById(id: string): ParishWithDecanato | undefined {
  const row = db
    .prepare(
      `
      SELECT parishes.*, decanatos.name as decanato, decanatos.zona_pastoral as zonaPastoral
      FROM parishes
      JOIN decanatos ON decanatos.id = parishes.decanato_id
      WHERE parishes.id = ?
      `
    )
    .get(id) as ParishWithDecanato | undefined;
  return row;
}

export function createDecanato(data: {
  name: string;
  zonaPastoral: string;
  coordinatorName?: string | null;
  coordinatorEmail?: string | null;
  coordinatorPhone?: string | null;
}): string {
  const id = nextDecanatoId();
  const maxOrder = db.prepare(`SELECT MAX(sort_order) as max FROM decanatos`).get() as {
    max: number | null;
  };
  db.prepare(
    `
    INSERT INTO decanatos (id, name, zona_pastoral, coordinator_name, coordinator_email, coordinator_phone, sort_order)
    VALUES (@id, @name, @zonaPastoral, @coordinatorName, @coordinatorEmail, @coordinatorPhone, @sortOrder)
  `
  ).run({
    id,
    name: data.name,
    zonaPastoral: data.zonaPastoral,
    coordinatorName: data.coordinatorName ?? null,
    coordinatorEmail: data.coordinatorEmail ?? null,
    coordinatorPhone: data.coordinatorPhone ?? null,
    sortOrder: (maxOrder.max ?? -1) + 1,
  });
  return id;
}

export function updateDecanato(
  id: string,
  data: {
    name: string;
    zonaPastoral: string;
    coordinatorName?: string | null;
    coordinatorEmail?: string | null;
    coordinatorPhone?: string | null;
  }
): void {
  db.prepare(
    `
    UPDATE decanatos
    SET name = @name,
        zona_pastoral = @zonaPastoral,
        coordinator_name = @coordinatorName,
        coordinator_email = @coordinatorEmail,
        coordinator_phone = @coordinatorPhone
    WHERE id = @id
    `
  ).run({
    id,
    name: data.name,
    zonaPastoral: data.zonaPastoral,
    coordinatorName: data.coordinatorName ?? null,
    coordinatorEmail: data.coordinatorEmail ?? null,
    coordinatorPhone: data.coordinatorPhone ?? null,
  });
}

export function deleteDecanato(id: string): { ok: boolean; error?: string } {
  const parishCount = (
    db.prepare(`SELECT COUNT(*) as count FROM parishes WHERE decanato_id = ?`).get(id) as {
      count: number;
    }
  ).count;
  if (parishCount > 0) {
    return { ok: false, error: "No puedes eliminar un decanato que todavía tiene parroquias." };
  }
  db.prepare(`DELETE FROM decanatos WHERE id = ?`).run(id);
  return { ok: true };
}

export function createParish(data: { name: string; locality: string; decanatoId: string }): string {
  const id = nextParishId();
  const maxOrder = db
    .prepare(`SELECT MAX(sort_order) as max FROM parishes WHERE decanato_id = ?`)
    .get(data.decanatoId) as { max: number | null };
  db.prepare(
    `INSERT INTO parishes (id, name, locality, decanato_id, sort_order) VALUES (@id, @name, @locality, @decanatoId, @sortOrder)`
  ).run({
    id,
    name: data.name,
    locality: data.locality,
    decanatoId: data.decanatoId,
    sortOrder: (maxOrder.max ?? -1) + 1,
  });
  return id;
}

export function updateParish(
  id: string,
  data: { name: string; locality: string; decanatoId: string }
): void {
  db.prepare(
    `UPDATE parishes SET name = @name, locality = @locality, decanato_id = @decanatoId WHERE id = @id`
  ).run({ id, name: data.name, locality: data.locality, decanatoId: data.decanatoId });
}

export function deleteParish(id: string): void {
  db.prepare(`DELETE FROM parishes WHERE id = ?`).run(id);
}
