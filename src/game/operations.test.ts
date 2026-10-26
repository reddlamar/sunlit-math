import { OPERATIONS, operationInfo } from './operations';

describe('operations registry', () => {
  it('lists the four operations in menu order, addition first', () => {
    expect(OPERATIONS.map((entry) => entry.operation)).toEqual([
      'addition',
      'subtraction',
      'multiplication',
      'division',
    ]);
  });

  it('gives every operation a display symbol and label', () => {
    expect(OPERATIONS.map(({ symbol, label }) => [symbol, label])).toEqual([
      ['+', 'Addition'],
      ['−', 'Subtraction'],
      ['×', 'Multiplication'],
      ['÷', 'Division'],
    ]);
  });

  it('looks an operation up by name', () => {
    expect(operationInfo('division')).toEqual({
      operation: 'division',
      symbol: '÷',
      label: 'Division',
    });
  });
});
