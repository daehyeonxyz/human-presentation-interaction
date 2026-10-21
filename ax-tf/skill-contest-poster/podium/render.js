const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport:{width:1760,height:820}});
  p.on('console', m=>console.log('console:', m.text())); p.on('pageerror', e=>console.log('err:', e.message));
  await p.goto('http://localhost:8765/podium/scene.html');
  await p.waitForFunction(()=>window.READY, null, {timeout:120000});
  await p.waitForTimeout(300);
  console.log(JSON.stringify(await p.evaluate(()=>window.TOPS)));
  await p.locator('canvas').screenshot({path:'../podium.png', omitBackground:true});
  await b.close();
})();
