/* eslint-disable no-console */
import React from 'react';
import './App.css';
import { Reaper } from './Reaper';
import { RotationManager } from './RotationManager';

const rotationManager = new RotationManager(() => new Reaper());

rotationManager.addActions(0, [
  { action: Reaper.prototype.shadowOfDeath },
  { action: Reaper.prototype.shadowOfDeath },
  { action: Reaper.prototype.shadowOfDeath },
  { action: Reaper.prototype.slice },
  { action: Reaper.prototype.infernalSlice },
  { action: Reaper.prototype.waxingSlice },
]);
console.log(rotationManager.actionSequence);

rotationManager.addActions(8000, [
  { action: Reaper.prototype.slice },
  { action: Reaper.prototype.waxingSlice },
  { action: Reaper.prototype.infernalSlice },
]);
console.log(rotationManager.actionSequence);

rotationManager.removeActions(rotationManager.actionSequence.slice(4, 6));
console.log(rotationManager.actionSequence);

const testReaper = new Reaper();
console.log({ ...testReaper });

function App() {
  return <> </>;
}

export default App;
