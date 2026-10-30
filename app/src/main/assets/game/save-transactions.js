// One operations queue owns checkpoint and import ordering.
var SaveTransactions = (() => {
    function createSaveTransactions(engine, bridge, validate, confirm) {
        let queue = Promise.resolve(), failure = null, blocked = false;
        const serial = operation => {
            const result = queue.then(operation);
            queue = result.catch(() => {});
            return result;
        };
        const write = text => { engine.write(text); if (engine.read() !== text) throw new Error('STORAGE'); };
        async function checkpoint() {
            if (blocked || !engine.canSave()) return false;
            const {compressed} = await validate(engine.serialize());
            if (!engine.canSave()) return false;
            const previous = engine.read();
            try { write(compressed); await bridge('checkpoint', compressed); }
            catch (error) { write(previous); throw error; }
            return true;
        }
        function saveNow() { return serial(async () => { if (blocked) return false; failure = null; try { return await checkpoint(); } catch (error) { failure = error; return false; } }); }
        function importSave(text, ask = true, purchase = null) {
            return serial(async () => {
                if (blocked) return false;
                let previous, candidate, pending = false, frozen = false;
                failure = null;
                try {
                    const {compressed} = await validate(text);
                    candidate = compressed;
                    if (ask && !await confirm()) return false;
                    if (!engine.canSave()) return false;
                    engine.freeze();
                    frozen = true;
                    if (!await checkpoint()) throw new Error('STORAGE');
                    previous = engine.read();
                    pending = true;
                    await bridge('beginImport', previous);
                    if (engine.load(compressed) !== true) throw new Error('LOAD');
                    write(compressed);
                    await bridge('commitImport', compressed, purchase);
                    pending = false;
                    return true;
                } catch (error) {
                    failure = error;
                    if (pending) {
                        try {
                            // A native queue read runs after the timed-out write; its reply is authoritative.
                            let state = await bridge('restore');
                            if (!state.rollback && state.lastGood === candidate && (!purchase || await bridge('purchaseRecorded', purchase.token))) {
                                write(candidate);
                                pending = false;
                                failure = null;
                                return true;
                            }
                            if (state.rollback !== previous && (state.rollback || state.lastGood !== previous)) throw new Error('STORAGE');
                            write(previous);
                            if (engine.load(previous) !== true) throw new Error('RESTORE');
                            if (state.rollback) {
                                try { await bridge('rollback'); } catch (_) { /* Verify a lost rollback reply as well. */ }
                                state = await bridge('restore');
                            }
                            if (state.rollback || state.lastGood !== previous) throw new Error('STORAGE');
                            pending = false;
                        } catch (error) { failure = error; blocked = true; engine.freeze(); return false; }
                    }
                    return false;
                } finally { if (frozen && !pending) engine.thaw(); }
            });
        }
        function restore() {
            return serial(async () => {
                engine.freeze();
                try {
                    const state = await bridge('restore');
                    if (state.deleted) write(null);
                    const source = state.deleted ? null : state.rollback || state.lastGood || engine.read();
                    if (source) {
                        const apply = async text => {
                            await validate(text);
                            if (engine.load(text) !== true) throw new Error('LOAD');
                            write(text);
                        };
                        await apply(source);
                        if (state.rollback) await bridge('rollback');
                    }
                    blocked = false;
                    failure = null;
                    engine.thaw();
                    return true;
                } catch (error) { failure = error; return false; }
            });
        }
        return {saveNow, importSave, restore, drain:()=>queue, failure:()=>failure, blocked:()=>blocked};
    }
    return {createSaveTransactions};
})();
if (typeof module !== 'undefined') module.exports = SaveTransactions;
