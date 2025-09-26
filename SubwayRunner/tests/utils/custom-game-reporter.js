// 📊 CUSTOM GAME REPORTER - Game-specific metrics and reporting
import fs from 'fs';
import path from 'path';

class CustomGameReporter {
  constructor(options = {}) {
    this.options = options;
    this.results = {
      gameMetrics: [],
      performanceData: [],
      visualRegressions: [],
      cacheIssues: [],
      testTiming: {}
    };
    this.startTime = Date.now();
  }

  onBegin(config, suite) {
    console.log('🎮 Starting Game Testing Suite...');
    this.config = config;
    this.suite = suite;
  }

  onTestBegin(test) {
    this.results.testTiming[test.id] = {
      title: test.title,
      startTime: Date.now()
    };
  }

  onTestEnd(test, result) {
    const timing = this.results.testTiming[test.id];
    if (timing) {
      timing.endTime = Date.now();
      timing.duration = timing.endTime - timing.startTime;
      timing.status = result.status;
    }

    // Extract game-specific metrics from test annotations
    const annotations = test.annotations || [];

    // Performance data extraction
    if (annotations.some(a => a.type === 'game-performance')) {
      const fpsData = result.attachments?.find(a => a.name === 'fps-data');
      const memoryData = result.attachments?.find(a => a.name === 'memory-data');

      this.results.performanceData.push({
        testId: test.id,
        title: test.title,
        status: result.status,
        duration: result.duration,
        fps: fpsData ? JSON.parse(fpsData.body?.toString() || '[]') : [],
        memory: memoryData ? JSON.parse(memoryData.body?.toString() || '{}') : {},
        timestamp: Date.now()
      });
    }

    // Visual regression data
    if (annotations.some(a => a.type === 'visual-regression')) {
      this.results.visualRegressions.push({
        testId: test.id,
        title: test.title,
        status: result.status,
        baseline: result.attachments?.find(a => a.name === 'baseline'),
        actual: result.attachments?.find(a => a.name === 'actual'),
        diff: result.attachments?.find(a => a.name === 'diff'),
        timestamp: Date.now()
      });
    }

    // Cache-busting issues
    if (annotations.some(a => a.type === 'cache-busting')) {
      this.results.cacheIssues.push({
        testId: test.id,
        title: test.title,
        status: result.status,
        retryCount: result.retry,
        timestamp: Date.now()
      });
    }

    // Game-specific metrics
    if (result.stdout) {
      const gameMetrics = this.extractGameMetrics(result.stdout);
      if (gameMetrics.length > 0) {
        this.results.gameMetrics.push({
          testId: test.id,
          title: test.title,
          metrics: gameMetrics,
          timestamp: Date.now()
        });
      }
    }
  }

