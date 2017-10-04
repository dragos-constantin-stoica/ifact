function (head, req) {
    // specify that we're providing a JSON response
    provides('json', function() {
        // create an array for our result set
        var results = [], invoices = {};


        while (row = getRow()) {

            if (row.key == "INVOICE"){
                if (typeof invoices[row.value.id] === 'undefined'){
                    invoices[row.value.id]= row.value;
                    invoices[row.value.id].plata = [];
                }else{
                    var plata = invoices[row.value.id].plata;
                    invoices[row.value.id] = row.value;
                    invoices[row.value.id].plata = plata;
                }
            }

            if (row.key == "PAYMENT"){
                if (typeof invoices[row.value.id] === 'undefined'){
                    invoices[row.value.id] = {};
                    invoices[row.value.id].plata = [];
                    invoices[row.value.id].plata.push(row.value);
                }else{
                    invoices[row.value.id].plata.push(row.value);
                    invoices[row.value.id].plata.sort(function(a, b) {
                        var aDATE = new Date(a.PAYMENT_DATE.substr(-4),a.PAYMENT_DATE.substr(3,2), a.PAYMENT_DATE.substr(0,2)), 
                            bDATE = new Date(b.PAYMENT_DATE.substr(-4),b.PAYMENT_DATE.substr(3,2), b.PAYMENT_DATE.substr(0,2));
                        return aDATE - bDATE;
                      });
                }
            }
        }

        var tmpResult = [];
        for (var key in invoices) {
            tmpResult.push(invoices[key]);
        }

        tmpResult.sort(function(a,b){
            return (a.id>b.id)?1:(a.id<b.id?-1:0);
        });

        results.push([
            "Achitată" , "Numă factură" , "Data facturii" , "Data scadenţă" , "Detalii factură" , "Suma €UR" , "Suma RON" , 
            "Virament €UR"  , "Virament RON" , "Data virament"
        ]);

        tmpResult.forEach(function(elm){
            if (elm.plata.length == 0){
                results.push([
                    "",
                    elm.numar,
                    elm.INVOICE_DATE,
                    elm.DUE_DATE,
                    elm.detalii,
                    elm.suma_eur,
                    elm.suma_ron,
                    "","",""
                ]);
            }else{
                for(var i=0; i< elm.plata.length; i++){
                    var pay_eur = (elm.valuta == "EUR")?elm.plata[i].PAYMENT_SUM:(elm.plata[i].PAYMENT_SUM/elm.eur_ron), 
                    pay_ron = (elm.valuta == "RON")?elm.plata[i].PAYMENT_SUM:(elm.plata[i].PAYMENT_SUM*elm.eur_ron);
                    if (i==0){
                        results.push([
                            "",
                            elm.numar,
                            elm.INVOICE_DATE,
                            elm.DUE_DATE,
                            elm.detalii,
                            elm.suma_eur,
                            elm.suma_ron,
                            pay_eur,
                            pay_ron,
                            elm.plata[i].PAYMENT_DATE
                        ]);
                    }else{
                        results.push([
                            "",
                            "",
                            "",
                            "",
                            "",
                            "",
                            "",
                            pay_eur,
                            pay_ron,
                            elm.plata[i].PAYMENT_DATE
                        ]);
                    }
                }
            }
        });

        // make sure to stringify the results :)
        send(JSON.stringify(results));
    });
}