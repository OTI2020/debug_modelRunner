// this might be illigal. I do not know.
// this Model is copied from the online Tool

let SimpleBurnModel;
if (!window.Models) { window.Models = {}; }

window.Models.SimpleBurnModel = (SimpleBurnModel = class SimpleBurnModel {

    constructor() {
        this.burn_time = 1;
    }
    simulate_burn(point, t0, t1, t_resolution) {
        if (!point.is_ignited(t0, t1)) {
            return;
        }
        point.fuel_load || (point.fuel_load = this.burn_time);
        point.fuel_load = point.fuel_load - 1;
        if (point.fuel_load === 0) {
            return point.extinguish_time = point.ignition_time + this.burn_time * t_resolution;
        }
    }
})