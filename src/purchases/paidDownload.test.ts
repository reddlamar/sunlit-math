import { Platform } from 'react-native';
import { getAppTransactionIOS } from 'expo-iap';
import { isPaidDownloadBuild, hasPaidDownload } from './paidDownload';

const mockGetAppTransaction = getAppTransactionIOS as jest.Mock;

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

  beforeEach(() => {
    mockGetAppTransaction.mockReset();
    Platform.OS = 'ios';
  });

  afterAll(() => {
    Platform.OS = originalOS;
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
});
