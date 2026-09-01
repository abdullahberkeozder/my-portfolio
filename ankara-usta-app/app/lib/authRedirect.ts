import type { UserRole } from '../domain/models';

export const roleLandingPages: Record<UserRole, string> = {
  customer: '/taleplerim',
  tradesperson: '/usta/talepler',
  moderator: '/yonetim/moderasyon',
  admin: '/yonetim/uyusmazliklar',
};

export const roleAllowedRoutePrefixes: Record<UserRole, string[]> = {
  customer: ['/taleplerim', '/islerim', '/uyusmazliklar'],
  tradesperson: ['/usta', '/islerim', '/uyusmazliklar'],
  moderator: ['/yonetim', '/uyusmazliklar'],
  admin: ['/yonetim', '/usta', '/taleplerim', '/islerim', '/uyusmazliklar'],
};

/**
 * Validates and sanitizes a redirect path to prevent Open Redirect vulnerabilities.
 * Disallows absolute URLs, protocol-relative slashes, backslashes, control chars, and data URIs.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();

  // Must start with exactly one forward slash, no protocol, no backslashes
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    trimmed.startsWith('/\\') ||
    /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) // No scheme like javascript:, data:, http:
  ) {
    return null;
  }

  // Prevent newline injection or control characters
  if (/[\r\n\t\0]/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Determines whether a user with given roles has permission to access a target path.
 */
export function isPathAllowedForRoles(roles: UserRole[], targetPath: string): boolean {
  if (!targetPath.startsWith('/')) return false;
  
  // Public routes always allowed
  const publicPrefixes = ['/giris', '/parola-yenile', '/auth', '/yardim', '/nasil-calisir', '/usta-basvurusu', '/gizlilik', '/kullanim-kosullari'];
  if (targetPath === '/' || publicPrefixes.some(prefix => targetPath.startsWith(prefix))) {
    return true;
  }

  return roles.some(role => {
    const prefixes = roleAllowedRoutePrefixes[role] || [];
    return prefixes.some(prefix => targetPath.startsWith(prefix));
  });
}

/**
 * Returns the best landing path for a user based on their roles and an optional safe requested path.
 */
export function landingPathForRoles(roles: string[], requestedPath?: string | null): string {
  const safeRequested = safeNextPath(requestedPath);
  const typedRoles = (roles as UserRole[]).filter(r => Boolean(roleLandingPages[r]));
  
  if (safeRequested && isPathAllowedForRoles(typedRoles, safeRequested)) {
    return safeRequested;
  }

  const priority: UserRole[] = ['admin', 'moderator', 'tradesperson', 'customer'];
  const primaryRole = priority.find(candidate => typedRoles.includes(candidate)) ?? 'customer';
  return roleLandingPages[primaryRole];
}

