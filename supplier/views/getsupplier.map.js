function(doc){
    if (typeof doc.doctype !== 'undefined' && doc.doctype == "SUPPLIER") {
        emit(null,doc);
    }
}