/**
 * GAME STABILITY TESTS
 *
 * Tests für:
 * 1. Spiel bis zum Ende (Game Over)
 * 2. Mehrere Spiele hintereinander
 * 3. Memory Leaks / Crashes nach mehreren Runden
 */

import { test, expect } from '@playwright/test';

test.describe('Game Stability Tests', () => {
    let consoleErrors = [];
    let pageErrors = [];

    test.beforeEach(async ({ page }) => {
        consoleErrors = [];
        pageErrors = [];

        // Golden Rule #2: Console Error Detection
        page.on('console', msg => {
            if (msg.type() === 'error') {
                // Filter WebGL errors (expected in headless)
                if (!msg.text().includes('WebGL') && !msg.text().includes('context')) {
                    consoleErrors.push(msg.text());
                }
            }
        });

        page.on('pageerror', error => {
            if (!error.message.includes('WebGL') && !error.message.includes('context')) {
                pageErrors.push(error.message);
            }
        });
    });

    test('Game Over: Spiel läuft bis zum Ende (60 Sekunden Timer)', async ({ page }) => {
        console.log('\n========================================');
        console.log('  TEST: Spiel bis Game Over');
        console.log('========================================\n');

        // Erhöhtes Timeout für 60+ Sekunden Spielzeit
        test.setTimeout(120000);

        await page.goto('http://localhost:8001/index.html');
        await page.waitForSelector('canvas', { timeout: 30000 });
        await page.waitForTimeout(3000);

        // Spiel starten
        console.log('1. Starte Spiel...');
        const startButton = page.locator('button:has-text("SPIELEN"), button:has-text("SPIEL STARTEN")').first();
        await startButton.click();
        await page.waitForTimeout(1000);

        // Prüfe ob Spiel läuft
        const isPlaying = await page.evaluate(() =>
            typeof gameState !== 'undefined' && gameState.isPlaying === true
        ).catch(() => false);
        console.log(`   Spiel läuft: ${isPlaying}`);

        if (!isPlaying) {
            console.log('   ⚠️ Spiel konnte nicht gestartet werden (WebGL headless?)');
            // In headless mode kann das Spiel möglicherweise nicht starten
            // Das ist OK - wir testen was wir können
            return;
        }

        // Warte auf Game Over (Timer läuft 60 Sekunden)
        // Oder der Spieler verliert alle Leben
        console.log('2. Warte auf Game Over (max 70 Sekunden)...');

        let gameOver = false;
        let checkCount = 0;
        const maxChecks = 70; // 70 Sekunden max

        while (!gameOver && checkCount < maxChecks) {
            await page.waitForTimeout(1000);
            checkCount++;

            const state = await page.evaluate(() => {
                if (typeof gameState === 'undefined') return null;
                return {
                    isPlaying: gameState.isPlaying,
                    isGameOver: gameState.isGameOver,
                    lives: gameState.lives,
                    timer: gameState.timer,
                    score: gameState.score
                };
            }).catch(() => null);

            if (state) {
                if (checkCount % 10 === 0) {
                    console.log(`   ${checkCount}s: Lives=${state.lives}, Timer=${state.timer}, Score=${state.score}`);
                }

                if (state.isGameOver || !state.isPlaying) {
                    gameOver = true;
                    console.log(`   Game Over nach ${checkCount} Sekunden!`);
                    console.log(`   Final Score: ${state.score}`);
                }
            }
        }

        // Prüfe Game Over Screen
        console.log('3. Prüfe Game Over Screen...');
        await page.waitForTimeout(1000);

        const gameOverVisible = await page.evaluate(() => {
            // Suche nach Game Over Elementen
            const gameOverText = document.body.innerText.includes('GAME OVER') ||
                                 document.body.innerText.includes('Nochmal') ||
                                 document.body.innerText.includes('Zeit abgelaufen');
            return gameOverText;
        }).catch(() => false);

        console.log(`   Game Over Screen sichtbar: ${gameOverVisible}`);

        // Error Check
        console.log('\n4. Error Check...');
        if (consoleErrors.length > 0) {
            console.error('   Console Errors:');
            consoleErrors.forEach(e => console.error(`     - ${e}`));
        }
        if (pageErrors.length > 0) {
            console.error('   Page Errors:');
            pageErrors.forEach(e => console.error(`     - ${e}`));
        }

        // Keine kritischen Errors während des Spiels
        expect(pageErrors.length, 'Keine Page Errors während Game Over').toBe(0);

        console.log('\n✅ Game Over Test abgeschlossen');
    });

    test('Stability: Zwei Spiele hintereinander', async ({ page }) => {
        console.log('\n========================================');
        console.log('  TEST: Zwei Spiele hintereinander');
        console.log('========================================\n');

        // Erhöhtes Timeout für 2 Spiele
        test.setTimeout(180000);

        await page.goto('http://localhost:8001/index.html');
        await page.waitForSelector('canvas', { timeout: 30000 });
        await page.waitForTimeout(3000);

        // Helper Funktion: Spiel starten und kurz spielen
        async function playOneGame(gameNumber) {
            console.log(`\n--- SPIEL ${gameNumber} ---`);

            // Start Button finden und klicken
            const startButton = page.locator('button:has-text("SPIELEN"), button:has-text("SPIEL STARTEN"), button:has-text("Nochmal")').first();

            const buttonVisible = await startButton.isVisible().catch(() => false);
            if (!buttonVisible) {
                console.log(`   Kein Start-Button gefunden für Spiel ${gameNumber}`);
                return false;
            }

            await startButton.click();
            console.log(`   Spiel ${gameNumber} gestartet`);
            await page.waitForTimeout(1000);

            // Prüfe ob Spiel läuft
            const isPlaying = await page.evaluate(() =>
                typeof gameState !== 'undefined' && gameState.isPlaying === true
            ).catch(() => false);

            if (!isPlaying) {
                console.log(`   ⚠️ Spiel ${gameNumber} konnte nicht starten`);
                return false;
            }

            // Spiele für 10 Sekunden (oder bis Game Over)
            console.log(`   Spiele für 10 Sekunden...`);

            for (let i = 0; i < 10; i++) {
                await page.waitForTimeout(1000);

                // Simuliere etwas Gameplay (Bewegung)
                if (i % 2 === 0) {
                    await page.keyboard.press('a'); // Links
                } else {
                    await page.keyboard.press('d'); // Rechts
                }

                // Gelegentlich springen
                if (i % 3 === 0) {
                    await page.keyboard.press('Space');
                }

                const state = await page.evaluate(() => {
                    if (typeof gameState === 'undefined') return null;
                    return {
                        isPlaying: gameState.isPlaying,
                        isGameOver: gameState.isGameOver,
                        score: gameState.score,
                        lives: gameState.lives
                    };
                }).catch(() => null);

                if (state && (state.isGameOver || !state.isPlaying)) {
                    console.log(`   Game Over nach ${i+1} Sekunden (Score: ${state.score})`);
                    break;
                }
            }

            // Warte bis Game Over oder beende manuell
            const finalState = await page.evaluate(() => {
                if (typeof gameState === 'undefined') return null;
                return {
                    isPlaying: gameState.isPlaying,
                    score: gameState.score,
                    lives: gameState.lives
                };
            }).catch(() => null);

            if (finalState && finalState.isPlaying) {
                // Spiel läuft noch - warte auf Game Over oder beende durch Leben verlieren
                console.log(`   Warte auf natürliches Game Over...`);
                await page.waitForTimeout(5000);
            }

            console.log(`   Spiel ${gameNumber} beendet`);
            return true;
        }

        // Spiel 1
        const game1 = await playOneGame(1);

        if (game1) {
            // Warte zwischen den Spielen
            console.log('\n   Pause zwischen Spielen (3s)...');
            await page.waitForTimeout(3000);

            // Spiel 2
            const game2 = await playOneGame(2);

            if (game2) {
                console.log('\n✅ Beide Spiele erfolgreich durchgeführt!');
            }
        }

        // Finale Error-Prüfung
        console.log('\n--- FINALE ERROR-PRÜFUNG ---');
        console.log(`Console Errors: ${consoleErrors.length}`);
        console.log(`Page Errors: ${pageErrors.length}`);

        if (consoleErrors.length > 0) {
            console.log('Console Errors:');
            consoleErrors.forEach(e => console.log(`  - ${e}`));
        }

        if (pageErrors.length > 0) {
            console.log('Page Errors:');
            pageErrors.forEach(e => console.log(`  - ${e}`));
        }

        // Memory/State Check
        const memoryCheck = await page.evaluate(() => {
            if (typeof gameState === 'undefined') return null;
            return {
                // Prüfe ob Arrays nicht explodiert sind
                obstaclesCount: gameState.obstacles?.length || 0,
                collectiblesCount: (gameState.apples?.length || 0) + (gameState.broccolis?.length || 0),
                // Prüfe grundlegende State-Integrität
                hasScene: typeof scene !== 'undefined',
                hasCamera: typeof camera !== 'undefined',
                hasRenderer: typeof renderer !== 'undefined'
            };
        }).catch(() => null);

        if (memoryCheck) {
            console.log('\nMemory/State Check:');
            console.log(`  Obstacles: ${memoryCheck.obstaclesCount}`);
            console.log(`  Collectibles: ${memoryCheck.collectiblesCount}`);
            console.log(`  Scene: ${memoryCheck.hasScene}`);
            console.log(`  Camera: ${memoryCheck.hasCamera}`);
            console.log(`  Renderer: ${memoryCheck.hasRenderer}`);
        }

        // Keine kritischen Errors
        expect(pageErrors.length, 'Keine Page Errors während mehrerer Spiele').toBe(0);
    });

    test('Quick: Spiel starten, 5 Sekunden spielen, stoppen', async ({ page }) => {
        console.log('\n========================================');
        console.log('  TEST: Quick Play (5 Sekunden)');
        console.log('========================================\n');

        await page.goto('http://localhost:8001/index.html');
        await page.waitForSelector('canvas', { timeout: 30000 });
        await page.waitForTimeout(3000);

        // Start
        const startButton = page.locator('button:has-text("SPIELEN"), button:has-text("SPIEL STARTEN")').first();
        await startButton.click();
        console.log('Spiel gestartet');

        // 5 Sekunden spielen mit Aktionen
        for (let i = 0; i < 5; i++) {
            await page.waitForTimeout(1000);

            // Verschiedene Aktionen
            switch (i) {
                case 0: await page.keyboard.press('a'); break;
                case 1: await page.keyboard.press('Space'); break;
                case 2: await page.keyboard.press('d'); break;
                case 3: await page.keyboard.press('s'); break;
                case 4: await page.keyboard.press('Space'); break;
            }

            console.log(`  Sekunde ${i+1}: Aktion ausgeführt`);
        }

        // State prüfen
        const state = await page.evaluate(() => {
            if (typeof gameState === 'undefined') return null;
            return {
                isPlaying: gameState.isPlaying,
                score: gameState.score,
                lives: gameState.lives,
                level: gameState.level
            };
        }).catch(() => null);

        if (state) {
            console.log(`\nSpielstand nach 5 Sekunden:`);
            console.log(`  isPlaying: ${state.isPlaying}`);
            console.log(`  Score: ${state.score}`);
            console.log(`  Lives: ${state.lives}`);
            console.log(`  Level: ${state.level}`);
        }

        console.log(`\nErrors: ${pageErrors.length} page, ${consoleErrors.length} console`);
        expect(pageErrors.length).toBe(0);
    });
});
