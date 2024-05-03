// Start chain of function calls
console.time();

const runner = new Models.ModelRunner();
// console.log(`init ModelRunner: ${JSON.stringify(runner, null, 10)}`)
runner.init();
runner.step() // how many times to calls this function???

console.log("++++++++++++++++++++++++");
console.log("+++ LOGs in index.js +++");
console.log("++++++++++++++++++++++++");

console.log("number of objects in the grid: " + runner.grid.length * runner.grid[0].length)
// console.log("first line in grid: " + runner.grid) //[0]);
console.log("first point in grid: " + runner.grid[0][0]);
console.log("first index in grid: " + JSON.stringify(runner.grid[0][0].index));
console.log("first position in grid: " + JSON.stringify(runner.grid[0][0].position) + "(1/1) position in grid: " + JSON.stringify(runner.grid[1][1].position));
console.log("first runner in grid: " + JSON.stringify(runner.grid[0][0].runner.parameters));
console.log("first ignition_time in grid: " + JSON.stringify(runner.grid[0][0].ignition_time));
console.log("next ignition_time in grid: " + JSON.stringify(runner.grid[2][2].ignition_time));
console.log("last ignition_time in grid: " + JSON.stringify(runner.grid[4][4].ignition_time));
console.log("first extinguish_time in grid: " + JSON.stringify(runner.grid[0][0].extinguish_time));
console.log("first _param_cache in grid: " + JSON.stringify(runner.grid[0][0]._param_cache));
console.log("first spread_rate in grid: " + JSON.stringify(runner.grid[0][0].spread_rate));
console.log("first neighbours in grid: " + runner.grid[0][0].neighbours);

console.timeEnd();


/////////////
// fill each ignited cell of table with arrival time 
/////////////

// DOM interaction
function fill_table(in_list) {
    let debug_counter = 0
    for (let i = 0; i < in_list.length; i++) {
        // Code, der den Fehler auslösen kann
        let table_cell = document.getElementById(`x${in_list[i].index.x}y${in_list[i].index.y}`); // uses id of needed cell in the table
        let roundedNumber = Math.round(in_list[i].ignition_time * 1000) / 1000
        table_cell.textContent = roundedNumber  // in_list[i].id;

        debug_counter++
    }
    // set_color_thresholds(in_list)
}