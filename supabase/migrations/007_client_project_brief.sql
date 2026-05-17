-- Structured project discovery brief per client (AI + proposal scoping)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS project_brief JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_clients_project_brief ON clients USING gin (project_brief);
