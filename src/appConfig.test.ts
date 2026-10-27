/// <reference types="node" />
import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..');
const { expo } = require('../app.json');
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

describe('app config', () => {
  // With "light" here iOS reports a light appearance to the app however the phone is set,
  // so the Auto theme ("follow the phone") could never turn dark.
  it('lets the phone tell the app whether it is in dark mode', () => {
    expect(expo.userInterfaceStyle).toBe('automatic');
  });

  // On Android the same setting only takes effect when expo-system-ui is installed.
  it('has expo-system-ui installed so that setting works on Android', () => {
    expect(packageJson.dependencies['expo-system-ui']).toBeDefined();
  });

  it('does not pin either platform back to a fixed appearance', () => {
    expect(expo.ios?.userInterfaceStyle).toBeUndefined();
    expect(expo.android?.userInterfaceStyle).toBeUndefined();
  });
});
