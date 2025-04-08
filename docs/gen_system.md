# Reactor Gen System Control Summary

This document outlines the controls, indicators, and feedback systems associated with the Generation (Gen) subsystem of the reactor simulation project. The system emphasizes subtle interdependence, ambiguous feedback, and a thin pretense of utility.

---

## Core Controls

### TURB PITCH (Slider)
- Adjusts turbine blade angle.
- Fine pitch: High RPM, low torque, unstable power.
- Steep pitch: Lower RPM, more torque, potential backpressure buildup.

### SYNC TUNE (Slider)
- Tunes coupling between turbine and generator.
- Loose: Low power transfer, flickering SYNC.
- Tight: High efficiency, potential mechanical drag.

### COND FAN (Slider + Vertical Meter)
- Controls condenser cooling speed.
- Low: Rising COND TEMP, poor condensation.
- High: Better steam throughput, potential instability.

### RELIEF VALVES (Multiple Knobs)
- VALVE Aâ€“D (or more), unlabeled functions.
- Relieve pressure in specific parts of the loop.
- Subtle effects: changes to COND TEMP, turbine stability, etc.
- No obvious faults, only ambiguous indicators.

---

## Indicators

### Meters
- **GEN V:** Generator output voltage.
- **COND TEMP:** Condenser temperature.
- **CAP ARRAY:** Vertical gauge showing capacitor charge (power buffer).
- **TURB RPM:** Large analog gauge for turbine speed.

### Digital Displays
- Row of displays across top of panel.
- Show **power demand**, dynamic and shifting.

---

## LED Indicators (12â€“16 total)
| Label         | Behavior                                                                 |
|---------------|--------------------------------------------------------------------------|
| SYNC          | Solid when synced, flickers when unstable.                              |
| LOAD          | Green when demand is met, amber when mismatched.                        |
| GEN STRESS    | Amber/red under coupling strain or high voltage.                        |
| TURB DAMP     | Lights if turbine pitch/load mismatch causes drag.                      |
| COND          | Flickers if condensation insufficient.                                  |
| VALVE Aâ€“D     | Lights per valve; not always 1:1â€”some light only in invalid combos.     |
| GRID          | Shows connection status to external load.                               |
| EFF           | Lights white/blue only in optimal operating modes.                      |
| SCRAM READY   | Lights near fault threshold.                                             |
| MYSTERY       | No clear meaningâ€”responds to odd configurations.                        |
| WARN          | Early warning lightâ€”lights amber in edge-case states.                   |
| FAULT         | Red fault indicatorâ€”only triggers in extreme misuse.                    |

---

## Capacitor Charge & Distribution

- **CAP ARRAY** gauge charges from generator output.
- Powers the distribution system.
- Charges when supply exceeds demand.
- Drains when demand outpaces generation.
- Zero charge triggers subtle warnings (e.g. CAP DRAIN LED).

---

## Design Philosophy

- Controls feel operational but may lead to inefficiency or instability if poorly coordinated.
- No direct error statesâ€”feedback is ambient, visual, and interpretive.
- Encourages experimentation, superstition, and over-correction.
