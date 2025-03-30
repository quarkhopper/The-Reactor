# CORE Subsystem Design

The CORE subsystem simulates the heart of a reactor, where power output and system stability are determined by a multidimensional arrangement of physical elements. The user interfaces with this subsystem indirectly, influencing values without necessarily understanding their full impact.

## Conceptual Overview

- The CORE is not governed solely by the quantity of fuel, but by the **geometry and interactions** between various reactor materials.
- The system computes **a solution each tick** based on multiple interacting tensors.
- Some of these tensors are visible to the user; others are hidden, or second-order.

## Tensor Structure

### 1. Fuel Rod Tensor
- Represents the presence and configuration of **fuel rods**.
- Directly influences power generation potential.
- User can modify this through **button inputs** (e.g. left side of the panel).
- Button **color** reflects local fuel rod status.

### 2. Control Rod Tensor
- A smaller tensor representing **control rods**.
- Affects neutron absorption, indirectly regulating reaction intensity.
- User can modify this using **sliders** beneath the panel.
- Sliders may **clamp** values rather than setting them absolutely.

### 3. Moderator Tensor
- Indicates where **moderators** (like water or graphite) are present.
- Modifies reactivity in combination with fuel and control rods.
- May be partially or fully hidden from the user.

### 4. Secondary/Hidden Tensors
- May represent **thermal buildup**, **geometric instability**, or **previous-state momentum**.
- Not directly visible or user-controlled.
- Evolve over time as part of second-order system dynamics.

## Tick Logic

- On each tick, all tensors are read and a **composite solution** is computed.
- This solution affects the following:
  - **Core heat and pressure**
  - **Power output**
  - **Subsystem warning states**
  - Potential **faults or instability**

- User input at any given moment:
  - Directly affects the relevant tensor’s element (buttons, sliders).
  - Contributes to the next tick’s full solution.

## Design Philosophy

- The system **runs itself**.
- The user is a **disruptive influence**, a child playing with something too complex to fully understand.
- Feedback is given through panel lights, heat indicators, and sometimes dramatic consequences.

