var logic = {
    
    login : function(){
        if(!webix.isUndefined($$('mainLayout'))) $$('mainLayout').destructor();
        if(!webix.isUndefined($$('sidemenu'))) $$('sidemenu').destructor();
        
        webix.ui({
            view:"window",
            id: "loginwindow",
            width:400,
            position:"top",
            head:"Login",
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
                if (! this.getParentView().validate())
                    webix.message({ type:"error", text:"Invalid user name or password!" });
                else{						
                    $.couch.login({
                        name: $$('username').getValue(),
                        password: $$('password').getValue(),
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