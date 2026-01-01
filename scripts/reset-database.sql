-- Reset Database Script
-- This script cleans all data from the database to start fresh
-- Run this in Supabase SQL Editor

-- Disable foreign key checks temporarily (if needed)
SET session_replication_role = 'replica';

-- Clean usage and cost data
TRUNCATE TABLE usage_records CASCADE;

-- Clean provider connections
DELETE FROM provider_connections;

-- Clean alerts
DELETE FROM alert_events;
DELETE FROM alert_rules;

-- Clean budgets
DELETE FROM budget_adjustments;
DELETE FROM budget_periods;
DELETE FROM budget_thresholds;
DELETE FROM budgets;

-- Clean optimization recommendations
DELETE FROM optimization_recommendations;

-- Clean cost center allocations
DELETE FROM cost_center_allocations;

-- Clean project teams
DELETE FROM project_teams;

-- Clean team members
DELETE FROM team_members;

-- Clean projects
DELETE FROM projects;

-- Clean teams
DELETE FROM teams;

-- Clean cost centers
DELETE FROM cost_centers;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Verify cleanup
SELECT 'usage_records' as table_name, COUNT(*) as count FROM usage_records
UNION ALL
SELECT 'provider_connections', COUNT(*) FROM provider_connections
UNION ALL
SELECT 'alert_rules', COUNT(*) FROM alert_rules
UNION ALL
SELECT 'budgets', COUNT(*) FROM budgets
UNION ALL
SELECT 'teams', COUNT(*) FROM teams
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'cost_centers', COUNT(*) FROM cost_centers;
