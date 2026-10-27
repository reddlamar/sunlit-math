import { useCallback, useEffect, useRef, useState } from 'react';
import { AVATARS, avatarForName, avatarInfo } from '../game/avatars';
import {
  addScore,
  getLastPlayerName,
  getTopScores,
  setLastPlayerName,
  setScoreAvatar,
} from '../storage/scoresRepository';
import { createId } from '../utils/random';
import type { AvatarId, Difficulty, Operation, ScoreEntry } from '../types/game';

/** How many players the result screen lists beside the player's own score. */
const TOP_PLAYERS_SHOWN = 5;
const DEFAULT_AVATAR: AvatarId = AVATARS[0].id;

export type RoundResultStatus = 'idle' | 'saving' | 'saved' | 'failed';

type RoundResultInput = {
  /** True from the moment the round ends until the player starts another. */
  isOver: boolean;
  score: number;
  operation: Operation;
  difficulty: Difficulty;
};

export type RoundResult = {
  status: RoundResultStatus;
  /** False for the instant before the player's previous best has been looked up. */
  isReady: boolean;
  /** Their best on this operation and level before this round; null if they had none. */
  previousBest: number | null;
  avatar: AvatarId;
  topScores: ScoreEntry[];
  chooseAvatar: (id: AvatarId) => void;
  retry: () => void;
};

/**
 * What happens when a round ends: look up the player's previous best, save the score at
 * once under the animal they used last (so a force-quit can't lose it), and let them pick
 * a different animal afterwards, which updates the saved score.
 */
export function useRoundResult({
  isOver,
  score,
  operation,
  difficulty,
}: RoundResultInput): RoundResult {
  const [status, setStatus] = useState<RoundResultStatus>('idle');
  const [previousBest, setPreviousBest] = useState<number | null | undefined>(undefined);
  const [avatar, setAvatar] = useState<AvatarId>(DEFAULT_AVATAR);
  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);
  const [attempt, setAttempt] = useState(0);

  const roundRef = useRef({ score, operation, difficulty });
  // What the player picked this round, if anything; wins over the remembered animal.
  const chosenRef = useRef<AvatarId | null>(null);
  // The score as saved, once it is.
  const savedRef = useRef<ScoreEntry | null>(null);
  useEffect(() => {
    roundRef.current = { score, operation, difficulty };
  }, [score, operation, difficulty]);

  // When a new round begins, the last round's result goes. This adjusts state during
  // render, which React allows, so the old result never shows for a frame.
  const [wasOver, setWasOver] = useState(isOver);
  if (isOver !== wasOver) {
    setWasOver(isOver);
    if (!isOver) {
      setStatus('idle');
      setPreviousBest(undefined);
      setTopScores([]);
    }
  }

  useEffect(() => {
    if (!isOver) {
      chosenRef.current = null;
      savedRef.current = null;
      return;
    }

    let isCancelled = false;
    (async () => {
      setStatus('saving');
      try {
        const round = roundRef.current;
        const [best] = await getTopScores(1, round.operation, round.difficulty);
        const previous = best ? best.score : null;
        const remembered = avatarForName(await getLastPlayerName());
        const firstChoice = chosenRef.current ?? remembered?.id ?? DEFAULT_AVATAR;
        if (isCancelled) {
          return;
        }
        setPreviousBest(previous);
        setAvatar(firstChoice);

        const entry: ScoreEntry = {
          id: createId(),
          name: avatarInfo(firstChoice).name,
          avatar: firstChoice,
          score: round.score,
          operation: round.operation,
          difficulty: round.difficulty,
          createdAt: Date.now(),
        };
        await addScore(entry);
        if (isCancelled) {
          return;
        }
        savedRef.current = entry;

        // The player may have picked another animal while the score was being written.
        const chosen = chosenRef.current ?? firstChoice;
        if (chosen !== firstChoice) {
          const name = avatarInfo(chosen).name;
          await setScoreAvatar(entry.id, chosen, name);
          savedRef.current = { ...entry, avatar: chosen, name };
        }
        await setLastPlayerName(avatarInfo(chosen).name);
        const top = await getTopScores(TOP_PLAYERS_SHOWN);
        if (!isCancelled) {
          setTopScores(top);
          setStatus('saved');
        }
      } catch {
        if (!isCancelled) {
          // Show the result anyway, with the failure on it, even if nothing was looked up.
          setPreviousBest((known) => (known === undefined ? null : known));
          setStatus('failed');
        }
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [isOver, attempt]);

  const chooseAvatar = useCallback((id: AvatarId) => {
    chosenRef.current = id;
    setAvatar(id);
    const saved = savedRef.current;
    if (!saved || saved.avatar === id) {
      return;
    }
    const { name } = avatarInfo(id);
    (async () => {
      try {
        await setScoreAvatar(saved.id, id, name);
        savedRef.current = { ...saved, avatar: id, name };
        await setLastPlayerName(name);
        setTopScores(await getTopScores(TOP_PLAYERS_SHOWN));
      } catch {
        // The picture is cosmetic: put the picker back on the animal the score still has.
        chosenRef.current = saved.avatar ?? null;
        setAvatar(saved.avatar ?? DEFAULT_AVATAR);
      }
    })();
  }, []);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return {
    status,
    isReady: previousBest !== undefined,
    previousBest: previousBest ?? null,
    avatar,
    topScores,
    chooseAvatar,
    retry,
  };
}
