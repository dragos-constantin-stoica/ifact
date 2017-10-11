function(doc){
    if(typeof doc.doctype !== 'undefined'){
        var exportJSON = {};
        for (var key in doc) {
            exportJSON[key] = doc[key];
        }        
        delete exportJSON._rev;
        emit(null, exportJSON);
    }
}