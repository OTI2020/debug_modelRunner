let SimpleBurnModel;
if (!window.Models) { window.Models = {}; }


/**
 * @class 
 * @name SimpleBurnModel
 * @description This class implements a simple model for simulating the burning process of a point in the landscape grid.
 * 
 * 
 * @constructor
 * @param {number} [burn_time=1] - The base duration (in time steps) for a point to burn completely (default is 1).
 * 
 * 
 * @function
 * @name simulate_burn
 * @description Simulates the burning process of a point within a specific time range.
 * @param {Models.Point} point - The point to be simulated.
 * @param {number} t0 - The start time of the range.
 * @param {number} t1 - The end time of the range.
 * @param {number} t_resolution - The time resolution of the simulation (time per step).
 * @returns {void}
 */  
window.Models.SimpleBurnModel = (SimpleBurnModel = class SimpleBurnModel {

    constructor() {
        this.burn_time = 1;
    }
    simulate_burn(point, t0, t1, t_resolution) {
        try {
            if (!point.is_ignited(t0, t1)) {
                return;
            }
            point.fuel_load || (point.fuel_load = this.burn_time);
            point.fuel_load = point.fuel_load - 1;
            if (point.fuel_load === 0) {
                return point.extinguish_time = point.ignition_time + this.burn_time * t_resolution;
            }
        } catch (error) {
            console.error(`simulate_burn SimpleBurn;odel: ${error.message}`);
        }
    }
})
