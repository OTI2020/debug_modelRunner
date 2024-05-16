// Start chain of function calls
console.time();

const runner = new Models.ModelRunner();
// console.log(`init ModelRunner: ${JSON.stringify(runner, null, 10)}`)
runner.init();
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???
runner.step() // how many times to calls this function???



///////////////////////////////////////////////////////
// Canvas - plot grid
///////////////////////////////////////////////////////
const cellWidth = 20; //pixel?
const cellHeight = 20;
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const threshold_5 = find_latest_ignition_time(runner.grid)

for (let i = 0; i < runner.grid.length; i++) {
    for (let j = 0; j < runner.grid[i].length; j++) {
        const x = j * cellWidth;
        const y = i * cellHeight;
        const value = runner.grid[j][i].ignition_time;

        // conditional coloring depending on ignition_time
        ctx.fillStyle = getColorForValue(value);
        // rectangle
        ctx.fillRect(x, y, cellWidth, cellHeight);
    }
}
// highlight ignition Points
for (let p = 0; p < runner.parameters.IGNITION_POINTS.length; p++) {
    const x = runner.parameters.IGNITION_POINTS[p].debug_x * cellWidth
    const y = runner.parameters.IGNITION_POINTS[p].debug_y * cellHeight
    ctx.fillStyle = '#FF0000'
    ctx.fillRect(x, y, cellWidth, cellHeight);
    console.log("runner.parameters.IGNITION_POINTS[p] " + runner.parameters.IGNITION_POINTS[p].debug_x + " / " + runner.parameters.IGNITION_POINTS[p].debug_y)
}

function getColorForValue(in_value) {
    // thresholds for 5 colors
    // thresholds are relative to the latest arrival time 
    // using golden ratio:
    // φ = (1 + √5) / 2 ≈ 1.618
    const PHI = (1 + Math.sqrt(5)) / 2;
    const threshold_4 = threshold_5 - (threshold_5 / PHI);
    const threshold_3 = threshold_4 - (threshold_4 / PHI);
    const threshold_2 = threshold_3 - (threshold_3 / PHI);
    const threshold_1 = threshold_2 - (threshold_2 / PHI);
    // console.log(`log thresholds: 1=${threshold_1}, 2=${threshold_2}, 3=${threshold_3}, 4=${threshold_4}, 5=${threshold_5}, `);

    if (0 <= in_value && in_value < threshold_1) {
        return '#B53302';
    } else if (threshold_1 <= in_value && in_value < threshold_2) {
        return '#E97D01';
    } else if (threshold_2 <= in_value && in_value < threshold_3) {
        return '#FCAC23';
    } else if (threshold_3 <= in_value && in_value < threshold_4) {
        return '#FECA64';
    } else if (threshold_4 <= in_value) {
        return '#FEDB9B';
    }
}

function find_latest_ignition_time(in_grid) {
    let latest_time = -Infinity;

    for (let i = 0; i < in_grid.length; i++) {
        for (let j = 0; j < in_grid[i].length; j++) {
            if (in_grid[i][j].ignition_time != Infinity && in_grid[i][j].ignition_time > latest_time) {
                latest_time = in_grid[i][j].ignition_time;
            }
        }
    }
    return latest_time;
}

var download = function () {
    const canvas = document.getElementById('myCanvas');
    if (!canvas) {
      console.error("Canvas element not found!");
      return;
    }
    var link = document.createElement('a');
    link.download = 'debug-ember-sim-test.png';
    link.href = canvas.toDataURL()
    link.click();
}
// download()










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