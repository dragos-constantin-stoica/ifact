function(doc){
    if (typeof doc.doctype !== 'undefined' && doc.doctype == "SUPPLIER") {
        emit(null,{id: doc._id, value:doc.nume});
    }
}