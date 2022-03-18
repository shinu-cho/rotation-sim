import { Warnings } from './Constants';
import { Action, ActionData } from './ActionData';

/**
 * A resource value of an FFXIV job.
 */
export default class Gauge {
  #value: number;

  /**
   *
   * @param value The initial value of the gauge.
   * @param min The minimum value of the gauge.
   * @param max The maximum value of the gauge.
   * @param tick The action to perform when a server tick occurs.
   */
  constructor(value: number = 0, public min?: number, public max?: number, public tick?: Action) {
    this.#value = 0;
    this.set(value);
  }

  /**
   * Sets the current value of the gauge.
   * @param value The value to try set the gauge.
   * @param context The action causing the change in value.
   */
  set(value: number, context?: ActionData): void {
    let setValue = value;
    if (this.max && value > this.max!) {
      setValue = this.max;
      if (context) context.warnings.push(Warnings.GAUGE_OVERCAP);
    }
    if (this.min && value > this.min!) {
      setValue = this.min;
      if (context) context.warnings.push(Warnings.GAUGE_UNDERCAP);
    }

    this.#value = setValue;
  }

  get value(): number {
    return this.#value;
  }

  /**
   * Increments the current value of the gauge.
   * @param delta The value change by which the gauge should be incremented.
   * @param context The action causing the change in value.
   */
  increment(delta: number, context?: ActionData): void {
    this.set(this.value + delta, context);
  }
}
