/**
 * GestureDebugOverlay - Real-time gesture debugging overlay (April 2026)
 *
 * Shows live data from the active gesture mode:
 * - Raw vs filtered values
 * - Thresholds and boundaries
 * - Frame skip reasons (the critical missing diagnostic)
 * - Landmark visibility (body mode)
 * - Action history
 *
 * Activation: URL param ?gestureDebug=1 OR toggle in Config Panel
 */

export class GestureDebugOverlay {
    /**
     * @param {Object} gestureManager - GestureManager instance
     * @param {string|HTMLElement} container - Container selector or element
     */
    constructor(gestureManager, container) {
        this.manager = gestureManager;
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        this.isVisible = false;
        this.pollInterval = null;
        this.actionHistory = []; // ring buffer, max 5
        this.lastLane = 'center';
        this.lastAction = 'none';

        this.el = null;
        this._createDOM();
    }

    _createDOM() {
        this.el = document.createElement('div');
        this.el.className = 'gesture-debug-overlay hidden';
        this.el.innerHTML = `
            <div class="debug-header">
                <span>GESTURE DEBUG</span>
                <span class="debug-fps">--fps</span>
                <button class="debug-hide-btn">hide</button>
            </div>
            <div class="debug-body"></div>
        `;

        // Hide button
        this.el.querySelector('.debug-hide-btn').addEventListener('click', () => this.hide());

        if (this.container) {
            this.container.appendChild(this.el);
        } else {
            document.body.appendChild(this.el);
        }
    }

    show() {
        this.isVisible = true;
        this.el.classList.remove('hidden');
        if (!this.pollInterval) {
            this.pollInterval = setInterval(() => this._update(), 100);
        }
    }

