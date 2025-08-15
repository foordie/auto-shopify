/**
 * Environment detection utilities for the Shopify Automation Platform
 *
 * This module provides utilities to detect the current deployment environment
 * and conditionally render content based on production, staging, or development modes.
 */

export const ENVIRONMENTS = {
  PRODUCTION: 'production',
  STAGING: 'staging',
  DEVELOPMENT: 'development',
} as const;

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

/**
 * Get the current environment from environment variables
 */
export function getCurrentEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase();

  switch (env) {
    case ENVIRONMENTS.PRODUCTION:
      return ENVIRONMENTS.PRODUCTION;
    case ENVIRONMENTS.STAGING:
      return ENVIRONMENTS.STAGING;
    case ENVIRONMENTS.DEVELOPMENT:
      return ENVIRONMENTS.DEVELOPMENT;
    default:
      // Default to development for local development
      return ENVIRONMENTS.DEVELOPMENT;
  }
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION;
}

/**
 * Check if we're in staging environment
 */
export function isStaging(): boolean {
  return getCurrentEnvironment() === ENVIRONMENTS.STAGING;
}

/**
 * Check if we're in development environment
 */
export function isDevelopment(): boolean {
  return getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT;
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const env = getCurrentEnvironment();

  return {
    environment: env,
    isProduction: env === ENVIRONMENTS.PRODUCTION,
    isStaging: env === ENVIRONMENTS.STAGING,
    isDevelopment: env === ENVIRONMENTS.DEVELOPMENT,
    showFullSite: env !== ENVIRONMENTS.PRODUCTION,
    showHoldingPage: env === ENVIRONMENTS.PRODUCTION,
    enableAnalytics: env === ENVIRONMENTS.PRODUCTION,
    enableDebugMode: env === ENVIRONMENTS.DEVELOPMENT,
    apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  };
}
