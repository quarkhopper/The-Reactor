# The Reactor Project

**Code Name:** `The Reactor`  
**Purpose:** A visually satisfying web application simulating a complex state machine through an interactive, cryptic control panel.

---

## 🌐 Project Overview

**The Reactor** is an aesthetic-driven application designed to mimic an industrial control panel. It is not meant to simulate a real-world reactor but to *feel* like a high-stakes system through satisfying feedback and mysterious behavior.

The core idea revolves around:
- **User interaction** with buttons, toggles, and sliders.
- A **dynamic state machine** reacting to those inputs.
- A feeling of **chaotic-but-contained equilibrium**, where each input causes the system to shift, adapt, and seek a new point of homeostasis.

---

## 🧠 Goals

- Create an **interactive UI** with visual depth and sensory feedback.
- Simulate a **stateful system** with complex internal logic.
- Trigger **animated auxiliary systems**, alarms, or shifting states in response to changes.
- Develop a **startup and shutdown sequence** for immersion.
- Use this project to **learn and practice**:
  - **React**
  - **TypeScript**
  - **Node.js** (future backend and Discord integration)
  - Optionally PostgreSQL (in a future persistent version)

---

## 🔧 Technical Overview

### Frontend (Current Focus)

- **Framework:** React (using TypeScript)
- **UI Framework:** Tailwind CSS for rapid styling
- **Component Libraries:**
  - `shadcn/ui` for basic UI elements
  - `lucide-react` for icons
  - `framer-motion` for animations and transitions

#### Interface Concepts

- A grid-based **control panel** with:
  - Light-up **buttons** and **toggles**
  - Flickering **indicator lights**
  - Potential **sliders**, **knobs**, or **rotating gauges**
- Dynamic lighting to simulate:
  - System pressure
  - Load levels
  - Temperature or other cryptic variables

#### Visual Goals

- Everything should feel **responsive and alive**
- Activations trigger short **animations or sound cues**
- Interface has a clear **startup sequence**, booting subsystems and initializing lights/sounds in order
- **Shutdown sequence** ends in a slow fade or flickering power-down

### Internal State Machine

- User interactions mutate a **shared system state**
- The system responds by:
  - Activating/deactivating subsystems
  - Lighting up different sections of the UI
  - Gradually stabilizing (or escalating!) depending on logic

#### State System Design (Planned)

- State Machine library options:
  - `xstate` (ideal for visualizing and structuring complex state graphs)
  - Custom lightweight FSM if minimal logic needed
- State includes:
  - Primary reactor state (idle, warming up, online, unstable, critical, offline)
  - Subsystem states (coolant system, pressure valves, containment field, etc.)
  - Load/Pressure/Flux values that influence visible behavior
- Each interaction **perturbs** the system (e.g., raising pressure)
- System attempts to **self-correct**, activating additional subsystems as needed

### Backend (Future Phase)

- **Node.js server** for:
  - Coordinating user interaction logs (if multiplayer added)
  - Optional Discord bot integration
  - Optional persistent state/history using PostgreSQL

#### Discord Integration (Later)

- Allow Discord users to trigger events, view logs, or initiate remote startups/shutdowns
- Potential for collaborative chaos mode where multiple users influence the reactor in real time

---

## 🎯 Implementation Milestones

### Phase 1 – Core UI & Logic

- [ ] React app scaffolded with Tailwind and TypeScript
- [ ] Add basic components: buttons, indicators, layout grid
- [ ] Implement startup/shutdown animation sequences
- [ ] Define and manage shared reactor state
- [ ] Add simple state transitions and reactions to input

### Phase 2 – Dynamic Behavior

- [ ] Define full state machine (possibly with `xstate`)
- [ ] Add interdependencies between subsystems
- [ ] Display shifting load/pressure/flux visually
- [ ] Make system visibly stabilize over time (or fail spectacularly)

### Phase 3 – Polish & Expansion

- [ ] Add sounds and enhanced animation via `framer-motion`
- [ ] Create auxiliary systems (e.g., emergency venting)
- [ ] Add theming (retro-futuristic or brutalist industrial)
- [ ] (Optional) Add Discord bot integration
- [ ] (Optional) Persist historical logs via Node/PostgreSQL

---

## 📦 Folder Structure (Planned)

```
/reactor
  /src
    /components
    /state
    /systems
    /ui
    App.tsx
    main.tsx
  /public
  tailwind.config.ts
  index.html
```

---

## 🧠 Design Principles

- Interactions should be **tactile and rewarding**
- System behavior should feel **emergent**, not rigid
- No need for player success/failure—just immersion
- Complexity should be **hinted**, not explained
- The system's "lore" is embedded in its behavior

---

## 📝 Notes & Considerations

- Avoid real physics simulation—it’s about the *feel*, not the realism
- Use *delay*, *lighting*, and *motion* to simulate system depth
- Subtlety: not every interaction should have an obvious effect
- Chaos mode is encouraged—randomization with limits
- Control panel should feel like it was built by a now-defunct organization with no documentation

