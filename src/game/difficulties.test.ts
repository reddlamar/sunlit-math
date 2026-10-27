import { DIFFICULTY_LABELS } from './difficulties';
import { DIFFICULTIES } from '../types/game';

describe('DIFFICULTY_LABELS', () => {
  it('names every level, and nothing else', () => {
    expect(Object.keys(DIFFICULTY_LABELS).sort()).toEqual([...DIFFICULTIES].sort());
  });

  it('writes each name with a capital letter, for children to read', () => {
    expect(DIFFICULTY_LABELS).toEqual({ easy: 'Easy', medium: 'Medium', hard: 'Hard' });
  });
});
