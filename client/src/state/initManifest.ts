const initComponentIds = [
  'circular_gauge',

  'cond_SCRAM',
  'cond_POWER',
  'cond_FAULT',
  'cond_TEST',
  'cond_STANDBY',
  'cond_RUN',
  'cond_WARN',
  'cond_LOCKED',
  'cond_AUX',
  'cond_COOL',

  'digi_0', 'digi_1', 'digi_2', 'digi_3', 'digi_4', 'digi_5',
  'digi_6', 'digi_7', 'digi_8', 'digi_9', 'digi_10', 'digi_11',
  'digi_12', 'digi_13', 'digi_14',

  'blink_opr_left',
  'blink_opr_right',
  'blink_grid_0',
  'blink_grid_1',
  'blink_grid_2',
  'blink_grid_3',
  'blink_grid_4',
  'blink_grid_5',
  'blink_grid_6',
  'blink_grid_7',
  'blink_grid_8',
  'blink_grid_9',
  'blink_grid_10',
  'blink_grid_11',
  'blink_grid_12',
  'blink_grid_13',
  'blink_grid_14',
  'blink_grid_15',
  'blink_grid_16',
  'blink_grid_17',

  'slider_0',
  'slider_1',
  'slider_2',
  'slider_3',
  'slider_4',
  'slider_5',
  'slider_6',
  'slider_7',

  'knob_grid_0', 'knob_grid_1', 'knob_grid_2', 'knob_grid_3',
  'knob_grid_4', 'knob_grid_5', 'knob_grid_6', 'knob_grid_7',
  'knob_grid_8', 'knob_grid_9', 'knob_grid_10', 'knob_grid_11',
  'knob_grid_12', 'knob_grid_13', 'knob_grid_14',
  'knob_ind_0', 'knob_ind_1',

  'master',

  // Fuel rod buttons (6x6)
  ...Array.from({ length: 6 }, (_, y) =>
    Array.from({ length: 6 }, (_, x) => `fuel_rod_button_${x}_${y}`)
  ).flat(),

  // Aux buttons (6)
  'aux_button_0', 'aux_button_1', 'aux_button_2',
  'aux_button_3', 'aux_button_4', 'aux_button_5',

  'scram',

  'meter_0', 'meter_1', 'meter_2', 'meter_3', 'meter_4',
];

export default initComponentIds;
