/**
 * One Euro Filter - Adaptive Signal Smoothing
 * Based on: https://gery.casiez.net/1euro/
 *
 * Advantages over Kalman:
 * - Adaptive: responds quickly to fast movements
 * - Stable: smooths effectively when idle
 * - No drift: maintains position without accumulated error
 * - Only 2 parameters to tune (minCutoff, beta)
 */
export class OneEuroFilter {
    /**
     * @param {number} minCutoff - Minimum cutoff frequency (higher = less smoothing)
     * @param {number} beta - Speed coefficient (higher = faster response to movement)
     * @param {number} dCutoff - Derivative cutoff frequency
     */
    constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
        this.minCutoff = minCutoff;
        this.beta = beta;
        this.dCutoff = dCutoff;
        this.xPrev = null;
        this.dxPrev = null;
        this.tPrev = null;
    }

    smoothingFactor(te, cutoff) {
        const r = 2 * Math.PI * cutoff * te;
        return r / (r + 1);
    }

    exponentialSmoothing(a, x, xPrev) {
        return a * x + (1 - a) * xPrev;
    }

    /**
     * Filter a value
     * @param {number} x - Raw input value
     * @param {number} timestamp - Current timestamp in ms
     * @returns {number} - Filtered value
     */
    filter(x, timestamp) {
        if (this.tPrev === null) {
            this.xPrev = x;
            this.dxPrev = 0;
            this.tPrev = timestamp;
            return x;
        }

        const te = (timestamp - this.tPrev) / 1000; // Convert to seconds
        if (te <= 0) return this.xPrev;

        // Estimate derivative
        const aD = this.smoothingFactor(te, this.dCutoff);
        const dx = (x - this.xPrev) / te;
        const dxHat = this.exponentialSmoothing(aD, dx, this.dxPrev);

        // Adaptive cutoff based on speed
        const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);

        // Filter signal
        const a = this.smoothingFactor(te, cutoff);
        const xHat = this.exponentialSmoothing(a, x, this.xPrev);

        // Store for next iteration
        this.xPrev = xHat;
        this.dxPrev = dxHat;
        this.tPrev = timestamp;

        return xHat;
    }

    reset() {
        this.xPrev = null;
        this.dxPrev = null;
        this.tPrev = null;
    }
}

/**
 * Simple Exponential Moving Average Filter
 * Used as fallback or for less demanding scenarios
 */
export class SimpleFilter {
    constructor(alpha = 0.3) {
        this.alpha = alpha;
        this.prev = null;
    }

    filter(x) {
        if (this.prev === null) {
            this.prev = x;
            return x;
        }
        this.prev = this.alpha * x + (1 - this.alpha) * this.prev;
        return this.prev;
    }

    reset() {
        this.prev = null;
    }
}
