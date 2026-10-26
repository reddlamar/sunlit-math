import type { Operation } from '../types/game';

export type OperationInfo = {
  operation: Operation;
  symbol: string;
  label: string;
};

/** Every operation in the order the Home screen and Leaderboard filters show them. */
export const OPERATIONS: readonly OperationInfo[] = [
  { operation: 'addition', symbol: '+', label: 'Addition' },
  { operation: 'subtraction', symbol: '−', label: 'Subtraction' },
  { operation: 'multiplication', symbol: '×', label: 'Multiplication' },
  { operation: 'division', symbol: '÷', label: 'Division' },
];

export function operationInfo(operation: Operation): OperationInfo {
  return OPERATIONS.find((entry) => entry.operation === operation)!;
}
