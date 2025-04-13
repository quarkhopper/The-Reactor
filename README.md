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

---

## 🔧 Technical Overview

### Frontend (Current Focus)

- **Framework:** React (using TypeScript)
- **Styling:** Custom CSS with a focus on maintainable, component-specific styles
- **Component Libraries:**
  - `shadcn/ui` for basic UI elements
  - `lucide-react` for icons
  - `framer-motion` for animations and transitions

#### Interface Concepts

- A grid-based **control panel** with:
  - Light-up **buttons** and **toggles**
  - Flickering **indicator lights**
  - **Sliders**, **knobs**, and **rotating gauges**
- Dynamic lighting to simulate:
  - System pressure
  - Load levels
  - Temperature or other cryptic variables

#### Visual Goals

- Everything should feel **responsive and alive**
- Activations trigger short **animations or sound cues**
- Interface has a clear **startup sequence**, booting subsystems and initializing lights/sounds in order
- **Shutdown sequence** ends in a slow fade or flickering power-down

### Core System Design

The reactor core is simulated through a multidimensional arrangement of physical elements:

- **Fuel Rod Tensor**: Represents fuel rod presence and configuration, directly influencing power generation
- **Control Rod Tensor**: Affects neutron absorption, regulating reaction intensity through slider controls
- **Moderator Tensor**: Modifies reactivity in combination with fuel and control rods
- **Secondary Tensors**: Represent thermal buildup, geometric instability, and system momentum

The system computes a solution each tick based on these interacting tensors, affecting:
- Core heat and pressure
- Power output
- Subsystem warning states
- Potential faults or instability

### State Management

- **Centralized Component Registry**: Single source of truth for all component IDs and metadata
- **State Transition Manager**: Handles all state transitions with validation and timing
- **Event Bus System**: Facilitates communication between components and the core system
- **Process Managers**: Manage initialization, testing, startup, and shutdown sequences

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

- [x] React app scaffolded with Tailwind and TypeScript
- [x] Add basic components: buttons, indicators, layout grid
- [x] Implement startup/shutdown animation sequences
- [x] Define and manage shared reactor state
- [x] Add simple state transitions and reactions to input

### Phase 2 – Component Refinement

- [x] Implement self-contained component architecture
- [x] Add test sequences for all components
- [x] Improve state management and transitions
- [x] Enhance visual feedback and animations

### Phase 3 – Core System Integration

- [x] Implement tensor-based core simulation
- [x] Add control rod and fuel rod interactions
- [x] Develop secondary tensor effects
- [x] Create comprehensive test sequences

### Phase 4 – Polish & Expansion

- [x] Add sound effects and audio feedback
- [ ] Implement multiplayer features
- [ ] Add Discord integration
- [x] Create updated documentation and tutorials

---

## 📚 Documentation

Detailed documentation can be found in the `docs` directory:

- `docs/state_machine.md`: State machine architecture and principles
- `docs/process_manager_pattern.md`: Process manager design and implementation
- `docs/bus_subscriber.md`: MessageBus subscription and handling pattern

---

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open `http://localhost:3000` in your browser

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🧠 Design Principles

- Interactions should be **tactile and rewarding**
- System behavior should feel **emergent**, not rigid
- No need for player success/failure—just immersion
- Complexity should be **hinted**, not explained
- The system's "lore" is embedded in its behavior

---

## 📝 Notes & Considerations

- Avoid real physics simulation—it's about the *feel*, not the realism
- Use *delay*, *lighting*, and *motion* to simulate system depth
- Subtlety: not every interaction should have an obvious effect
- Chaos mode is encouraged—randomization with limits
- Control panel should feel like it was built by a now-defunct organization with no documentation

