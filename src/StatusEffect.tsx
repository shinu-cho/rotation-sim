import Timer from './Timer';
import { Action, ActionMutator } from './ActionData';

/**
 * A status effect of an FFXIV job affecting action calculations.
 */
export default class StatusEffect extends Timer {
  /**
   *
   * @param alterData The effects of the status effect on actions during the calculation step.
   * @param duration The initial duration of the status effect.
   * @param max The maximum duration of the status effect.
   * @param expire The action to perform when the status effect expires.
   * @param tick The action to perform when a server tick occurs.
   */
  constructor(
    public alterData: ActionMutator,
    duration: number,
    max?: number,
    expire?: Action,
    tick?: Action
  ) {
    super(duration, max, expire, tick);
  }
}
