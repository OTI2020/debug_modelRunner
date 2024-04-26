/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let EllipticalPropagationModel, PropagationModel;
if (!window.Models) { window.Models = {}; }

/**
 * @class 
 * @name PropagationModel
 * /
window.Models.PropagationModel = (PropagationModel = class PropagationModel { }); //extends Models.Model



/**
 * @class 
 * @name EllipticalPropagationModel
 * @description This class implements a model for simulating elliptical fire propagation between two points in the landscape grid.
 * 
 * 
 * @extends PropagationModel
 * @see PropagationModel
 * 
 * 
 * @constructor
 * @param {Object} [parameters] - Optional configuration parameters for the model.
 * 
 * 
 * @function
 * @name calculate_arrival_time
 * @description Calculates the estimated arrival time of a fire front at a target point from a source point within a specific time range.
 * @param {Models.Point} from_point - The point where the fire originates.
 * @param {Models.Point} to_point - The target point where the fire arrival time is to be calculated.
 * @param {number} t0 - The start time of the range.
 * @param {number} t1 - The end time of the range.
 * @param {boolean} [flat=false] - A flag indicating a flat terrain (default is false).
 * @returns {number} The estimated arrival time of the fire front at the target point, or null if calculation fails.
 */
window.Models.EllipticalPropagationModel = (EllipticalPropagationModel = class EllipticalPropagationModel extends PropagationModel {

    calculate_arrival_time(from_point, to_point, t0, t1, flat) {
        try {
            if (flat == null) { flat = false; }
            if ((from_point.position.x === to_point.position.x) && (from_point.position.y === to_point.position.y)) { return from_point.ignition_time; }

            // also for less typing
            const xp = to_point.position.x;
            const yp = to_point.position.y;
            const x0 = from_point.position.x;
            const y0 = from_point.position.y;

            const xd = xp - x0;
            const yd = yp - y0;


            // adjust spread rate based on terrain and wind
            const slope = flat === true ? 0 : 1// HARD CODED // in degrees
            // const slope = flat === true ? 0 : from_point.param('SLOPE'); // in degrees /////////////////////// ORIGINAL LINE
            console.log(`slope is ${slope}`);
            if (slope == null) { return; }

            // TODO: use a better approximation for slope - there's some empirical exp() stuff somewhere
            const terrain_factor = (2.0 * slope) / 10.0; // based on firefighter's mannual - spread rate doubles for every 10 degrees of slope
            // theta = from_point.theta
            // aspect points in the direction of the downslope, need to rotate by 180
            const aspect = flat === true ? 180.0 : 0 + 180.0; // HARD CODED
            //const aspect = flat === true ? 180.0 : from_point.param('ASPECT') + 180.0; /////////////////////// ORIGINAL LINE
            const terrain_theta = (aspect * Math.PI) / 180.0;

            // after [Alexander 1985]
            const wind_speed = 40; // HARD CODED
            // const wind_speed = (from_point.param('WIND', 'speed_2m')); /////////////////////// ORIGINAL LINE
            const wind_factor = 1.0 + (0.00120 * Math.pow(wind_speed, 2.154));
            const wind_theta = (90 * Math.PI) / 180.0 + Math.PI; // HARD CODED
            // const wind_theta = ((from_point.param('WIND', 'angle') * Math.PI) / 180.0) + Math.PI; /////////////////////// ORIGINAL LINE

            const tx = terrain_factor * Math.cos(terrain_theta);
            const ty = terrain_factor * Math.sin(terrain_theta);

            const wx = wind_factor * Math.cos(wind_theta);
            const wy = wind_factor * Math.sin(wind_theta);

            const cx = tx + wx;
            const cy = ty + wy;

            let c = Math.sqrt(Math.pow(cx, 2) + Math.pow(cy, 2));
            let theta = Math.atan(cy / cx) - (Math.PI / 2.0);

            theta = cx > 0 ?
                cy > 0 ?
                    // Q1
                    theta
                    :
                    // Q4
                    theta + (2 * Math.PI)
                :
                // Q2 or Q3
                theta + Math.PI;

            // spread rate is in km/h, we need m/h
            let r = (from_point.spread_rate * 1000.0) / 60.0;

            // TODO HACK - this is to correct the ellipsis shape for high winds - need to find the problem with the algorithm!
            r = r / ((-0.0097 * wind_speed) + 1.0558);

            const forward_spread_rate = r;

            // spread rate models include wind effects, so we'll approximate the flanking (0-wind) spread rate
            const flanking_spread_rate = r / wind_factor;

            // for less typing...
            c = Math.cos(theta);
            const s = Math.sin(theta);

            const b = flanking_spread_rate;
            const bsq = Math.pow(b, 2);

            // calculate focus distance
            const f = (Math.pow(forward_spread_rate, 2) - bsq) / (2 * forward_spread_rate);
            const fsq = Math.pow(f, 2);

            // calculate major axis length from forward spread rate and focus
            const a = forward_spread_rate - f;
            const asq = Math.pow(a, 2);

            // transform the coordinate system
            const xs = (xd * c) + (yd * s);
            const ys = (-xd * s) + (yd * c);

            // solve quadratic equation
            const div = 1 - (fsq / asq);
            const p2 = ((2 * xs * f) / asq) / (2 * div);
            const q = - ((Math.pow(xs, 2) / asq) + (Math.pow(ys, 2) / bsq)) / div;

            let tarrival = - p2 + Math.sqrt(Math.pow(p2, 2) - q);
            // the second solution of the quadratic equation is physically irrelevant as it inverts the ellipsis
            // t2 = - p2 - Math.sqrt( p2**2 - q )

            // calculate slope between the two points
            const phi = Math.atan((1 - 1) / Math.sqrt(Math.pow(xd, 2) + Math.pow(yd, 2))); // HARD CODED
            // const phi = Math.atan((to_point.param('ELEVATION') - from_point.param('ELEVATION')) / Math.sqrt(Math.pow(xd, 2) + Math.pow(yd, 2))); /////////////////////// ORIGINAL LINE

            //tarrival = tarrival * (0.9+Math.random()*0.2)

            // correct for slope and initial ignition time
            tarrival = tarrival / Math.cos(phi);
            tarrival = from_point.ignition_time + tarrival;

            return tarrival;
        } catch (error) {
            console.error(`calculate_arrival_time EllipticalPropagationModel ${error.message}`);
        }
    }
});