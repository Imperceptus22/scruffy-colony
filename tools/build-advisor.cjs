// Build the authored mobile copy, retaining the original chapter IDs and provenance.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const source=fs.readFileSync('app/src/main/assets/game/objects.js','utf8');
const code=source.slice(source.indexOf('var tutorial ='),source.indexOf('\nvar alchObj ='));
assert(code.startsWith('var tutorial ='));
const copy=JSON.parse(fs.readFileSync('docs/sources/advisor-copy.json','utf8'));
assert.equal(createHash('sha256').update(code).digest('hex'),copy.sourceTutorialSha256,'Original tutorial changed; review all copy and chapter mappings before updating the source hash');
const nodes=new Map(),context=vm.createContext({game:{global:{tutorialStep:15,tutorialLg:false}},document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,{style:{}});return nodes.get(id);}}});
vm.runInContext(code,context);context.tutorial.setWinSize=()=>{};context.tutorial.setBookmarks();
const titles=[...nodes.get('tutorialBookmarks').innerHTML.matchAll(/>([^<]+)<\/div>/g)].map(m=>m[1]);
assert.equal(copy.chapters.length,16);assert.equal(titles.length,16);
const chapters=copy.chapters.map((chapter,step)=>{
    assert.equal(chapter.step,step);assert.equal(chapter.title,titles[step]);assert(chapter.html&&chapter.goal);
    context.tutorial.viewingStep=step;context.tutorial.getText();
    assert.notEqual(chapter.html,nodes.get('tutorialTextInner').innerHTML);assert.notEqual(chapter.goal,nodes.get('tutorialGoal').innerHTML);
    return {...chapter,html:chapter.html+(step>0&&step<15?'<br/><br/>'+copy.reminder:''),source:'Adapted from Trimps 5.10.1 by Zach Hood / Greensatellite; objects.js → tutorial.getText → case '+step+'; reworded for Scruffy Colony'};
});
assert(copy.messages.mutatedZones&&copy.messages.mutatedEffects&&copy.messages.recycleEarlyMap);
const output='// Generated from docs/sources/advisor-copy.json by tools/build-advisor.cjs.\n// Reworded from Trimps 5.10.1 by Zach Hood / Greensatellite; GPL-3.0-or-later.\n// Original tutorial SHA-256: '+copy.sourceTutorialSha256+'\nvar MobileAdvisorChapters = Object.freeze('+JSON.stringify(chapters,null,2)+');\nvar MobileAdvisorMessages = Object.freeze('+JSON.stringify(copy.messages,null,2)+');\n'+`
// Keep the original navigation, sizing and progress logic; replace only its rendered copy.
{
    const original = tutorial.getText;
    tutorial.getText = function() {
        const result = original.apply(this, arguments);
        const chapter = MobileAdvisorChapters[this.viewingStep];
        if (!chapter) return result;
        const language=typeof MobileI18n!=='undefined'?MobileI18n.lang:'en';
        document.getElementById('tutorialTextInner').lang=language;
        document.getElementById('tutorialGoal').lang=language;
        document.getElementById('tutorialTextInner').innerHTML = MobileBranding.text(chapter.html);
        document.getElementById('tutorialGoal').innerHTML = MobileBranding.text(chapter.goal);
        return result;
    };
}
// V-206: when a new step is reached while the window is closed, the original only flashes the gold star. In the first run
// (no portal yet) the window opens by itself at each new step, once per step; More → Game → Quality of life can switch it
// off. The original step conditions, the star and manual opening stay unchanged.
if (typeof tutorial.check === 'function') {
    const original = tutorial.check;
    tutorial.check = function() {
        const before = game.global.tutorialStep;
        const result = original.apply(this, arguments);
        // The preference is read only when a step actually changed (check runs on every game tick).
        // V-240: while the guided start runs (mobile-guided-start.js), ADVISOR waits; it opens when the guided start ends.
        const auto = () => (typeof MobileQolStore === 'undefined' || MobileQolStore.get('advisorAutoOpen', true) !== false)
            && !(typeof MobileGuidedStart !== 'undefined' && MobileGuidedStart.active());
        if (game.global.tutorialStep !== before && !game.global.tutorialOpen && game.global.totalPortals === 0 && auto()) { this.openWindow(); this.resetScroll?.(); }
        return result;
    };
}
`;
const target='app/src/main/assets/game/mobile-advisor.js';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),output,'Advisor copy is stale; run node tools/build-advisor.cjs');
else fs.writeFileSync(target,output);
console.log('Advisor copy: 16 reworded chapters and goals, plus Mutated Zones and early-map recycling notice; original source mapping verified.');
