// V-305: only app-owned research text; game IDs and mechanics remain unchanged.
var MobileI18nDePerkResearch={strings:{
 'Perk Optimization':'Perk-Optimierung',
 'Researched':'Erforscht',
 'Research Perk Optimization':'Perk-Optimierung erforschen',
 'Info Perk Optimization':'Info zur Perk-Optimierung',
 'Research complete. Perk Optimization is unlocked.':'Forschung abgeschlossen. Die Perk-Optimierung ist freigeschaltet.',
 'Plan your next perk allocation using a target zone and play style. Review the suggestion before applying it. Requires four completed portal runs. Costs 1,000 Science and 500 Gems once. Kept through portals.':'Plane deine nächste Perk-Verteilung anhand einer Zielzone und eines Spielstils. Prüfe den Vorschlag vor dem Übernehmen. Erfordert vier abgeschlossene Portaldurchläufe. Kostet einmalig 1.000 Wissenschaft und 500 Edelsteine. Bleibt nach Portalen erhalten.',
 'Plan your next perk allocation. One-time cost: 1,000 Science and 500 Gems. Kept through portals.':'Plane deine nächste Perk-Verteilung. Einmalige Kosten: 1.000 Wissenschaft und 500 Edelsteine. Bleibt nach Portalen erhalten.',
 'Four completed portal runs; then research Perk Optimization.':'Vier abgeschlossene Portaldurchläufe; danach Perk-Optimierung erforschen.',
 'Unlock: Four completed portal runs; then research Perk Optimization.':'Freischaltung: Vier abgeschlossene Portaldurchläufe; danach Perk-Optimierung erforschen.'
},patterns:[[/^(\d+) of 4 portal runs$/,(_,n)=>n+' von 4 Portaldurchläufen']]};
if(typeof module!=='undefined')module.exports=MobileI18nDePerkResearch;
if(typeof MobileI18nGame!=='undefined')MobileI18nGame.extend('de',{...MobileI18nDePerkResearch,scope:'#mobile-perk-research,[data-unlock="mobile:perkOptimization"]'});
