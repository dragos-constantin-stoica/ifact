function (head, req) {
    // specify that we're providing a JSON response
    provides('json', function() {
        // create an array for our result set
        var results = [];

        var y = ("" + new Date().getFullYear()).substr(-2);
        if (req.query && req.query.startkey){
            y = req.query.startkey[0].substr(-2);
        }

        for (var i = 1; i <= 12; i++){
            results.push({
                year_month: ("0"+i).substr(-2)+"-"+y,
                invoiced_ron: 0,
                invoiced_eur: 0,
                payed_ron: 0,
                payed_eur: 0
            });
        }

        function filterElm(elm, index){
            if (elm.year_month == row.value.year_month) dataIndex = index;
            return elm.year_month == row.value.year_month;
        }
        

        while (row = getRow()) {
            var tmpData = {
                year_month: row.value.year_month,
                invoiced_ron: (row.value.type == "INVOICE")?row.value.ron:0,
                invoiced_eur: (row.value.type == "INVOICE")?row.value.eur:0,
                payed_ron: (row.value.type == "PAYMENT")?row.value.ron:0,
                payed_eur: (row.value.type == "PAYMENT")?row.value.eur:0
            };

            var dataIndex = -1;
            var dataElm = results.filter(filterElm);

            if( dataIndex == -1){
                results.push(tmpData);
            }else{
                //update values for that element
                tmpData.invoiced_ron += dataElm[0].invoiced_ron;
                tmpData.invoiced_eur += dataElm[0].invoiced_eur;
                tmpData.payed_ron += dataElm[0].payed_ron;
                tmpData.payed_eur += dataElm[0].payed_eur;
                results[dataIndex] = tmpData;
            }

        }

        results.forEach(function(elm){
            elm.invoiced_ron = elm.invoiced_ron.toFixed();
            elm.invoiced_eur = elm.invoiced_eur.toFixed();
            elm.payed_ron = elm.payed_ron.toFixed();
            elm.payed_eur = elm.payed_eur.toFixed();
        });

        // make sure to stringify the results :)
        send(JSON.stringify(results));
    });
}