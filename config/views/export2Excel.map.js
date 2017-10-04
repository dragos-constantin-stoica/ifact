function(doc){
    if (typeof doc.doctype !== 'undefined'){
        if (doc.doctype == "INVOICE") {
           emit(doc.doctype, {
               id: doc._id,
               numar: doc.SERIA + " " + doc.NUMARUL,
               INVOICE_DATE: doc.INVOICE_DATE,
               DUE_DATE: doc.DUE_DATE,
               detalii: doc.BENEFICIAR.nume,
               suma_eur: (doc.FURNIZOR.valuta == "EUR")?doc.INVOICE_TOTAL:(doc.INVOICE_TOTAL/doc.CURS_BNR.eur_ron),
               suma_ron: (doc.FURNIZOR.valuta == "RON")?doc.INVOICE_TOTAL:(doc.INVOICE_TOTAL*doc.CURS_BNR.eur_ron),
               eur_ron: doc.CURS_BNR.eur_ron,
               valuta: doc.FURNIZOR.valuta,
               plata: []
            });
        }

        if (doc.doctype == "PAYMENT"){
            emit(doc.doctype, {
                id: doc.invoice_id,
                PAYMENT_DATE: doc.PAYMENT_DATE,
                PAYMENT_SUM: doc.PAYMENT_SUM
            });
        }
    }
}