/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */

import React from 'react';
import './App.css';
import Combo from './Combo';
import Gauge from './Gauge';
import Timer from './Timer';
import { Action, WarningList, ActionData } from './ActionData';
import { Constants, Warnings } from './Constants';
import StatusEffect from './StatusEffect';

class Reaper {
  static Warnings = {
    DEATHS_DESIGN_EXPIRED: "Death's design expired",
  };

  state: {
    totalPotency: Gauge;
    soulGauge: Gauge;
    shroudGauge: Gauge;
    combo: Combo;
    deathsDesign: StatusEffect;
    gcd: Timer;
  };

  constructor() {
    this.state = {
      totalPotency: new Gauge(),
      soulGauge: new Gauge(0, 0, 20),
      shroudGauge: new Gauge(0, 0, 100),
      combo: new Combo(this.slice, this.expireCombo),
      deathsDesign: new StatusEffect(Reaper.deathsDesignMutator, 0, 60, this.expireDeathsDesign),
      gcd: new Timer(0),
    };
  }

  execute(action: Action): WarningList {
    const actionData = action.call(this);
    actionData.beginEffects();

    Object.values(this.state).forEach((status) => {
      if (status instanceof StatusEffect && status.isActive()) {
        status.alterData(actionData);
      }
    });

    actionData.finishEffects();
    return actionData.warnings;
  }

  expireCombo(): ActionData {
    const action = {
      parent: this.expireCombo,
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

  expireDeathsDesign(): ActionData {
    return {
      parent: this.expireDeathsDesign,
      warnings: [Reaper.Warnings.DEATHS_DESIGN_EXPIRED],
      beginEffects: () => {},
      finishEffects: () => {},
    };
  }

  slice(): ActionData {
    const actionData: ActionData = {
      parent: this.slice,
      warnings: [],
      potency: 300,
      gcdRecastTime: Constants.DEFAULT_GCD,
      beginEffects: () => {},
      finishEffects: () => {
        this.state.totalPotency.increment(actionData.potency!, actionData);
        this.state.soulGauge.increment(10, actionData);
        this.state.combo.activate(this.waxingSlice, actionData);
        this.state.gcd.set(actionData.gcdRecastTime!, actionData);
      },
    };

    return actionData;
  }

  waxingSlice(): ActionData {
    const isInCombo = this.state.combo.nextAction === this.waxingSlice;

    const actionData: ActionData = {
      parent: this.waxingSlice,
      warnings: [],
      potency: isInCombo ? 380 : 140,
      gcdRecastTime: Constants.DEFAULT_GCD,
      beginEffects: () => {},
      finishEffects: () => {
        this.state.totalPotency.increment(actionData.potency!, actionData);
        this.state.soulGauge.increment(isInCombo ? 10 : 0, actionData);
        this.state.combo.activate(isInCombo ? this.infernalSlice : this.slice, actionData);
        this.state.gcd.set(actionData.gcdRecastTime!, actionData);
      },
    };

    if (!isInCombo) {
      actionData.warnings!.push(Warnings.COMBO_BROKEN);
    }

    return actionData;
  }

  infernalSlice(): ActionData {
    const isInCombo = this.state.combo.nextAction === this.infernalSlice;

    const actionData: ActionData = {
      parent: this.infernalSlice,
      warnings: [],
      potency: isInCombo ? 460 : 140,
      gcdRecastTime: Constants.DEFAULT_GCD,
      beginEffects: () => {},
      finishEffects: () => {
        this.state.totalPotency.increment(actionData.potency!, actionData);
        this.state.soulGauge.increment(isInCombo ? 10 : 0, actionData);
        this.state.combo.reset(actionData);
        this.state.gcd.set(actionData.gcdRecastTime!, actionData);
      },
    };

    if (!isInCombo) {
      actionData.warnings!.push(Warnings.COMBO_BROKEN);
    }

    return actionData;
  }

  shadowOfDeath(): ActionData {
    const actionData: ActionData = {
      parent: this.shadowOfDeath,
      warnings: [],
      potency: 300,
      gcdRecastTime: Constants.DEFAULT_GCD,
      beginEffects: () => {
        this.state.deathsDesign.increment(30, actionData);
      },
      finishEffects: () => {
        this.state.totalPotency.increment(actionData.potency!, actionData);
        this.state.gcd.set(actionData.gcdRecastTime!, actionData);
      },
    };
    return actionData;
  }
}

function App() {
  const RPR = new Reaper();

  RPR.execute(Reaper.prototype.shadowOfDeath).forEach((warning) => console.log(warning));
  console.log(RPR.state.totalPotency.value);
  RPR.execute(Reaper.prototype.shadowOfDeath).forEach((warning) => console.log(warning));
  console.log(RPR.state.totalPotency.value);
  RPR.execute(Reaper.prototype.shadowOfDeath).forEach((warning) => console.log(warning));
  console.log(RPR.state.totalPotency.value);

  RPR.execute(Reaper.prototype.slice).forEach((warning) => console.log(warning));
  console.log(RPR.state.totalPotency.value);
  RPR.execute(Reaper.prototype.waxingSlice).forEach((warning) => console.log(warning));
  console.log(RPR.state.totalPotency.value);
  RPR.execute(Reaper.prototype.infernalSlice).forEach((warning) => console.log(warning));
  console.log(RPR.state.totalPotency.value);

  RPR.execute(Reaper.prototype.slice).forEach((warning) => console.log(warning));
  console.log(RPR.state.totalPotency.value);
  RPR.execute(Reaper.prototype.infernalSlice).forEach((warning) => console.log(warning));
  console.log(RPR.state.totalPotency.value);
  RPR.execute(Reaper.prototype.waxingSlice).forEach((warning) => console.log(warning));
  console.log(RPR.state.totalPotency.value);

  return <> </>;
}

export default App;
