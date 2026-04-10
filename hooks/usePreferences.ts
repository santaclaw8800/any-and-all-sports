'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPreferences, getPreferences, savePreferences } from '@/lib/preferences';

export function usePreferences() {
  const [preferences, setPreferencesState] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getPreferences();
    setPreferencesState(stored);
    setIsLoading(false);
  }, []);

  const setPreferences = useCallback((prefs: UserPreferences) => {
    savePreferences(prefs);
    setPreferencesState(prefs);
  }, []);

  const hasPreferences = preferences !== null &&
    (preferences.sports.length > 0 || preferences.teams.length > 0);

  return {
    preferences,
    setPreferences,
    hasPreferences,
    isLoading,
  };
}
