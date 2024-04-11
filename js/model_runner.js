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
/**
 * @class 
 * @name Point
 * @description This class represents a single point (cell) within the simulated landscape grid.
 * 
 * 
 * @constructor
 * @param {Object} index - The index of the point within the grid (x, y coordinates).
 * @param {Object} position - The real-world position of the point (x, y, z coordinates).
 * @param {ModelRunner} runner - The ModelRunner instance this point belongs to.
 * @property {Object} index - The index of the point within the grid (x, y coordinates).
 * @property {Object} position - The real-world position of the point (x, y, z coordinates).
 * @property {ModelRunner} runner - The ModelRunner instance this point belongs to.
 * @property {number} ignition_time - The time step at which the point ignites (Infinity initially).
 * @property {number} extinguish_time - The time step at which the point extinguishes (Infinity initially).
 * @property {Object} _param_cache - An internal cache to store retrieved parameter values.
 * 
 * 
 * @function
 * @name is_ignited
 * @description Checks if the point is ignited within a specific time range.
 * @param {number} t0 - The start time of the range.
 * @param {number} t1 - The end time of the range.
 * @returns {boolean} True if the point is ignited within the specified time range, false otherwise.
 * 
 * 
 * @function
 * @name param
 * @description Retrieves a parameter value for the point from the model configuration.
 * @param {string} group_name - The name of the parameter group.
 * @param {string} parameter - The name of the specific parameter within the group.
 * @returns {number|null} The parameter value for the point, or null if not found.
 * 
 * 
 * @function
 * @name clean
 * @description Clears the internal parameter cache of the point.
 * @returns {void}
 */
Models.Point = (Point = class Point {
    constructor(index, position, runner) {

        this.index = index;
        this.position = position;
        this.runner = runner;
        this.ignition_time = 0 // Infinity; // ignition time
        this.extinguish_time = 2 // Infinity;
        this._param_cache = {};

    }

    is_ignited(t0, t1) {

        let log_value = (this.ignition_time < t1) && (this.extinguish_time >= t1)
        // console.log(`CALL in Point: is_ignited = ${log_value} +++ t0 = ${t0} +++ t1 = ${t1}+++ this.ignition_time = ${this.ignition_time} +++ this.extinguish_time=${this.extinguish_time}`);
        return (this.ignition_time < t1) && (this.extinguish_time >= t1); //boolean type
        // original line: return (this.ignition_time < t1) && (this.extinguish_time >= t1); 
        // TODO #1 - I changed t1 to t0, need to be proofed 

    }


    param(group_name, parameter) {
        try {

            // lookup param from the cache
            let val = (this._param_cache[group_name] || (this._param_cache[group_name] = {}))[parameter];
            console.log(`CALL param: val = ${val}`);

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
            console.error(`TRYCATCH: param() in ModelRunner: ${error.message}`);
        }
    }

    clean() {
        console.log(`CALL clean ${this.clean}`);
        this._param_cache = null;
        return this.runner = null;

    }
});




////////////////////////////
// Class ModelRunner
////////////////////////////
/**
 * @class ModelRunner
 * @description This class simulates the spread of fire across a grid-based landscape.
 * 
 * 
 * @constructor
 * @param {Object} [parameters] - An optional configuration object for the simulation.
 * @property {Object} parameters - The simulation parameters.
 * @property {Object} parameters.EXTENTS - The extent of the simulated landscape (width and height in number of cells).
 * @property {Object} parameters.RESOLUTION - The resolution of the simulation grid (cell size in x, y, and time dimensions).
 * @property {Object} parameters.SIMULATION - The simulation settings (number of timesteps).
 * @property {Object} parameters.TOPOGRAPHY - Options related to the simulated topography (currently supports a flat surface only).
 * @property {Models.SimpleSpreadRateModel} spread_rate_model - An instance of the spread rate model used in the simulation.
 * @property {Models.EllipticalPropagationModel} propagation_model - An instance of the propagation model used in the simulation.
 * @property {Models.SimpleBurnModel} burn_model - An instance of the burn model used in the simulation.
 * @property {Array<Array<Point>>} grid - A 2D array representing the simulated landscape grid.
 * @property {number} t0 - The current time step (initial time is 0).
 * @property {number} t_index - The current time step index (starts from 0).
 * 
 * 
 * @function
 * @name neighbours
 * @description Calculates the neighbouring points around a given point in the grid.
 * @param {Point} point - The point for which to find neighbours.
 * @returns {Array<Point>} An array containing the neighbouring points.
 * 
 * 
 * @function
 * @name progress
 * @description Sets a callback function to receive progress updates during the simulation.
 * @param {function} progress_callback - The callback function to be called with progress updates.
 * 
 * 
 * @function
 * @name report_progress
 * @description Sends a progress update message with an optional progress value to the callback function (if set).
 * @param {string} message - The progress update message.
 * @param {number} [progress] - The progress value (between 0 and 100).
 * 
 * 
 * @function
 * @name init
 * @description Initializes the simulation grid and models.
 * @returns {Array<Array<Point>>} The initialized grid.
 * 
 * 
 * @function
 * @name step
 * @description Executes one time step of the simulation, advancing the fire spread and burn effects.
 * @returns {string} A progress message indicating the completion of the time step.
 */
