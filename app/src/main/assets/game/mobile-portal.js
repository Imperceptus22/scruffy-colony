// Portalatlas: presentation around the original portal nodes and handlers.
var MobilePortal = (() => {
    const byId=id=>document.getElementById(id);
    const groups={Combat:['Power','Toughness','Agility','Range','Anticipation','Resilience','Overkill','Criticality','Equality','Prismal','Hunger','Championism','Frenzy','Tenacity'],Economy:['Looting','Motivation','Packrat','Resourceful','Artisanistry','Meditation','Greed','Smithology'],Trimps:['Bait','Trumps','Pheromones','Carpentry','Coordinated','Capable','Cunning','Curious','Classy','Observation','Expansion']};
    const effects={Power:'Attack',Toughness:'Health',Agility:'Attack interval',Range:'Minimum damage',Anticipation:'Attack after breeding',Resilience:'Health',Overkill:'Excess damage',Criticality:'Critical hits',Equality:'Balance damage',Prismal:'Prismatic Shield',Hunger:'Overkill damage',Championism:'Attack and health',Frenzy:'Temporary attack bonus',Tenacity:'Attack over time',Looting:'Loot',Motivation:'Production',Packrat:'Storage',Resourceful:'Building cost',Artisanistry:'Equipment cost',Meditation:'Production over time',Greed:'Loot from Tributes',Smithology:'Smithy effect',Bait:'Trap capture',Trumps:'Territory bonus',Pheromones:'Breeding',Carpentry:'Maximum population',Coordinated:'Coordination requirement',Capable:'Fluffy levels',Cunning:'Fluffy experience',Curious:'Fluffy experience',Classy:'Fluffy experience',Observation:'Trinkets',Expansion:'Tauntimp bonus',Masterfulness:'Greed and Tenacity',Siphonology:'Map levels'};
    function meta(name){const base=name.replace(/_II$/,'');return {group:Object.keys(groups).find(key=>groups[key].includes(base))||'Trimps',effect:effects[base]||'Original effect · Info',icon:['Power','Overkill','Range','Anticipation','Criticality','Hunger','Frenzy','Tenacity'].includes(base)?'sword':['Toughness','Resilience','Prismal','Equality','Championism'].includes(base)?'shield':base==='Agility'?'clock':base==='Packrat'?'box':base==='Bait'?'trap':['Pheromones','Carpentry','Trumps'].includes(base)?'heart':groups.Economy.includes(base)?'bag':'spark'};}
    // V-157: outside viewingUpgrades the overview leads into the guided new run: 1 Challenge, 2 Perks, 3 Review.
    let view='overview',filter='All',wasOpen=false,scheduled=false,keepView=false,building=false;
    const steps={challenges:1,perks:2,review:3},order=['overview','challenges','perks','review'];
    // V-243 step 4d: own labels pass through the translator of the language catalog (identity in English). text() compares
    // the translated value, so a German label is written once and never rewritten every refresh.
    let tr=value=>value,html=value=>value;
    const text=(node,value)=>{const english=String(value);value=tr(english);if(node.textContent!==value)node.textContent=value;if(value!==english&&node.lang!=='de')node.lang='de';};
    const run=()=>!game.global.viewingUpgrades,currency=()=>portalUniverse===2?'Radon':'Helium',squared=()=>challengeSquaredMode?' C'+(portalUniverse===2?'³':'²'):'';
    function button(label,action,id){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;if(id)b.id=id;return b;}
    function el(tag,id,className,content){const n=document.createElement(tag);if(id)n.id=id;if(className)n.className=className;if(content!==undefined)n.textContent=content;return n;}
    function svg(name){return '<svg aria-hidden="true" viewBox="0 0 24 24"><use href="mobile-assets/portal-symbols.svg#'+name+'"/></svg>';}
    function show(next){
        if((next==='review'||next==='challenges')&&!run())next='overview';
        if(next!=='perks'&&typeof MobilePerky!=='undefined')MobilePerky.close();
        view=next;const root=byId('portalWrapper');root.dataset.portalView=next;
        for(const name of order)byId(name==='review'?'mobile-portal-run-review':'mobile-portal-'+name).hidden=name!==next;
        // The review page is rebuilt from the original confirmation each time and emptied when left (no stale original IDs).
        if(next==='review')buildReview();else if(byId('mobile-portal-run-review').firstChild)byId('mobile-portal-run-review').replaceChildren();
        root.scrollTop=0;refresh();
    }
    function back(){if(byId('portalWrapper').style.display==='none'||view==='overview')return false;show(run()?order[order.indexOf(view)-1]:'overview');return true;}
    function open(){if(keepView){keepView=false;refresh();return;}wasOpen=false;filter='All';for(const b of byId('mobile-perk-filters').children)b.setAttribute('aria-pressed',String(b.textContent==='All'));refresh();}
    function refreshChallenge(){
        const name=game.global.selectedChallenge,challenge=game.challenges[name],host=byId('mobile-challenge-facts');
        const brief={Discipline:['Lower minimum damage, higher maximum damage.','Complete Dimension of Anger.'],Metal:['No Miners until the Challenge is completed.','Complete Dimension of Anger.']};
        const known=!challengeSquaredMode&&brief[name];
        // Step 1 names the selected Challenge above the tiles; the short facts exist for the first Challenges only.
        host.hidden=!challenge||!run();
        if(challenge){
            const reward=known&&challenge.unlocks?(isPerkUnlocked(challenge.unlocks,true)?'Perk '+challenge.unlocks+' is already unlocked.':'Unlocks the Perk '+challenge.unlocks+'.'):'See the original conditions.';
            const signature=JSON.stringify([name,squared(),known,reward]);
            if(host.dataset.signature!==signature){host.dataset.signature=signature;host.replaceChildren(el('h3','','',name+squared()));
                if(!known)host.append(el('p','','mobile-challenge-more','Complete rules, goal and reward below the list.'));
                else for(const [label,value] of [['Rule',known[0]],['Goal',known[1]],['Reward',reward]]){const row=document.createElement('p');row.append(el('strong','','',label),document.createElement('br'),value);host.append(row);}}
        }
        // Later/dynamic challenge rules retain their complete original controls and values.
        const details=byId('mobile-challenge-rules');
        if(details.dataset.selection!==name+'|'+challengeSquaredMode){details.dataset.selection=name+'|'+challengeSquaredMode;details.open=!!challenge&&!known;}
    }
    function effectText(name,perk){const base=name.replace(/_II$/,'');const label=meta(name).effect;if(['Power','Toughness','Looting','Motivation','Packrat','Pheromones','Agility','Artisanistry','Resourceful','Resilience','Carpentry'].includes(base))return label+' '+(['Agility','Artisanistry','Resourceful'].includes(base)?'−':'+')+prettify(perk.modifier*100)+'% per level';if(['Bait','Trumps'].includes(base))return label+' +'+perk.modifier+' per level';return label;}
    function decoratePerks(){
        for(const action of [...byId('portalUpgradesHere').querySelectorAll('button.portalThing')]){
            const name=action.id,perk=game.portal[name];
            if(!perk){
                // Preserve the separate original Equality control and give its hover help a touch target.
                if(name==='equalityScaling'){
                    let special=action.closest('.mobile-portal-special');
                    if(!special){special=document.createElement('article');special.className='mobile-portal-special';action.before(special);const info=button(tr('Info Equality Scaling'),()=>TrimpsUI.infoAction(()=>tooltip('Equality Scaling',null,'update')));special.append(action,info);}
                    special.hidden=filter!=='All'&&filter!=='Combat';
                }
                continue;
            }
            if(!action.closest('.mobile-perk')){
                const article=document.createElement('article');article.className='mobile-perk';article.dataset.perk=name;const priority=['Power','Toughness','Agility','Looting','Motivation','Packrat','Pheromones','Trumps','Bait'].indexOf(name);article.style.order=priority<0?100:priority;action.before(article);
                const data=meta(name),heading=document.createElement('strong');heading.className='mobile-perk-name';heading.textContent=name.replaceAll('_',' ');
                const icon=document.createElement('span');icon.className='mobile-perk-symbol';icon.innerHTML=svg(data.icon);
                const info=button('Info',()=>TrimpsUI.info(name,'portal'));info.className='mobile-perk-info';info.setAttribute('aria-label','Info '+heading.textContent);
                const level=document.createElement('span');level.className='mobile-perk-level';level.append('Level ',byId(name+'Owned'));
                const effect=document.createElement('small');effect.className='mobile-perk-effect';effect.textContent=effectText(name,perk);
                // Keep original optional readout IDs alive for updatePerkLevel, without duplicate prices.
                const readouts=document.createElement('span');readouts.hidden=true;
                for(const suffix of ['Price','Spent','screenReaderPerkAfford']){const node=byId(suffix==='screenReaderPerkAfford'?suffix+name:name+suffix);if(node)readouts.append(node);}
                action.replaceChildren();action.onmouseover=null;action.onmouseout=null;action.classList.add('mobile-perk-buy');action.setAttribute('aria-label','Increase '+heading.textContent);
                article.append(icon,heading,info,level,effect,action,readouts);
            }
            const article=action.closest('.mobile-perk');article.hidden=filter!=='All'&&meta(name).group!==filter;
            const removing=game.global.removingPerks,amount=getPerkBuyCount(name),maxed=action.classList.contains('perkColorMaxed');
            const price=maxed?'Max':prettify(getPortalUpgradePrice(name,false,amount))+' '+(portalUniverse===2?'Rn':'He');
            text(action,removing?'− Remove':'+'+prettify(amount)+' · '+price);
            action.disabled=!action.classList.contains('perkColorOn')||(game.global.viewingUpgrades&&game.global.challengeActive==='Hypothermia');
            action.setAttribute('aria-label',tr((removing?'Remove ':'Increase ')+name.replaceAll('_',' ')+': '+(removing?'Original amount':price)));
        }
    }
    function refresh(){
        const root=byId('portalWrapper');
        if(root.style.display==='none'){wasOpen=false;keepView=false;view='overview';const review=byId('mobile-portal-run-review');if(review.firstChild)review.replaceChildren();if(typeof MobilePerky!=='undefined')MobilePerky.refresh();return;}
        if(!wasOpen){wasOpen=true;view='overview';show('overview');return;}
        if(!run()&&(view==='challenges'||view==='review')){show('overview');return;}
        const flow=run(),step=flow?steps[view]||0:0,selected=game.global.viewingUpgrades?game.global.challengeActive:game.global.selectedChallenge;
        byId('mobile-portal-open-challenges').hidden=!flow;
        // Current-run information and abandon/return actions remain available without offering a new Challenge.
        const current=byId('viewChallenge'),currentHost=byId(flow?'challengeCol':'mobile-portal-overview');
        if(current.parentNode!==currentHost){if(flow)currentHost.prepend(current);else currentHost.append(current);current.classList.toggle('mobile-portal-card',!flow);}
        const chosen=(game.global.selectedChallenge||'No Challenge')+(game.global.selectedChallenge?squared():'');
        root.toggleAttribute('data-portal-run',flow);root.dataset.portalStep=String(step);root.toggleAttribute('data-portal-removing',!!game.global.removingPerks);
        text(byId('mobile-portal-view-title'),view==='overview'?'Time Portal':flow?'New run':view==='perks'?'Perk Atlas':'Challenge');
        byId('mobile-portal-back').hidden=view==='overview'||flow;
        for(const item of byId('mobile-portal-steps').children){const n=+item.dataset.step;item.toggleAttribute('data-done',n<step);if(n===step)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');}
        text(byId('mobile-portal-perks-title'),flow?'Browse Perks →':'Upgrade Perks →');
        text(byId('mobile-portal-perks-note'),flow?'Jumps to step 2 of the flow':'');
        text(byId('mobile-portal-challenge-title'),flow?'Browse Challenges →':'Choose Challenge');
        text(byId('mobile-portal-challenge-label'),flow?'Selected: '+chosen:selected?selected+squared():'No Challenge');
        text(byId('cancelPortalBtn'),'');
        text(byId('activatePortalBtn'),game.global.viewingUpgrades?'Apply changes':'Review new run');
        text(byId('mobile-portal-mode'),game.global.viewingUpgrades?'Manage Perks without ending your current run.':'Prepare Perks and choose a Challenge for your next run.');
        text(byId('mobile-portal-perk-balance'),byId('portalHelium').textContent+' available · '+byId('totalHeliumSpent').textContent+' spent on Perks'+(game.global.viewingUpgrades&&game.global.challengeActive==='Hypothermia'?' · Hypothermia: Perk changes are disabled.':''));
        // Step 1: universe card around the original swap button, Normal | C² switch for the original toggle, "No Challenge".
        text(byId('mobile-portal-universe-name'),'Universe '+portalUniverse+' · '+currency());
        const c2=byId('mobile-portal-c2'),label='C'+(portalUniverse===2?'³':'²');
        c2.hidden=byId('challengeTitleSquared').style.display==='none'||(portalUniverse===2&&game.global.highestRadonLevelCleared<49);
        text(c2.querySelector('[data-squared="true"]'),label);text(c2.querySelector('small'),'Mode · '+label+' bonus '+byId('challengeSquaredBonusAmt').textContent+'%');
        for(const b of c2.querySelectorAll('button'))b.setAttribute('aria-pressed',String((b.dataset.squared==='true')===!!challengeSquaredMode));
        // C²/C³ buttons carry their progress colour instead of the state classes, so the key is shown for Normal only.
        byId('mobile-challenge-legend').hidden=!!challengeSquaredMode;
        const none=byId('challenge0')?.querySelector('.thingName');if(none&&none.textContent==='None')none.textContent='No Challenge';
        // Step 2: chosen Challenge, readable balance above Perky, Add | Remove beside the categories.
        text(byId('mobile-portal-chosen-name'),chosen);
        const entry=byId('mobile-perky-entry'),balance=byId('mobile-portal-perk-balance');
        if(entry){if(flow&&balance.nextElementSibling!==entry)balance.after(entry);else if(!flow&&entry.nextElementSibling!==balance)balance.before(entry);}
        const remove=byId('mobile-portal-remove');remove.hidden=byId('ptabRemove').style.display==='none';
        for(const b of remove.children)b.setAttribute('aria-pressed',String((b.dataset.removing==='true')===!!game.global.removingPerks));
        const tools=byId('mobile-portal-tools');tools.hidden=![...tools.children].some(n=>n.tagName!=='SUMMARY'&&n.style.display!=='none');
        const back=byId('mobile-portal-step-back'),next=byId('mobile-portal-step-next');
        text(back,['','← Overview','← Challenge','← Perks'][step]||'');text(next,['','Next: Perks →','Next: Review →','Start new run'][step]||'');
        refreshChallenge();
        decoratePerks();
        if(typeof MobilePerky!=='undefined')MobilePerky.refresh();
    }
    function buildReview(){
        const host=byId('mobile-portal-run-review'),hero=el('img','','mobile-portal-hero');hero.src='mobile-assets/portal.png';hero.alt='';
        // The original confirmation text (Challenge line, story, Daily/C²/Heirloom/Magmite warnings) moves onto the page.
        // No screen reader "Confirmation Popup is active" announcement: the text becomes a page, not a popup.
        const announce=globalThis.screenReaderAssert;globalThis.screenReaderAssert=()=>{};
        building=true;try{activateClicked();}finally{building=false;globalThis.screenReaderAssert=announce;}
        // The original confirmation sentences become German as one piece before they leave the tooltip.
        const tip=byId('tipText'),translated=html(tip.innerHTML);if(translated!==tip.innerHTML)tip.innerHTML=translated;
        const warnings=el('div','','mobile-portal-warnings');warnings.append(...tip.childNodes);cancelTooltip();
        const changes=Object.entries(game.portal).filter(([,perk])=>perk&&perk.levelTemp).map(([name,perk])=>name.replaceAll('_',' ')+' '+(perk.levelTemp>0?'+':'−')+prettify(Math.abs(perk.levelTemp)));
        const summary=el('dl');
        for(const [label,value,target] of [['Universe','Universe '+portalUniverse+' · '+currency()],['Challenge',(game.global.selectedChallenge||'No Challenge')+(game.global.selectedChallenge?squared():''),'challenges'],['Perks',changes.length?changes.join(', '):'No changes','perks'],[currency(),byId('portalHeliumOwned').textContent+' left · '+byId('totalHeliumSpent').textContent+' spent on Perks']]){
            const row=el('div');row.append(el('dt','','',tr(label)),el('dd','','',tr(value)));
            if(target){const edit=button(tr('Edit'),()=>show(target));edit.setAttribute('aria-label',tr('Edit '+label));row.append(edit);}
            summary.append(row);
        }
        // V-202: the bones before the new run (mobile-bone-hints.js); the trader is offered after the start.
        const bones=typeof MobileBoneHints!=='undefined'&&MobileBoneHints.reviewRow((label,value)=>{const row=el('div');row.append(el('dt','','',label),el('dd','','',value));return row;});
        if(bones)summary.append(bones);
        host.replaceChildren(hero,el('h2','','',tr('Your current run will end')),summary,el('p','','mobile-portal-kept',tr('Resources, buildings, jobs and current combat will reset. Permanent progress such as Perks, Helium/Radon and Bones is retained under the original rules.')),warnings);
    }
    function start(){
        // activatePortal stays the only start; if it declines (e.g. the Daily changed) its message is shown on the review.
        // A second tap after a successful start (portal closed, review still set) must not run activatePortal again.
        if(!portalWindowOpen||view!=='review')return;
        const story=byId('portalStory').innerHTML;activatePortal();
        if(!portalWindowOpen||view!=='review')return;
        show('review');if(byId('portalStory').innerHTML!==story){const notice=el('p','','portalError');notice.innerHTML=byId('portalStory').innerHTML;byId('mobile-portal-run-review').prepend(notice);}
    }
    function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refresh();});}
    function decorateConfirmation(){
        if(building||game.global.viewingUpgrades||!byId('portalConfirmStory'))return;
        byId('tooltipDiv').classList.add('mobile-portal-confirm');
        text(byId('tipTitle'),'Review new run');
        const summary=document.createElement('section');summary.id='mobile-portal-review';
        const image=document.createElement('img');image.src='mobile-assets/portal.png';image.alt='';
        const title=document.createElement('h2');title.textContent=tr('Your current run will end');
        const line=document.createElement('p');line.textContent=tr('Universe '+portalUniverse+' · '+(portalUniverse===2?'Radon':'Helium')+' · '+(game.global.selectedChallenge||'No Challenge')+(challengeSquaredMode?' C'+(portalUniverse===2?'³':'²'):''));
        const currency=document.createElement('p');currency.textContent=tr(byId('portalHelium').textContent+' available · '+byId('totalHeliumSpent').textContent+' spent on Perks');
        const kept=document.createElement('p');kept.textContent=tr('Resources, buildings, jobs and current combat will reset. Permanent progress such as Perks, Helium/Radon and Bones is retained under the original rules.');
        const tip=byId('tipText'),translated=html(tip.innerHTML);if(translated!==tip.innerHTML)tip.innerHTML=translated;
        summary.append(image,title,line,currency,kept);tip.prepend(summary);
        const confirm=byId('tipCost').querySelector('[onclick="activatePortal()"]');if(confirm)confirm.textContent=tr('Start new run');
        const cancel=byId('tipCost').querySelector('[onclick="cancelTooltip()"]');if(cancel)cancel.textContent=tr('Keep editing selection');
        byId('tooltipDiv').scrollTop=0;
    }
    function setup(){
        const root=byId('portalWrapper'),header=document.createElement('header');header.id='mobile-portal-header';
        const title=document.createElement('span');title.id='mobile-portal-view-title';
        header.append(button('← Overview',()=>show('overview'),'mobile-portal-back'),title,byId('cancelPortalBtn'));root.prepend(header);
        const close=byId('cancelPortalBtn');close.textContent='';close.setAttribute('role','button');close.tabIndex=0;close.setAttribute('aria-label','Close');
        const overview=document.createElement('section');overview.id='mobile-portal-overview';
        overview.innerHTML='<img class="mobile-portal-hero" src="mobile-assets/portal.png" alt="Trimps at a stone Time Portal in the forest"><h1>Time Portal</h1><p id="mobile-portal-mode"></p>';
        root.insertBefore(overview,byId('titleRow'));const stats=byId('titleCol2');overview.append(stats);
        for(const [id,label] of [['portalTotalHelium',' earned in total'],['portalTotalSpent',' spent on Perks'],['portalTotalPortals',' Portals used']]){const node=byId(id);node.replaceChildren(node.firstElementChild,label);}
        // V-157: one entry into the guided run; Browse Perks/Challenges jump straight to step 2/1 of it.
        const prepare=button('',()=>show('challenges'),'mobile-portal-prepare');prepare.append(el('span','','mobile-portal-prepare-title','Prepare new run'),el('span','','mobile-portal-prepare-steps','1 Challenge · 2 Perks · 3 Review'));
        const perksEntry=button('',()=>show('perks'),'mobile-portal-open-perks');perksEntry.append(el('span','mobile-portal-perks-title'),el('strong','mobile-portal-perks-note'));
        const challenge=button('',()=>show('challenges'),'mobile-portal-open-challenges');challenge.append(el('span','mobile-portal-challenge-title'),el('strong','mobile-portal-challenge-label'));
        overview.append(prepare,perksEntry,challenge);
        // V-158/V-159: About the Portal, More Info and the old Remove tab leave the interface; main.js/updates.js still write them.
        const originals=el('div','mobile-portal-originals');originals.hidden=true;originals.append(byId('portalStory'),byId('ptabInfo'),byId('ptabRemove'));root.append(originals);
        const stepper=el('ol','mobile-portal-steps');stepper.setAttribute('aria-label','New run steps');
        for(const [n,label] of [[1,'Challenge'],[2,'Perks'],[3,'Review']]){const item=el('li');item.dataset.step=n;item.append(el('span','','mobile-portal-step-number',String(n)),el('span','','mobile-portal-step-label',label));stepper.append(item);}
        header.after(stepper);
        const perks=document.createElement('section');perks.id='mobile-portal-perks';root.insertBefore(perks,byId('titleRow'));perks.append(byId('perkCol'));
        const balance=document.createElement('p');balance.id='mobile-portal-perk-balance';byId('perkCol').prepend(balance);
        const chosen=el('div','mobile-portal-chosen','mobile-portal-card'),chosenText=el('div');chosenText.append(el('small','','','Challenge'),el('strong','mobile-portal-chosen-name'));chosen.append(chosenText,button('Change',()=>show('challenges')));balance.before(chosen);
        const presets=document.createElement('details');presets.id='mobile-portal-presets';presets.innerHTML='<summary>Presets · Load, Save and Import/Export</summary>';byId('portalPresets').before(presets);presets.append(byId('portalPresets'));
        const filters=document.createElement('nav');filters.id='mobile-perk-filters';filters.setAttribute('aria-label','Perk categories');
        for(const category of ['All','Combat','Economy','Trimps']){const tab=button(category,()=>{filter=category;for(const b of filters.children)b.setAttribute('aria-pressed',String(b===tab));decoratePerks();});tab.setAttribute('aria-pressed',String(category==='All'));filters.append(tab);}
        // Add | Remove switches the original removingPerks through toggleRemovePerks, shown whenever the original shows its tab.
        const remove=el('div','mobile-portal-remove');remove.setAttribute('role','group');remove.setAttribute('aria-label','Add or remove Perk levels');
        for(const [label,removing] of [['+ Add',false],['− Remove',true]]){const b=button(label,()=>{if(!!game.global.removingPerks!==removing)toggleRemovePerks();refresh();});b.dataset.removing=String(removing);remove.append(b);}
        const filterRow=el('div','mobile-portal-filter-row');filterRow.append(filters,remove);byId('portalUpgradesHere').before(filterRow);
        const challenges=document.createElement('section');challenges.id='mobile-portal-challenges';challenges.innerHTML='<h2>Choose a Challenge</h2>';root.insertBefore(challenges,byId('titleRow'));challenges.append(byId('challengeCol'));
        const universe=el('div','mobile-portal-universe','mobile-portal-card'),universeText=el('div');universeText.append(el('small','','','Universe'),el('strong','mobile-portal-universe-name'));universe.append(universeText,byId('swapPortalUniverseBtn'));
        // The original swap re-runs portalClicked (and with it MobilePortal.open); the guided run stays on step 1.
        root.addEventListener('click',event=>{if(event.target.closest('#swapPortalUniverseBtn')&&run())keepView=true;},true);
        const c2=el('div','mobile-portal-c2','mobile-portal-card'),modes=el('div','','mobile-portal-segments');c2.setAttribute('role','group');c2.setAttribute('aria-label','Challenge mode');
        for(const [label,on] of [['Normal',false],['C²',true]]){const b=button(label,()=>{if(!!challengeSquaredMode!==on)toggleChallengeSquared();refresh();});b.dataset.squared=String(on);modes.append(b);}
        c2.append(el('small'),modes);
        challenges.querySelector('h2').before(universe,c2,byId('swapToCurrentChallengeBtn'));
        byId('challengeDescription').before(byId('challengesHere'));
        // V-171: key to the state marks mobile-portal.css draws from the original classes (finishedChallenge, challengeRepeatable).
        const legend=el('p','mobile-challenge-legend','mobile-challenge-legend','✓ completed · ↻ repeatable');byId('challengesHere').before(legend);
        const facts=document.createElement('section');facts.id='mobile-challenge-facts';challenges.querySelector('h2').after(facts);
        const rules=document.createElement('details');rules.id='mobile-challenge-rules';rules.innerHTML='<summary>Complete original rules · Goal and reward</summary>';byId('specificChallengeDescription').before(rules);rules.append(byId('specificChallengeDescription'));
        const review=el('section','mobile-portal-run-review');
        const tools=document.createElement('details');tools.id='mobile-portal-tools';tools.innerHTML='<summary>Respec & Tools</summary>';
        for(const id of ['respecPortalBtn','clearPerksBtn','respecMutatorsBtn'])tools.append(byId(id));
        root.insertBefore(overview,byId('titleRow'));root.insertBefore(perks,byId('titleRow'));root.insertBefore(challenges,byId('titleRow'));root.insertBefore(review,byId('titleRow'));byId('portalUpgradesHere').after(tools);
        const footer=el('div','mobile-portal-footer');footer.append(button('',back,'mobile-portal-step-back'),button('',()=>view==='review'?start():show(order[order.indexOf(view)+1]),'mobile-portal-step-next'));root.append(footer);
        overview.querySelector('h1').replaceChildren(byId('portalTitle'));
        new MutationObserver(schedule).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
        root.addEventListener('click',schedule);
        show('overview');
    }
    if(typeof document!=='undefined')setup();
    // V-243 step 4d: the German catalog (mobile-i18n-de-portal.js) hands over its translators once. Labels written once in
    // setup are translated here; the Perk filter keeps its English names ('All' is compared in open()). The preset actions
    // (Save, Load …) are relabelled once here, not as shared strings (other windows keep their English Save/Cancel).
    function translate(text,markup){
        if(typeof text!=='function')return false;
        tr=text;if(typeof markup==='function')html=markup;
        const root=byId('portalWrapper');if(!root)return true;
        const fixed='#mobile-portal-back,#portalTotalHelium,#portalTotalSpent,#portalTotalPortals,#mobile-portal-prepare,#mobile-portal-steps,#mobile-portal-chosen small,#mobile-portal-chosen>button,#mobile-portal-presets>summary,#mobile-portal-remove,#mobile-portal-universe small,#mobile-portal-tools>summary,#presetTabSave,#presetTabLoad,#presetTabRename,#presetTabExport,#presetTabImport';
        for(const node of root.querySelectorAll(fixed)){const walker=document.createTreeWalker(node,4);while(walker.nextNode()){const t=walker.currentNode,next=tr(t.data);if(next!==t.data){t.data=next;t.parentElement.lang='de';}}}
        for(const node of root.querySelectorAll('#cancelPortalBtn,#mobile-portal-steps,#mobile-perk-filters,#mobile-portal-remove,#mobile-portal-c2,#mobile-portal-overview>img'))
            for(const name of ['aria-label','alt']){const value=node.getAttribute(name);if(value){const next=tr(value);if(next!==value)node.setAttribute(name,next);}}
        refresh();return true;
    }
    return {meta,show,open,back,refresh,decorateConfirmation,translate};
})();
if(typeof module!=='undefined')module.exports=MobilePortal;
