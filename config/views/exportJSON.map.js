function(doc){
    if(typeof doc.doctype !== 'undefined'){
        var exportJSON = {};
        for (var key in doc) {
            if ((key.indexOf('_') != 0) || (key == "_id")) {
                 exportJSON[key] = doc[key];
            }
        }       
        emit(null, exportJSON);
    }
}