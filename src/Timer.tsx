import { Action, ActionData } from './ActionData';
import Gauge from './Gauge';

/**
 * A timer of an FFXIV job.
 */
export default class Timer extends Gauge {
  /**
   *
   * @param duration The initial duration of the timer. Timers with duration zero are inactive.
   * @param max The maximum duration of the timer.
   * @param expire The action to perform when the timer expires.
   * @param tick The action to perform when a server tick occurs.
   */
  constructor(duration: number = 0, max?: number, public expire?: Action, tick?: Action) {
    super(duration, 0, max, tick);
  }

  /**
   * Sets the current duration of the timer.
   * @param duration The duration to try set the timer.
   * @param context The action causing the change in duration.
   */
  set(duration: number, context?: ActionData): void {
    super.set(duration, context);
  }

  /**
   *
   * @returns True if the timer duration is nonzero.
   */
  isActive(): boolean {
    return this.value > 0;
  }

  /**
   * Sets the timer to its maximum value.
   * @param context The action causing the timer to reset.
   */
  reset(context?: ActionData): void {
    this.set(this.max!, context);
  }
}
