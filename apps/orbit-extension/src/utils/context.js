/**
 * Orbit Extension - Context Utilities
 */

import { STORAGE_KEYS } from '../config/constants';

/**
 * Get current context snapshot for the browser
 */
export function getCurrentContext() {
    const now = new Date();

    // Detect device type
    const ua = navigator.userAgent.toLowerCase();
    let device = 'desktop';
    if (/mobile|android|iphone|ipad/.test(ua)) {
        device = /ipad|tablet/.test(ua) ? 'tablet' : 'mobile';
    }

    // Place defaults to unknown - user can set manually
    const place = localStorage.getItem(STORAGE_KEYS.CONTEXT) || 'unknown';

    return {
        now: now.toISOString(),
        hour: now.getHours(),
        day: now.getDay(),
        device,
        place,
        sessionId: sessionStorage.getItem('orbit_session') || createSessionId(),
    };
}

function createSessionId() {
    const id = crypto.randomUUID();
    sessionStorage.setItem('orbit_session', id);
    return id;
}
