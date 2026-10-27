import { tabBarPosition } from './tabBarOptions';

describe('tabBarPosition', () => {
  it('keeps the tab bar at the bottom of a phone on both platforms', () => {
    expect(tabBarPosition('compact', 'ios')).toBe('bottom');
    expect(tabBarPosition('compact', 'android')).toBe('bottom');
  });

  it('uses a rail on a medium window on Android only', () => {
    expect(tabBarPosition('medium', 'android')).toBe('left');
    expect(tabBarPosition('medium', 'ios')).toBe('bottom');
  });

  it('uses a rail on an expanded window on both platforms', () => {
    expect(tabBarPosition('expanded', 'ios')).toBe('left');
    expect(tabBarPosition('expanded', 'android')).toBe('left');
  });
});
