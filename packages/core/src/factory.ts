/**
 * Orbit Engine - Factory Helpers
 */

import { OrbitItem, OrbitContext } from './types';
import { ITEM_DEFAULTS } from './config';

/**
 * Create a new orbit item
 */
export function createItem(title: string, detail = '', url = ''): OrbitItem {
    return {
        id: crypto.randomUUID(),
        title,
        detail,
        url,
        signals: {
            createdAt: new Date().toISOString(),
            lastSeenAt: null,
            seenCount: 0,
            openedCount: 0,
            dismissedCount: 0,
            hourHistogram: {},
            dayHistogram: {},
            placeHistogram: {},
            deviceHistogram: {},
            ignoredStreak: 0,
            isPinned: false,
            pinUntil: null,
        },
        computed: {
            score: 0.5,
            distance: 0.5,
            reasons: [],
        },
    };
}

/**
 * Create a context snapshot
 * Note: Browser-specific detection should happen in the consumer 
 * or via a provided detector.
 */
export function createContext(params: Partial<OrbitContext> = {}): OrbitContext {
    const now = new Date();
    return {
        now: now.toISOString(),
        hour: now.getHours(),
        day: now.getDay(),
        device: 'desktop',
        place: 'unknown',
        sessionId: crypto.randomUUID(),
        ...params
    };
}
