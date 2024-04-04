/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let ModelRunner, Point;
if (!window.Models) { window.Models = {}; }


const {
    Models
} = window;





////////////////////////////
// Class Point
////////////////////////////

Models.Point = (Point = class Point {
    constructor(index, position, runner) {
        try {
            this.index = index;
            this.position = position;
            this.runner = runner;
            this.ignition_time = Infinity; // ignition time
            this.extinguish_time = Infinity;
            this._param_cache = {};
        } catch (error) {
            console.error(`constructor Point: ${error.message}`);
        }
    }

    is_ignited(t0, t1) {
        try {
            let log_value = (this.ignition_time < t1) && (this.extinguish_time >= t1)
            console.log(`CALL is_ignited= ${log_value} +++ t0=${t0} +++ t1=${t1}+++ this.ignition_time=${this.ignition_time} +++ this.extinguish_time=${this.extinguish_time}`);
            return (this.ignition_time < t1) && (this.extinguish_time >= t1); //boolean type
            // original line: return (this.ignition_time < t1) && (this.extinguish_time >= t1); 
            // TODO #1 - I changed t1 to t0, need to be proofed 
        } catch (error) {
            console.error(`is_ignited Point: ${error.message}`);
        }
    }


    param(group_name, parameter) {
        try {

            console.log(`CALL param ${this.param}`);
            // lookup param from the cache
            let val = (this._param_cache[group_name] || (this._param_cache[group_name] = {}))[parameter];
            if (val) { return val; }

            const group = this.runner.parameters[group_name];
            if (group.data) {
                // needs grid lookup

                // calculate index of this point in 1D array
                if (!this._array_index) { this._array_index = (this.index.y * this.runner.parameters.EXTENTS.x) + this.index.x; }

                // lookup point value in grid
                val = group.data[this._array_index];
            }


            // access parameter directly
            if (!val) { val = group[parameter]; }

            if (group.lookup) {
                if (!val) { val = 1; }
                // needs table lookup
                val = group.lookup[val];
                if (val) {
                    val = val[parameter];
                }
            }

            // We can't use null in ArrayBuffers since null==0, therefore missing param values are represented by -Infinity
            if (val === -Infinity) {
                val = null;
            } else {
                val = parseFloat(val);
            }

            return this._param_cache[group_name][parameter] = val;

        } catch (error) {
            console.error(`param Point: ${error.message}`);
        }
    }

    clean() {
        try {
            console.log(`CALL clean ${this.clean}`);
            this._param_cache = null;
            return this.runner = null;
        } catch (error) {
            console.error(`clean Point: ${error.message}`);
        }
    }
});




////////////////////////////
// Class ModelRunner
////////////////////////////

