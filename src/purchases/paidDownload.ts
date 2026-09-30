import { Platform } from 'react-native';
import { getAppTransactionIOS } from 'expo-iap';

/**
 * iOS build number (CFBundleVersion) of the first release that was free to download.
 * Users whose original download is an earlier build paid for the app, so they keep
 * every operation unlocked. Set this to the build number that shipped after the App
 * Store price changed to free. Build 6 is the first release after the price changed to free (while build 5 was live).
 */
export const FIRST_FREE_BUILD: number | null = 6;

export function isPaidDownloadBuild(originalAppVersion: string, firstFreeBuild: number | null): boolean {
  if (firstFreeBuild === null || !/^\d+$/.test(originalAppVersion)) {
    return false;
  }
  return Number(originalAppVersion) < firstFreeBuild;
}

export async function hasPaidDownload(firstFreeBuild: number | null = FIRST_FREE_BUILD): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }
  try {
    const transaction = await getAppTransactionIOS();
    return transaction ? isPaidDownloadBuild(transaction.originalAppVersion, firstFreeBuild) : false;
  } catch {
    return false;
  }
}
