/**
 * Central manifest for all component IDs in the system.
 * This is the single source of truth for component identification.
 */

// Component categories
export const COMPONENT_CATEGORIES = {
  BUTTONS: 'buttons',
  INDICATORS: 'indicators',
  DISPLAYS: 'displays',
  CONTROLS: 'controls',
  CONDITION_LIGHTS: 'condition_lights',
  BLINK_LIGHTS: 'blink_lights',
  FUEL_RODS: 'fuel_rods',
  AUXILIARY: 'auxiliary'
};

// Component IDs by category
export const COMPONENT_IDS = {
  // Buttons
  [COMPONENT_CATEGORIES.BUTTONS]: [
    'master',
    'scram',
    'aux_button_0',
    'aux_button_1',
    'aux_button_2',
    'aux_button_3',
    'aux_button_4',
    'aux_button_5'
  ],
  
  // Indicators
  [COMPONENT_CATEGORIES.INDICATORS]: [
    'core_temp_gauge',
    'turbine_rpm_gauge',
    'pump_temp_meter_primary',
    'pump_temp_meter_secondary',
    'pump_pres_meter_primary',
    'pump_pres_meter_secondary'
  ],
  
  // Displays
  [COMPONENT_CATEGORIES.DISPLAYS]: [
    'digi_0', 'digi_1', 'digi_2', 'digi_3', 'digi_4', 'digi_5', 'digi_6', 'digi_7', 'digi_8',
    'digi_9', 'digi_10', 'digi_11', 'digi_12', 'digi_13', 'digi_14'
  ],
  
  // Controls
  [COMPONENT_CATEGORIES.CONTROLS]: [
    'primary_speed',
    'secondary_speed',
    'slider_0', 'slider_1', 'slider_2', 'slider_3', 'slider_4', 'slider_5', 'slider_6', 'slider_7'
  ],
  
  // Condition lights
  [COMPONENT_CATEGORIES.CONDITION_LIGHTS]: [
    'cond_POWER', 'cond_TRANS', 'cond_RUN', 'cond_FAULT', 'cond_SCRAM',
    'cond_CORE', 'cond_COOLING', 'cond_LOAD', 'cond_CTRL', 'cond_AUX'
  ],
  
  // Blink lights
  [COMPONENT_CATEGORIES.BLINK_LIGHTS]: [
    'blink_opr_left', 'blink_opr_right', 'blink_grid_0', 'blink_grid_1', 'blink_grid_2', 'blink_grid_3',
    'blink_grid_4', 'blink_grid_5', 'blink_grid_6', 'blink_grid_7', 'blink_grid_8', 'blink_grid_9',
    'blink_grid_10', 'blink_grid_11', 'blink_grid_12', 'blink_grid_13', 'blink_grid_14', 'blink_grid_15',
    'blink_grid_16', 'blink_grid_17'
  ],
  
  // Fuel rods
  [COMPONENT_CATEGORIES.FUEL_RODS]: [
    'fuel_rod_button_0_0', 'fuel_rod_button_1_0', 'fuel_rod_button_2_0', 'fuel_rod_button_3_0',
    'fuel_rod_button_4_0', 'fuel_rod_button_5_0', 'fuel_rod_button_0_1', 'fuel_rod_button_1_1',
    'fuel_rod_button_2_1', 'fuel_rod_button_3_1', 'fuel_rod_button_4_1', 'fuel_rod_button_5_1',
    'fuel_rod_button_0_2', 'fuel_rod_button_1_2', 'fuel_rod_button_2_2', 'fuel_rod_button_3_2',
    'fuel_rod_button_4_2', 'fuel_rod_button_5_2', 'fuel_rod_button_0_3', 'fuel_rod_button_1_3',
    'fuel_rod_button_2_3', 'fuel_rod_button_3_3', 'fuel_rod_button_4_3', 'fuel_rod_button_5_3',
    'fuel_rod_button_0_4', 'fuel_rod_button_1_4', 'fuel_rod_button_2_4', 'fuel_rod_button_3_4',
    'fuel_rod_button_4_4', 'fuel_rod_button_5_4', 'fuel_rod_button_0_5', 'fuel_rod_button_1_5',
    'fuel_rod_button_2_5', 'fuel_rod_button_3_5', 'fuel_rod_button_4_5', 'fuel_rod_button_5_5'
  ],
  
  // Auxiliary components
  [COMPONENT_CATEGORIES.AUXILIARY]: []
};

// Flatten all component IDs into a single array
const ALL_COMPONENT_IDS = Object.values(COMPONENT_IDS).flat();

// Component metadata
export interface ComponentMetadata {
  id: string;
  category: string;
  description: string;
  testable: boolean;
}

// Generate metadata for all components
export const COMPONENT_METADATA: Record<string, ComponentMetadata> = {};

// Populate metadata
Object.entries(COMPONENT_IDS).forEach(([category, ids]) => {
  ids.forEach(id => {
    COMPONENT_METADATA[id] = {
      id,
      category,
      description: `${id} component`,
      testable: true
    };
  });
});

// Export a function to get all component IDs
export function getAllComponentIds(): string[] {
  // No logging here
  return ALL_COMPONENT_IDS;
}

// Export a function to get component IDs by category
export function getComponentIdsByCategory(category: string): string[] {
  return COMPONENT_IDS[category] || [];
}

// Export a function to get component metadata
export function getComponentMetadata(id: string): ComponentMetadata | undefined {
  return COMPONENT_METADATA[id];
} 