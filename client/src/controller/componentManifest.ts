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
  ],
  
  // Indicators
  [COMPONENT_CATEGORIES.INDICATORS]: [
    'core_temp_gauge',    'turbine_rpm_gauge',    'pump_temp_meter',
    'pump_pres_meter',    'target_temp_meter',    'core_reactivity_meter',
    "control_rod_light_0_0",    "control_rod_light_1_0",    "control_rod_light_2_0",
    "control_rod_light_3_0",    "control_rod_light_4_0",    "control_rod_light_5_0",
    "control_rod_light_0_1",    "control_rod_light_1_1",    "control_rod_light_2_1",
    "control_rod_light_3_1",    "control_rod_light_4_1",    "control_rod_light_5_1",
    "control_rod_light_0_2",    "control_rod_light_1_2",    "control_rod_light_2_2",
    "control_rod_light_3_2",    "control_rod_light_4_2",    "control_rod_light_5_2",
    "control_rod_light_0_3",    "control_rod_light_1_3",    "control_rod_light_2_3",
    "control_rod_light_3_3",    "control_rod_light_4_3",    "control_rod_light_5_3",
    "control_rod_light_0_4",    "control_rod_light_1_4",    "control_rod_light_2_4",
    "control_rod_light_3_4",    "control_rod_light_4_4",    "control_rod_light_5_4",
    "control_rod_light_0_5",    "control_rod_light_1_5",    "control_rod_light_2_5",
    "control_rod_light_3_5",    "control_rod_light_4_5",    "control_rod_light_5_5"
  ],
  
  // Displays
  [COMPONENT_CATEGORIES.DISPLAYS]: [
    'power_demand_1', 'power_demand_2', 'power_demand_3',
    'power_demand_4', 'power_demand_5', 'power_demand_6'
  ],
  
  // Controls
  [COMPONENT_CATEGORIES.CONTROLS]: [
    'pump_speed', 'target_power'
  ],
  
  // Condition lights
  [COMPONENT_CATEGORIES.CONDITION_LIGHTS]: [ 
    'cond_power', 'cond_trans', 'cond_fault', 'cond_scram', 'cond_aux', 
    'sys_core', 'sys_cooling', 'sys_gen', 'sys_ctrl', 'sys_aux'
  ],
  

  // Fuel rod buttons
  [COMPONENT_CATEGORIES.FUEL_RODS]: [
  "fuel_rod_button_0_1",  "fuel_rod_button_0_2",  "fuel_rod_button_0_3",  "fuel_rod_button_0_4",  "fuel_rod_button_0_5",
  "fuel_rod_button_1_0",  "fuel_rod_button_1_1",  "fuel_rod_button_1_2",  "fuel_rod_button_1_3",  "fuel_rod_button_1_4",
  "fuel_rod_button_1_5",  "fuel_rod_button_1_6",  "fuel_rod_button_2_0",  "fuel_rod_button_2_1",  "fuel_rod_button_2_2",
  "fuel_rod_button_2_3",  "fuel_rod_button_2_4",  "fuel_rod_button_2_5",  "fuel_rod_button_2_6",  "fuel_rod_button_3_0",
  "fuel_rod_button_3_1",  "fuel_rod_button_3_2",  "fuel_rod_button_3_3",  "fuel_rod_button_3_4",  "fuel_rod_button_3_5",
  "fuel_rod_button_3_6",  "fuel_rod_button_4_0",  "fuel_rod_button_4_1",  "fuel_rod_button_4_2",  "fuel_rod_button_4_3",
  "fuel_rod_button_4_4",  "fuel_rod_button_4_5",  "fuel_rod_button_4_6",  "fuel_rod_button_5_0",  "fuel_rod_button_5_1",
  "fuel_rod_button_5_2",  "fuel_rod_button_5_3",  "fuel_rod_button_5_4",  "fuel_rod_button_5_5",  "fuel_rod_button_5_6",
  "fuel_rod_button_6_1",  "fuel_rod_button_6_2",  "fuel_rod_button_6_3",  "fuel_rod_button_6_4",  "fuel_rod_button_6_5"
  ],
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