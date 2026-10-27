import { AccessibilityInfo } from 'react-native';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useReducedMotion } from './useReducedMotion';

describe('useReducedMotion', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('is off until the device says otherwise', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const { result } = await renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it('turns on when the device has reduce motion enabled', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const { result } = await renderHook(() => useReducedMotion());

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('follows the setting when it changes mid-game', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    let notify: (enabled: boolean) => void = () => {};
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((
      _event: string,
      handler: (enabled: boolean) => void
    ) => {
      notify = handler;
      return { remove: jest.fn() };
    }) as never);
    const { result } = await renderHook(() => useReducedMotion());

    await act(async () => notify(true));
    expect(result.current).toBe(true);

    await act(async () => notify(false));
    expect(result.current).toBe(false);
  });

  it('stops listening when it unmounts', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const remove = jest.fn();
    jest
      .spyOn(AccessibilityInfo, 'addEventListener')
      .mockReturnValue({ remove } as unknown as ReturnType<
        typeof AccessibilityInfo.addEventListener
      >);
    const { unmount } = await renderHook(() => useReducedMotion());

    await unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('ignores a device that cannot say, staying off', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockRejectedValue(new Error('no'));
    const { result } = await renderHook(() => useReducedMotion());

    await act(async () => {});
    expect(result.current).toBe(false);
  });
});
