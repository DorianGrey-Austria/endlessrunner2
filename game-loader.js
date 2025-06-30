// ES5-COMPATIBLE GAME LOADER
// Führt Kompatibilitätsprüfungen durch und lädt das Spiel sicher

(function() {
    'use strict';
    
    // Browser Feature Detection
    function checkCompatibility() {
        var required = {
            canvas: !!document.createElement('canvas').getContext,
            JSON: typeof JSON !== 'undefined',
            addEventListener: !!document.addEventListener,
            querySelector: !!document.querySelector,
            requestAnimationFrame: !!(window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame)
        };
        
        var missing = [];
        for (var feature in required) {
            if (!required[feature]) {
                missing.push(feature);
            }
        }
        
        return {
            compatible: missing.length === 0,
            missing: missing
        };
    }
    
    // Fallback Game für inkompatible Browser
    function createFallbackGame() {
        var canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        var ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Einfaches Fallback-Spiel
        var player = { x: 100, y: canvas.height - 100, jumping: false, velocityY: 0 };
        var obstacles = [];
        var score = 0;
        var gameRunning = true;
        
        function drawPlayer() {
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(player.x, player.y, 40, 60);
        }
        
        function drawObstacles() {
            ctx.fillStyle = '#333';
            for (var i = 0; i < obstacles.length; i++) {
                var obs = obstacles[i];
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            }
        }
        
        function gameLoop() {
            if (!gameRunning) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Simple physics
            if (player.jumping) {
                player.velocityY += 0.8;
                player.y += player.velocityY;
                if (player.y >= canvas.height - 100) {
                    player.y = canvas.height - 100;
                    player.jumping = false;
                    player.velocityY = 0;
                }
            }
            
            // Move obstacles
            for (var i = obstacles.length - 1; i >= 0; i--) {
                obstacles[i].x -= 3;
                if (obstacles[i].x < -50) {
                    obstacles.splice(i, 1);
                    score += 10;
                }
            }
            
            // Spawn obstacles
            if (Math.random() < 0.005) {
                obstacles.push({
                    x: canvas.width,
                    y: canvas.height - 80,
                    width: 30,
                    height: 80
                });
            }
            
            drawPlayer();
            drawObstacles();
            
            // Draw score
            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.fillText('Score: ' + score, 20, 50);
            ctx.fillText('Fallback Mode - Press Space to Jump', 20, canvas.height - 20);
            
            requestAnimationFrame(gameLoop);
        }
        
        // Controls
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space' && !player.jumping) {
                player.jumping = true;
                player.velocityY = -15;
                e.preventDefault();
            }
        });
        
        canvas.addEventListener('click', function() {
            if (!player.jumping) {
                player.jumping = true;
                player.velocityY = -15;
            }
        });
        
        gameLoop();
        console.log('Fallback game loaded successfully');
    }
    
    // Lade das vollständige Spiel
    function loadFullGame() {
        console.log('Loading full game...');
        
        // Verstecke UI-Elemente die ES6 benötigen
        var elements = ['debugDashboard', 'settingsPanel'];
        for (var i = 0; i < elements.length; i++) {
            var el = document.getElementById(elements[i]);
            if (el) el.style.display = 'none';
        }
        
        try {
            // ES6 Check - wenn das fehlschlägt, laden wir Fallback
            eval('class TestClass {}');
            
            // ES6 ist verfügbar, lade das Hauptspiel
            var script = document.createElement('script');
            script.src = 'script.js';
            script.onload = function() {
                console.log('Full game loaded successfully');
            };
            script.onerror = function() {
                console.warn('Failed to load main script, using fallback');
                createFallbackGame();
            };
            document.head.appendChild(script);
            
        } catch (e) {
            console.warn('ES6 not supported, using fallback game');
            createFallbackGame();
        }
    }
    
    // Initialisierung
    function init() {
        var compat = checkCompatibility();
        
        if (!compat.compatible) {
            console.warn('Browser missing features:', compat.missing);
            document.body.innerHTML = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 50px; text-align: center; font-family: Arial, sans-serif; min-height: 100vh;"><h1>🎮 Browser Not Supported</h1><p>Your browser is missing: ' + compat.missing.join(', ') + '</p><p>Please use Chrome, Firefox, Safari or Edge.</p></div>';
            return;
        }
        
        loadFullGame();
    }
    
    // Start wenn DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();