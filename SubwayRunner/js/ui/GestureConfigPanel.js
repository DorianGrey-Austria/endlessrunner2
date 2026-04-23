/**
 * GestureConfigPanel - In-game settings panel for gesture control (April 2026)
 *
 * Tabbed UI with sliders for all configurable parameters:
 * - Head tab: sensitivity, dead zone, pitch baseline, hysteresis
 * - Body tab: jump/crouch/lean thresholds, visibility, distance presets
 * - Debug tab: overlay toggle, console logging toggle
 *
 * Persists to localStorage['subwayRunner_gestureConfig']
 */

export class GestureConfigPanel {
    /**
     * @param {Object} gestureManager - GestureManager instance
     * @param {Object} debugOverlay - GestureDebugOverlay instance (optional)
     */
    constructor(gestureManager, debugOverlay = null) {
        this.manager = gestureManager;
        this.debugOverlay = debugOverlay;
        this.isVisible = false;
        this.activeTab = 'head';
        this.el = null;

        this._createDOM();
        this._loadConfig();
    }

    _createDOM() {
        this.el = document.createElement('div');
        this.el.className = 'gesture-config-panel hidden';
        this.el.innerHTML = `
            <div class="config-header">
                <h3>Gesture Settings</h3>
                <button class="config-close-btn">&times;</button>
            </div>
            <div class="config-tabs">
                <button class="config-tab active" data-tab="head">Head</button>
                <button class="config-tab" data-tab="body">Body</button>
                <button class="config-tab" data-tab="debug">Debug</button>
            </div>
            <div class="config-content">
                ${this._renderHeadTab()}
                ${this._renderBodyTab()}
                ${this._renderDebugTab()}
            </div>
        `;

        // Wire events
        this.el.querySelector('.config-close-btn').addEventListener('click', () => this.hide());

        // Tab switching
        this.el.querySelectorAll('.config-tab').forEach(tab => {
            tab.addEventListener('click', () => this._switchTab(tab.dataset.tab));
        });

        // Sliders
        this.el.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.addEventListener('input', (e) => this._onSliderChange(e.target));
        });

        // Preset buttons
        this.el.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this._onPreset(btn.dataset.preset));
        });

        // Action buttons
        this.el.querySelector('.config-btn-recalibrate')?.addEventListener('click', () => {
            this.manager.startCalibration();
        });
        this.el.querySelector('.config-btn-reset')?.addEventListener('click', () => {
            this._resetDefaults();
        });

        // Debug toggles
        this.el.querySelector('#debugOverlayToggle')?.addEventListener('change', (e) => {
            if (this.debugOverlay) {
                if (e.target.checked) this.debugOverlay.show();
                else this.debugOverlay.hide();
            }
        });
        this.el.querySelector('#debugConsoleToggle')?.addEventListener('change', (e) => {
            this._consoleLogging = e.target.checked;
        });

        // Gesture test mode — activates gesture detection without starting the game
        this.el.querySelector('#gestureTestToggle')?.addEventListener('change', (e) => {
            if (!this.manager) return;
            if (e.target.checked) {
                // Show large canvas for testing
                const canvas = document.getElementById('gestureCanvas');
                if (canvas) {
                    canvas.classList.add('active');
                    canvas.style.width = '320px';
                    canvas.style.height = '240px';
                    canvas.style.bottom = '10px';
                    canvas.style.left = '10px';
                }
                // Show debug overlay
                if (this.debugOverlay) this.debugOverlay.show();
                const overlayToggle = this.el.querySelector('#debugOverlayToggle');
                if (overlayToggle) overlayToggle.checked = true;
            } else {
                // Restore canvas size
                const canvas = document.getElementById('gestureCanvas');
                if (canvas) {
                    canvas.style.width = '';
                    canvas.style.height = '';
                }
            }
        });

        document.body.appendChild(this.el);
    }

    _renderHeadTab() {
        return `
            <div class="config-tab-content active" data-content="head">
                ${this._slider('headSensitivity', 'Empfindlichkeit', 0.2, 0.8, 0.05, 0.45, '', 'Wie weit du den Kopf drehen musst')}
                ${this._slider('headDeadZone', 'Ruhezone', 0.5, 5.0, 0.5, 2.0, 'deg', 'Ignoriert kleine Kopfbewegungen')}
                ${this._slider('headPitchBaseline', 'Kopfhaltung', 0.3, 0.5, 0.01, 0.4, '', 'Anpassen falls Nicken nicht reagiert')}
                ${this._slider('headHysteresis', 'Spurhaltung', 0.1, 0.5, 0.05, 0.3, '', 'Verhindert Flackern zwischen Spuren')}
                <div class="config-actions">
                    <button class="config-btn primary config-btn-recalibrate">Neu kalibrieren</button>
                    <button class="config-btn config-btn-reset">Werkseinstellung</button>
                </div>
            </div>
        `;
    }

    _renderBodyTab() {
        return `
            <div class="config-tab-content" data-content="body">
                ${this._slider('bodyJumpThreshold', 'Sprung-Schwelle', 0.04, 0.20, 0.01, 0.10, '', 'Wie hoch du springen musst')}
                ${this._slider('bodyCrouchThreshold', 'Duck-Schwelle', 0.65, 0.95, 0.01, 0.82, '', 'Wie tief du dich ducken musst')}
                ${this._slider('bodyLeanThreshold', 'Neige-Schwelle', 0.05, 0.20, 0.01, 0.10, '', 'Wie weit du dich neigen musst')}
                ${this._slider('bodyMinVisibility', 'Erkennungs-Qualitaet', 0.2, 0.8, 0.05, 0.4, '', 'Senken wenn Koerper schlecht erkannt')}
                ${this._slider('bodyVelocityJump', 'Sprung-Geschwindigkeit', 0.005, 0.040, 0.005, 0.015, '', 'Wie schnell die Aufwaertsbewegung sein muss')}
                <div class="preset-group">
                    <label>Entfernung zur Kamera</label>
                    <div class="preset-buttons">
                        <button class="preset-btn" data-preset="close">Nah (&lt;1.5m)</button>
                        <button class="preset-btn active" data-preset="medium">Mittel (2-3m)</button>
                        <button class="preset-btn" data-preset="far">Weit (3-5m)</button>
                    </div>
                </div>
                <div class="config-actions">
                    <button class="config-btn primary config-btn-recalibrate">Neu kalibrieren</button>
                    <button class="config-btn config-btn-reset">Werkseinstellung</button>
                </div>
            </div>
        `;
    }

    _renderDebugTab() {
        return `
            <div class="config-tab-content" data-content="debug">
                <div class="toggle-group">
                    <label>Debug Overlay anzeigen</label>
                    <label class="toggle-switch">
                        <input type="checkbox" id="debugOverlayToggle">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="toggle-group">
                    <label>Konsolen-Logging</label>
                    <label class="toggle-switch">
                        <input type="checkbox" id="debugConsoleToggle">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="toggle-group">
                    <label>Gesten-Test (ohne Spiel)</label>
                    <label class="toggle-switch">
                        <input type="checkbox" id="gestureTestToggle">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        `;
    }

    _slider(id, label, min, max, step, defaultVal, unit = '', hint = '') {
        return `
            <div class="slider-group">
                <div class="slider-label">
                    <span>${label}</span>
                    <span class="slider-value" id="${id}Value">${defaultVal}${unit}</span>
                </div>
                ${hint ? `<div style="font-size: 10px; color: #6e7681; margin: -2px 0 4px 0;">${hint}</div>` : ''}
                <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${defaultVal}" data-unit="${unit}" data-default="${defaultVal}">
            </div>
        `;
    }

    _switchTab(tabName) {
        this.activeTab = tabName;

        // Update tab buttons
        this.el.querySelectorAll('.config-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tabName);
        });

        // Update tab content
        this.el.querySelectorAll('.config-tab-content').forEach(c => {
            c.classList.toggle('active', c.dataset.content === tabName);
        });
    }

    _onSliderChange(slider) {
        const value = parseFloat(slider.value);
        const unit = slider.dataset.unit || '';
        const valueEl = this.el.querySelector(`#${slider.id}Value`);
        if (valueEl) {
            valueEl.textContent = `${value}${unit}`;
        }

        // Apply to gesture manager
        this._applyCurrentConfig();
    }

    _onPreset(preset) {
        // Update active button
        this.el.querySelectorAll('.preset-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.preset === preset);
        });

        const presets = {
            close: { bodyJumpThreshold: 0.14, bodyCrouchThreshold: 0.85, bodyLeanThreshold: 0.12, bodyMinVisibility: 0.35, bodyVelocityJump: 0.020 },
            medium: { bodyJumpThreshold: 0.10, bodyCrouchThreshold: 0.82, bodyLeanThreshold: 0.10, bodyMinVisibility: 0.40, bodyVelocityJump: 0.015 },
            far: { bodyJumpThreshold: 0.07, bodyCrouchThreshold: 0.78, bodyLeanThreshold: 0.08, bodyMinVisibility: 0.45, bodyVelocityJump: 0.010 }
        };

        const values = presets[preset];
        if (!values) return;

        // Update sliders
        for (const [id, val] of Object.entries(values)) {
            const slider = this.el.querySelector(`#${id}`);
            if (slider) {
                slider.value = val;
                const valueEl = this.el.querySelector(`#${id}Value`);
                if (valueEl) valueEl.textContent = `${val}${slider.dataset.unit || ''}`;
            }
        }

        this._applyCurrentConfig();
    }

    _resetDefaults() {
        this.el.querySelectorAll('input[type="range"]').forEach(slider => {
            const defaultVal = slider.dataset.default;
            if (defaultVal !== undefined) {
                slider.value = defaultVal;
                const valueEl = this.el.querySelector(`#${slider.id}Value`);
                if (valueEl) valueEl.textContent = `${defaultVal}${slider.dataset.unit || ''}`;
            }
        });

        this._applyCurrentConfig();
    }

    _applyCurrentConfig() {
        const modeKey = this.manager.activeModeKey;

        if (modeKey === 'bodyPose' || modeKey === 'adaptive' || modeKey === 'oneEuro') {
            const config = this._readCurrentValues();
            this.manager.applyConfig(config);
        }
    }

    _readCurrentValues() {
        const get = (id) => {
            const el = this.el.querySelector(`#${id}`);
            return el ? parseFloat(el.value) : undefined;
        };

        const modeKey = this.manager.activeModeKey;

        if (modeKey === 'bodyPose') {
            return {
                jumpThreshold: get('bodyJumpThreshold'),
                crouchThreshold: get('bodyCrouchThreshold'),
                leanThreshold: get('bodyLeanThreshold'),
                minVisibility: get('bodyMinVisibility'),
                velocityJumpThreshold: get('bodyVelocityJump')
            };
        } else {
            // Head modes (adaptive / oneEuro)
            return {
                sensitivity: get('headSensitivity'),
                deadZone: get('headDeadZone'),
                pitchBaseline: get('headPitchBaseline'),
                hysteresis: get('headHysteresis')
            };
        }
    }

    _loadConfig() {
        try {
            const stored = JSON.parse(localStorage.getItem('subwayRunner_gestureConfig') || '{}');
            // Apply stored values to sliders
            for (const [modeKey, config] of Object.entries(stored)) {
                for (const [key, val] of Object.entries(config)) {
                    // Map config keys to slider IDs
                    const sliderId = this._configKeyToSliderId(modeKey, key);
                    if (sliderId) {
                        const slider = this.el.querySelector(`#${sliderId}`);
                        if (slider) {
                            slider.value = val;
                            const valueEl = this.el.querySelector(`#${sliderId}Value`);
                            if (valueEl) valueEl.textContent = `${val}${slider.dataset.unit || ''}`;
                        }
                    }
                }
            }
        } catch (e) { /* silent */ }
    }

    _configKeyToSliderId(modeKey, key) {
        const map = {
            bodyPose: {
                jumpThreshold: 'bodyJumpThreshold',
                crouchThreshold: 'bodyCrouchThreshold',
                leanThreshold: 'bodyLeanThreshold',
                minVisibility: 'bodyMinVisibility',
                velocityJumpThreshold: 'bodyVelocityJump'
            },
            adaptive: {
                sensitivity: 'headSensitivity',
                deadZone: 'headDeadZone',
                pitchBaseline: 'headPitchBaseline',
                hysteresis: 'headHysteresis'
            },
            oneEuro: {
                deadZone: 'headDeadZone',
                pitchBaseline: 'headPitchBaseline',
                hysteresis: 'headHysteresis'
            }
        };
        return map[modeKey]?.[key] || null;
    }

    show() {
        this.isVisible = true;
        this.el.classList.remove('hidden');

        if (!this.manager) return;

        // Sync sliders with current config
        const config = this.manager.getConfig();
        if (config) {
            const modeKey = this.manager.activeModeKey;
            for (const [key, val] of Object.entries(config)) {
                const sliderId = this._configKeyToSliderId(modeKey, key);
                if (sliderId) {
                    const slider = this.el.querySelector(`#${sliderId}`);
                    if (slider) {
                        slider.value = val;
                        const valueEl = this.el.querySelector(`#${sliderId}Value`);
                        if (valueEl) valueEl.textContent = `${val}${slider.dataset.unit || ''}`;
                    }
                }
            }
        }

        // Auto-switch to relevant tab
        const modeKey = this.manager.activeModeKey;
        if (modeKey === 'bodyPose') {
            this._switchTab('body');
        } else {
            this._switchTab('head');
        }
    }

    hide() {
        this.isVisible = false;
        this.el.classList.add('hidden');
    }

    destroy() {
        this.hide();
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
            this.el = null;
        }
        this.manager = null;
        this.debugOverlay = null;
    }

    toggle() {
        if (this.isVisible) this.hide();
        else this.show();
    }
}
