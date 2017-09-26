function(doc){
    if (typeof doc.doctype !== 'undefined' && doc.doctype == "SUPPLIER") {
        doc.conturi.forEach(function(element) {
            emit(null,{id: doc._id+"-"+element.valuta, value:doc.nume + " ["+element.valuta+"]"});
        }, this);
        
    }
}