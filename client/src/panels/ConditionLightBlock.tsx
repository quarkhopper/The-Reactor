import ConditionLight from '../components/ConditionLight';

export default function ConditionLightBlock() {
  const x = 750;
  const y = 170;
  const width = 1450;
  const columns = 5;
  const rows = 2;

  const values: { 
    id: string; 
    label: string; 
    stateEvent?: Record<string, string[]>; 
    conditionEvent?: Array<{type: string; value: string; color: string}> }[] = [
    { id: 'cond_power', label: 'POWER', stateEvent: { 'green': ['on'], 'amber': ['init', 'startup'], 'red': ['scram', 'fault'] } },
    { id: 'cond_trans', label: 'TRANS', stateEvent: { 'amber': ['init', 'test', 'startup'] } },
    { id: 'cond_fault', label: 'FAULT', stateEvent: { 'red': ['fault'] } },
    { id: 'cond_scram', label: 'SCRAM', stateEvent: { 'red': ['scram'] } },
    { id: 'cond_aux', label: 'AUX' },
    { id: 'sys_core', label: 'CORE', conditionEvent: [
      {type: 'core_state_update', value: 'normal', color: 'green' },
      {type: 'core_state_update', value: 'critical', color: 'red' },
      {type: 'core_state_update', value: 'warning', color: 'amber' },
    ] },
    { id: 'sys_cooling', label: 'COOLING', conditionEvent: [
        {type: 'cooling_state_update', value: 'normal', color: 'green' },
        {type: 'cooling_state_update', value: 'critical', color: 'red' },
        {type: 'cooling_state_update', value: 'warning', color: 'amber' },
    ] },
    { id: 'sys_gen', label: 'GEN', conditionEvent: [
      {type: 'gen_state_update', value: 'normal', color: 'green' },
      {type: 'gen_state_update', value: 'critical', color: 'red' },
      {type: 'gen_state_update', value: 'warning', color: 'amber' },
    ] },
    { id: 'sys_ctrl', label: 'CTRL', conditionEvent: [
      {type: 'ctrl_state_update', value: 'normal', color: 'green' },
      {type: 'ctrl_state_update', value: 'critical', color: 'red' },
      {type: 'ctrl_state_update', value: 'warning', color: 'amber' },
    ] },
    { id: 'sys_aux', label: 'AUX' },
  ];

  const lightWidth = width / columns;
  const lightHeight = lightWidth / (707 / 274);
  const totalHeight = lightHeight * rows;
  const startX = x - width / 2 + lightWidth / 2;
  const startY = y - totalHeight / 2 + lightHeight / 2;

  return (
    <>
      {values.map((entry, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const cx = startX + col * lightWidth;
        const cy = startY + row * lightHeight;

        return (
          <ConditionLight
            key={index}
            id={entry.id}
            x={cx}
            y={cy}
            width={lightWidth}
            label={entry.label}
            stateEvent={entry.stateEvent}
            conditionEvent={entry.conditionEvent}
          />
        );
      })}
    </>
  );
}
