

App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    admin:'0x0',
    init: function() {
        return App.initWeb3();
    },

    initWeb3: function() {
        console.log("init web3")
        // TODO: refactor conditional
        if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            ethereum.enable();
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            ethereum.enable();
            web3 = new Web3(App.web3Provider);
        }
        return App.initContract();
    },




    initContract: function() {
        console.log("init contract");
        $.getJSON("Grade.json", function(grade) {
            // init contract
            App.contracts.Grade = TruffleContract(grade);
            // interact with contract
            App.contracts.Grade.setProvider(App.web3Provider);
            console.log("init success");
            App.listenForEvents();
            App.getAdmin();
            return App.render();
        });
    },

    // listen to contract event
    listenForEvents: function() {
        console.log("listen event")
        App.contracts.Grade.deployed().then(function(instance) {
            instance.StudentCreated({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function(error, event) {
                console.log("event triggered", event)
            });

        });
    },
    
    //get administrator's address
    getAdmin: function(){
        console.log("get admin")
        App.contracts.Grade.deployed().then(function(instance) {
            gradeInstance = instance;
            return gradeInstance.administrator();
        }).then(function(administrator){
            var addr = administrator;
            console.log(addr);
            App.admin = addr;
            console.log("App.admin:"+App.admin);
            return App.loadAccount();
        })
    },

    loadAccount:function(){
        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            console.log("get accout info")
            if (err === null) {
                App.account = account;
                $("#accountAddress").html("current accnout address: " + account);   
                if(App.admin == account){
                    $("#accountName").html("current login: administrator " );   
                }else{
                    $("#accountName").html("current login: poort student " );  
                }

                web3.eth.getBalance( account,function(err,res){
                    if(!err) {
                        console.log(res);
                        $("#accountBalance").html("current Account balance: " +res+'wei');   
                    }else{
                        console.log(err);
                    }
                });
            }     
        })
    },

    render: function() {
    // Load contract data
        App.contracts.Grade.deployed().then(function(instance) {
            console.log("load contract data")
            gradeInstance = instance;
            return gradeInstance.studentCount();
        }).then(function(studentCount) {
            var Graderesult = $("#graderesult");
            Graderesult.empty();
            for (var i = 1; i <= studentCount; i++) {
                gradeInstance.students(i).then(function(record) {
                    var id = record[0];
                    var professorAddress = record[1];
                    var studentName = record[2];
                    var createTime = record[3];            
                    var studentNumber = record[4];
                    var assignmentScore = record[5];
                    var projectScore = record[6];
                    var examScore = record[7];
                    var finalGrade = record[8]
                    var recordTemplate = "<tr><td width=140px>" + studentName + 
                    "</font></td><td>"+ professorAddress + 
                    "</td><td width=300px>" + studentNumber + 
                    "</td><td width=70px>"+ createTime + 
                    "</td><td width=70px>" + assignmentScore + 
                    "</td><td width=70px>"+ projectScore + 
                    "</td><td width=70px>"+ examScore + 
                    "</td><td width=70px>"+ finalGrade + 
                    "</td></tr>"
                    var qID=document.cookie.split(";")[0].split("=")[1]; 
                    if(studentNumber==qID){
                        Graderesult.append(recordTemplate);
                    }
                });
            }
            }).catch(function(error) {
                console.warn(error);
            });

        },

        queryS: function() {
            console.log("get query student number")
            qID= $('#qID').val();
            document.cookie="qID="+qID; 
        },
        createStudent: function() {
            console.log("create a student")
            var studentName= $('#studentName').val();
            var studentNumber= $('#studentNumber').val();
            var assignemntScore= $('#assignemntScore').val();
            var projectScore= $('#projectScore').val();
            var examScore= $('#examScore').val();
            var userAccount = web3.eth.accounts[0];
            App.contracts.Grade.deployed().then(function(instance) {
                return instance.createStudent(studentName,studentNumber,assignemntScore,projectScore,examScore,{gas: 3000000, from: userAccount});
            }).then(function(result) {
        // Wait for to update
        console.log(accounts[0]); 
        }).catch(function(err) {
            console.error(err);
        });
    },
};
$(function() {
    $(window).on('load',(function() {
        App.init();
    }));
});

