// Odds Pulse utility functions for managing configuration and local storage

export interface OddsPulseConfig {
  enabled: boolean;
  pollingInterval: number; // in seconds
}

const DEFAULT_CONFIG: OddsPulseConfig = {
  enabled: false,
  pollingInterval: 60,
};

const CONFIG_KEY = 'ODDS_PULSE_CONFIG';

/**
 * Gets the current Odds Pulse configuration from localStorage
 */
export const getOddsPulseConfig = (): OddsPulseConfig => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate the config structure
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_CONFIG.enabled,
        pollingInterval: typeof parsed.pollingInterval === 'number' && parsed.pollingInterval > 0 
          ? parsed.pollingInterval 
          : DEFAULT_CONFIG.pollingInterval,
      };
    }
  } catch (error) {
    console.warn('Failed to load Odds Pulse config from localStorage:', error);
  }
  
  return { ...DEFAULT_CONFIG };
};

/**
 * Sets the Odds Pulse configuration in localStorage
 */
export const setOddsPulseConfig = (config: OddsPulseConfig): void => {
  try {
    // Validate config before saving
    const validConfig: OddsPulseConfig = {
      enabled: Boolean(config.enabled),
      pollingInterval: Math.max(10, Math.min(600, config.pollingInterval || 60)), // Clamp between 10-600 seconds
    };
    
    localStorage.setItem(CONFIG_KEY, JSON.stringify(validConfig));
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('oddsPulseConfigChanged', { 
      detail: validConfig 
    }));
  } catch (error) {
    console.error('Failed to save Odds Pulse config to localStorage:', error);
    throw error;
  }
};

/**
 * Resets the configuration to default values
 */
export const resetOddsPulseConfig = (): void => {
  setOddsPulseConfig({ ...DEFAULT_CONFIG });
};

/**
 * Validates if Odds Pulse is enabled and properly configured
 */
export const isOddsPulseEnabled = (): boolean => {
  const config = getOddsPulseConfig();
  return config.enabled && config.pollingInterval > 0;
};

/**
 * Gets the effective polling interval, with fallback to default
 */
export const getPollingInterval = (): number => {
  const config = getOddsPulseConfig();
  return Math.max(10, config.pollingInterval || DEFAULT_CONFIG.pollingInterval);
};