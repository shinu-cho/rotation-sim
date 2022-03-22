/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */

import Combo from './Combo';
import Gauge from './Gauge';
import Timer from './Timer';
import { Action, ActionData } from './ActionData';
import { Constants, Warnings } from './Constants';
import StatusEffect from './StatusEffect';

type BaseState = {
  gcd: Timer;
  actionLock: Timer;
};

type ReaperState = BaseState & {
  totalPotency: Gauge;
  soulGauge: Gauge;
  shroudGauge: Gauge;
  combo: Combo;
  deathsDesign: StatusEffect;
};

class Player {
  clock: number = 0;
  state: BaseState = {
    gcd: new Timer(0),
    actionLock: new Timer(0, Constants.ACTION_RECAST_LOCK),
  };
}

export default class Reaper extends Player {
  static Warnings = {
    DEATHS_DESIGN_EXPIRED: "Death's design expired",
  };

  declare state: ReaperState;

  constructor() {
    super();

    this.state.totalPotency = new Gauge();
    this.state.soulGauge = new Gauge(0, 0, 20);
    this.state.shroudGauge = new Gauge(0, 0, 100);
    this.state.combo = new Combo(this.slice, this.expireCombo);
    this.state.deathsDesign = new StatusEffect(
      Reaper.deathsDesignMutator,
      0,
      60,
      this.expireDeathsDesign
    );

    console.table(this.state);
  }

  stepTime(delta: number) {
    this.clock += delta;
    Object.values(this.state).forEach((status) => {
      if (status instanceof Timer) {
        status.increment(-delta);
      }
    });
  }

  getNextExpireAction() {
    let nextExpire: { delta: number; action: Action } | undefined;
    Object.values(this.state).forEach((status) => {
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

    Object.values(this.state).forEach((status) => {
      if (status instanceof StatusEffect && status.isActive()) {
        status.alterData(actionData);
      }
    });

    actionData.finishEffects();
    return actionData;
  }

  expireCombo(): ActionData {
    const action: ActionData = {
      type: 'effect',
      warnings: [Warnings.COMBO_EXPIRED],
      beginEffects: () => {},
      finishEffects: () => {
        this.state.combo.reset(action);
      },
    };
    return action;
  }

  static deathsDesignMutator(actionData: ActionData): ActionData {
    const result = actionData;
    if (result.potency !== undefined) {
      result.potency *= 1.1;
    }
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  expireDeathsDesign(): ActionData {
    return {
      type: 'effect',
      warnings: [Reaper.Warnings.DEATHS_DESIGN_EXPIRED],
      beginEffects: () => {},
      finishEffects: () => {},
    };
  }

  slice(): ActionData {
    const isComboed = this.state.combo.nextAction === this.slice;

    const actionData: ActionData = {
      type: 'gcd',
      potency: 300,
      gcdRecastTime: Constants.DEFAULT_GCD,
      warnings: [],
      beginEffects: () => {},
      finishEffects: () => {
        this.state.totalPotency.increment(actionData.potency!, actionData);
        this.state.soulGauge.increment(10, actionData);
        this.state.combo.activate(this.waxingSlice, actionData);
        this.state.gcd.set(actionData.gcdRecastTime!, actionData);
        this.state.actionLock.reset(actionData);
      },
    };

    if (!isComboed) {
      actionData.warnings.push(
        this.state.combo.isActive() ? Warnings.COMBO_BROKEN : Warnings.COMBO_INACTIVE
      );
    }

    return actionData;
  }

  waxingSlice(): ActionData {
    const isComboed = this.state.combo.nextAction === this.waxingSlice;

    const actionData: ActionData = {
      type: 'gcd',
      potency: isComboed ? 380 : 140,
      gcdRecastTime: Constants.DEFAULT_GCD,
      warnings: [],
      beginEffects: () => {},
      finishEffects: () => {
        this.state.totalPotency.increment(actionData.potency!, actionData);
        this.state.soulGauge.increment(isComboed ? 10 : 0, actionData);
        this.state.combo.activate(isComboed ? this.infernalSlice : this.slice, actionData);
        this.state.gcd.set(actionData.gcdRecastTime!, actionData);
        this.state.actionLock.reset(actionData);
      },
    };

    if (!isComboed) {
      actionData.warnings.push(
        this.state.combo.isActive() ? Warnings.COMBO_BROKEN : Warnings.COMBO_INACTIVE
      );
    }

    return actionData;
  }

  infernalSlice(): ActionData {
    const isComboed = this.state.combo.nextAction === this.infernalSlice;

    const actionData: ActionData = {
      type: 'gcd',
      potency: isComboed ? 460 : 140,
      gcdRecastTime: Constants.DEFAULT_GCD,
      warnings: [],
      beginEffects: () => {},
      finishEffects: () => {
        this.state.totalPotency.increment(actionData.potency!, actionData);
        this.state.soulGauge.increment(isComboed ? 10 : 0, actionData);
        this.state.combo.reset(actionData);
        this.state.gcd.set(actionData.gcdRecastTime!, actionData);
        this.state.actionLock.reset(actionData);
      },
    };

    if (!isComboed) {
      actionData.warnings.push(Warnings.COMBO_BROKEN);
    }

    return actionData;
  }

  shadowOfDeath(): ActionData {
    const actionData: ActionData = {
      type: 'gcd',
      potency: 300,
      gcdRecastTime: Constants.DEFAULT_GCD,
      warnings: [],
      beginEffects: () => {},
      finishEffects: () => {
        this.state.deathsDesign.increment(30, actionData);
        this.state.totalPotency.increment(actionData.potency!, actionData);
        this.state.gcd.set(actionData.gcdRecastTime!, actionData);
        this.state.actionLock.reset(actionData);
      },
    };
    return actionData;
  }
}
