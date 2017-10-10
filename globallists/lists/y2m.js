function (head, req) {
    // specify that we're providing a JSON response
    provides('json', function() {
        // create an array for our result set
        var results = [], years = [];

        for (var i = 1; i <= 12; i++){
            results.push({
                month: ("0"+i).substr(-2)
            });
        }

        function filterElm(elm, index){
            if (elm.month == row.key[1]) dataIndex = index;
            return elm.month == row.key[1];
        }
        

        while (row = getRow()) {
            var tmpData = {
                month: row.key[1]
            };
            var yr = row.key[0];
            if (years.indexOf(yr) == -1) years.push(yr);
            tmpData["ron_" + yr] = (row.value.type == "INVOICE")?row.value.ron:0;
            tmpData["eur_" + yr] = (row.value.type == "INVOICE")?row.value.eur:0;
            
            var dataIndex = -1;
            var dataElm = results.filter(filterElm);

            if( dataIndex == -1){
                results.push(tmpData);
            }else{
                //update values for that element
                tmpData["ron_" + yr] += (typeof dataElm[0]["ron_" + yr] !== 'undefined')?dataElm[0]["ron_" + yr]:0;
                tmpData["eur_" + yr] += (typeof dataElm[0]["eur_" + yr] !== 'undefined')?dataElm[0]["eur_" + yr]:0;
                results[dataIndex] = tmpData;
            }

        }
        years.sort();
        /*
        normalize results
        */
        results.forEach(function(elm){
            years.forEach(function(element){
                if (typeof elm["ron_" + element] === 'undefined') {
                    elm["ron_" + element] = 0;
                }else{
                    elm["ron_" + element] =elm["ron_" + element].toFixed();
                }

                if (typeof elm["eur_" + element] === 'undefined') {
                    elm["eur_" + element] = 0;
                }else{
                    elm["eur_" + element] =elm["eur_" + element].toFixed();
                }
            });

        });

        // make sure to stringify the results :)
        send(JSON.stringify(results));
    });
}