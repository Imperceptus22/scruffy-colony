// Settings removed from the mobile menu keep a fixed working value, also for imported older saves (docs/EINSTELLUNGEN.md).
function mobileSettingDefaults() {
    const menu = game.options.menu;
    menu.usePlayFab.enabled = 0;
    menu.tooltips.enabled = 1;
    menu.tooltipPosition.enabled = 0;
    if (menu.tinyButtons.enabled !== 0) { menu.tinyButtons.enabled = 0; menu.tinyButtons.onToggle(); }
    if (menu.darkTheme.enabled !== 1) { menu.darkTheme.enabled = 1; menu.darkTheme.onToggle(); }
}
var TrimpsMobile = (() => {
    let ready = false, background = false, nativeId = 0, appVersion = '', appBuild = 0, lifecycleGeneration = 0;
    let pendingLoad = false, awayPreferences = null, resumeAfterChange = false;
    let activeSlot = null, developmentAllowed = false, switching = false, documentsBusy = 0, changing = false;
    const session = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    const storageKey = (id = activeSlot) => id === 'dev' ? 'trimpSaveDev' : 'trimpSave' + (id || '1');
    const replies = new Map();
    // V-259: success and notice lines hide after about 4 s or on a tap; failures and warnings stay until a tap or the next
    // message. Each message clears the previous timer, so an older timer can never hide a newer line.
    const notices = new Set(['Save imported and stored.', 'Export file saved.', 'Offline progress is running. Your last confirmed save is safe.']);
    const noticeTime = 4000;
    let statusTimer = null, statusShown = 0;
    const status = text => {
        const node = document.getElementById('mobile-status'), shown = ++statusShown; node.textContent = text;
        clearTimeout(statusTimer); statusTimer = null;
        node.hidden = text === 'Game saved.';
        const dismiss = () => { if (shown !== statusShown) return; clearTimeout(statusTimer); statusTimer = null; node.hidden = true; node.onclick = null; };
        node.onclick = node.hidden ? null : dismiss;
        if (!node.hidden && (notices.has(text) || text.startsWith('Trimps Mobile '))) statusTimer = setTimeout(dismiss, noticeTime);
    };
    function failureDetail(error) {
        const code = error?.code || error?.message;
        if (!['INVALID','TOO_LARGE','UNSUPPORTED_VERSION','VALIDATION_TIMEOUT','WORKER_ERROR','STORAGE','BRIDGE','DOCUMENT','LOAD'].includes(code)) return '';
        const path = typeof error.path === 'string' && /^[A-Za-z0-9_.]{1,160}$/.test(error.path) ? ' at ' + error.path : '';
        return ' [' + code + path + ']';
    }
    function bridge(type, payload = null, purchase = null) {
        return new Promise((resolve, reject) => {
            if (typeof TrimpsNative === 'undefined') { reject(new Error('BRIDGE')); return; }
            const id = ++nativeId;
            const timeout = ['importFile', 'exportFile'].includes(type) ? null : setTimeout(() => { replies.delete(id); reject(new Error('STORAGE')); }, type === 'restore' ? 30000 : 10000);
            replies.set(id, {resolve, reject, timeout, type, slot:activeSlot});
            TrimpsNative.postMessage(JSON.stringify({id, type, payload, purchase, slot:activeSlot, session}));
        });
    }
    function freeze() {
        if(typeof TrimpsUI!=='undefined')TrimpsUI.suspend();
        if(typeof MobileMapMenu!=='undefined')MobileMapMenu.cancel();
        if(typeof MobileGuidedStart!=='undefined')MobileGuidedStart.suspend?.();
        mobileRuntimeSuspended = true;
        clearTimeout(mobileGameTimer);
        clearTimeout(mobileCostTimer);
        clearTimeout(autoSaveTimeout);
        if (usingRealTimeOffline) { clearTimeout(offlineProgress.loop); offlineProgress.loop = null; }
    }
    function alignClock(now) {
        game.global.lastOnline = now;
        game.global.start = now;
        game.global.time = 0;
    }
    function reconcileAway(coldStart = false) {
        if (awayPreferences) {
            game.options.menu.offlineProgress.enabled = awayPreferences.mode;
            game.global.timeWarpLimit = awayPreferences.limit;
            awayPreferences = null;
        }
        if (background) { pendingLoad = coldStart; return; }
        pendingLoad = false;
        if (game.options.menu.pauseGame.enabled) return;
        const now = Date.now(), elapsed = Math.max(0, now - game.global.lastOnline);
        if (!game.global.lastOnline) { alignClock(now); return; }
        if (!game.options.menu.offlineProgress.enabled) {
            game.global.portalTime += elapsed;
            game.global.zoneStarted += elapsed;
            alignClock(now);
        } else if (elapsed >= 300000) {
            checkOfflineProgress();
            // A Time Warp has not consumed its timestamp until it finishes.
            if (!usingRealTimeOffline) alignClock(now);
            else { game.global.start = now; game.global.time = 0; }
        } else if (coldStart) {
            // Let the ordinary game loop consume short absences after a reload,
            // just as it does on a warm resume. Keep lastOnline pending until then.
            game.global.start = Math.min(now, game.global.lastOnline);
            game.global.time = 0;
        }
    }
    function completeAway(reset) {
        if (reset) return;
        alignClock(Date.now());
        saveNow();
    }
    function thaw() {
        if (!background && !switching && !changing) {
            if(!engine.read()&&typeof MobileEarlyColony!=='undefined')MobileEarlyColony.start(game);
            if (pendingLoad) reconcileAway(true);
            startTrimpsMobileRuntime();
            if(typeof TrimpsUI!=='undefined')TrimpsUI.resume();
        }
    }
    const engine = {
        serialize:()=>saveOriginal(true), read:()=>localStorage.getItem(storageKey()),
        write:text=>text === null ? localStorage.removeItem(storageKey()) : localStorage.setItem(storageKey(),text),
        load:text=>{ const ok = loadOriginal(text); mobileSettingDefaults(); freeze(); return ok; },
        freeze, thaw, canSave:()=>!usingRealTimeOffline && !disableSaving
    };
    const transactions = SaveTransactions.createSaveTransactions(engine, bridge, SaveValidation.validateInWorker,
        async()=>window.confirm('Replace the current save with the imported one?'));
    async function saveNow() {
        if (!ready || switching) return false;
        const ok = await transactions.saveNow();
        status(ok ? 'Game saved.' : usingRealTimeOffline ? 'Offline progress is running. Your last confirmed save is safe.' : 'Saving failed' + failureDetail(transactions.failure?.()) + '. Please export your save.');
        return ok;
    }
    // label names the change in its failure messages (research by default; bone purchases since V-220).
    async function applySaveChange(change, label='Research', purchase=null) {
        if(!ready||switching||changing||documentsBusy||usingRealTimeOffline||disableSaving||game.options.menu.pauseGame.enabled)return false;
        changing=true;freeze();const wasInert=document.body.inert;document.body.inert=true;
        try{
            await transactions.drain();
            // A page may die after the atomic credit but before the shop's acknowledgement.
            if(purchase && await bridge('purchaseRecorded',purchase.token))return true;
            const data=JSON.parse(LZString.decompressFromBase64(saveOriginal(true)));
            if(change(data)!==true)return false;
            const candidate=LZString.compressToBase64(JSON.stringify(data));
            // Reuse the durable import transaction; no game value changes before validation/commit.
            const ok=await transactions.importSave(candidate,false,purchase);
            if(transactions.blocked?.()){ready=false;document.getElementById('mobile-recovery').hidden=false;status(label+' could not be verified. Reload to recover the stored save.');}
            return ok;
        }catch(_){status(label+' could not be saved. Nothing was changed.');return false;}
        finally{
            document.body.inert=wasInert;changing=false;
            if(ready&&!background&&resumeAfterChange){
                resumeAfterChange=false;
                // The original loader may already have started a Time Warp for this candidate.
                if(!usingRealTimeOffline)reconcileAway(pendingLoad);
            }
            if(ready)thaw();
        }
    }
    async function importSave(text) {
        if (!ready || switching || changing) { status('Import is locked: reload to verify the stored save first.'); return false; }
        const ok = await transactions.importSave(text);
        if (ok) { ready = true; document.getElementById('mobile-recovery').hidden = true; thaw(); }
        if (transactions.blocked?.()) {
            ready = false;
            freeze();
            document.getElementById('mobile-recovery').hidden = false;
            status('Import result could not be verified. The game is locked; reload to recover the stored save.');
        } else status(ok ? 'Save imported and stored.' : 'Import not applied. Your previous save is preserved.');
        return ok;
    }
    async function initialize() {
        document.getElementById('mobile-recovery').hidden = true;
        TrimpsNative.onmessage = event => {
            let reply;
            try { reply = JSON.parse(event.data); } catch (_) { return; }
            if (reply.session !== undefined && reply.session !== session) return;
            const pending = replies.get(reply.id);
            if (!pending) return;
            clearTimeout(pending.timeout); replies.delete(reply.id);
            if (reply.ok && pending.type === 'restore' && reply.result?.slot) {
                if (pending.slot !== null && pending.slot !== reply.result.slot) { pending.reject(new Error('STORAGE')); return; }
                if (!['1','2','3','dev'].includes(reply.result.slot)) { pending.reject(new Error('STORAGE')); return; }
                activeSlot = reply.result.slot;
                developmentAllowed = reply.result.developmentAllowed === true;
            }
            if (reply.ok && reply.result && reply.result.appVersion) appVersion = reply.result.appVersion;
            if (reply.ok && reply.result && Number.isInteger(reply.result.appBuild)) appBuild = reply.result.appBuild;
            if (reply.ok && reply.result && typeof reply.result.foreground === 'boolean') background = !reply.result.foreground;
            reply.ok ? pending.resolve(reply.result) : pending.reject(new Error(String(reply.result)));
        };
        const ok = await transactions.restore();
        if (ok) {
            ready = true;
            // N.00 shows as N.0, e.g. 1.0 / 1.0-preview for versionName 1.00 (V-205); all other numbers keep two decimals.
            status('Trimps Mobile ' + appVersion.replace(/^(\d+)\.00(?=$|-)/, '$1.0') + ' · Original ' + game.global.stringVersion + ' · Offline');
            // The welcome of a new game opens with the guided start (mobile-guided-start.js).
            if (!engine.read()) mobileSettingDefaults();
            if (!usingRealTimeOffline && !background) await saveNow();
        } else {
            freeze();
            document.getElementById('mobile-recovery').hidden = false;
            status('The stored save could not be loaded' + failureDetail(transactions.failure?.()) + '. No new game was saved.');
        }
        return ok;
    }
    async function suspend() {
        lifecycleGeneration++;
        background = true;
        freeze();
        return saveNow();
    }
    async function resume() {
        const wasBackground = background;
        if (!wasBackground) return;
        background = false;
        if (switching) return;
        if (changing) { resumeAfterChange=true; return; }
        resumeAfterChange=false;
        const generation = ++lifecycleGeneration;
        await transactions.drain();
        if (!ready || background || generation !== lifecycleGeneration) return;
        if (changing) { resumeAfterChange=true; return; }
        if (usingRealTimeOffline) {
            // Partial Time Warp state is deliberately not a durable checkpoint.
            awayPreferences = {mode:game.options.menu.offlineProgress.enabled, limit:game.global.timeWarpLimit};
            ready = false;
            freeze();
            const ok = await transactions.restore();
            ready = ok;
            if (!ok) {
                freeze();
                document.getElementById('mobile-recovery').hidden = false;
                status('Offline progress could not restart. Your stored save is preserved.');
                return;
            }
            if (background || generation !== lifecycleGeneration) return;
        } else {
            reconcileAway(pendingLoad);
        }
        thaw();
        if (!usingRealTimeOffline) await saveNow();
    }
    async function importFile() {
        if (switching || changing) return false;
        documentsBusy++;
        try { const text = await bridge('importFile'); return text === null ? false : await importSave(text); }
        catch (_) { status('The file could not be read. Reload to verify the stored save if recovery is pending.'); return false; }
        finally { documentsBusy--; }
    }
    async function exportFile() {
        if (switching || changing) return false;
        documentsBusy++;
        try {
            const stored = !ready || usingRealTimeOffline || disableSaving ? engine.read() : saveOriginal(true);
            const {compressed} = await SaveValidation.validateInWorker(stored);
            const ok = await bridge('exportFile', compressed);
            if (ok) status('Export file saved.');
            return ok;
        } catch (error) { status('Export failed' + failureDetail(error) + '. Please try again.'); return false; }
        finally { documentsBusy--; }
    }
    async function changeSlot(target, scenario = null) {
        if (switching || changing || documentsBusy || usingRealTimeOffline || !['1','2','3','dev'].includes(target)) return false;
        if (target === 'dev' && (!developmentAllowed || !ready || !scenario)) return false;
        if (target === activeSlot && target !== 'dev') return false;
        const wasReady = ready;
        let attempted = false, verifiedUnchanged = false, previousDevelopment = null;
        switching = true;
        freeze();
        try {
            await transactions.drain();
            if (wasReady && !await transactions.saveNow()) throw new Error('STORAGE');
            if (target === 'dev') {
                await SaveValidation.validateInWorker(scenario);
                previousDevelopment = await bridge('readSlot', 'dev');
            }
            else {
                const state = await bridge('readSlot', target);
                const source = state.deleted ? null : state.rollback || state.lastGood || localStorage.getItem(storageKey(target));
                if (source) await SaveValidation.validateInWorker(source);
            }
            ready = false;
            attempted = true;
            try { await bridge(target === 'dev' ? 'startDevelopment' : 'selectSlot', scenario || target); }
            catch (error) {
                const state = await bridge('slotInfo');
                if (target === 'dev') {
                    const stored = await bridge('readSlot', 'dev');
                    if (state.active !== target || (stored.rollback || stored.lastGood) !== scenario) {
                        verifiedUnchanged = state.active === activeSlot && stored.lastGood === previousDevelopment.lastGood && stored.rollback === previousDevelopment.rollback;
                        throw error;
                    }
                } else if (state.active !== target) { verifiedUnchanged = state.active === activeSlot; throw error; }
            }
            // A fresh page rebuilds all original systems and preserves the selected slot's offline timestamp.
            window.location.reload();
            return true;
        } catch (error) {
            if (attempted && !verifiedUnchanged) {
                ready = false;
                document.getElementById('mobile-recovery').hidden = false;
                status('Save selection could not be verified. Reload or choose a confirmed save in Game saves.');
            } else {
                ready = wasReady;
                status('Save switch failed' + failureDetail(error) + '. Stored saves are preserved.');
            }
            switching = false;
            if (ready) thaw();
            return false;
        }
    }
    // V-248: delete one personal save. Another slot is emptied in place; the active one stops saving first and the page
    // reloads into a new game there. The local copy and the save's own preferences go as well.
    async function deleteSlot(target) {
        if (switching || changing || documentsBusy || usingRealTimeOffline || !['1','2','3'].includes(target)) return false;
        const active = target === activeSlot, wasReady = ready;
        if (active) { switching = true; ready = false; freeze(); }
        const deleted = () => {
            for (const key of [storageKey(target), 'trimps-mobile-qol-' + target]) try { localStorage.removeItem(key); } catch (_) {}
            if (active) window.location.reload();
            return true;
        };
        try {
            if (active) await transactions.drain();
            await bridge('deleteSlot', target);
            return deleted();
        } catch (error) {
            // Only a durable deletion marker proves that a lost reply followed a completed delete.
            const state = await bridge('readSlot', target).catch(() => null);
            if (state?.deleted === true) return deleted();
            if (active) {
                if (state) { switching = false; ready = wasReady; if (ready) thaw(); }
                else { document.getElementById('mobile-recovery').hidden = false; status('The save could not be deleted completely. Reload to continue.'); }
            }
            return false;
        }
    }
    async function slotInfo() {
        const state = await bridge('slotInfo');
        // A malformed active checkpoint may fail before restore can return its identity.
        if (!ready && !switching && ['1','2','3','dev'].includes(state.active)) activeSlot = state.active;
        developmentAllowed = state.developmentAllowed === true;
        return state;
    }
    function handleBack() {
        if (typeof TrimpsUI !== 'undefined') return TrimpsUI.back();
        if (game.global.lockTooltip || document.getElementById('tooltipDiv').style.display !== 'none') { cancelTooltip(); return true; }
        return false;
    }
    return {initialize,saveNow,importSave,importFile,exportFile,suspend,resume,handleBack,bridge,freeze,reconcileAway,completeAway,version:()=>appVersion,build:()=>appBuild,ready:()=>ready,
        slot:()=>activeSlot,storageKey,developmentAllowed:()=>developmentAllowed,busy:()=>switching||changing||documentsBusy>0,applySaveChange,
        slotInfo,slots:()=>bridge('slots'),status,selectSlot:id=>changeSlot(id),deleteSlot:id=>deleteSlot(id),startDevelopment:text=>changeSlot('dev',text)};
})();

function save(exportThis, fromManual) {
    if (exportThis) return saveOriginal(true, fromManual);
    if (mobileRuntimeSuspended || usingRealTimeOffline) return false;
    return TrimpsMobile.saveNow();
}
// Legacy keyboard/tooltip imports must use the same validation and durable transaction.
function load(text) {
    if (text === true) text = document.getElementById('importBox')?.value;
    return text ? TrimpsMobile.importSave(text) : false;
}
TrimpsMobile.initialize().catch(()=>{
    TrimpsMobile.freeze();
    // Through status, so a pending notice timer cannot hide this warning.
    TrimpsMobile.status('Save protection is unavailable. The app will not save.');
    document.getElementById('mobile-recovery').hidden = false;
});
