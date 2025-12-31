/**
 * Histogram Utilities
 */

import { Histogram } from '../types';

const DECAY_FACTOR = 0.95; // 5% decay per day for EMA

/**
 * Add an observation to a histogram
 */
export function addToHistogram(
    histogram: Histogram,
    key: string | number,
    amount = 1
): Histogram {
    return {
        ...histogram,
        [key]: (histogram[key] || 0) + amount,
    };
}

/**
 * Get the total count in a histogram
 */
export function getHistogramTotal(histogram: Histogram): number {
    return Object.values(histogram).reduce((sum, val) => sum + val, 0);
}

/**
 * Normalize histogram values to probabilities (0-1)
 */
export function normalizeHistogram(histogram: Histogram): Histogram {
    const total = getHistogramTotal(histogram);
    if (total === 0) return histogram;

    const normalized: Histogram = {};
    for (const [key, value] of Object.entries(histogram)) {
        normalized[key] = value / total;
    }
    return normalized;
}

/**
 * Apply exponential decay to histogram values
 */
export function decayHistogram(
    histogram: Histogram,
    factor = DECAY_FACTOR
): Histogram {
    const decayed: Histogram = {};
    for (const [key, value] of Object.entries(histogram)) {
        const newValue = value * factor;
        // Only keep values above a threshold
        if (newValue >= 0.01) {
            decayed[key] = newValue;
        }
    }
    return decayed;
}

/**
 * Merge two histograms, summing values
 */
export function mergeHistograms(a: Histogram, b: Histogram): Histogram {
    const merged = { ...a };
    for (const [key, value] of Object.entries(b)) {
        merged[key] = (merged[key] || 0) + value;
    }
    return merged;
}

/**
 * Compress a histogram using exponential moving average
 */
export function compressHistogram(
    histogram: Histogram,
    newObservation: string | number | null = null
): Histogram {
    // Apply decay first
    let compressed = decayHistogram(histogram);

    // Add new observation if provided
    if (newObservation !== null) {
        compressed = addToHistogram(compressed, newObservation, 1);
    }

    // Round values to 2 decimal places to save space
    const rounded: Histogram = {};
    for (const [key, value] of Object.entries(compressed)) {
        rounded[key] = Math.round(value * 100) / 100;
    }

    return rounded;
}

/**
 * Get the peak (most common) key in a histogram
 */
export function getHistogramPeak(histogram: Histogram): string | number | null {
    let maxKey: string | number | null = null;
    let maxValue = 0;

    for (const [key, value] of Object.entries(histogram)) {
        if (value > maxValue) {
            maxValue = value;
            maxKey = key;
        }
    }

    return maxKey;
}

/**
 * Calculate affinity score for a given key
 */
export function calculateAffinity(histogram: Histogram, key: string | number): number {
    const count = histogram[key] || 0;
    const total = getHistogramTotal(histogram);
    return total > 0 ? count / total : 0;
}
