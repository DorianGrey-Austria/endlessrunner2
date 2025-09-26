// ⚡ FPS MONITORING TESTS - Performance guarantee for smooth gameplay
import { test, expect } from '@playwright/test';
import GameTestHelpers from '../utils/game-helpers.js';

test.describe('FPS & Performance Monitoring', () => {
  test.use({
    // Mark as performance test for custom reporter
    annotation: { type: 'game-performance', description: 'Monitors FPS and performance' }
  });

  test('Maintains 60 FPS during normal gameplay', async ({ page }) => {
    console.log('🎯 Testing FPS performance during normal gameplay...');

    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);

    // Start the game
    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    console.log('🎮 Starting FPS monitoring for 30 seconds...');

    // Monitor FPS for 30 seconds of gameplay
    const fpsData = await GameTestHelpers.monitorFPS(page, 30000);

    // Simulate normal gameplay during monitoring
    await GameTestHelpers.simulateGameplay(page, 30000, 'normal');

    console.log(`📊 Collected ${fpsData.length} FPS samples`);

    // Analyze FPS data
    const fpsValues = fpsData.map(d => d.fps).filter(fps => fps > 0);

    if (fpsValues.length === 0) {
      throw new Error('No FPS data collected - monitoring system may be broken');
    }

    const averageFPS = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
    const minFPS = Math.min(...fpsValues);
    const maxFPS = Math.max(...fpsValues);

    console.log(`FPS Analysis: Avg=${averageFPS.toFixed(1)}, Min=${minFPS}, Max=${maxFPS}`);

    // Attach FPS data for custom reporter
    test.info().attach('fps-data', {
      body: JSON.stringify(fpsData),
      contentType: 'application/json'
    });

    // Performance assertions
    expect(averageFPS).toBeGreaterThan(50); // Target: 60 FPS, minimum acceptable: 50
    expect(minFPS).toBeGreaterThan(30); // Never drop below 30 FPS
    expect(fpsValues.filter(fps => fps >= 50).length / fpsValues.length).toBeGreaterThan(0.8); // 80% of frames should be 50+ FPS
  });

  test('Handles intensive gameplay without performance degradation', async ({ page }) => {
    console.log('🔥 Testing performance under intensive gameplay...');

    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);

    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    // Start performance monitoring
    const fpsData = await GameTestHelpers.monitorFPS(page, 60000); // 1 minute

    // Simulate intensive gameplay (rapid inputs)
    console.log('🎮 Starting intensive gameplay simulation...');
    const actionsPerformed = await GameTestHelpers.simulateGameplay(page, 60000, 'intense');

    console.log(`🎯 Performed ${actionsPerformed} actions in 60 seconds`);

    // Analyze performance under stress
    const fpsValues = fpsData.map(d => d.fps).filter(fps => fps > 0);

    if (fpsValues.length === 0) {
      throw new Error('No FPS data collected during intensive test');
    }

    const averageFPS = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
    const minFPS = Math.min(...fpsValues);

    // Check for performance degradation over time
    const firstHalf = fpsValues.slice(0, Math.floor(fpsValues.length / 2));
    const secondHalf = fpsValues.slice(Math.floor(fpsValues.length / 2));

    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const performanceDrop = firstHalfAvg - secondHalfAvg;

    console.log(`Performance over time: First half=${firstHalfAvg.toFixed(1)}, Second half=${secondHalfAvg.toFixed(1)}, Drop=${performanceDrop.toFixed(1)}`);

    // Attach data for reporting
    test.info().attach('fps-data', {
      body: JSON.stringify(fpsData),
      contentType: 'application/json'
    });

    // Performance assertions
    expect(averageFPS).toBeGreaterThan(40); // Acceptable under stress
    expect(minFPS).toBeGreaterThan(25); // Minimum acceptable under stress
    expect(performanceDrop).toBeLessThan(10); // Less than 10 FPS drop over time
  });

  test('Memory usage stays within acceptable limits', async ({ page }) => {
    console.log('🧠 Testing memory usage during gameplay...');

    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);

    // Get initial memory baseline
    const initialMemory = await GameTestHelpers.checkMemoryLeaks(page);

    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    // Play for 2 minutes to accumulate potential memory leaks
    console.log('🎮 Playing for 2 minutes to test memory usage...');
    await GameTestHelpers.simulateGameplay(page, 120000, 'normal');

    // Check final memory usage
    const finalMemory = await GameTestHelpers.checkMemoryLeaks(page, initialMemory.measurement);

    console.log(`Memory Analysis:`, {
      initial: (initialMemory.measurement?.used / 1024 / 1024).toFixed(1) + 'MB',
      final: (finalMemory.current?.used / 1024 / 1024).toFixed(1) + 'MB',
      growth: finalMemory.growth?.toFixed(1) + 'MB',
      growthRate: finalMemory.growthRate?.toFixed(3) + 'MB/s'
    });

    // Attach memory data for reporting
    test.info().attach('memory-data', {
      body: JSON.stringify(finalMemory),
      contentType: 'application/json'
    });

    // Memory assertions
    expect(finalMemory.hasLeak).toBe(false); // No significant memory leaks
    expect(finalMemory.growth).toBeLessThan(100); // Less than 100MB growth
    expect(finalMemory.growthRate).toBeLessThan(1); // Less than 1MB/s growth rate
  });

  test('Performance across different device simulations', async ({ page, browserName }) => {
    console.log('📱 Testing performance across device types...');

    const devices = [
      { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
      { name: 'Tablet', viewport: { width: 768, height: 1024 } },
      { name: 'Mobile', viewport: { width: 375, height: 667 } }
    ];

    const results = [];

    for (const device of devices) {
      console.log(`Testing on ${device.name}...`);

      await page.setViewportSize(device.viewport);
      await page.goto('/');
      await GameTestHelpers.waitForGameReady(page);

      const gameStarted = await GameTestHelpers.startGame(page);
      expect(gameStarted).toBe(true);

      // Monitor FPS for 15 seconds on each device
      const fpsData = await GameTestHelpers.monitorFPS(page, 15000);
      await GameTestHelpers.simulateGameplay(page, 15000, 'light');

      const fpsValues = fpsData.map(d => d.fps).filter(fps => fps > 0);
      const averageFPS = fpsValues.length > 0 ?
        fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length : 0;

      results.push({
        device: device.name,
        viewport: device.viewport,
        averageFPS: averageFPS,
        minFPS: fpsValues.length > 0 ? Math.min(...fpsValues) : 0,
        samples: fpsValues.length
      });

      console.log(`${device.name} performance: ${averageFPS.toFixed(1)} FPS average`);
    }

    // Attach device performance data
    test.info().attach('device-performance', {
      body: JSON.stringify(results),
      contentType: 'application/json'
    });

    // All devices should maintain acceptable performance
    for (const result of results) {
      expect(result.averageFPS).toBeGreaterThan(30); // Minimum 30 FPS on all devices
      expect(result.samples).toBeGreaterThan(10); // Should have collected data
    }

    // Desktop should perform best
    const desktop = results.find(r => r.device === 'Desktop');
    const mobile = results.find(r => r.device === 'Mobile');

    if (desktop && mobile) {
      expect(desktop.averageFPS).toBeGreaterThanOrEqual(mobile.averageFPS);
    }
  });

  test('Three.js rendering performance optimization', async ({ page }) => {
    console.log('🎨 Testing Three.js rendering performance...');

    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);

    // Monitor Three.js specific metrics
    const renderingMetrics = await page.evaluate(() => {
      if (!window.THREE || !window.renderer) {
        return { error: 'Three.js or renderer not available' };
      }

      const info = window.renderer.info;
      return {
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        triangles: info.render.triangles,
        calls: info.render.calls,
        points: info.render.points,
        lines: info.render.lines
      };
    });

    console.log('Three.js metrics:', renderingMetrics);

    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    // Play for 30 seconds and monitor render calls
    await GameTestHelpers.simulateGameplay(page, 30000, 'normal');

    const finalMetrics = await page.evaluate(() => {
      if (!window.renderer) return { error: 'Renderer not available' };

      const info = window.renderer.info;
      return {
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        triangles: info.render.triangles,
        calls: info.render.calls,
        points: info.render.points,
        lines: info.render.lines
      };
    });

    console.log('Final Three.js metrics:', finalMetrics);

    // Attach rendering metrics
    test.info().attach('rendering-metrics', {
      body: JSON.stringify({ initial: renderingMetrics, final: finalMetrics }),
      contentType: 'application/json'
    });

    // Rendering optimization assertions
    if (!renderingMetrics.error && !finalMetrics.error) {
      // Draw calls should be reasonable (not excessive)
      expect(finalMetrics.calls).toBeLessThan(100); // Reasonable draw call count

      // Memory shouldn't grow excessively
      const geometryGrowth = finalMetrics.geometries - renderingMetrics.geometries;
      const textureGrowth = finalMetrics.textures - renderingMetrics.textures;

      expect(geometryGrowth).toBeLessThan(50); // Reasonable geometry growth
      expect(textureGrowth).toBeLessThan(20); // Reasonable texture growth
    }
  });

  test('Frame time consistency', async ({ page }) => {
    console.log('⏱️ Testing frame time consistency...');

    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);

    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    // Measure frame times for consistency
    const frameTimeData = await page.evaluate(() => {
      return new Promise((resolve) => {
        const frameTimes = [];
        let lastTime = performance.now();
        let frameCount = 0;
        const maxFrames = 300; // ~5 seconds at 60fps

        function measureFrame() {
          const currentTime = performance.now();
          const frameTime = currentTime - lastTime;
          frameTimes.push(frameTime);
          lastTime = currentTime;
          frameCount++;

          if (frameCount < maxFrames) {
            requestAnimationFrame(measureFrame);
          } else {
            resolve(frameTimes);
          }
        }

        requestAnimationFrame(measureFrame);
      });
    });

    console.log(`📊 Measured ${frameTimeData.length} frame times`);

    // Analyze frame time consistency
    const averageFrameTime = frameTimeData.reduce((a, b) => a + b, 0) / frameTimeData.length;
    const maxFrameTime = Math.max(...frameTimeData);
    const minFrameTime = Math.min(...frameTimeData);

    // Calculate frame time variance (consistency indicator)
    const variance = frameTimeData.reduce((acc, time) => {
      return acc + Math.pow(time - averageFrameTime, 2);
    }, 0) / frameTimeData.length;

    const standardDeviation = Math.sqrt(variance);

    console.log(`Frame time analysis:`, {
      average: averageFrameTime.toFixed(2) + 'ms',
      min: minFrameTime.toFixed(2) + 'ms',
      max: maxFrameTime.toFixed(2) + 'ms',
      stdDev: standardDeviation.toFixed(2) + 'ms'
    });

    // Frame time consistency assertions
    expect(averageFrameTime).toBeLessThan(20); // Average should be ~16.67ms for 60fps
    expect(maxFrameTime).toBeLessThan(50); // No frame should take longer than 50ms
    expect(standardDeviation).toBeLessThan(10); // Frame times should be consistent
  });
});