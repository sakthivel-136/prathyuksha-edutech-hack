-- Migration to add is_published to student_results
ALTER TABLE student_results ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
