// Estimates only. Inputs come from the unchanged engine's prices, rates and capacities.
var MobilePurchaseGuidance=(()=>{
 function eta(prices,stocks,rates,caps){
  let seconds=0,blocked=null;
  for(const {resource,cost}of prices){
   const owned=stocks[resource];if(!Number.isFinite(cost)||!Number.isFinite(owned)||cost<0)return{kind:'unknown'};
   const missing=cost-owned;if(missing<=0)continue;
   if(Number.isFinite(caps[resource])&&caps[resource]>=0&&cost>caps[resource])blocked='storage';
   else if((!Number.isFinite(rates[resource])||!(rates[resource]>0))&&blocked!=='storage')blocked='income';
   else seconds=Math.max(seconds,missing/rates[resource]);
  }
  return blocked?{kind:blocked}:!Number.isFinite(seconds)?{kind:'unknown'}:seconds>0?{kind:'time',seconds}:{kind:'ready'};
 }
 function housingScore(prices,gain){
  if(!(gain>0)||!Number.isFinite(gain)||!prices.length)return null;
  let total=0;
  for(const {resource,cost}of prices){
   if(['gems','fragments'].includes(resource))continue;
   if(!['food','wood','metal'].includes(resource)||!Number.isFinite(cost)||cost<0)return null;
   total+=cost;
  }
  return Number.isFinite(total)?total/gain:null;
 }
 function choose(rows,previous){
  const eligible=rows.filter(r=>Number.isFinite(r.score)&&r.score>=0);if(!eligible.length)return null;
  const best=eligible.reduce((a,b)=>b.score<a.score?b:a),old=eligible.find(r=>r.name===previous);
  return old&&old.score<=best.score*1.02?old:best;
 }
 return{eta,housingScore,choose};
})();
if(typeof module!=='undefined')module.exports=MobilePurchaseGuidance;
