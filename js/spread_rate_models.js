/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let CheneySpreadRateModel, McArthurSpreadRateModel, SimpleSpreadRateModel;
if (!window.Models) { window.Models = {}; }


// Simple spread rate model used for testing. Will set the spread rate to a constant.
window.Models.SimpleSpreadRateModel = (SimpleSpreadRateModel = class SimpleSpreadRateModel {

    constructor() {
        this.spread_rate = 100.0;
    }

    calculate_spread_rate(point, t0, t1) {
        try {
            console.log("CALL calculate_spread_rate in SimpleSpreadRateModel");
            // r = Math.random()

            // point.theta = if t0 < 250 then 0 else Math.PI / 2.0
            // point.forward_spread_rate = (0.3 + r*0.6) * 3
            // point.flanking_spread_rate = (0.1 + r*0.2) * 3

            point.theta = 0;
            return point.spread_rate = 2;
        } catch (error) {
            console.error(`calculate_spread_rate SimpleSpreadRateModel: ${error.message}`);
        }

    }
});



//////////////////////////////////
// Class McArthurSpreadRateModel
//////////////////////////////////

/**
 * @class 
 * @name McArthurSpreadRateModel
 * @description This class implements the McArthur fire spread rate model for calculating the fire spread rate at a point in the landscape grid.

 * @constructor
 * @param {Object} [parameters] - Optional configuration parameters for the model.

 * @function
 * @name calculate_spread_rate
 * @description Calculates the fire spread rate at a point within a specific time range.
 * @param {Models.Point} point - The point for which to calculate the spread rate.
 * @param {number} t0 - The start time of the range.
 * @param {number} t1 - The end time of the range.
 * @returns {void}
 */
window.Models.McArthurSpreadRateModel = (McArthurSpreadRateModel = class McArthurSpreadRateModel {

    calculate_spread_rate(point, t0, t1) {
        try {

            const kbdi = 150 // HARD CODED
            // const kbdi = point.param('VEGETATION', 'KBDI');////////////////////// ORIGINAL LINE

            if (!kbdi) { return; }

            const p = 5 // HRAD CODED
            // const p = point.param('RAIN', 'precipitation'); ////////////////////// ORIGINAL LINE
            const n = 14 // HARD CODED
            // const n = point.param('RAIN', 'days_since_rain'); ////////////////////// ORIGINAL LINE

            const d1 = (0.191 * (kbdi + 104) * Math.pow(n + 1, 1.5));
            const d2 = (((3.52 * Math.pow(n + 1, 1.5)) + p) - 1);

            const d = d1 / d2;
            //d = Math.min(d, 10.0)

            const u = 50 // HARD CODED
            // const u = point.param('WIND', 'speed_2m'); ////////////////////// ORIGINAL LINE

            const rh = 50 // HARD CODED
            // const rh = point.param('ATMOSPHERE', 'humidity'); ////////////////////// ORIGINAL LINE
            const t = 35 // HARD CODED
            // const t = point.param('ATMOSPHERE', 'temperature'); ////////////////////// ORIGINAL LINE
            const mc = (5.658 + (0.04651 * rh) + ((0.0003151 * Math.pow(rh, 3)) / t)) - (0.185 * Math.pow(t, 0.77));
            const ffdi = 34.81 * Math.exp(0.987 * Math.log(d)) * Math.pow(mc, -2.1) * Math.exp(0.0234 * u);

            // fuel load
            const w = 1 // HARD CODED
            // const w = point.param('VEGETATION', 'w'); ////////////////////// ORIGINAL LINE

            return point.spread_rate = 0.0012 * ffdi * w;

        } catch (error) {
            console.error(`calculate_spread_rate McArthurSpreadRateModel ${error.message}`);
        }
    }
});


//////////////////////////////////
// Class CheneySpreadRateModel
//////////////////////////////////

/**
 * @class CheneySpreadRateModel
 * @description This class implements the Cheney spread rate model for calculating the fire spread rate at a point in the landscape grid.

 * @constructor
 * @param {Object} [parameters] - Optional configuration parameters for the model.

 * @function
 * @name calculate_spread_rate
 * @description Calculates the fire spread rate at a point within a specific time range.
 * @param {Models.Point} point - The point for which to calculate the spread rate.
 * @param {number} t0 - The start time of the range.
 * @param {number} t1 - The end time of the range.
 * @returns {void}
 */ 
window.Models.CheneySpreadRateModel = (CheneySpreadRateModel = class CheneySpreadRateModel {

    calculate_spread_rate(point, t0, t1) {
        try {

            const grazing = 0 // HARD CODED
            // const grazing = point.param('VEGETATION', 'grazing'); ////////////////////// ORIGINAL LINE


            if (grazing == null) { return; }

            const u = 50 // HRAD CODED
            // const u = point.param('WIND', 'speed_2m'); ////////////////////// ORIGINAL LINE

            const c = 100 // HARD CODED
            // const c = point.param('VEGETATION', 'C'); ////////////////////// ORIGINAL LINE

            const mc = 1.0 // HARD CODED
            // const mc = point.param('VEGETATION', 'FMC'); ////////////////////// ORIGINAL LINE


            const dm = mc < 12 ?
                Math.exp(-0.108 * mc)
                : u < 10 ?
                    0.684 - (0.0342 * mc)
                    :
                    0.547 - (0.0228 * mc);

            const dc = c < 20 ?
                1.12 / (1 + (59.2 * Math.exp(-0.124 * (c - 50))))
                :
                1.036 / (1 + (103.99 * Math.exp(-0.0996 * (c - 20))));

            const r = (() => {
                switch (grazing) {
                    case 0: // Rn
                        if (u < 5) {
                            return (0.054 + (0.269 * u)) * dm * dc;
                        } else {
                            return (1.4 + (0.838 * Math.pow(u - 5, 0.844))) * dm * dc;
                        }
                    case 1: // Rcu
                        if (u < 5) {
                            return (0.054 + (0.209 * u)) * dm * dc;
                        } else {
                            return (1.1 + (0.715 * Math.pow(u - 5, 0.844))) * dm * dc;
                        }
                    case 2: // Re
                        if (u < 5) {
                            // use the same as for grazed pastures
                            return (0.054 + (0.209 * u)) * dm * dc;
                        } else {
                            return (0.55 + (0.357 * Math.pow(u - 5, 0.844))) * dm * dc;
                        }
                }
            })();

            return point.spread_rate = r;
        } catch (error) {
            console.error(`calculate_spread_rate CheneySpreadRateModel ${error.message}`);
        }
    }
});
