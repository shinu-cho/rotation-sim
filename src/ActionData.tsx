export type WarningList = Array<string>;
export type Action = () => ActionData;
export type ActionMutator = (action: ActionData) => void;

/**
 * Describes an object holding the numerical properties of an action.
 */
export interface ActionValues {
  /** The potency of the action. */
  potency: number;
  /** The GCD cooldown set by the action, possibly zero. Undefined GCD recast corresponds to an oGCD. */
  gcdRecastTime: number;
  /** The cast time of the action, possibly zero (undefined). */
  castTime: number;
  /** The cooldown time of the action, possibly zero (undefined). */
  cooldownTime: number;
}

/**
 * Describes an object holding the behavior of an action.
 */
export interface ActionData extends Partial<ActionValues> {
  type: 'gcd' | 'ogcd' | 'effect';
  /** The warnings generated by or associated to the action. */
  warnings: WarningList;
  /** The initial effects of the action, before numerical changes to the effect by other sources. */
  beginEffects: () => void;
  /** The final effects of the action, after numerical changes to the effect by other sources. */
  finishEffects: () => void;
}
