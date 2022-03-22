/* eslint-disable max-classes-per-file */
import { DataSet, DataView } from 'vis-data';
import { Action, ActionData } from './ActionData';
import Reaper from './Reaper';

export interface TimelineActionData {
  id: number;
  time: number;
  action: Action;
  snap?: 'left' | 'middle' | 'right';
  data?: ActionData;
}

export abstract class AbstractRotationManager {
  // #actionItems: TimelineActionData[];

  abstract addActions(actions: Action[], time: number): void;
  abstract removeActions(actions: TimelineActionData[]): void;
  abstract moveActions(actions: TimelineActionData[], time: number): void;
  abstract getClosestSnapPoint(
    time: number,
    type: 'gcd' | 'ogcd',
    ignoreBlock: TimelineActionData[]
  ): number;

  abstract get actionItems(): DataSet<TimelineActionData>;
}

export class RotationManager {
  #actionItems: DataSet<TimelineActionData>;
  #actionSequence: Array<TimelineActionData>;
  #actionIdCounter: number;

  constructor() {
    this.#actionItems = new DataSet<TimelineActionData>({ queue: {} });
    this.#actionSequence = [];
    this.#actionIdCounter = 0;
  }

  updateDataSet() {
    this.simulate();
    this.#actionItems.flush!();
    this.#actionItems.updateOnly(this.#actionSequence);
  }

  addActions(insertTime: number, actions: Partial<TimelineActionData>[], simulate: boolean = true) {
    const newItems = actions.map(
      (action) => ({ ...action, id: this.getUniqueId(), time: 0 } as TimelineActionData)
    );

    const insertIndex = this.getNextIndexAtTime(insertTime);
    this.#actionSequence = [
      ...this.#actionSequence.slice(0, insertIndex),
      ...newItems,
      ...this.#actionSequence.slice(insertIndex),
    ];

    this.#actionItems.add(newItems);
    if (simulate) {
      this.updateDataSet();
    }
  }

  removeActions(actions: TimelineActionData[], simulate: boolean = true) {
    if (actions.length === 0) {
      return;
    }

    const removeIndex = this.getNextIndexAtTime(actions[0].time);
    this.#actionSequence = [
      ...this.#actionSequence.slice(0, removeIndex),
      ...this.#actionSequence.slice(removeIndex + actions.length),
    ];

    this.#actionItems.remove(actions);
    if (simulate) {
      this.updateDataSet();
    }
  }

  moveActions(insertTime: number, actions: TimelineActionData[], simulate: boolean = true) {
    this.removeActions(actions, false);
    this.addActions(insertTime, actions, false);

    if (simulate) {
      this.updateDataSet();
    }
  }

  private simulate() {
    const player = new Reaper();
    this.#actionSequence.forEach((item) => {
      item.time = player.clock;
      item.data = player.execute(item.action);

      let nextExpireAction = player.getNextExpireAction();
      while (nextExpireAction && nextExpireAction.delta <= player.state.gcd.value) {
        player.stepTime(nextExpireAction.delta);
        player.execute(nextExpireAction.action);
        nextExpireAction = player.getNextExpireAction();
      }

      player.stepTime(player.state.gcd.value);
    });
  }

  // first index at which item.time >= t
  private getNextIndexAtTime(time: number) {
    for (let index = 0; index < this.#actionItems.length; index += 1) {
      if (this.#actionSequence[index].time >= time) {
        return index;
      }
    }
    return this.#actionSequence.length;
  }

  private getUniqueId(): number {
    this.#actionIdCounter += 1;
    return this.#actionIdCounter - 1;
  }

  get actionItems(): DataView<TimelineActionData> {
    return new DataView(this.#actionItems);
  }

  get actionSequence(): Array<TimelineActionData> {
    return this.#actionSequence;
  }
}
