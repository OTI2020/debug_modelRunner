timer()
var start
var time
function test_run() {
    start = performance.now();
    const runner = new Models.ModelRunner();
    console.log(`init ModelRunner: ${JSON.stringify(runner, null, 10)}`)
    runner.init()
    runner.step()
    time = performance.now();
    console.log('Dauer: ' + (time - start) + ' ms.');
    console.clear();
}


function timer() {
    var runtimes = [];

    for (var i = 0; i < 100; i++) {
        test_run();
        runtimes.push(time - start);
    }

    console.log('list of runtimes:');
    const csvString = runtimes.join(",");
    console.log(csvString);
    console.log(runtimes);
}


/*
console.time();
try {
    const runner = new Models.ModelRunner();
    console.log(`init ModelRunner: ${JSON.stringify(runner, null, 10)}`)
    runner.init();
    runner.step() // how many times to calls this function???
    console.log("+++ LOGs in index.js +++");
    console.log("number of objects in the grid: " + runner.grid.length * runner.grid[0].length )
    // console.log("first line in grid: " + runner.grid) //[0]);
    console.log("first point in grid: " + runner.grid[0][0]);
    console.log("first index in grid: " + JSON.stringify(runner.grid[0][0].index));
    console.log("first position in grid: " + JSON.stringify(runner.grid[0][0].position));
    console.log("first runner in grid: " + runner.grid[0][0].runner);
    console.log("first ignition_time in grid: " + JSON.stringify(runner.grid[0][0].ignition_time));
    console.log("first extinguish_time in grid: " + JSON.stringify(runner.grid[0][0].extinguish_time));
    console.log("first _param_cache in grid: " + JSON.stringify(runner.grid[0][0]._param_cache));
    console.log("first spread_rate in grid: " + JSON.stringify(runner.grid[0][0].spread_rate));
    console.log("first neighbours in grid: " + JSON.stringify(runner.grid[0][0].neighbours));
    
} catch (error) {
    console.error(`Error in html script: ${error.message}`);
}
console.timeEnd();
*/