-- JAJ Pajtoluca -- esquema completo de la base de datos (SQLite)
--
-- No es necesario correr este archivo para usar la app: al iniciarla por
-- primera vez, src/lib/db.ts crea estas mismas tablas y siembra los
-- decanatos y parroquias automaticamente en data/jaj.db.
--
-- Este archivo es para cuando necesitas crear o inspeccionar la base de
-- datos por tu cuenta (por ejemplo, en otro entorno o con una herramienta
-- como DB Browser for SQLite). Uso:
--   sqlite3 data/jaj.db < database/schema.sql

PRAGMA foreign_keys = ON;

-- ============================================================
-- Tablas
-- ============================================================

CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id TEXT,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  belongs_to_group INTEGER NOT NULL DEFAULT 0,
  parish_id TEXT,
  parish_group TEXT,
  decanato TEXT,
  zona_pastoral TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  discovery_reason TEXT,
  notes TEXT,
  registration_type TEXT NOT NULL DEFAULT 'attendee',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_registrations_parish_group ON registrations(parish_group);
CREATE INDEX IF NOT EXISTS idx_registrations_decanato ON registrations(decanato);
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_ticket_id ON registrations(ticket_id);

CREATE TABLE IF NOT EXISTS decanatos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  zona_pastoral TEXT NOT NULL,
  coordinator_name TEXT,
  coordinator_email TEXT,
  coordinator_phone TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS parishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  locality TEXT NOT NULL,
  decanato_id TEXT NOT NULL REFERENCES decanatos(id),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_parishes_decanato_id ON parishes(decanato_id);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS staff_access_codes (
  registration_type TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS coordinator_report_batches (
  decanato_id TEXT NOT NULL REFERENCES decanatos(id) ON DELETE CASCADE,
  batch_number INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  sent_at TEXT,
  PRIMARY KEY (decanato_id, batch_number)
);

-- ============================================================
-- Datos iniciales: decanatos y parroquias
-- (Directorio - Ubica tu Decanato.pdf, Arquidiocesis de Toluca)
-- ============================================================

INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d01', 'San José', 'San Pedro Apóstol', 0);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d02', 'San Carlos Borromeo', 'San Pedro Apóstol', 1);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d03', 'San Pío X', 'San Pedro Apóstol', 2);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d04', 'San Agustín de Hipona', 'San Andrés Apóstol', 3);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d05', 'San Juan Bautista', 'San Andrés Apóstol', 4);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d06', 'San Juan María Vianney', 'San Andrés Apóstol', 5);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d07', 'San Ignacio de Antioquia', 'Santiago el Mayor Apóstol', 6);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d08', 'Espíritu Santo', 'Santiago el Mayor Apóstol', 7);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d09', 'Santa Clara de Asís', 'San Pablo Apóstol', 8);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d10', 'San Martín Obispo de Tours', 'San Pablo Apóstol', 9);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d11', 'San Bartolomé Apóstol', 'San Mateo Apóstol y Evangelista', 10);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d12', 'San Juan Diego', 'San Mateo Apóstol y Evangelista', 11);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d13', 'San Miguel Arcángel', 'San Juan Apóstol y Evangelista', 12);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d14', 'San Gabriel Arcángel', 'San Juan Apóstol y Evangelista', 13);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d15', 'San Francisco de Asís', 'Santo Tomás Apóstol', 14);
INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order) VALUES ('d16', 'El Señor del Perdón y Nuestra Señora de la Consolación', 'Santo Tomás Apóstol', 15);

INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p001', 'Rectoría de María, Reina de la Paz', 'Toluca', 'd01', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p002', 'Parroquia de Nuestra Señora de Guadalupe', 'Toluca', 'd01', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p003', 'Parroquia de San Juan Bautista', 'Toluca', 'd01', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p004', 'Rectoría de San Diego de Alcalá', 'Toluca', 'd01', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p005', 'Rectoría de Santa Clara de Asís', 'Toluca', 'd01', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p006', 'Parroquia de La Virgen de Guadalupe y San Juan Diego', 'Toluca', 'd01', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p007', 'Capilla de La Magdalena', 'Tlacopa, Toluca', 'd01', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p008', 'Parroquia de Nuestra Señora de los Ángeles', 'Huitzila, Toluca', 'd01', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p009', 'Parroquia de Santiago Apóstol', 'Santiago Miltepec, Toluca', 'd01', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p010', 'Capilla de Nuestra Señora de Guadalupe', 'Rancho la Mora, Toluca', 'd01', 9);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p011', 'Rectoría de Nuestra Señora de Lourdes', 'Toluca', 'd01', 10);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p012', 'Rectoría de San Juan Evangelista', 'San Juan Chiquito, Toluca', 'd01', 11);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p013', 'Parroquia de San José, El Sagrario', 'Toluca', 'd01', 12);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p014', 'Rectoría de La Santa Veracruz', 'Toluca', 'd01', 13);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p015', 'Rectoría de Nuestra Señora del Carmen', 'Toluca', 'd01', 14);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p016', 'Parroquia y Templo Expiatorio Diocesano Santa Bárbara', 'Toluca', 'd01', 15);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p017', 'Rectoría de San Miguel Arcángel', 'San Miguel Apinahuizco, Toluca', 'd01', 16);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p018', 'Parroquia de La Santa Cruz', 'Santa Cruz Atzcapotzaltongo, Toluca', 'd01', 17);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p019', 'Capilla de Santiago', 'Tlaxomulco, Toluca', 'd01', 18);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p020', 'Parroquia de San Francisco de Asís', 'Calixtlahuaca, Toluca', 'd01', 19);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p021', 'Rectoría de Nuestra Señora de los Dolores', 'Toluca', 'd02', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p022', 'Rectoría de San José', 'El Ranchito, Toluca', 'd02', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p023', 'Parroquia de La Divina Providencia', 'Toluca', 'd02', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p024', 'Capilla del Señor de la Redención', 'Toluca', 'd02', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p025', 'Parroquia de San Felipe de Jesús', 'Toluca', 'd02', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p026', 'Parroquia de Nuestra Señora de los Desamparados', 'Toluca', 'd02', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p027', 'Rectoría de El Calvario', 'Toluca', 'd02', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p028', 'Parroquia y Santuario de Santa María de Guadalupe', 'Toluca', 'd02', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p029', 'Rectoría y Santuario de Nuestra Señora de la Merced', 'Toluca', 'd02', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p030', 'Parroquia de San Bernardino de Siena', 'Toluca', 'd02', 9);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p031', 'Parroquia Universitaria María, Madre de la Sabiduría', 'Toluca', 'd02', 10);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p032', 'Parroquia de El Patrocinio de San José', 'Toluca', 'd02', 11);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p033', 'Parroquia de San Mateo Apóstol', 'Oxtotitlán, Toluca', 'd02', 12);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p034', 'Parroquia de Nuestra Señora del Rosario de Fátima', 'Toluca', 'd02', 13);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p035', 'Parroquia de Cristo Rey', 'Toluca', 'd02', 14);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p036', 'Parroquia de El Señor de la Transfiguración', 'Metepec', 'd03', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p037', 'Rectoría de San Judas Tadeo, Apóstol', 'Metepec', 'd03', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p038', 'Parroquia de La Inmaculada Concepción de María', 'Metepec', 'd03', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p039', 'Rectoría de El Señor de la Misericordia', 'Toluca', 'd03', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p040', 'Parroquia de La Santa Cruz Gloriosa', 'Toluca', 'd03', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p041', 'Parroquia de Jesús Nazareno', 'Toluca', 'd03', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p042', 'Rectoría de El Espíritu Santo', 'Toluca', 'd03', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p043', 'Rectoría de Santos Simón y Judas Tadeo, Apóstoles', 'Toluca', 'd03', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p044', 'Parroquia de San Martín de Porres', 'Toluca', 'd03', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p045', 'Rectoría de La Sagrada Familia', 'Toluca', 'd03', 9);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p046', 'Parroquia de San Sebastián', 'Toluca', 'd03', 10);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p047', 'Parroquia de Nuestra Señora del Perpetuo Socorro', 'Toluca', 'd03', 11);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p048', 'Parroquia de Nuestra Señora del Sagrado Corazón', 'Toluca', 'd03', 12);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p049', 'Parroquia de Nuestra Señora de Fátima', 'Toluca', 'd03', 13);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p050', 'Parroquia de Santa María de las Rosas', 'Toluca', 'd03', 14);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p051', 'Capilla de El Divino Salvador', 'San Salvador Tizatlali', 'd04', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p052', 'Parroquia de San Jerónimo', 'San Jerónimo Chicahualco, Metepec', 'd04', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p053', 'Rectoría de Nuestra Señora del Perpetuo Socorro', 'Metepec', 'd04', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p054', 'Parroquia de San José Obrero', 'Metepec', 'd04', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p055', 'Capilla de La Santa Cruz', 'Santa Ana Tlapaltitlán', 'd04', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p056', 'Capilla de Santa María Zozoquipan', 'Santa Ana Tlapaltitlán', 'd04', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p057', 'Parroquia de San Gabriel Arcángel', 'Fuentes de San Gabriel, Infonavit, Metepec', 'd04', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p058', 'Parroquia de San Carlos Borromeo', 'Metepec', 'd04', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p059', 'Rectoría de San Francisco de Asís', 'San Francisco Coaxusco, Metepec', 'd04', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p060', 'Parroquia de Santa Ana', 'Santa Ana Tlapaltitlán, Toluca', 'd04', 9);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p061', 'Parroquia y Santuario de Nuestra Señora de la Vida', 'Metepec', 'd05', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p062', 'Parroquia de San Miguel Arcángel', 'San Miguel Totocuitlapilco, Metepec', 'd05', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p063', 'Parroquia de San Bartolomé Apóstol', 'San Bartolomé Tlaltelulco, Metepec', 'd05', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p064', 'Parroquia de Santa María Magdalena', 'Ocotitlán', 'd05', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p065', 'Parroquia de San Juan Bautista y Santa María de Guadalupe', 'Metepec', 'd05', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p066', 'Rectoría de La Anunciación', 'La Virgen, Metepec', 'd05', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p067', 'Parroquia de San José', 'Rancho La Pila, Metepec', 'd05', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p068', 'Parroquia de La Santísima Trinidad', 'La Asunción, Metepec', 'd05', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p069', 'Parroquia de San Francisco de Asís', 'Infonavit, Metepec', 'd05', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p070', 'Rectoría de Inmaculado Corazón de María', 'Metepec', 'd05', 9);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p071', 'Parroquia de Sagrado Corazón de Jesús', 'Metepec', 'd05', 10);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p072', 'Rectoría de San Juan Bautista', 'San Juan Tilapa', 'd06', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p073', 'Parroquia de Santiago Apóstol', 'Santiago Tlacotepec', 'd06', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p074', 'Parroquia de San Felipe Apóstol', 'San Felipe Tlalmimilolpan', 'd06', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p075', 'Parroquia de El Divino Salvador', 'Capultitlán', 'd06', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p076', 'Parroquia de Sagrado Corazón de Jesús', 'Ocho Cedros', 'd06', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p077', 'Rectoría de Santa María de Guadalupe', 'Col. Guadalupe', 'd06', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p078', 'Parroquia de San Buenaventura', 'San Buenaventura', 'd06', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p079', 'Parroquia de La Asunción de María', 'Cacalomacán', 'd06', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p080', 'Parroquia de San Antonio de Padua', 'San Antonio Buenavista', 'd06', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p081', 'Rectoría de Nuestra Señora del Sagrado Corazón', 'Cacalomacán', 'd06', 9);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p082', 'Rectoría de Santa Cruz Cuauhtenco', 'Santa Cruz Cuauhtenco', 'd06', 10);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p083', 'Parroquia de San Francisco de Asís', 'San Francisco Tepexoxuca, Tenango del Valle', 'd07', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p084', 'Parroquia de San Pedro Apóstol', 'Zictepec, Tenango del Valle', 'd07', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p085', 'Parroquia de San Bartolomé Apóstol', 'Atlatlahuca, Tenango del Valle', 'd07', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p086', 'Parroquia de La Asunción de María', 'Tenango del Valle', 'd07', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p087', 'Parroquia de San Miguel Arcángel', 'San Miguel Balderas, Tenango del Valle', 'd07', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p088', 'Parroquia de Nuestra Señora del Pilar', 'Zaragoza de Guadalupe, Calimaya', 'd07', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p089', 'Parroquia de San Pedro y San Pablo, Apóstoles', 'Calimaya', 'd07', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p090', 'Parroquia de La Asunción de María', 'Santa María Rayón', 'd07', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p091', 'Parroquia de San Antonio de Padua', 'San Antonio la Isla', 'd07', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p092', 'Parroquia de San Andrés Apóstol', 'San Andrés Ocotlán', 'd07', 9);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p093', 'Parroquia de San Miguel Arcángel', 'San Miguel Chapultepec', 'd07', 10);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p094', 'Parroquia de San Mateo Apóstol', 'Mexicaltzingo', 'd07', 11);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p095', 'Parroquia de La Natividad de María', 'Santa María Nativitas', 'd07', 12);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p096', 'Parroquia de San Pedro Apóstol', 'Atlapulco, San Pedro Atlapulco', 'd08', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p097', 'Parroquia de El Divino Salvador', 'Santiago Tilapa', 'd08', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p098', 'Rectoría de San Miguel Arcángel', 'San Miguel Almaya', 'd08', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p099', 'Parroquia de San Bartolomé Apóstol', 'Capulhuac', 'd08', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p100', 'Parroquia de Santiago Apóstol', 'Santiago Tianguistenco', 'd08', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p101', 'Parroquia de San Pedro Apóstol', 'San Pedro Tlaltizapán', 'd08', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p102', 'Parroquia de Santa Cruz', 'Santa Cruz Atizapán', 'd08', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p103', 'Parroquia de San Miguel Arcángel', 'Almoloya del Río', 'd08', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p104', 'Parroquia de San Mateo Apóstol', 'San Mateo Texcalyacac', 'd08', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p105', 'Parroquia de San Nicolás Tolentino', 'Coatepec de las Bateas, Tianguistenco', 'd08', 9);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p106', 'Parroquia de La Asunción de María', 'Xalatlaco', 'd08', 10);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p107', 'Parroquia de San Nicolás Tolentino', 'San Nicolás Peralta, Lerma', 'd09', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p108', 'Parroquia de Santa María de la Asunción', 'Sta. María Atarasquillo', 'd09', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p109', 'Parroquia de San Miguel Arcángel', 'San Miguel Ameyalco, Lerma', 'd09', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p110', 'Parroquia de Santa Clara de Asís', 'Lerma', 'd09', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p111', 'Parroquia de Santa Rosa de Lima', 'San Mateo Atenco', 'd09', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p112', 'Parroquia de San José', 'El Cerrillo Vista Hermosa, San Pedro Totoltepec', 'd09', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p113', 'Parroquia de San Pedro Apóstol', 'San Pedro Totoltepec', 'd09', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p114', 'Parroquia de La Inmaculada Concepción', 'Santa María Totoltepec', 'd09', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p115', 'Rectoría de Nuestra Señora del Carmen', 'Sta. María Totoltepec', 'd09', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p116', 'Parroquia de La Asunción de María', 'Tepexoyuca', 'd10', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p117', 'Parroquia de San Martín, Obispo de Tours', 'Ocoyoacac', 'd10', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p118', 'Rectoría de San Pedro Apóstol', 'Cholula, Ocoyoacac', 'd10', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p119', 'Parroquia de San Pedro Apóstol', 'San Pedro Tultepec', 'd10', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p120', 'Rectoría de San Pedro y San Pablo Atenco', 'San Mateo Atenco', 'd10', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p121', 'Parroquia de San Mateo Apóstol', 'San Mateo Atenco', 'd10', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p122', 'Parroquia de Nuestra Señora de Guadalupe', 'San Mateo Atenco', 'd10', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p123', 'Parroquia de San Gaspar', 'San Gaspar Tlahuelilpan, Metepec', 'd10', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p124', 'Parroquia de Santa María de los Ángeles', 'Atenco, San Mateo Atenco', 'd10', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p125', 'Parroquia y Santuario de Nuestra Señora de San Juan de los Lagos', 'San Mateo Atenco', 'd10', 9);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p126', 'Parroquia de Santa Ana', 'Santa Ana Jilotzingo, Otzolotepec', 'd11', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p127', 'Parroquia de San Miguel Arcángel', 'Mimiapan, Xonacatlán', 'd11', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p128', 'Parroquia de San Isidro Labrador', 'Zacamulpa, Lerma', 'd11', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p129', 'Parroquia de San Lorenzo', 'Huitzizilapan, Lerma', 'd11', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p130', 'Parroquia de San Francisco de Asís', 'Xonacatlán', 'd11', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p131', 'Parroquia de San Bartolomé Apóstol', 'Otzolotepec, Villa Cuauhtémoc', 'd11', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p132', 'Rectoría de San Pedro Apóstol', 'San Pedro Arriba, Temoaya', 'd12', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p133', 'Parroquia y Santuario de Santiago Apóstol', 'Temoaya', 'd12', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p134', 'Parroquia de San Diego de Alcalá', 'Temoaya', 'd12', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p135', 'Rectoría de San Cayetano y San Nicolás Tolentino', 'Tlachaloya Primera Sección', 'd12', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p136', 'Parroquia de Santa María de Guadalupe', 'Taborda', 'd12', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p137', 'Parroquia de San Diego de Alcalá', 'San Pablo Autopan', 'd12', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p138', 'Parroquia de San Pablo Apóstol', 'San Pablo Autopan', 'd12', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p139', 'Parroquia de Santa María de Guadalupe', 'Pueblo Nuevo, San Pablo Autopan', 'd12', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p140', 'Parroquia de San Andrés Apóstol', 'San Andrés Cuexcontitlán', 'd12', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p141', 'Rectoría de San Diego de los Padres', 'San Andrés Cuexcontitlán', 'd12', 9);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p142', 'Parroquia de San Cristóbal', 'San Cristóbal Huichochitlán', 'd12', 10);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p143', 'Parroquia de San Mateo Apóstol', 'San Mateo Otzacatipan', 'd12', 11);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p144', 'Parroquia de San Mateo Apóstol', 'San Mateo Tlalchichilpán', 'd13', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p145', 'Parroquia y Santuario de Nuestra Señora de los Ángeles', 'Tecaxic', 'd13', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p146', 'Parroquia de El Señor de los Milagros', 'Zinacantepec', 'd13', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p147', 'Parroquia de San Luis, Rey de Francia', 'San Luis Mextepec', 'd13', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p148', 'Parroquia de San Miguel Arcángel', 'Zinacantepec', 'd13', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p149', 'Parroquia de San Cristóbal', 'San Cristóbal Tecolit', 'd13', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p150', 'Parroquia de San Juan Bautista', 'San Juan de las Huertas', 'd13', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p151', 'Parroquia de San Antonio de Padua', 'San Antonio Acahualco', 'd13', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p152', 'Parroquia de San Francisco de Asís', 'San Francisco Tlalcilalcalpan', 'd13', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p153', 'Parroquia de Santa María Magdalena', 'Santa María del Monte', 'd13', 9);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p154', 'Parroquia de San José', 'Almoloya de Juárez', 'd14', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p155', 'Parroquia de La Inmaculada Concepción', 'Mayorazgo de León', 'd14', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p156', 'Parroquia de San Miguel', 'San Miguel Almoloyán', 'd14', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p157', 'Parroquia de San Nicolás Tolentino', 'San Nicolás Amealco, Almoloya de Juárez', 'd14', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p158', 'Parroquia de San Juan María Vianney', 'Cieneguillas, Almoloya de Juárez', 'd14', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p159', 'Parroquia del Señor de los Milagros', 'Villa Victoria', 'd14', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p160', 'Parroquia de Nuestra Señora de la Merced', 'Villa Victoria', 'd14', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p161', 'Parroquia de El Señor de la Preciosa Sangre', 'Ayala, Villa Victoria', 'd14', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p162', 'Parroquia de Nuestra Señora de Guadalupe', 'Yebucivi, Almoloya de Juárez', 'd14', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p163', 'Parroquia de San Jerónimo', 'Amanalco de Becerra', 'd15', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p164', 'Parroquia de La Asunción de María', 'Pipioltepec, Valle de Bravo', 'd15', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p165', 'Parroquia de San Francisco de Asís', 'Valle de Bravo', 'd15', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p166', 'Santuario del Cristo Negro', 'Santa María Ahuacatlán, Valle de Bravo', 'd15', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p167', 'Parroquia de Nuestra Señora de Fátima', 'Avandaro', 'd15', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p168', 'Parroquia del Sagrado Corazón de Jesús', 'Colorines, Valle de Bravo', 'd15', 5);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p169', 'Parroquia de Santo Tomás Apóstol', 'Nuevo Santo Tomás de los Plátanos', 'd15', 6);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p170', 'Parroquia de San Miguel Arcángel', 'Ixtapan del Oro', 'd15', 7);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p171', 'Parroquia de La Asunción de María', 'Malacatepec, Donato Guerra', 'd15', 8);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p172', 'Parroquia de San José', 'Villa de Allende', 'd15', 9);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p173', 'Parroquia de La Sagrada Familia', 'Comunidad, Temascaltepec', 'd16', 0);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p174', 'Parroquia de San Martín Obispo de Tours', 'Tequesquipan, Temascaltepec', 'd16', 1);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p175', 'Parroquia de Santos Simón y Judas Tadeo, Apóstoles', 'San Simón de Guerrero', 'd16', 2);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p176', 'Parroquia de El Señor del Perdón y Nuestra Señora de la Consolación', 'Temascaltepec', 'd16', 3);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p177', 'Parroquia de San Pedro Apóstol', 'Tenayac, Temascaltepec', 'd16', 4);
INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order) VALUES ('p178', 'Parroquia de La Inmaculada Concepción', 'Cerro Colorado, Valle de Bravo', 'd16', 5);
