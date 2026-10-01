import { fireEvent } from '@testing-library/react-native';

/** The gate's answer while `Math.random` is mocked to return 0 (see createGateChallenge). */
export const GATE_ANSWER_WHEN_RANDOM_IS_ZERO = '101';

type GateQueries = {
  getByTestId: (testID: string) => Parameters<typeof fireEvent.press>[0];
};

/** Passes the parental gate. Mock `Math.random` to return 0 before the gate renders. */
export async function passParentalGate({ getByTestId }: GateQueries) {
  await fireEvent.changeText(getByTestId('parental-gate-input'), GATE_ANSWER_WHEN_RANDOM_IS_ZERO);
  await fireEvent.press(getByTestId('parental-gate-submit'));
}
