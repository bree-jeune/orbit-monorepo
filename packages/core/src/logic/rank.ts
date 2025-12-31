/**
 * Orbit Engine - Ranking & Interaction logic
 */

import { computeRelevance, scoreToDistance } from './score';
import { OrbitItem, OrbitContext, InteractionType } from '../types';
import { ITEM_DEFAULTS } from '../config';

/**
 * Rank all items and return visible set
 */
export function rankItems(
    items: OrbitItem[],
    context: OrbitContext,
    maxVisible = ITEM_DEFAULTS.MAX_VISIBLE
): { all: OrbitItem[]; visible: OrbitItem[] } {
    // Score each item
    const scored = items.map((item) => {
        const { score, reasons } = computeRelevance(item, context);
        return {
            ...item,
            computed: {
                score,
                distance: scoreToDistance(score),
                reasons,
                updatedAt: context.now,
            },
        };
    });

    // Sort by score descending (highest relevance first)
    scored.sort((a, b) => b.computed.score - a.computed.score);

    // Slice visible set
    const visible = scored.slice(0, maxVisible);

    return {
        all: scored,
        visible,
    };
}

/**
 * Record an interaction with an item
 * Updates histograms and counters for learning
 */
export function recordInteraction(
    item: OrbitItem,
    action: InteractionType,
    context: OrbitContext
): OrbitItem {
    const now = new Date(context.now);
    const signals = { ...item.signals };

    // Update counters
    if (action === 'seen') {
        signals.seenCount = (signals.seenCount || 0) + 1;
        signals.lastSeenAt = context.now;
        signals.ignoredStreak = 0; // Reset ignored streak
    } else if (action === 'opened') {
        signals.openedCount = (signals.openedCount || 0) + 1;
        signals.lastSeenAt = context.now;
        signals.ignoredStreak = 0;
    } else if (action === 'dismissed') {
        signals.dismissedCount = (signals.dismissedCount || 0) + 1;
        signals.ignoredStreak = (signals.ignoredStreak || 0) + 1;
    }

    // Update time histograms
    const hour = now.getHours();
    const day = now.getDay();
    signals.hourHistogram = signals.hourHistogram || {};
    signals.dayHistogram = signals.dayHistogram || {};
    signals.hourHistogram[hour] = (signals.hourHistogram[hour] || 0) + 1;
    signals.dayHistogram[day] = (signals.dayHistogram[day] || 0) + 1;

    // Update place histogram
    signals.placeHistogram = signals.placeHistogram || {};
    signals.placeHistogram[context.place] =
        (signals.placeHistogram[context.place] || 0) + 1;

    // Update device histogram
    signals.deviceHistogram = signals.deviceHistogram || {};
    signals.deviceHistogram[context.device] =
        (signals.deviceHistogram[context.device] || 0) + 1;

    return {
        ...item,
        signals,
    };
}

/**
 * Pin an item (keeps it visible regardless of decay)
 */
export function pinItem(item: OrbitItem, until: string | null = null): OrbitItem {
    return {
        ...item,
        signals: {
            ...item.signals,
            isPinned: true,
            pinUntil: until,
        },
    };
}

/**
 * Unpin an item
 */
export function unpinItem(item: OrbitItem): OrbitItem {
    return {
        ...item,
        signals: {
            ...item.signals,
            isPinned: false,
            pinUntil: null,
        },
    };
}

/**
 * "Quiet for now" - temporary distance increase
 */
export function quietItem(item: OrbitItem, hours: number, context: OrbitContext): OrbitItem {
    const quietUntil = new Date(
        new Date(context.now).getTime() + hours * 60 * 60 * 1000
    ).toISOString();

    return {
        ...item,
        signals: {
            ...item.signals,
            quietUntil,
            dismissedCount: (item.signals.dismissedCount || 0) + 1,
        },
    };
}
