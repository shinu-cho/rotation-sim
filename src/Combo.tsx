import { Constants, Warnings } from './Constants';
import { Action, ActionData } from './ActionData';
import Timer from './Timer';

/**
 * A combo timer of an FFXIV job managing a currently combo-ready action.
 */
export default class Combo extends Timer {
  #nextAction: Action;

  /**
   *
   * @param neutralAction The action that starts the combo.
   * @param expire The action to perform when the timer expires.
   */
  constructor(public neutralAction: Action, expire?: Action) {
    super(0, Constants.COMBO_DURATION, expire);
    this.#nextAction = neutralAction;
  }

  /**
   * Sets the next action of the combo.
   * @param nextAction The next action of the combo.
   * @param context The action causing the combo to change.
   */
  activate(nextAction: Action, context?: ActionData): void {
    if (context && this.#nextAction !== context.parent) {
      context.warnings.push(Warnings.COMBO_BROKEN);
    }

    if (nextAction === this.neutralAction) {
      this.reset(context);
    } else {
      super.reset(context);
      this.#nextAction = nextAction;
    }
  }

  /**
   * Resets the combo to the neutral combo action.
   * @param context
   */
  reset(context?: ActionData): void {
    super.set(0, context);
    this.#nextAction = this.neutralAction;
  }

  get nextAction(): Action {
    return this.#nextAction;
  }
}
