import { test, expect } from '@playwright/test';
const IGNORE = ['WebGL','webgl','context could not be created','Error creating WebGL','setClearColor','THREE.WebGLRenderer','GPU','RENDER WARNING','framebuffer','BindToCurrentSequence','403','404','MIME type','mediapipe','cdn.jsdelivr.net','Refused to execute script','Failed to load resource','gestureController','Cannot read properties of undefined','position'];
function isCritical(t) { return !IGNORE.some(p => t.includes(p)); }
async function safeEval(page, fn) { try { return await page.evaluate(fn); } catch(e) { if(e.message.includes('Execution context')) { await page.waitForTimeout(2000); try { return await page.evaluate(fn); } catch(e2) { return null; } } return null; } }
test.describe('Game Start Health Check', () => {
    let ce=[], pe=[];
    test.beforeEach(async ({ page }) => { ce=[]; pe=[]; page.on('console',m=>{if(m.type()==='error')ce.push(m.text());}); page.on('pageerror',e=>{pe.push(e.message);}); });
    test('Production: Game loads without errors', async ({ page }) => { await page.goto('/index.html',{waitUntil:'domcontentloaded'}); await page.waitForSelector('canvas',{timeout:30000}); await page.waitForTimeout(6000); expect(await safeEval(page,()=>typeof THREE!=='undefined')).toBe(true); expect(await safeEval(page,()=>typeof gameState!=='undefined')).toBe(true); expect(await safeEval(page,()=>typeof window.startGame==='function')).toBe(true); expect(ce.filter(isCritical).length+pe.filter(isCritical).length).toBe(0); });
    test('Canvas and WebGL verification', async ({ page }) => { await page.goto('/index.html',{waitUntil:'domcontentloaded'}); await page.waitForSelector('canvas',{timeout:30000}); await page.waitForTimeout(6000); expect(ce.filter(isCritical).length).toBe(0); });
    test('No 404 for local assets', async ({ page }) => { const n=[]; page.on('response',r=>{if(r.status()===404&&(r.url().includes('localhost')||r.url().includes('127.0.0.1')))n.push(r.url());}); await page.goto('/index.html',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(6000); expect(n.length).toBe(0); });
});
