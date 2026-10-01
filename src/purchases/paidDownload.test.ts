import { Platform } from 'react-native';
import { getAppTransactionIOS } from 'expo-iap';
import { isPaidDownloadBuild, hasPaidDownload, FIRST_FREE_BUILD } from './paidDownload';

const mockGetAppTransaction = getAppTransactionIOS as jest.Mock;

// __DEV__ is a global const in React Native's types; tests flip it to cover release builds.
function setDev(value: boolean) {
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = value;
}

describe('isPaidDownloadBuild', () => {
  it('is true for builds older than the first free build', () => {
    expect(isPaidDownloadBuild('3', 10)).toBe(true);
    expect(isPaidDownloadBuild('9', 10)).toBe(true);
  });

  it('is false for the first free build and newer', () => {
    expect(isPaidDownloadBuild('10', 10)).toBe(false);
    expect(isPaidDownloadBuild('11', 10)).toBe(false);
  });

  it('compares numerically, not alphabetically', () => {
    expect(isPaidDownloadBuild('9', 10)).toBe(true);
    expect(isPaidDownloadBuild('100', 20)).toBe(false);
  });

  it('is false when the build is not a plain number (e.g. sandbox "1.0")', () => {
    expect(isPaidDownloadBuild('1.0', 10)).toBe(false);
    expect(isPaidDownloadBuild('', 10)).toBe(false);
  });

  it('fails closed when no first free build is configured', () => {
    expect(isPaidDownloadBuild('1', null)).toBe(false);
  });
});

describe('hasPaidDownload', () => {
  const originalOS = Platform.OS;
  const originalDev = __DEV__;

  beforeEach(() => {
    mockGetAppTransaction.mockReset();
    Platform.OS = 'ios';
    setDev(false);
  });

  afterAll(() => {
    Platform.OS = originalOS;
    setDev(originalDev);
  });

  it('is true when the original download was an older, paid build', async () => {
    mockGetAppTransaction.mockResolvedValue({ originalAppVersion: '3' });
    expect(await hasPaidDownload(10)).toBe(true);
  });

  it('is false when the original download was a free build', async () => {
    mockGetAppTransaction.mockResolvedValue({ originalAppVersion: '12' });
    expect(await hasPaidDownload(10)).toBe(false);
  });

  it('is false when no app transaction is available', async () => {
    mockGetAppTransaction.mockResolvedValue(null);
    expect(await hasPaidDownload(10)).toBe(false);
  });

  it('is false when the store lookup throws (e.g. iOS < 16)', async () => {
    mockGetAppTransaction.mockRejectedValue(new Error('unsupported'));
    expect(await hasPaidDownload(10)).toBe(false);
  });

  it('is false on non-iOS platforms without calling the store', async () => {
    Platform.OS = 'android';
    expect(await hasPaidDownload(10)).toBe(false);
    expect(mockGetAppTransaction).not.toHaveBeenCalled();
  });

  it('is false in development builds without calling the store (which would prompt for sign-in)', async () => {
    setDev(true);
    mockGetAppTransaction.mockResolvedValue({ originalAppVersion: '3' });
    expect(await hasPaidDownload(10)).toBe(false);
    expect(mockGetAppTransaction).not.toHaveBeenCalled();
  });
});

describe('production cutoff', () => {
  const originalDev = __DEV__;

  beforeEach(() => {
    Platform.OS = 'ios';
    setDev(false);
  });

  afterAll(() => {
    setDev(originalDev);
  });

  it('treats build 6 as the first free build', () => {
    expect(FIRST_FREE_BUILD).toBe(6);
  });

  it('grandfathers builds 3-5 (paid or live at the price change) but not 6+', async () => {
    for (const [build, expected] of [['3', true], ['4', true], ['5', true], ['6', false], ['7', false]] as const) {
      mockGetAppTransaction.mockResolvedValue({ originalAppVersion: build });
      expect(await hasPaidDownload()).toBe(expected);
    }
  });
});
