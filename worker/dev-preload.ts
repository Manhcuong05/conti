// Development-only fix to ensure worker routes load before Hono builds matcher
// This file is imported at the top of worker/index.ts to preload user routes
import { userRoutes } from './user-routes';
import type { Hono } from 'hono';
import type { Env } from './core-utils';

export function preloadUserRoutes(app: Hono<{ Bindings: Env }>) {
    // In dev mode, eagerly load user routes to avoid matcher lock
    if (import.meta.env?.DEV) {
        try {
            userRoutes(app);
            console.log('[DEV] User routes preloaded successfully');
        } catch (e) {
            console.error('[DEV] Failed to preload user routes:', e);
        }
    }
}
