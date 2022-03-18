import Timer from './Timer';
import { ActionData } from './ActionData';

/**
 * A stacking cooldown timer of an FFXIV job.
 */
export default class StackingTimer extends Timer {
  #timePerStack: number;

  /**
   *
   * @param timePerStack The cooldown time per stack.
   * @param maxStacks The maximum number of stacks held by the timer.
   * @param initialStacks The initial number of stacks held by the timer.
   */
  constructor(
    timePerStack: number,
    public maxStacks: number = 1,
    initialStacks: number = maxStacks
  ) {
    super(timePerStack * (maxStacks - initialStacks), timePerStack * maxStacks);
    this.#timePerStack = timePerStack;
  }

  /**
   * Sets the current stack count of the cooldown.
   * @param count The number of stacks to try set.
   * @param context The action causing the cooldown to change.
   */
  setStacks(count: number, context?: ActionData) {
    this.set(this.timePerStack * (this.maxStacks - count), context);
  }

  get stacks() {
    return (this.max! - this.value) / this.timePerStack;
  }

  /**
   * Sets the cooldown length per stack.
   * @param timePerStack The cooldown length per stack.
   */
  setLength(timePerStack: number) {
    this.#timePerStack = timePerStack;
  }

  get timePerStack() {
    return this.#timePerStack;
  }

  /**
   * Consumes a number of stacks in the cooldown.
   * @param count The number of stacks to use.
   * @param context The action consuming the cooldown.
   */
  useStacks(count: number, context?: ActionData) {
    this.increment(this.timePerStack * count, context);
  }

  /**
   * Makes the cooldown fully available at max stacks.
   * @param context The action causing the cooldown to reset.
   */
  reset(context?: ActionData) {
    this.set(0, context);
  }

  /**
   *
   * @returns True if the cooldown has at least one stack available.
   */
  isReady(): boolean {
    return this.stacks >= 1;
  }
}
