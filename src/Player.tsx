import Timer from './Timer';
import { Action, ActionData } from './ActionData';
import { Constants } from './Constants';
import StatusEffect from './StatusEffect';

export interface PlayerState {
  gcd: Timer;
  actionLock: Timer;
}

export class Player implements PlayerState {
  gcd: Timer;
  actionLock: Timer;

  constructor() {
    this.gcd = new Timer(0);
    this.actionLock = new Timer(0, Constants.ACTION_RECAST_LOCK);
  }

  stepTime(delta: number) {
    Object.values(this).forEach((status) => {
      if (status instanceof Timer) {
        status.increment(-delta);
      }
    });
  }

  getNextExpireAction() {
    let nextExpire: { delta: number; action: Action } | undefined;
    Object.values(this).forEach((status) => {
      if (
        status instanceof Timer &&
        status.isActive() &&
        status.expire &&
        (nextExpire === undefined || status.value < nextExpire.delta)
      ) {
        nextExpire = {
          delta: status.value,
          action: status.expire,
        };
      }
    });

    return nextExpire;
  }

  execute(action: Action): ActionData {
    const actionData = action.call(this);
    actionData.beginEffects();

    Object.values(this).forEach((status) => {
      if (status instanceof StatusEffect && status.isActive()) {
        status.alterData(actionData);
      }
    });

    actionData.finishEffects();
    return actionData;
  }
}
