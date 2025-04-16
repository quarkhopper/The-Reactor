# Next Steps — Fidget Reactor Controller

> Last session success: The C++ tick engine is compiling and running successfully!  
> Let’s build on that with messaging and subsystems.

---

## ✅ Environment Confirmed
- g++ working (v14.2.0)
- VS Code ready
- Tick loop outputs and runs independently

---

## 🔧 Immediate Next Tasks

### 1. `MessageBus.h / MessageBus.cpp`
- Create a simple pub/sub or `emit()` interface
- Accept hardcoded messages like:
  - `ScramEvent`
  - `FuelRodPressedEvent { int x, int y }`
- Start with `emit()` logging to stdout

### 2. Create `subsystems/`
- Folder: `simulation/subsystems/`
- File: `coreSystem.h / coreSystem.cpp`
- Implement:
  - `initialize()`
  - `onTick()`
  - `handleMessage(const Message&)`
- Log internal state (even if dummy for now)

### 3. Connect to Tick Loop
In `tickEngine.cpp`:
- Call `coreSystem::onTick()` each cycle
- Simulate a `FuelRodPressedEvent` every few ticks for testing

---

## 🧪 Stretch Goal (Optional Next Session)
- Accept basic input via `std::getline()` in `controller_runner`
- Parse and emit real messages
  - `press 3 4`
  - `scram`

---

## 📁 Suggested Structure

```
simulation/
├── controller_runner.cpp
├── tickEngine.cpp/h
├── MessageBus.cpp/h
└── subsystems/
    └── coreSystem.cpp/h
```

---

