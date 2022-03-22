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

export class RotationManager {
  #actionItems: DataSet<TimelineActionData>;
  #actionSequence: Array<TimelineActionData>;
  #actionIdCounter: number;

  constructor() {
    this.#actionItems = new DataSet<TimelineActionData>({ queue: {} });
    this.#actionSequence = [];
    this.#actionIdCounter = 0;
  }

  addActions(
    insertTime: number,
    actions: Partial<TimelineActionData>[],
    updateRotation: boolean = true
  ) {
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
    if (updateRotation) {
      this.updateRotation();
    }
  }

  removeActions(actions: TimelineActionData[], updateRotation: boolean = true) {
    if (actions.length === 0) {
      return;
    }

    const removeIndex = this.getNextIndexAtTime(actions[0].time);
    this.#actionSequence = [
      ...this.#actionSequence.slice(0, removeIndex),
      ...this.#actionSequence.slice(removeIndex + actions.length),
    ];

    this.#actionItems.remove(actions);
    if (updateRotation) {
      this.updateRotation();
    }
  }

  moveActions(insertTime: number, actions: TimelineActionData[], updateRotation: boolean = true) {
    this.removeActions(actions, false);
    this.addActions(insertTime, actions, false);

    if (updateRotation) {
      this.updateRotation();
    }
  }

  private updateRotation() {
    this.simulate();
    this.#actionItems.flush!();
    this.#actionItems.updateOnly(this.#actionSequence);
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
