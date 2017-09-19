function(doc){
    if (typeof doc.doctype !== 'undefined' && doc.doctype == "CUSTOMER") {
        emit(null,doc);
    }
}