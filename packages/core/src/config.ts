/**
 * Orbit Configuration Constants
 */

export const SCORING_WEIGHTS = {
    TIME: 0.20,      // Hour-of-day pattern matching
    PLACE: 0.15,     // Location context (home/work)
    DEVICE: 0.10,    // Device type matching
    RECENCY: 0.25,   // How recently accessed
    FREQUENCY: 0.15, // How often accessed
    PINNED: 0.10,    // User pinned items
    NOVELTY: 0.05,   // Boost for new items
} as const;

export const ITEM_DEFAULTS = {
    MAX_VISIBLE: 5,           // Maximum items shown in orbit
    DECAY_DAYS: 7,            // Days until item fully decays
    QUIET_HOURS_DEFAULT: 4,   // Default quiet period in hours
    NOVELTY_HOURS: 24,        // Hours an item is considered "new"
    MAX_TITLE_LENGTH: 200,    // Maximum characters for item title
    MAX_ITEMS: 500,           // Maximum total items in orbit
};

export const DEFAULTS = {
    ...ITEM_DEFAULTS,
    MIN_SCORE: 0,
    MAX_SCORE: 1,
};

export const ITEM_STATES = {
    NEW: 'new',           // Just created, within novelty period
    ACTIVE: 'active',     // Normal state, being scored
    QUIETED: 'quieted',   // Temporarily suppressed
    DECAYING: 'decaying', // Score dropping due to inactivity
    ARCHIVED: 'archived', // Removed from active orbit
} as const;
