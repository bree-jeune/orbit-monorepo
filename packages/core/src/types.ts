/**
 * Orbit Ecosystem - Shared Types
 */

export type DeviceType = 'desktop' | 'mobile' | 'tablet';
export type PlaceType = 'home' | 'work' | 'unknown' | string;
export type InteractionType = 'seen' | 'opened' | 'dismissed';
export type ItemState = 'new' | 'active' | 'quieted' | 'decaying' | 'archived';

export interface Histogram {
    [key: string]: number;
    [key: number]: number;
}

export interface OrbitContext {
    now: string;
    hour: number;
    day: number;
    device: DeviceType;
    place: PlaceType;
    sessionId: string;
}

export interface OrbitItemSignals {
    createdAt: string;
    lastSeenAt: string | null;
    seenCount: number;
    openedCount: number;
    dismissedCount: number;
    hourHistogram: Histogram;
    dayHistogram: Histogram;
    placeHistogram: Histogram;
    deviceHistogram: Histogram;
    ignoredStreak: number;
    isPinned: boolean;
    pinUntil: string | null;
    quietUntil?: string;
}

export interface OrbitItemComputed {
    score: number;
    distance: number;
    reasons: string[];
    updatedAt?: string;
}

export interface OrbitItem {
    id: string;
    title: string;
    detail?: string;
    url?: string;
    signals: OrbitItemSignals;
    computed: OrbitItemComputed;
}

export type NoiseType = 'white' | 'pink' | 'brown';

export interface ModeBlueprint {
    id: string;
    name: string;
    description: string;
    intent: string;
    constraints: {
        maxDuration?: number;
        forbiddenElements?: string[];
        requiredElements?: string[];
    };
    audioParams: {
        noiseType: NoiseType;
        noiseVolume: number;
        toneFrequency: number;
        toneVolume: number;
        is8D?: boolean;
        isLofi?: boolean;
    };
    metadata: {
        author: string;
        version: string;
        tags: string[];
    };
}
