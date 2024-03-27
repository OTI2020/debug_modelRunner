
try {
    const runner = new Models.ModelRunner();
    runner.init();
    let counter = 0
    function runSimulation() {
        console.log(counter);
        runner.step();
        // Check for termination condition (e.g., number of steps)
        counter++
        final_step = runner.parameters.SIMULATION.steps
        console.log(`final_step = ${final_step}`);
        if (counter < 5) {
            runSimulation();
        }
    }
    runSimulation()
} catch (error) {
    console.error(`Error in html script: ${error.message}`);
}