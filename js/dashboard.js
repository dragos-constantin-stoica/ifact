var dashboard = {
  
    ui: function(){
        return  {
            id: "page-6",
            fitBiggest: true,
            rows:[
                {
                    cols:[
                        {
                            rows:[
                                { 
                                    view:"property", id:"financialStatementY2D", autoheight: true, editable: false,
                                    elements:[
                                        { label:"RON Year to Date", type:"label"},
                                        { label:"Invoiced", type:"text", id:"invoicedRONY2D"},
                                        { label:"Overdue", type:"text", id:"dueRONY2D"},
                                        { label:"Payed", type:"text", id:"payedRONY2D"},
                                        { label:"EUR Year to Date", type:"label"},
                                        { label:"Invoiced", type:"text", id:"invoicedEURY2D"},
                                        { label:"Overdue", type:"text", id:"dueEURY2D"},
                                        { label:"Payed", type:"text", id:"payedEURY2D"}
                                    ]
                                }
                            ]
                        },
                        {
                            rows:[
                                { 
                                    view:"property", id:"financialStatement", autoheight: true, editable: false,
                                    elements:[
                                        { label:"RON TOTAL", type:"label"},
                                        { label:"Invoiced", type:"text", id:"invoicedRON"},
                                        { label:"Overdue", type:"text", id:"dueRON"},
                                        { label:"Payed", type:"text", id:"payedRON"},
                                        { label:"EUR TOTAL", type:"label"},
                                        { label:"Invoiced", type:"text", id:"invoicedEUR"},
                                        { label:"Overdue", type:"text", id:"dueEUR"},
                                        { label:"Payed", type:"text", id:"payedEUR"}
                                    ]
                                }
                            ]
                        }                      
                    ]                    
                },
                {
                    cols: [
                        {
                            rows:[
                                {
                                    view: "template",
                                    template: "Year to Date invoiced vs. payed RON",
                                    type:"header"
                                },
                                {
                                    view:"chart",
                                    type:"line",
                                    preset:"simple",
                                    xAxis:{ template:"#year_month#", title:"Month"},
                                    yAxis:{ title:"Amount (RON)", template: function(obj){return (obj%1000?"":obj/1000+"k");}},
                                    legend:{
                                        values:[{text:"Invoiced",color:"#1293f8"},{text:"Payed",color:"#66cc00"}],
                                        align:"right",
                                        valign:"middle",
                                        layout:"y",
                                        width: 100,
                                        margin: 8
                                    },
                                    series:[
                                        {
                                            value:"#invoiced_ron#",
                                            item:{
                                                borderColor: "#1293f8",
                                                color: "#ffffff"
                                            },
                                            line:{
                                                color:"#1293f8",
                                                width:3
                                            },
                                            tooltip:{
                                                template:"#invoiced_ron#"
                                            }
                                        },
                                        {
                                            value:"#payed_ron#",
                                            item:{
                                                borderColor: "#66cc00",
                                                color: "#ffffff"
                                            },
                                            line:{
                                                color:"#66cc00",
                                                width:3
                                            },
                                            tooltip:{
                                                template:"#payed_ron#"
                                            }
                                        }
                                    ],
                                    url: "../../_design/globallists/_list/y2d/charts/y2d?startkey=[\""+ new Date().getFullYear() +"\",\"01\"]&endkey=[\""+ new Date().getFullYear() +"\",\"12\"]"
                                }
                            ]                    
                        },
                        {
                            rows:[
                                {
                                    view: "template",
                                    template: "Year to Date invoiced vs. payed EUR",
                                    type:"header"
                                },
                                {
                                    view:"chart",
                                    type:"line",
                                    preset:"simple",
                                    xAxis:{ template:"#year_month#", title:"Month"},
                                    yAxis:{ title:"Amount (EUR)", template: function(obj){return (obj%1000?"":obj/1000+"k");}},
                                    legend:{
                                        values:[{text:"Invoiced",color:"#1293f8"},{text:"Payed",color:"#66cc00"}],
                                        align:"right",
                                        valign:"middle",
                                        layout:"y",
                                        width: 100,
                                        margin: 8
                                    },
                                    series:[
                                        {
                                            value:"#invoiced_eur#",
                                            item:{
                                                borderColor: "#1293f8",
                                                color: "#ffffff"
                                            },
                                            line:{
                                                color:"#1293f8",
                                                width:3
                                            },
                                            tooltip:{
                                                template:"#invoiced_eur#"
                                            }
                                        },
                                        {
                                            value:"#payed_eur#",
                                            item:{
                                                borderColor: "#66cc00",
                                                color: "#ffffff"
                                            },
                                            line:{
                                                color:"#66cc00",
                                                width:3
                                            },
                                            tooltip:{
                                                template:"#payed_eur#"
                                            }
                                        }
                                    ],
                                    url: "../../_design/globallists/_list/y2d/charts/y2d?startkey=[\""+ new Date().getFullYear() +"\",\"01\"]&endkey=[\""+ new Date().getFullYear() +"\",\"12\"]"                                
                                }
                            ]
                        }
                    ]
                },
                {
                    cols: [
                        {
                            rows:[
                                {
                                    view: "template",
                                    template: "Monthly invoiced per Year RON",
                                    type:"header"
                                },
                                {
                                    view:"chart",
                                    id: "y2m_ron",
                                    title: "SDS",
                                    type:"line",
                                    preset:"simple",
                                    xAxis:{ template:"#month#", title:"Month"},
                                    yAxis:{ title:"Amount (RON)", template: function(obj){return (obj%1000?"":obj/1000+"k");}},
                                    legend: function(){ return (dashboard)?dashboard.legend_y2m_ron:{};}(),
                                    series: function(){ return (dashboard)?dashboard.series_y2m_ron:[];}()
                                }
                                
                            ]
                        },
                        {
                            rows:[
                                {
                                    view: "template",
                                    template: "Monthly invoiced per Year EUR",
                                    type:"header"
                                },
                                {
                                    view:"chart",
                                    id: "y2m_eur",
                                    type:"line",
                                    preset:"simple",
                                    xAxis:{ template:"#month#", title:"Month"},
                                    yAxis:{ title:"Amount (EUR)", template: function(obj){return (obj%1000?"":obj/1000+"k");}},
                                    legend: function(){ return (dashboard)?dashboard.legend_y2m_eur:{};}(),
                                    series: function(){ return (dashboard)?dashboard.series_y2m_eur:[];}()
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }
    
};
