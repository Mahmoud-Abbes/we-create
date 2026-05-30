-- Run manually when migrating an existing dev DB after the entity changes.
-- Prefer a fresh database if you can; type/PK changes are awkward with existing rows.

-- 1) user_projects.user_id: varchar/text -> uuid
ALTER TABLE user_projects
    ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- 2) user_projects.id: bigint identity -> uuid (only if you need to keep rows)
--    Safer on dev: truncate link table and let Hibernate recreate, or drop/recreate user_projects.
-- ALTER TABLE user_projects ADD COLUMN id_uuid uuid DEFAULT gen_random_uuid();
-- UPDATE user_projects SET id_uuid = gen_random_uuid() WHERE id_uuid IS NULL;
-- ALTER TABLE user_projects DROP CONSTRAINT user_projects_pkey CASCADE;
-- ALTER TABLE user_projects DROP COLUMN id;
-- ALTER TABLE user_projects RENAME COLUMN id_uuid TO id;
-- ALTER TABLE user_projects ADD PRIMARY KEY (id);

-- 3) invoices.project_id: must reference projects(id), not user_projects(id)
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS fk_invoice_project;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS fk_invoices_project;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_project_id_fkey;

-- If project_id still stores user_projects.id, backfill from the link table first:
-- UPDATE invoices i
-- SET project_id = up.project_id
-- FROM user_projects up
-- WHERE i.project_id = up.id;

ALTER TABLE invoices
    ADD CONSTRAINT fk_invoices_project
        FOREIGN KEY (project_id) REFERENCES projects (id);
