function(doc){
    if (typeof doc.doctype !== 'undefined' && doc.doctype == "INVOICE") {
        emit(null,doc);
    }
}