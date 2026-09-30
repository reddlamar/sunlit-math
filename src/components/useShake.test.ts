import { Animated } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import { useShake } from './useShake';

describe('useShake', () => {
  it('starts at rest', async () => {
    const { result } = await renderHook(() => useShake());
    const [{ translateX }] = result.current.shakeStyle.transform;
    expect((translateX as unknown as { __getValue: () => number }).__getValue()).toBe(0);
  });

  it('wiggles right and left, then settles back at rest', async () => {
    const timing = jest.spyOn(Animated, 'timing');
    const { result } = await renderHook(() => useShake());

    await act(async () => {
      result.current.shake();
    });

    const targets = timing.mock.calls.map(([, config]) => (config as { toValue: number }).toValue);
    expect(targets).toEqual([1, -1, 1, -1, 0]);
    timing.mockRestore();
  });
});