Models.ModelRunner = (ModelRunner = class ModelRunner {
    constructor() {

        this.spread_rate_model = new Models.SimpleSpreadRateModel
        this.propagation_model = new Models.EllipticalPropagationModel
        this.burn_model = new Models.SimpleBurnModel
        this.grid = null;

        this.t0 = 0;
        this.t_index = 0;

        this.parameters = {
            EXTENTS: { x: 5, y: 5 },
            RESOLUTION: { x: 1, y: 1, t: 1 },
            SIMULATION: { steps: 15 },
            TOPOGRAPHY: { flat: true }
        }
        /*} catch (error) {
            console.error(`constructor ModelRunner: ${error.message}`);
        }*/
        console.log("log in constructor of Point: t0 = " + this.t0);

    }


    neighbours(point) {
        //try {
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
        /*} catch (error) {
            console.error(`neighbours ModelRunner: ${error.message}`);
        }*/
    }


    progress(progress_callback) {
        // try {
        return this.progress_callback = progress_callback;
        /*} catch (error) {
            console.error(`progress ModelRunner: ${error.message}`);
        }*/
    }

    report_progress(message, progress) {
        //try {
        if (!this.progress_callback) { return; }
        return this.progress_callback({ message, progress });
        /*} catch (error) {
            console.error(`report_progress ModelRunner: ${error.message}`);
        }*/
    }

    init() {
        //try {

        console.log(`CALL init`);
        //try {
        this.report_progress("Initialising model", 0);
        // initialize the grid
        this.report_progress("Initialising grid", 0);
        console.assert(`report: ${this.report_progress()}`);
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
        /*} catch (error) {
            console.error(`${error.message}`);
        }*/
        /*} catch (error) {
            console.error(`init ModelRunner: ${error.message}`);
        }*/
    }

    step() {
        //try {
        console.log("CALL step");
        // calculate end of timestep
        let from_point, x, y;
        let asc2, end2;
        let asc4, end4;
        const t1 = this.t0 + this.parameters.RESOLUTION.t;
        console.log("log t1 = " + t1);

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
        console.log("ignited log: " + JSON.stringify(ignited));

        for (y = 0, end2 = this.parameters.EXTENTS.y - 1, asc2 = 0 <= end2; asc2 ? y <= end2 : y >= end2; asc2 ? y++ : y--) {
            var asc3, end3;
            for (x = 0, end3 = this.parameters.EXTENTS.x - 1, asc3 = 0 <= end3; asc3 ? x <= end3 : x >= end3; asc3 ? x++ : x--) { // x and y are the indices for from_point
                from_point = this.grid[y][x];
                if (from_point.is_ignited(this.t0, t1)) { ignited.push(from_point); }
            }
        }

        //ignited = sortBy(ignited, 'ignition_time')
        console.log(`log ignited: ${ignited}`);

        // now process the list of ignited points until there are none left

        /*} catch (error) {
            console.error(`before loops in step in ModelRunner: ${error.message}`);
        }
        try {*/
        console.log(`log ignited[0].ignition_time: ${ignited[0].ignition_time}`);
        console.log(`log ignited[99].ignition_time: ${ignited[99].ignition_time}`);
        console.log(`log ignited[49].ignition_time: ${ignited[49].ignition_time}`);

        let debug_loop_counter = 0 // only for debugging
        while (ignited.length > 0) {
            debug_loop_counter++
            console.log(`CALL outer while-loop in step() +++ loop_counter: ${debug_loop_counter}`);
            from_point = ignited.shift(); // get first point in the list

            // TODO: this is a performance optimisation, but may lead to some aliasing artifacts. Should check if looking at the neighbours' neighbours makes it better. With the noise introduced by terrain and other variations, this should not have a noticable effect though...
            let bypass_bug = this.t0
            console.log(`log error with reading t0: ${this.t0}`);
            if (this.neighbours(from_point).every(function (neighbour) { return neighbour.ignition_time < bypass_bug; })) { continue; } // no reason to propagate if all points in the neighbourhood are already ignited

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
        /*        } catch (error) {
            console.error(`loops in step in ModelRunner: ${error.message}`);
        }
        try {*/

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
        console.log(`log at the end of ModelRunner. t0=t1 = ${this.t0} = ${t1} +++ this.t_index ${this.t_index}`);

        return this.report_progress(`Time step ${this.t_index} for time ${this.t0} complete`, progress);
        /*} catch (error) {
            console.error(`step in ModelRunner: ${error.message}`);
        }*/
    }

});



/**
 * @function 
 * @name __range__ 
 * @description - This function outside a class generates a numerical range.
 * @param {number} left  - The left boundary of the interval (inclusive).
 * @param {number} right - The right boundary ... (exclusive by default).
 * @param {boolean} [inclusive=false] - Whether to include the right boundary as well.
 * @returns {number[]} Array containing the numbers within specified range.
 */
function __range__(left, right, inclusive) {
    let range = [];
    let ascending = left < right;
    let end = !inclusive ? right : ascending ? right + 1 : right - 1;
    for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
    }
    return range;
}