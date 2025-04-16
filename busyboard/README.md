# The-Fidget-Reactor
Porting of The-Reactor to hardware
# The Fidget Reactor

**The Fidget Reactor** is a tactile control panel simulation project designed to emulate a richly interactive industrial interface. The system is built around a playful, cryptic experience of interacting with lights, buttons, meters, gauges, and switches that respond to internal state machines — all modeled to reflect plausible physical dynamics.

---

## 🧠 Project Purpose
The goal is to simulate an entire hardware control panel *in software first* — modeling all controls and visual feedback mechanisms as realistically as possible before real-world hardware is built. The project emphasizes:

- **C++ system simulation**, portable to embedded systems like ESP32 and ATtiny
- A **React frontend test interface** that mirrors real hardware layouts
- Event-driven messaging between UI and simulation layers
- Future portability to actual physical control panels with minimal firmware changes

---

## 🧪 Current Phase: Software-Only Simulation
- **100% virtual hardware environment**
- C++ modules simulate all component behaviors (buttons, displays, state machines)
- React UI acts as a virtual panel with minimal abstraction from real-world IO
- Designed for **portability to microcontrollers**, with early attention to bus structure, update loops, and OTA compatibility

---

## 🔩 Planned Hardware Integration
The software simulation is preparing for seamless deployment to:
- **ESP32 main controller** (WiFi, OTA, SPI/I2C master)
- Multiple **ATtiny/ATmega peripherals**
- A matrix of real buttons, LEDs, analog sensors, and displays

All hardware decisions are being informed by the in-silico test platform — see `BOM.md` for the evolving parts list.

---

## 🔧 Key Technologies
- C++ core simulation (designed to be embedded-friendly)
- React (test interface in browser)
- Custom event bus system
- Planning for SPI, I²C, and UART message routing

---

## 🗺️ Status
- ✅ Simulation harness working in browser
- ✅ Button logic, test sequences, and lighting simulations functional
- 🧪 Bus design under evaluation
- 🔜 Physical prototyping pending software maturity

---

_This README will expand as the system gains physical form._

