/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */

import Combo from './Combo';
import Gauge from './Gauge';
import { ActionData } from './ActionData';
import { Constants, Warnings } from './Constants';
import StatusEffect from './StatusEffect';
import { Player, PlayerState } from './Player';

/**
 * The values of a reaper state. Used for memoizing in simulation.
 */
export interface ReaperState extends PlayerState {
  totalPotency: Gauge;
  soulGauge: Gauge;
  shroudGauge: Gauge;
  combo: Combo;
  deathsDesign: StatusEffect;
}

export class Reaper extends Player implements ReaperState {
  static Warnings = {
    DEATHS_DESIGN_EXPIRED: "Death's design expired",
  };

  totalPotency: Gauge;
  soulGauge: Gauge;
  shroudGauge: Gauge;
  combo: Combo;
  deathsDesign: StatusEffect;

  constructor() {
    super();
    this.totalPotency = new Gauge();
    this.soulGauge = new Gauge(0, 0, 20);
    this.shroudGauge = new Gauge(0, 0, 100);
    this.combo = new Combo(this.slice, this.expireCombo);
    this.deathsDesign = new StatusEffect(
      Reaper.deathsDesignMutator,
      0,
      60,
      this.expireDeathsDesign
    );
  }

  expireCombo(): ActionData {
    const action: ActionData = {
      type: 'effect',
      warnings: [Warnings.COMBO_EXPIRED],
      beginEffects: () => {},
      finishEffects: () => {
        this.combo.reset(action);
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
    const isComboed = this.combo.nextAction === this.slice;

    const actionData: ActionData = {
      type: 'gcd',
      potency: 300,
      gcdRecastTime: Constants.DEFAULT_GCD,
      warnings: [],
      beginEffects: () => {},
      finishEffects: () => {
        this.totalPotency.increment(actionData.potency!, actionData);
        this.soulGauge.increment(10, actionData);
        this.combo.activate(this.waxingSlice, actionData);
        this.gcd.set(actionData.gcdRecastTime!, actionData);
        this.actionLock.reset(actionData);
      },
    };

    if (!isComboed) {
      actionData.warnings.push(
        this.combo.isActive() ? Warnings.COMBO_BROKEN : Warnings.COMBO_INACTIVE
      );
    }

    return actionData;
  }

  waxingSlice(): ActionData {
    const isComboed = this.combo.nextAction === this.waxingSlice;

    const actionData: ActionData = {
      type: 'gcd',
      potency: isComboed ? 380 : 140,
      gcdRecastTime: Constants.DEFAULT_GCD,
      warnings: [],
      beginEffects: () => {},
      finishEffects: () => {
        this.totalPotency.increment(actionData.potency!, actionData);
        this.soulGauge.increment(isComboed ? 10 : 0, actionData);
        this.combo.activate(isComboed ? this.infernalSlice : this.slice, actionData);
        this.gcd.set(actionData.gcdRecastTime!, actionData);
        this.actionLock.reset(actionData);
      },
    };

    if (!isComboed) {
      actionData.warnings.push(
        this.combo.isActive() ? Warnings.COMBO_BROKEN : Warnings.COMBO_INACTIVE
      );
    }

    return actionData;
  }

  infernalSlice(): ActionData {
    const isComboed = this.combo.nextAction === this.infernalSlice;

    const actionData: ActionData = {
      type: 'gcd',
      potency: isComboed ? 460 : 140,
      gcdRecastTime: Constants.DEFAULT_GCD,
      warnings: [],
      beginEffects: () => {},
      finishEffects: () => {
        this.totalPotency.increment(actionData.potency!, actionData);
        this.soulGauge.increment(isComboed ? 10 : 0, actionData);
        this.combo.reset(actionData);
        this.gcd.set(actionData.gcdRecastTime!, actionData);
        this.actionLock.reset(actionData);
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
        this.deathsDesign.increment(30, actionData);
        this.totalPotency.increment(actionData.potency!, actionData);
        this.gcd.set(actionData.gcdRecastTime!, actionData);
        this.actionLock.reset(actionData);
      },
    };
    return actionData;
  }
}
