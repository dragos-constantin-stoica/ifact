var logic = {
    
    login : function(){
        if(!webix.isUndefined($$('mainLayout'))) $$('mainLayout').destructor();
        if(!webix.isUndefined($$('sidemenu'))) $$('sidemenu').destructor();
        
        webix.ui({
            view:"window",
            id: "loginwindow",
            width:400,
            position:"top",
            head:{
                view:"toolbar", //margin:-4, 
                    cols:[
                        {view:"label", label: "Login - iFact" },
                        {   type:"header",
                            width: 48,
                            data: {title: "iFact", src: "img/Logo.png" },
                            template: function (obj) {
                            // obj is a data record object
                            return '<img src="'+obj.src+'"/>';
                            } 
                        }
                        //{ view:"button", type:"image", image:"img/Logo.png", width:40}
                    ]
            },
            body: webix.copy(logic.loginForm)
        }).show();
    },
    
    logout: function(){
        $.couch.logout({
            success: function(data) {
                //console.log(data);
                USERNAME.delUSERNAME();
                if(!webix.isUndefined($$('mainLayout'))) $$('mainLayout').destructor();
                if(!webix.isUndefined($$('sidemenu'))) $$('sidemenu').destructor();
                myApp.init();
                
            }
        });  
    },
    
    loginForm : {
        id: "loginform",			
        view:"form", 
        width:400,

        elements:[
            { view:"text", type:"text", label:"Username", name:"username", placeholder:"User name", value:""},
            { view:"text", type:'password', label:"Password", name:"password", value:""},
            { view:"button", label:"Login" , type:"form", click:function(){
                if (!this.getParentView().validate()){
                    webix.message({ type:"error", text:"User name and password are mandatory!" });
                    
                    //TODO - remove from here
                    //$$("loginform").hide();
                    //myApp.showUI();
                    //until here

                }else{						
                    $.couch.login({
                        name: $$('loginform').elements.username.getValue(),
                        password: $$('loginform').elements.password.getValue(),
                        success: function(data) {
                            //console.log(data);
                            $$("loginform").hide();
                            $.couch.session({
                                success: function(data) {
                                    USERNAME.setUSERNAME(data.userCtx);
                                    //console.log(data);
                                }
                            });

                            myApp.showUI();
                            //Check for INVOICE_CFG document
                            /*
                            webix.ajax()
                            .headers({"Content-type":"application/json"})
                            .get(SERVER_URL + DBNAME +"/INVOICE_CFG")
                            .then(function(data){
                                console.log(data);
                                myApp.showUI();
                            })
                            .fail(function(err){
                                console.log(err);
                                return webix.ajax()
                                .headers({"Content-type":"application/json"})
                                .post(SERVER_URL + DBNAME, JSON.stringify({NUMARUL:1,SERIA:"DEMO",_id:"INVOICE_CFG",doctype:"INVOICE_CFG"}))
                                .then(function(data){
                                    console.log(data);
                                    myApp.showUI();
                                })
                                .fail(function(err){
                                    console.log(err);
                                });
                            });
                            */
                            
                        },
                        error: function(status) {
                            webix.message({type:"error", text:"Invalid user name or password!"});
                            //console.log(status);
                        }
                    });
                }
             }
            }
        ],
        rules:{
            "username":webix.rules.isNotEmpty,
            "password":webix.rules.isNotEmpty
        }
    }
};