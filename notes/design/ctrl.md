# CTRL Subsystem Design

The CTRL (Control) subsystem is an internal algorithm tasked with stabilizing the reactor. It is not a conscious entity, but its behavior is agent-like—monitoring system trends and intervening when necessary to prevent runaway conditions or system collapse.

---

## Core Function

CTRL observes the dynamic interplay between subsystems (CORE, COOL, LOAD) and attempts to:
- **Resist positive feedback loops** (e.g. thermal or power runaway)
- **Stabilize toward a new equilibrium** when disturbed
- **Prevent system-wide faults** without user intervention

---

## Points of Influence

Although the user may interact with sliders and knobs, the CTRL subsystem is what ultimately acts on core mechanical controls:

### 1. Control Rod Engagement
- User sliders define **limits** or **biases**.
- CTRL actively sets the **actual** control rod insertion based on system conditions.
- This allows it to quietly fight back against user-induced instability.

### 2. Turbine RPM / Load Regulation
- CTRL can throttle or boost the turbine speed to match cooling and load conditions.
- Can attempt to recover system performance before faults accumulate.

### 3. System-Level Intervention
- When all efforts fail, CTRL can:
  - **Trigger warnings**
  - **Force a SCRAM event** (shutting down the CORE)
  - **Shut down or fault entire subsystems** (COOL, LOAD, GEN, etc.)

---

## Behavioral Summary

CTRL is the last line of defense in an open system that invites disruption. It does not override the user, but it **filters** and **modulates** the user's inputs to avoid catastrophe.

It is happiest when all systems trend toward a stable state. If that proves impossible, it first resists, then warns, and finally intervenes.

---

## UI Indications

- **CTRL condition light** may glow or blink when it's actively intervening.
- Other subsystems may visibly react to CTRL overrides (e.g. turbine needle stalling despite user input).
