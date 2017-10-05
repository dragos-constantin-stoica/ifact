function(doc){
    if (typeof doc.doctype !== 'undefined'){
        if (doc.doctype == "INVOICE") {
            emit([doc.INVOICE_DATE, doc._id],
                 {
                    id: doc._id, 
                    SERIA: doc.SERIA,
                    NUMARUL: doc.NUMARUL,
                    INVOICE_DATE: doc.INVOICE_DATE,
                    description: doc.INVOICE_LINE[0].details, 
                    DUE_DATE: doc.DUE_DATE,
                    INVOICE_TOTAL: doc.INVOICE_TOTAL,
                    currency: (typeof doc.FURNIZOR.valuta !== 'undefined')?doc.FURNIZOR.valuta:"RON",
                    eur_ron: doc.CURS_BNR.eur_ron,
                    doctype: doc.doctype
                }
            );
        }
        if (doc.doctype == "PAYMENT"){
            emit([doc.PAYMENT_DATE, doc.invoice_id],
                {
                    _id: doc.invoice_id,
                    SERIA: doc.SERIA,
                    NUMARUL: doc.NUMARUL,
                    PAYMENT_DATE: doc.PAYMENT_DATE,
                    PAYMENT_DETAILS: doc.PAYMENT_DETAILS,
                    PAYMENT_SUM: doc.PAYMENT_SUM,
                    currency: doc.currency,
                    doctype: doc.doctype
                }
            );
        }
    }
}