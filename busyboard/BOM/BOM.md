# Bill of Materials (BOM) — The Fidget Reactor

> **Project Phase:** In-silico design and test harness mapping
> 
> This file tracks the evolving hardware plan for The Fidget Reactor — a tactile simulation panel integrating buttons, lights, displays, and analog controls. The BOM is versioned alongside source code and should reflect only parts likely to exist in the final real-world build.

---

## 🔲 Display & Indicator Components

| Qty | Component                            | Details & Notes |
|-----|--------------------------------------|------------------|
| 10  | Large 4-color indicator panels       | Top row and middle status panel (POWER, TRANS, etc). Possibly addressable RGB LEDs or discrete lights. |
| 12  | 7-segment single-digit LED displays  | For NORTH, SOUTH, EAST, WEST grid indicators and capacitors A/B. TM1637, MAX7219, or custom driver. |
| 36  | 4-color LEDs (control rods)          | Arranged 6x6, driven independently. Possibly bi/tri-color LEDs or RGB with software control. |

---

## 🔘 Input Components

| Qty | Component                          | Details & Notes |
|-----|------------------------------------|------------------|
| 1   | Master power button (momentary)    | Main power control. Circular with illumination. Edge-triggered. |
| 1   | SCRAM button (toggle / E-stop)     | Emergency shutdown. Latching or toggle-type. |
| 45  | Fuel rod buttons (momentary)       | 6x6 matrix + extras. Each has 4-color feedback. Debounced in software or using matrix logic. |
| 4   | Toggle switches                    | 2x CAP toggles (A/B), 2x ROD GRP toggles. SPDT or DPDT physical hardware. |

---

## 📊 Analog/Visual Indicators

| Qty | Component                          | Details & Notes |
|-----|------------------------------------|------------------|
| 2   | Vertical LED bars (20-segment)     | Therm peak and Pressure indicators. Software-controlled linear progression. |
| 2   | Sliders (fader-style)              | THERM SET and PUMP SET. Analog input via potentiometers. |
| 2   | Needle gauges                      | Thermal Mean and Turbine RPM. Possibly driven by PWM-controlled servos or analog voltmeters (TBD). |

---

## 🧠 Microcontrollers & Coordination

| Qty | Component                          | Details & Notes |
|-----|------------------------------------|------------------|
| 1   | ESP32 (main controller)            | WiFi/BT capable, SPI/I2C/UART master. Central coordinator of subsystems. Supports OTA firmware updates for ease of development and long-term maintainability. |
| TBD | ATtiny or ATmega peripherals       | For input matrices, LED drivers, or segment displays. Modular per subsystem (CORE, CTRL, etc). |
| 1   | Custom PCB + breakout boards       | Centralized base board plus connections to breakouts. Routing TBD. |

---

## 🔌 Buses, Power, and Wiring

| Type         | Usage & Notes |
|--------------|---------------|
| I²C          | Ideal for low-speed, addressable subsystems: sliders, toggle switches, LED bar drivers. Keep device count limited per bus to avoid latency. |
| SPI          | Best for high-throughput LEDs (RGB panels, 7-segments). Dedicated lines per subsystem to reduce wiring congestion. |
| UART         | Use for debug or isolated ATtiny subsystems (e.g. SCRAM logic or turbine gauge servo). |
| GPIO expanders | MCP23017 for button grids, control rod LEDs. Consider one per subsystem to simplify wiring. |
| Power rails  | 3.3V for logic (ESP/ATtiny), 5V for displays/LEDs. Use a central buck regulator module (e.g. MP1584) and distribute via wide trace or power rail under panel. |

**Layout Notes:**
- Mount ESP32 and voltage regulators centrally, under the SCRAM/master button cluster.
- Route SPI/I²C buses radially to each edge cluster (e.g. fuel rod grid, grid displays, top panel).
- Break LED and button groups into physical/functional clusters to reduce connector count.
- Consider layered vertical PCBs for tall sections (needle gauges, LED bars) to avoid deep wire routing.

---

## 💰 Estimated Raw Component Cost (No Assembly)

| Component                            | Qty | Est. Unit Price | Subtotal |
|--------------------------------------|-----|-----------------|----------|
| Large 4-color LED panels             | 10  | $5.00           | $50.00   |
| 7-segment single digit LED displays | 12  | $1.25           | $15.00   |
| 4-color LEDs (control rods)         | 36  | $0.75           | $27.00   |
| Fuel rod buttons w/ LED caps        | 45  | $2.50           | $112.50  |
| Toggle switches (SPDT)              | 4   | $1.50           | $6.00    |
| Master power button (momentary)     | 1   | $3.00           | $3.00    |
| SCRAM toggle / e-stop               | 1   | $6.00           | $6.00    |
| Vertical LED bar indicators         | 2   | $4.50           | $9.00    |
| Fader-style sliders                 | 2   | $3.00           | $6.00    |
| Large needle gauges (servo or analog)| 2  | $7.00           | $14.00   |
| ESP32 dev board                     | 1   | $8.00           | $8.00    |
| ATtiny / ATmega boards              | ~6  | $3.00           | $18.00   |
| Misc passives / resistors / LEDs    | —   | —               | $10.00   |
| PCB fabrication (basic 2-layer)     | 1   | $20.00          | $20.00   |

**Estimated Total: ~$304.50 USD**

---

## 📌 Notes

- Fuel rod buttons and LEDs should be visually integrated — consider concentric light rings.
- Plan early for power draw from LED clusters and segment displays.
- Consider combining vertical LED bars using pre-binned strips or matrix drivers.
- Bus layout should minimize contention and bottlenecks — subdivide by subsystem.
- SPI for all display and LED logic; I²C or GPIO expanders for controls; UART only for isolated subsystems.
- Use PCB-mounted JST connectors per cluster to simplify wiring and assembly.

---

_Last updated: April 15, 2025_

