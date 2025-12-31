
export const DESIGN_TOKENS = {
    colors: {
        aurora: {
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
        },
        nebula: {
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
        },
        space: {
            50: '#f8f9fa',
            100: '#f1f3f5',
            200: '#e9ecef',
            800: '#343a40',
            900: '#212529',
            950: '#1a1d20',
        }
    },
    fonts: {
        display: ['Oswald', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
    }
};

export type Theme = 'dark' | 'light';

export * from './BrandIcon';