Models.ModelRunner = (ModelRunner = class ModelRunner {

    constructor() {
        try {
            this.spread_rate_model = new Models.SimpleSpreadRateModel
            this.propagation_model = new Models.EllipticalPropagationModel
            this.burn_model = new Models.SimpleBurnModel
            this.grid = null;

            this.t0 = 0;
            this.t_index = 0;

            this.parameters = {
                EXTENTS: { x: 10, y: 10 },
                RESOLUTION: { x: 1, y: 1, t: 1 },
                SIMULATION: { steps: 15 },
                TOPOGRAPHY: { flat: true }
            }
        } catch (error) {
            console.error(`constructor ModelRunner: ${error.message}`);
        }
    }

    neighbours(point) {
        try {
            console.log("CALL neughbours");

            if (point.neighbours) { return point.neighbours; }
            const neighbour = (x, y) => {
                if ((x < 0) || (y < 0) || (x >= this.parameters.EXTENTS.x) || (y >= this.parameters.EXTENTS.y)) { return null; }
                return this.grid[y][x];
            };

            point.neighbours = [];

            for (let y = -1, asc = -1 <= 1; asc ? y <= 1 : y >= 1; asc ? y++ : y--) {
                for (let x = -1, asc1 = -1 <= 1; asc1 ? x <= 1 : x >= 1; asc1 ? x++ : x--) {
                    var n;
                    if ((x === 0) && (y === 0)) { continue; }
                    if (n = neighbour(point.index.x + x, point.index.y + y)) {
                        point.neighbours.push(n);
                    }
                }
            }
            return point.neighbours;
        } catch (error) {
            console.error(`neighbours ModelRunner: ${error.message}`);
        }
    }


    progress(progress_callback) {
        try {
            return this.progress_callback = progress_callback;
        } catch (error) {
            console.error(`progress ModelRunner: ${error.message}`);
        }
    }

    report_progress(message, progress) {
        try {
            if (!this.progress_callback) { return; }
            return this.progress_callback({ message, progress });
        } catch (error) {
            console.error(`report_progress ModelRunner: ${error.message}`);
        }
    }

    init() {
        try {

            console.log(`CALL init`);
            try {
                this.report_progress("Initialising model", 0);
                // initialize the grid
                this.report_progress("Initialising grid", 0);
                console.log(`report: ${this.report_progress()}`);
                console.log(`Extents: ${JSON.stringify(this.parameters.EXTENTS)}`);
                console.log(`Resolution: ${JSON.stringify(this.parameters.RESOLUTION)}`);
                this.grid = (
                    __range__(0, this.parameters.EXTENTS.y - 1, true).map((y) => (
                        __range__(0, this.parameters.EXTENTS.x - 1, true).map((x) => new Point(
                            { x, y },
                            { x: x * this.parameters.RESOLUTION.x, y: y * this.parameters.RESOLUTION.y, z: 0.0 },
                            this
                        ))
                    ))
                );

                /*
                console.log("+++ grid LOGs in init() +++"); // only for debugging
                console.log("number of objects in the grid: " + this.grid.length * this.grid[0].length);
                console.log("first line in grid: " + this.grid[0]);
                console.log("first point in grid: " + this.grid[0][0]);
                console.log("first index in grid: " + JSON.stringify(this.grid[0][0].index));
                console.log("first position in grid: " + JSON.stringify(this.grid[0][0].position));
                console.log("first runner in grid: " + this.grid[0][0].runner);
                console.log("first ignition_time in grid: " + JSON.stringify(this.grid[0][0].ignition_time));
                console.log("first extinguish_time in grid: " + JSON.stringify(this.grid[0][0].extinguish_time));
                console.log("first _param_cache in grid: " + JSON.stringify(this.grid[0][0]._param_cache));
                console.log("first spread_rate in grid: " + JSON.stringify(this.grid[0][0].spread_rate));
                */

                return this.grid
            } catch (error) {
                console.error(`${error.message}`);
            }
        } catch (error) {
            console.error(`init ModelRunner: ${error.message}`);
        }
    }

    step() {
        try {
            console.log("CALL step");
            // calculate end of timestep
            let from_point, x, y;
            let asc2, end2;
            let asc4, end4;
            const t1 = this.t0 + this.parameters.RESOLUTION.t;

            const progress = (100.0 * this.t_index) / this.parameters.SIMULATION.steps;
            console.log(`log progress: ${progress}`);

            this.report_progress(`Step ${this.t_index} - starting calculation for time ${this.t0}`, progress);
            // calculate everything for time step t

            // calculate spread rate
            this.report_progress(`Step ${this.t_index} - Calculating spread rate`, progress);

            if (this.t_index === 0) {
                let asc, end;
                for (y = 0, end = this.parameters.EXTENTS.y - 1, asc = 0 <= end; asc ? y <= end : y >= end; asc ? y++ : y--) {
                    var asc1, end1;
                    for (x = 0, end1 = this.parameters.EXTENTS.x - 1, asc1 = 0 <= end1; asc1 ? x <= end1 : x >= end1; asc1 ? x++ : x--) {
                        this.spread_rate_model.calculate_spread_rate(this.grid[y][x], this.t0, this.t0 + this.parameters.RESOLUTION.t);
                    }
                }
            }

            // propagate fire
            this.report_progress(`Step ${this.t_index} - Propagating fire`, progress);

            // build a list of all points that are ignited before t1
            const ignited = [];

            for (y = 0, end2 = this.parameters.EXTENTS.y - 1, asc2 = 0 <= end2; asc2 ? y <= end2 : y >= end2; asc2 ? y++ : y--) {
                var asc3, end3;
                for (x = 0, end3 = this.parameters.EXTENTS.x - 1, asc3 = 0 <= end3; asc3 ? x <= end3 : x >= end3; asc3 ? x++ : x--) { // x and y are the indices for from_point
                    from_point = this.grid[y][x];
                    if (from_point.is_ignited(this.t0, t1)) { ignited.push(from_point); }
                }
            }

            // ignited = _.sortBy(ignited, 'ignition_time')

            // now process the list of ignited points until there are none left
            let debug_loop_counter = 0 // only for debugging
            while (debug_loop_counter < 5) {//(ignited.length > 0) {
                debug_loop_counter++
                console.log(`CALL outer while-loop in step() +++ loop_counter: ${debug_loop_counter}`);
                from_point = ignited.shift(); // get first point in the list

                // TODO: this is a performance optimisation, but may lead to some aliasing artifacts. Should check if looking at the neighbours' neighbours makes it better. With the noise introduced by terrain and other variations, this should not have a noticable effect though...
                if (this.neighbours(from_point).every(function (neighbour) { return neighbour.ignition_time < this.t0; })) { continue; } // no reason to propagate if all points in the neighbourhood are already ignited

                // initial list of destination points to check for ignition
                const to_points = this.neighbours(from_point);

                const to_points_processed = [];

                while (to_points.length > 0) {
                    console.log("CALL inner while-loop in step() ");

                    const to_point = to_points.shift();

                    to_points_processed.push(to_point);

                    if (to_point.ignition_time < this.t0) { continue; } // to_point was already ignited in a previous timestep
                    // stop processing if we're too far away from the ignition point
                    // TODO: replace arbitrary distance with something derived from model resolution?
                    if (Math.sqrt(Math.pow((to_point.index.x - from_point.index.x), 2) + Math.pow((to_point.index.y - from_point.index.y), 2)) > 10) { continue; }

                    const arrival_time = this.propagation_model.calculate_arrival_time(from_point, to_point, this.t0, t1, this.parameters.TOPOGRAPHY['flat']);
                    if (arrival_time < to_point.ignition_time) {
                        to_point.ignition_time = arrival_time;
                        // process the to_point (again) and its neighbourhood if it ignites in this time step and is not already in the queue
                        if (arrival_time < t1) {
                            if (!Array.from(ignited).includes(to_point)) { ignited.push(to_point); }
                            for (let neighbour of Array.from(this.neighbours(to_point))) {
                                if (!neighbour.is_ignited(this.t0, t1) && (!Array.from(to_points).includes(neighbour)) && (!Array.from(to_points_processed).includes(neighbour))) { to_points.push(neighbour); }
                            }
                        }
                    }
                }
            }

            // calculate effects of burning
            this.report_progress(`Step ${this.t_index} - Simulating burn`, progress);
            for (y = 0, end4 = this.parameters.EXTENTS.y - 1, asc4 = 0 <= end4; asc4 ? y <= end4 : y >= end4; asc4 ? y++ : y--) {
                var asc5, end5;
                for (x = 0, end5 = this.parameters.EXTENTS.x - 1, asc5 = 0 <= end5; asc5 ? x <= end5 : x >= end5; asc5 ? x++ : x--) {
                    const point = this.grid[y][x];
                    if (!point.is_ignited(this.t0, t1)) { continue; }
                    this.burn_model.simulate_burn(point, this.t0, t1, this.parameters.RESOLUTION.t);
                }
            }




            // advance time
            this.t0 = t1;
            this.t_index += 1;

            return this.report_progress(`Time step ${this.t_index} for time ${this.t0} complete`, progress);
        } catch (error) {
            console.error(`step ModelRunner: ${error.message}`);
        }
    }
});



/**
 * function __range__ outside a class
 * This function generates a numerical range.
 * @param {number} left  - The left boundary of the interval (inclusive).
 * @param {number} right - The right boundary ... (exclusive by default).
 * @param {boolean} [inclusive=false] - Whether to include the right boundary as well.
 * @returns {number[]} Array containing the numbers within specified range.
 */
function __range__(left, right, inclusive) {
    try {

        let range = [];
        let ascending = left < right;
        let end = !inclusive ? right : ascending ? right + 1 : right - 1;
        for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
            range.push(i);
        }
        return range;
    } catch (error) {
        console.error(`__range__ ModelRunner: ${error.message}`);
    }
}