    hide() {
        this.isVisible = false;
        this.el.classList.add('hidden');
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    destroy() {
        this.hide();
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }

    _update() {
        if (!this.isVisible || !this.manager) return;

        const info = this.manager.getExtendedDebugInfo();
        if (!info) return;

        // Update FPS
        const fpsEl = this.el.querySelector('.debug-fps');
        const fps = info.fps || 0;
        fpsEl.textContent = `${fps}fps`;
        fpsEl.className = 'debug-fps' + (fps < 15 ? ' error' : fps < 25 ? ' warn' : '');

        // Track action history
        if (info.lane && info.lane !== this.lastLane) {
            this._addHistory(`lane -> ${info.lane}`);
            this.lastLane = info.lane;
        }
        if (info.action && info.action !== this.lastAction) {
            this._addHistory(`action -> ${info.action}`);
            this.lastAction = info.action;
        }

        // Render body based on mode
        const body = this.el.querySelector('.debug-body');
        if (info.mode === 'bodyPose') {
            body.innerHTML = this._renderBodyMode(info);
        } else {
            body.innerHTML = this._renderHeadMode(info);
        }
    }

    _renderHeadMode(info) {
        const t = info.thresholds || {};
        const cal = info.calibration || {};
        const skipClass = info.lastSkipReason ? 'error' : 'good';

        return `
            <div class="debug-section">
                <div class="debug-row"><span class="debug-label">RAW</span><span class="debug-value">yaw:${this._f(info.rawYaw)} pitch:${this._f(info.rawPitch)}</span></div>
                <div class="debug-row"><span class="debug-label">FILT</span><span class="debug-value">yaw:${this._f(info.filteredYaw)} pitch:${this._f(info.filteredPitch)}</span></div>
            </div>
            <div class="debug-section">
                <div class="debug-row"><span class="debug-label">THRESH</span><span class="debug-value">L:${this._f(t.yawLeft)} R:${this._f(t.yawRight)}</span></div>
                <div class="debug-row"><span class="debug-label"></span><span class="debug-value">U:${this._f(t.pitchUp)} D:${this._f(t.pitchDown)}</span></div>
                <div class="debug-row"><span class="debug-label">DEAD</span><span class="debug-value">${this._f(info.deadZone)} HYST:${this._f(info.hysteresis, 0)}</span></div>
                <div class="debug-row"><span class="debug-label">SENS</span><span class="debug-value">${this._f(info.sensitivity, 0)} pitchBase:${this._f(info.pitchBaseline)}</span></div>
            </div>
            <div class="debug-section">
                <div class="debug-row"><span class="debug-label">CALIB</span><span class="debug-value">nYaw:${this._f(cal.neutralYaw)} nPitch:${this._f(cal.neutralPitch)}</span></div>
                <div class="debug-row"><span class="debug-label"></span><span class="debug-value">range Y:${this._f(cal.yawRange)} P:${this._f(cal.pitchRange)} (${cal.sampleCount || 0}s)</span></div>
            </div>
            <div class="debug-section">
                <div class="debug-row"><span class="debug-label">Lane</span><span class="debug-value ${skipClass}">${info.lane || '--'}</span></div>
                <div class="debug-row"><span class="debug-label">Action</span><span class="debug-value ${skipClass}">${info.action || '--'}</span></div>
                <div class="debug-row"><span class="debug-label">Skip</span><span class="debug-value">${info.skippedFrames || 0}/${info.totalFrames || 0}</span></div>
            </div>
            ${info.lastSkipReason ? `<div class="debug-skip-reason">SKIP: ${info.lastSkipReason}</div>` : ''}
            ${this._renderHistory()}
        `;
    }

    _renderBodyMode(info) {
        const t = info.thresholds || {};
        const vis = info.landmarkVisibility || {};
        const minVis = info.minVisibility || 0.4;
        const skipClass = info.lastSkipReason ? 'error' : 'good';

        return `
            <div class="debug-section">
                <div class="debug-row"><span class="debug-label">RAW</span><span class="debug-value">shY:${this._f(info.rawShoulderY, 3)} hipY:${this._f(info.rawHipY, 3)}</span></div>
                <div class="debug-row"><span class="debug-label">FILT</span><span class="debug-value">shY:${this._f(info.shoulderY, 3)} hipY:${this._f(info.hipY, 3)}</span></div>
                <div class="debug-row"><span class="debug-label">FLOOR</span><span class="debug-value">lv:${this._f(info.floorLevel, 3)} vel:${this._f(info.velocity, 4)}</span></div>
            </div>
            <div class="debug-section">
                <div class="debug-row"><span class="debug-label">TORSO</span><span class="debug-value">ratio:${this._f(info.torsoRatio)} norm:${this._f(info.normalTorsoHeight, 3)}</span></div>
                <div class="debug-row"><span class="debug-label">HEIGHT</span><span class="debug-value ${info.heightAboveFloor > t.jumpThreshold ? 'good' : ''}">${this._f(info.heightAboveFloor, 3)} (thr:${this._f(t.jumpThreshold)})</span></div>
            </div>
            <div class="debug-section">
                <div class="debug-row"><span class="debug-label">VIS</span><span class="debug-value ${this._visClass(vis.ls, minVis)}">LS:${this._f(vis.ls)} ${this._visClass(vis.rs, minVis)}RS:${this._f(vis.rs)}</span></div>
                <div class="debug-row"><span class="debug-label"></span><span class="debug-value ${this._visClass(vis.lh, minVis)}">LH:${this._f(vis.lh)} ${this._visClass(vis.rh, minVis)}RH:${this._f(vis.rh)}</span></div>
                <div class="debug-row"><span class="debug-label">MIN</span><span class="debug-value">${this._f(minVis)} cal:${info.isFloorCalibrated ? 'YES' : 'NO'}</span></div>
            </div>
            <div class="debug-section">
                <div class="debug-row"><span class="debug-label">THRESH</span><span class="debug-value">J:${this._f(t.jumpThreshold)} C:${this._f(t.crouchThreshold)}</span></div>
                <div class="debug-row"><span class="debug-label"></span><span class="debug-value">L:${this._f(t.leanThreshold)} W:${this._f(t.walkThreshold)}</span></div>
            </div>
            <div class="debug-section">
                <div class="debug-row"><span class="debug-label">Lane</span><span class="debug-value ${skipClass}">${info.lane || '--'}</span></div>
                <div class="debug-row"><span class="debug-label">Action</span><span class="debug-value ${skipClass}">${info.action || '--'}</span></div>
                <div class="debug-row"><span class="debug-label">Skip</span><span class="debug-value">${info.skippedFrames || 0}/${info.totalFrames || 0}</span></div>
            </div>
            ${info.lastSkipReason ? `<div class="debug-skip-reason">SKIP: ${info.lastSkipReason}</div>` : ''}
            ${this._renderHistory()}
        `;
    }

    _renderHistory() {
        if (this.actionHistory.length === 0) return '';
        const rows = this.actionHistory.map(h =>
            `<div class="history-entry"><span class="history-time">${h.time}</span><span class="history-action">${h.text}</span></div>`
        ).join('');
        return `<div class="debug-section debug-history"><div class="debug-row"><span class="debug-label">HISTORY</span></div>${rows}</div>`;
    }

    _addHistory(text) {
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
        this.actionHistory.unshift({ time, text });
        if (this.actionHistory.length > 5) this.actionHistory.pop();
    }

    _f(val, decimals = 1) {
        if (val === undefined || val === null) return '--';
        return typeof val === 'number' ? val.toFixed(decimals) : String(val);
    }

    _visClass(val, min) {
        if (val === undefined) return '';
        return val >= min ? 'good' : 'warn';
    }
}
