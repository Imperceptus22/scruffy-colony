// Optional local UI metadata, separate from original checkpoints and exports.
var MobileQolStore=(()=>{
    function create(storage,slot,identity=()=>''){
        const cache=new Map(),owners=new Map();let warning='';const copy=value=>JSON.parse(JSON.stringify(value));
        function current(){
            const id=String(slot());if(!['1','2','3','dev'].includes(id))return null;const key='trimps-mobile-qol-'+id;
            const owner=String(identity()).slice(0,100);
            if(!cache.has(key)||owners.get(key)!==owner){
                let value={};try{const raw=storage.getItem(key);if(raw&&raw.length<=131072){const p=JSON.parse(raw);if(p?.version===1&&p.identity===owner&&p.data&&typeof p.data==='object'&&!Array.isArray(p.data))value=p.data;}}
                catch(_){warning='Local preferences could not be read. Gameplay saves are unaffected.';}cache.set(key,value);owners.set(key,owner);
            }return key;
        }
        function get(part,fallback){const key=current(),data=key&&cache.get(key);return copy(data&&Object.hasOwn(data,part)?data[part]:fallback);}
        function set(part,value){
            const key=current();if(!key)return false;
            try{const data={...cache.get(key),[part]:copy(value)},raw=JSON.stringify({version:1,identity:owners.get(key),data});
                if(raw.length>131072){warning='Local preferences are full. Remove older entries and try again.';return false;}
                cache.set(key,data);try{storage.setItem(key,raw);warning='';return true;}catch(_){warning='Preferences are kept for this session only. Device storage is unavailable.';return false;}
            }catch(_){warning='These preferences could not be stored.';return false;}
        }
        return{get,set,error:()=>warning};
    }
    return typeof document==='undefined'?{create}:create({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)},()=>TrimpsMobile.slot(),()=>game.global.uniqueId);
})();
if(typeof module!=='undefined')module.exports=MobileQolStore;
