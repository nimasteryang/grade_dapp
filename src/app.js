

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
        $.getJSON("Aurora2.json", function(aurora2) {
            // init contract
            App.contracts.Aurora2 = TruffleContract(aurora2);
            // interact with contract
            App.contracts.Aurora2.setProvider(App.web3Provider);
            App.listenForEvents();
            App.getAdmin();
            return App.render();
        });
    },

    // listen to contract event
    listenForEvents: function() {
        console.log("listen event")
        App.contracts.Aurora2.deployed().then(function(instance) {
            instance.GradeCreated({}, {
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
        App.contracts.Aurora2.deployed().then(function(instance) {
            aurora2Instance = instance;
            return aurora2Instance.administrator();
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
                $("#accountAddress").html("current account address: " + account);
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
        App.contracts.Aurora2.deployed().then(function(instance) {
            console.log("load contract data")
            aurora2Instance = instance;
            return aurora2Instance.gradeCount();
        }).then(function(gradeCount) {
            var graderesult = $("#graderesult");
            graderesult.empty();
            for (var i = 1; i <= gradeCount; i++) {
                aurora2Instance.grades(i).then(function(record) {
                    var id = record[0];
                    var professorAddress = record[1];
                    var courseCode = record[2];
                    var studentName = record[3];
                    var createTime = record[4];
                    var studentNumber = record[5];
                    var assignmentScore = record[6];
                    var projectScore = record[7];
                    var examScore = record[8];
                    var finalAurora2 = record[9];
                    var recordTemplate = "<tr><td width=140px>" + studentName +
                    "</td><td width=300px>" + courseCode +
                    "</font></td><td>"+ professorAddress +
                    "</td><td width=300px>" + studentNumber +
                    "</td><td width=70px>"+ createTime +
                    "</td><td width=70px>" + assignmentScore +
                    "</td><td width=70px>"+ projectScore +
                    "</td><td width=70px>"+ examScore +
                    "</td><td width=70px>"+ finalAurora2 +
                    "</td></tr>"
                    //parse request student number from cookie
                    var request_student_number=document.cookie.split(";")[0].split("=")[1];
                    var request_course_code=document.cookie.split(";")[1].split("=")[1];
                    if(request_course_code == ""){
                      if(studentNumber==request_student_number){
                          graderesult.append(recordTemplate);
                      }
                    }else{
                      if(studentNumber==request_student_number && courseCode == request_course_code){
                          graderesult.append(recordTemplate);
                      }
                    }
                });
            }
            }).catch(function(error) {
                console.warn(error);
            });

        },

        queryS: function() {
            console.log("get query student number and course code");
            requestStudentNumber= $('#requestStudentNumber').val();
            if(requestStudentNumber == ""){
              alert("student number can not be empty");
            }else{
              //set student number to cookie
              document.cookie="request_student_number="+requestStudentNumber;

              requestCourseCode = $('#requestCourseCode').val();
              document.cookie="request_course_code="+requestCourseCode;
            }
        },
        createStudent: function() {
            console.log("create a grade");
            var courseCode= $('#courseCode').val().toUpperCase().trim();
            var studentName= $('#studentName').val();
            var studentNumber= $('#studentNumber').val();
            var assignemntScore= $('#assignemntScore').val();
            var projectScore= $('#projectScore').val();
            var examScore= $('#examScore').val();
            var userAccount = web3.eth.accounts[0];
            App.contracts.Aurora2.deployed().then(function(instance) {
                return instance.createGrade(courseCode,studentName,studentNumber,assignemntScore,projectScore,examScore,{gas: 3000000, from: userAccount});
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
