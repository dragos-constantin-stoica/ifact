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

        while (row = getRow()) {
            var yr = row.key[0];
            if (years.indexOf(yr) == -1) years.push(yr);

            var FOUND = false;
            for (var index = 0; index < results.length; index++) {
                var element = results[index];
                if (element.month == row.key[1]){
                    if (typeof element["ron_"+yr] === 'undefined'){
                        element["ron_"+yr] = (row.value.type == "INVOICE")?row.value.ron:0;
                    }else{
                        element["ron_"+ yr] += (row.value.type == "INVOICE")?row.value.ron:0;
                    }
                    if (typeof element["eur_"+yr] === 'undefined'){
                        element["eur_"+yr] = (row.value.type == "INVOICE")?row.value.eur:0;
                    }else{
                        element["eur_"+ yr] += (row.value.type == "INVOICE")?row.value.eur:0;
                    }
                    FOUND = true;
                    break;
                }
            }
            if(!FOUND){
                //This will be really absurd!!!
                var tmp = { month: row.key[1] };
                tmp["ron_"+yr] = (row.value.type == "INVOICE")?row.value.ron:0;
                tmp["eur_"+yr] = (row.value.type == "INVOICE")?row.value.eur:0;
                results.push(tmp);
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