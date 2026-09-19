-- Add the onboarding state used by the authenticated product flow.
ALTER TABLE profiles ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 0;
