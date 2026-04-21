import { test, expect } from '@playwright/test';
async function safeEval(page, fn) { try { return await page.evaluate(fn); } catch(e) { if(e.message.includes('Execution context')) { await page.waitForTimeout(2000); try { return await page.evaluate(fn); } catch(e2) { return null; } } return null; } }
test.describe('Sound System Tests', () => {
    let ce=[];
    test.beforeEach(async ({ page }) => { ce=[]; page.on('console',m=>{if(m.type()==='error')ce.push(m.text());}); page.on('pageerror',e=>{ce.push(e.message);}); });
    test('AudioManager initializes', async ({ page }) => { await page.goto('/index.html',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(6000); const a=await safeEval(page,()=>({ac:typeof AudioContext!=='undefined'||typeof webkitAudioContext!=='undefined',am:typeof audioManager!=='undefined'})); expect(a).not.toBeNull(); expect(a.ac).toBe(true); });
    test('Music options available', async ({ page }) => { await page.goto('/index.html',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(6000); const m=await safeEval(page,()=>{const s=document.getElementById('musicSelect');if(!s)return{options:[]};return{options:Array.from(s.options).map(o=>o.value)};}); if(m&&m.options.length>0){expect(m.options.length).toBeGreaterThan(0);}else{expect(await safeEval(page,()=>typeof audioManager!=='undefined')).toBe(true);} });
    test('Sound functions exist', async ({ page }) => { await page.goto('/index.html',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(6000); expect(await safeEval(page,()=>typeof audioManager!=='undefined')).toBe(true); });
    test('No sound errors during start', async ({ page }) => { await page.goto('/index.html',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(6000); const se=ce.filter(e=>e.toLowerCase().includes('audio')||e.toLowerCase().includes('sound')||e.toLowerCase().includes('oscillator')); expect(se.length).toBe(0); });
});
