-- Run once if checkout webhooks overwrote project_type with billing plan names.
-- Moves billing values into billing_plan and restores site template type for site-engine.

UPDATE projects
SET billing_plan = project_type
WHERE project_type IN ('SUBSCRIPTION', 'THREE_MONTHS', 'ONE_MONTH')
  AND (billing_plan IS NULL OR billing_plan = '');

UPDATE projects
SET project_type = 'SHOWCASE'
WHERE project_type IN ('SUBSCRIPTION', 'THREE_MONTHS', 'ONE_MONTH');
