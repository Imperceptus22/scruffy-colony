importScripts('vendor/perky/perky.js');
self.onmessage=event=>{
    try{self.postMessage({ok:true,result:PerkyCore.calculate(event.data.ctx,event.data.inputs)});}
    catch(error){self.postMessage({ok:false,error:String(error?.message||error).slice(0,500)});}
};
