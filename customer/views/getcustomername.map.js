function(doc){
    if (typeof doc.doctype !== 'undefined' && doc.doctype == "CUSTOMER") {
        emit(null,{id: doc._id, value:doc.nume});
    }
}