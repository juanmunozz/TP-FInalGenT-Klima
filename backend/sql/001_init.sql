CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT,
  zone TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS service_types (
  id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, description TEXT NOT NULL,
  suggested_duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (suggested_duration_minutes > 0),
  active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS service_requests (
  id BIGSERIAL PRIMARY KEY, customer_id BIGINT NOT NULL REFERENCES customers(id),
  service_type_id BIGINT NOT NULL REFERENCES service_types(id), description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK(status IN ('PENDIENTE','CONTACTADO','ACEPTADO','CANCELADO')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY, request_id BIGINT NOT NULL REFERENCES service_requests(id),
  resource_name TEXT NOT NULL DEFAULT 'KLIMA', starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK(duration_minutes > 0),
  status TEXT NOT NULL DEFAULT 'CONFIRMADA' CHECK(status IN ('CONFIRMADA','COMPLETADA','CANCELADA')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS appointments_resource_start_idx ON appointments(resource_name, starts_at);
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY, appointment_id BIGINT UNIQUE NOT NULL REFERENCES appointments(id),
  outcome TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', total_amount_ars BIGINT NOT NULL DEFAULT 0 CHECK(total_amount_ars >= 0),
  visit_charge_ars BIGINT NOT NULL DEFAULT 0 CHECK(visit_charge_ars >= 0),
  visit_charge_discounted BOOLEAN NOT NULL DEFAULT FALSE, finished_at TIMESTAMPTZ
);
INSERT INTO service_types(name,description,suggested_duration_minutes) VALUES
('Limpieza y sanitización','Limpieza de filtros y componentes del equipo.',90),
('Mantenimiento','Revisión preventiva del funcionamiento.',90),
('Instalación','Instalación de equipo de aire acondicionado.',180),
('Desinstalación','Retiro del equipo.',90),
('Reparación','Revisión y reparación según diagnóstico.',120)
ON CONFLICT(name) DO NOTHING;
