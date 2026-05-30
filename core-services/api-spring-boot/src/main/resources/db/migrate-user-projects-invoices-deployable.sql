-- Fixes sidebar 500 (varchar vs uuid), invoices FK -> projects, user_projects UUID ids, is_deployable default.

-- 1) projects.is_deployable
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS is_deployable boolean NOT NULL DEFAULT true;

UPDATE projects SET is_deployable = true WHERE is_deployable IS DISTINCT FROM true;

-- 2) invoices: project_id must reference projects(id), not user_projects(id)
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS fkpntikrpokrkwcwypqa9pi8h5n;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS fk_invoice_project;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS fk_invoices_project;

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_uuid uuid;

UPDATE invoices i
SET project_uuid = up.project_id
FROM user_projects up
WHERE i.project_uuid IS NULL
  AND i.project_id = up.id;

ALTER TABLE invoices DROP COLUMN IF EXISTS project_id;
ALTER TABLE invoices RENAME COLUMN project_uuid TO project_id;
ALTER TABLE invoices ALTER COLUMN project_id SET NOT NULL;

ALTER TABLE invoices
    ADD CONSTRAINT fk_invoices_project
        FOREIGN KEY (project_id) REFERENCES projects (id);

-- 3) user_projects.user_id -> uuid
ALTER TABLE user_projects
    ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- 4) user_projects.id -> uuid
ALTER TABLE user_projects ADD COLUMN IF NOT EXISTS id_uuid uuid;

UPDATE user_projects
SET id_uuid = gen_random_uuid()
WHERE id_uuid IS NULL;

ALTER TABLE user_projects DROP CONSTRAINT IF EXISTS user_projects_pkey;
ALTER TABLE user_projects DROP COLUMN id;
ALTER TABLE user_projects RENAME COLUMN id_uuid TO id;
ALTER TABLE user_projects ADD PRIMARY KEY (id);
