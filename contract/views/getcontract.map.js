function(doc){
    if (typeof doc.doctype !== 'undefined' && doc.doctype == "CONTRACT") {
        emit(null,doc);
    }
}