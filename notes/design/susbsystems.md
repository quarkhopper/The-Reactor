# Reactor Subsystems Overview

The reactor is organized into three primary subsystems that form a dynamic triangle of influence: **CORE**, **COOL**, and **LOAD**. Each is internally autonomous, governed by its own rules and tensor-driven states, but tightly interlinked with the others through shared heat, power, and flow.

---

## CORE Subsystem

The CORE represents the heart of the reactor—where fuel, control rods, and moderators interact in a multidimensional arrangement.

- Composed of several interacting tensors:
  - **Fuel Rod Tensor**
  - **Control Rod Tensor**
  - **Moderator Tensor**
  - Hidden tensors for second-order effects (e.g. thermal buildup, instability)
- Each tick, these tensors are solved together to compute:
  - Power output
  - Heat generation
  - System stability
- Controlled by:
  - **Left panel buttons** – influence fuel rod tensor
  - **Sliders** – clamp values in the control rod tensor
- Output influences:
  - **Heat flow to COOL**
  - **Power availability to LOAD**

---

## COOL Subsystem

The COOL subsystem manages thermal dissipation and heat transfer from CORE to LOAD. It is responsible for extracting heat and maintaining reactor equilibrium.

- Internally represented by tensors describing:
  - **Coolant concentration**
  - **Temperature distribution**
  - **Flow dynamics**
- Knobs on the **right side** of the panel affect:
  - Primary/secondary loop lengths
  - Efficiency of heat exchangers
  - Binary toggles between flow patterns or routing
- Geometry of the coolant tensors determines:
  - How efficiently heat is moved away from the CORE
  - How effectively it is transferred into the LOAD subsystem
- Improper cooling leads to CORE overheating or inefficient energy transfer.

---

## LOAD Subsystem

The LOAD subsystem simulates the system’s electrical demand and power distribution. It acts as the sink for energy, creating a demand curve that must be met.

- Power demand is represented as a tensor mapped to **digital displays**.
- **Vertical meters** represent capacitors:
  - Charge from CORE power output
  - Drain based on simulated demand
- Knobs near the **main gauge** control turbine behavior and possibly load prioritization.
- The **main gauge** may indicate:
  - Turbine effort
  - Power flow balance
  - System strain or inefficiency

---

## Subsystem Interactions

- **CORE → COOL**: Generates heat that must be dissipated
- **COOL → LOAD**: Transfers heat into usable power via turbine loop
- **LOAD → CORE**: Reflects back pressure via power draw and load imbalance

Disruption in one subsystem creates emergent effects in the others. For example:
- A cooling failure may cause the core to enter thermal stress.
- An overdrawn load may drain capacitors too quickly, forcing power instability.
- Poor control rod configuration may destabilize the reaction and overload cooling.

---

## Design Principle

The user does not directly manage these subsystems, but instead **nudges** them through cryptic interfaces. They are a **chaotic agent**, triggering ripples in a self-regulating system that evolves tick by tick.

