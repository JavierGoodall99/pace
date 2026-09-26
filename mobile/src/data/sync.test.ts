import { availableProviders, hasSync, isProvider, providerList } from './sync';

test('Apple Health is iPhone-only and Samsung Health Android-only', () => {
  expect(availableProviders('ios')).toEqual(['strava', 'garmin', 'apple']);
  expect(availableProviders('android')).toEqual(['strava', 'garmin', 'samsung']);
  expect(availableProviders('web')).toEqual(['strava', 'garmin', 'apple', 'samsung']);
});

test('providerList reads naturally', () => {
  expect(providerList('ios')).toBe('Strava, Garmin or Apple Health');
});

test('isProvider guards route params', () => {
  expect(isProvider('samsung')).toBe(true);
  expect(isProvider('fitbit')).toBe(false);
  expect(isProvider(undefined)).toBe(false);
});

test('hasSync is true once any provider is connected', () => {
  expect(hasSync({ connected: [] })).toBe(false);
  expect(hasSync({ connected: ['apple'] })).toBe(true);
});
