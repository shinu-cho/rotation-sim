export type WarningList = Array<string>;
export type Action = () => ActionData;
export type ActionMutator = (action: ActionData) => void;

/**
 * Describes an object holding the properties and behavior of an action.
 */
export interface ActionData {
  /** The owner of the action data. */
  parent: Action;
  /** The warnings generated by or associated to the action. */
  warnings: WarningList;

  /** The potency of the action. */
  potency?: number;
  /** The GCD cooldown set by the action, possibly zero. Undefined GCD recast corresponds to an oGCD. */
  gcdRecastTime?: number;
  /** The cast time of the action, possibly zero. Undefined cast time is equivalent to zero. */
  castTime?: number;

  /** The initial effects of the action, before numerical changes to the effect by other sources. */
  beginEffects: () => void;
  /** The final effects of the action, after numerical changes to the effect by other sources. */
  finishEffects: () => void;
}