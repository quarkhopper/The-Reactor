#include <iostream>
#include <thread>
#include <chrono>
#include "tickEngine.h"

int main() {
    std::cout << "Starting Fidget Reactor simulation...\n";
    int tickCount = 0;

    while (tickCount < 10) {
        std::cout << "Tick " << tickCount << std::endl;
        tickEngine::tick();  // Simulate one reactor tick
        std::this_thread::sleep_for(std::chrono::milliseconds(1000)); // 1 second per tick
        tickCount++;
    }

    std::cout << "Simulation complete.\n";
    return 0;
}
