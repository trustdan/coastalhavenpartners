-- Add 'professional' to education_level enum for JD, MD, and other professional degrees
ALTER TYPE education_level ADD VALUE IF NOT EXISTS 'professional';