  onEnd(result) {
    console.log('📊 Generating Game Testing Report...');

    // Safe handling of result object
    const suites = result?.suites || [];
    const allTests = suites.flatMap(suite => suite?.tests || []);

    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.startTime,
        totalTests: allTests.length,
        passed: allTests.filter(t => t?.outcome?.() === 'expected').length,
        failed: allTests.filter(t => t?.outcome?.() === 'unexpected').length,
        flaky: allTests.filter(t => t?.outcome?.() === 'flaky').length,
        skipped: allTests.filter(t => t?.outcome?.() === 'skipped').length
      },
      gameMetrics: this.results.gameMetrics,
      performance: this.analyzePerformance(),
      visualRegressions: this.results.visualRegressions,
      cacheIssues: this.results.cacheIssues,
      recommendations: this.generateRecommendations(),
      testTiming: this.results.testTiming
    };

    // Write JSON report
    const reportsDir = path.join(process.cwd(), 'tests/reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportsDir, 'game-testing-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate HTML dashboard
    this.generateHTMLDashboard(report);

    console.log('✅ Game testing report generated');
    console.log(`📊 Performance Summary: ${this.formatPerformanceSummary(report.performance)}`);
    console.log(`🎯 Recommendations: ${report.recommendations.length} items`);
  }

  extractGameMetrics(stdout) {
    const metrics = [];
    const lines = stdout.split('\n');

    for (const line of lines) {
      // Extract FPS metrics
      if (line.includes('Game FPS:')) {
        const fps = parseFloat(line.match(/Game FPS: ([\d.]+)/)?.[1]);
        if (fps) metrics.push({ type: 'fps', value: fps });
      }

      // Extract score metrics
      if (line.includes('Final Score:')) {
        const score = parseInt(line.match(/Final Score: (\d+)/)?.[1]);
        if (score) metrics.push({ type: 'score', value: score });
      }

      // Extract memory metrics
      if (line.includes('Memory Usage:')) {
        const memory = parseFloat(line.match(/Memory Usage: ([\d.]+)MB/)?.[1]);
        if (memory) metrics.push({ type: 'memory', value: memory });
      }

      // Extract gameplay metrics
      if (line.includes('Actions Performed:')) {
        const actions = parseInt(line.match(/Actions Performed: (\d+)/)?.[1]);
        if (actions) metrics.push({ type: 'actions', value: actions });
      }
    }

    return metrics;
  }

  analyzePerformance() {
    const performanceData = this.results.performanceData;
    if (performanceData.length === 0) {
      return { message: 'No performance data collected' };
    }

    const fpsValues = performanceData
      .flatMap(p => p.fps)
      .map(f => f.fps)
      .filter(Boolean);

    const memoryValues = performanceData
      .map(p => p.memory?.used)
      .filter(Boolean);

    return {
      fps: {
        average: fpsValues.length > 0 ? fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length : 0,
        min: fpsValues.length > 0 ? Math.min(...fpsValues) : 0,
        max: fpsValues.length > 0 ? Math.max(...fpsValues) : 0,
        samples: fpsValues.length
      },
      memory: {
        average: memoryValues.length > 0 ? memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length : 0,
        peak: memoryValues.length > 0 ? Math.max(...memoryValues) : 0,
        samples: memoryValues.length
      },
      tests: performanceData.length
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const performance = this.analyzePerformance();

    // Performance recommendations
    if (performance.fps?.average < 50) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        title: 'Low FPS Performance',
        message: `Average FPS (${performance.fps.average.toFixed(1)}) below recommended 50. Consider optimizing Three.js rendering or reducing scene complexity.`,
        action: 'Profile GPU usage and optimize render calls'
      });
    }

    if (performance.fps?.min < 30) {
      recommendations.push({
        type: 'performance',
        severity: 'critical',
        title: 'Critical FPS Drops',
        message: `Minimum FPS (${performance.fps.min}) below acceptable 30. Game may be unplayable on slower devices.`,
        action: 'Implement object pooling and reduce particle effects'
      });
    }

    // Memory recommendations
    if (performance.memory?.peak > 200 * 1024 * 1024) { // 200MB
      recommendations.push({
        type: 'memory',
        severity: 'medium',
        title: 'High Memory Usage',
        message: `Peak memory usage (${(performance.memory.peak / 1024 / 1024).toFixed(1)}MB) is high.`,
        action: 'Check for memory leaks and optimize asset loading'
      });
    }

    // Cache-busting recommendations
    if (this.results.cacheIssues.length > 0) {
      recommendations.push({
        type: 'deployment',
        severity: 'medium',
        title: 'Cache Issues Detected',
        message: `${this.results.cacheIssues.length} tests required cache-busting retries.`,
        action: 'Review cache headers and implement proper versioning'
      });
    }

    // Visual regression recommendations
    const failedVisualTests = this.results.visualRegressions.filter(v => v.status === 'failed');
    if (failedVisualTests.length > 0) {
      recommendations.push({
        type: 'visual',
        severity: 'low',
        title: 'Visual Regressions Detected',
        message: `${failedVisualTests.length} visual regression tests failed.`,
        action: 'Review visual differences and update baselines if changes are intentional'
      });
    }

    return recommendations;
  }

  generateHTMLDashboard(report) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎮 Game Testing Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #f0f0f0; border-radius: 5px; }
        .fps-good { background: #d4edda; }
        .fps-warning { background: #fff3cd; }
        .fps-danger { background: #f8d7da; }
        .recommendation { margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; background: #f8f9fa; }
        .severity-high { border-color: #dc3545; }
        .severity-critical { border-color: #dc3545; background: #f8d7da; }
        .severity-medium { border-color: #ffc107; }
        .severity-low { border-color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 Game Testing Dashboard</h1>
        <p><strong>Generated:</strong> ${report.summary.timestamp}</p>

        <div class="card">
            <h2>📊 Test Summary</h2>
            <div class="metric">✅ Passed: ${report.summary.passed}</div>
            <div class="metric">❌ Failed: ${report.summary.failed}</div>
            <div class="metric">🔄 Flaky: ${report.summary.flaky}</div>
            <div class="metric">⏱️ Duration: ${(report.summary.duration / 1000).toFixed(1)}s</div>
        </div>

        <div class="card">
            <h2>⚡ Performance Metrics</h2>
            <div class="metric ${this.getFPSClass(report.performance.fps?.average)}">
                🎯 Average FPS: ${report.performance.fps?.average?.toFixed(1) || 'N/A'}
            </div>
            <div class="metric">📉 Min FPS: ${report.performance.fps?.min || 'N/A'}</div>
            <div class="metric">📈 Max FPS: ${report.performance.fps?.max || 'N/A'}</div>
            <div class="metric">🧠 Peak Memory: ${report.performance.memory?.peak ? (report.performance.memory.peak / 1024 / 1024).toFixed(1) + 'MB' : 'N/A'}</div>
        </div>

        <div class="card">
            <h2>💡 Recommendations</h2>
            ${report.recommendations.map(rec => `
                <div class="recommendation severity-${rec.severity}">
                    <h4>${rec.title}</h4>
                    <p>${rec.message}</p>
                    <small><strong>Action:</strong> ${rec.action}</small>
                </div>
            `).join('')}
        </div>

        <div class="card">
            <h2>🔍 Detailed Results</h2>
            <p>See <a href="html-report/index.html">Interactive Report</a> for detailed test results.</p>
            <p>See <code>game-testing-report.json</code> for raw data.</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(
      path.join(process.cwd(), 'tests/reports/game-dashboard.html'),
      html
    );
  }

  getFPSClass(fps) {
    if (!fps) return '';
    if (fps >= 50) return 'fps-good';
    if (fps >= 30) return 'fps-warning';
    return 'fps-danger';
  }

  formatPerformanceSummary(performance) {
    if (!performance.fps) return 'No performance data';
    return `FPS: ${performance.fps.average.toFixed(1)} avg, ${performance.fps.min} min`;
  }
}

export default CustomGameReporter;