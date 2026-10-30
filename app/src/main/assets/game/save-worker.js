importScripts('lz-string.js', 'save-schema.js', 'save-validation.js');
self.onmessage = event => {
    try { self.postMessage({ok:true, result:SaveValidation.validateSave(event.data)}); }
    catch (error) { self.postMessage({ok:false, code:error.code || 'INVALID', path:error.path}); }
};
