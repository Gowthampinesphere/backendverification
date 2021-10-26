// requird modules & lib
const bcrypt = require('bcryptjs'); // encrypt 
var database = require('../config/database'); // Database access
var async = require('async');
var asyncLoop = require('node-async-loop');
var sql = require("mssql");
let nodeGeocoder = require('node-geocoder');
var multer  =   require('multer');  // filr handling
var upload = multer({ dest: './upload/'}); 
var path = require('path')  
const fs = require('fs');
const readXlsxFile = require("read-excel-file/node");
var XLSX = require('xlsx'); // For future scope (excel read)

// file local storage 
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads/');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

var upload_emp = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads/');
  },
  filename: function (req, file, callback) {
    callback(null, 'act_upload' +
      path.extname(file.originalname));
  }
});

var upload_userss = multer({
  storage: upload_emp
}).single('file');

 
const { Console } = require('console');
const { format } = require('path');
var storage =   multer.diskStorage({
  destination: function (req, file, callback) { 
    callback(null, './public/images/pdf');
  },  
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});    

var upload = multer({ storage : storage}).single('updates');

// user login function
exports.login = function (req, res) {
   var email = req.body.username;
   var password = req.body.password;
   database.query('SELECT * FROM login WHERE username = ? and password =?', [email, password], function (error, result, fields) {
    if (error) {
      res.send({
        "code": 500,
        "error": "rso error",
      });
     } else {
       if(result.length == 0){
        database.query('SELECT * FROM admin WHERE username = ? and password =?', [email, password], function (erroradmin, resultadmin, fields) {
          if (erroradmin) {
            res.send({
              "code": 500,
              "error": "admin error" + erroradmin,
            });
           }else{
            if(resultadmin.length == 0){
              database.query('SELECT * FROM terminal_login WHERE username = ? and password =?', [email, password], function (errorterminal, resultterminal, fields) {
                if (errorterminal){
                  res.send({
                    "code": 500,
                    "error": "terminal error",
                  });
                 }
                 else{
                  if(resultterminal.length == 0){
                    database.query('SELECT * FROM displaylogin WHERE username = ? and password =?', [email, password], function (errordisplay, resultdis, fields) {
                      if (errordisplay) {
                        res.send({
                          "code": 500,
                          "error": "terminal error",
                        });
                       }else{
                        if(resultdis.length == 0){
                          database.query('SELECT * FROM superadmin WHERE username = ? and password =?', [email, password], function (erroradmin, resultadmin, fields) {
                            if (erroradmin){ 
                              res.send({
                                "code": 500,
                                "error": "terminal error",
                              });
                             }else{
                               if(resultadmin.length == 0){
                                database.query('SELECT * FROM titan_admin WHERE username = ? and password =?', [email, password], function (errtitanadmin, resultadmintitan, fields) {
                                if(errtitanadmin){
                                  res.send({
                                    "code": 500,
                                    "error": "Titan Admin error",
                                  });
                                }else{
                                      if(resultadmintitan.length == 0){
                                        res.send({
                                          "code": 500,
                                          "error": "Titan Admin error",
                                        });
                                      }else{
                                        res.send({
                                          "code": 200, 
                                          "email": resultadmintitan[0].username,
                                          "success": resultadmintitan[0],
                                          "check": "titanadmin"
                                        });
                                      }
                                    }
                              })
                               }else{
                                res.send({
                                  "code": 200, 
                                  "email": resultadmin[0].username,
                                  "success": resultadmin[0],
                                  "check": "superadmin"
                                });
                               }
                             }
                            })
                        }else{
                          res.send({
                            "code": 200, 
                            "email": resultdis[0].username,
                            "success": resultdis[0],
                            "check": "display"
                          });
                        }
                       }
                    })
                  }
                  else{
                    res.send({
                      "code": 200, 
                      "email": resultterminal[0].username,
                      "success": resultterminal[0],
                      "check": "terminal"
                    });
                  }
                 }
              })
            }else{
              res.send({
                "code": 200, 
                "email": resultadmin[0].username,
                "success": resultadmin[0],
                "check": "admin"
              });
            }
           }
        })
       }
       else{
        res.send({
          "code": 200, 
          "email": result[0].username,
          "success": result[0],
          "check": "RSO"
        });
       }
     }
   });
  }

 // customer detail
exports.customerdetail = function (req, res) {
    database.query('SELECT * FROM token_customerdetail WHERE showroom_id = ?', [req.body.showroomid], function (errorterminal, resultterminal, fields) {
      if (errorterminal) {
        res.send({
          "code": 500,
          "error": "error", 
        });
       }else{
        var toknu = resultterminal.length + 1
         var today = new Date();
         var billname = req.body.data.billtype+toknu.toString()
         var data = {
          showroom_id:req.body.showroomid,
          mobilenumber: req.body.data.mobilenumber,
          customername: req.body.data.name,
          emailid	: req.body.data.email,
          cashtype: req.body.data.cashdetail, 
          typeofbill:req.body.data.billtype,
          token:billname,
          terminal: req.body.data.terminalsel,
          floorno:req.body.data.floorno,
          created: today,
          updated:today,
          customerstatus:'Ready To start Billing' 
         }
         database.query('INSERT INTO token_customerdetail SET ?', data, function (error, results, fields) {
         if (error) {
             res.send({
               "code": 400,
               "message": "error ocurred " + error
             })
           } else {
            if(req.body.data.billtype == 'S'){
              database.query('SELECT * FROM terminal_calculation WHERE showroom_id = ? and teriminal=?', [req.body.showroomid,req.body.data.terminalsel], function (errorterminalsels, resultterminalsel, fields) {
               
                if (errorterminalsels) {
                  res.send({
                 "code": 400,
                 "message": "error ocurred " + errorterminalsels
               })
               }else{
                 var pluevalue = resultterminalsel[0].simple_count + 1
                 var totalcount = resultterminalsel[0].totalbill + 1
                 var sql = "UPDATE terminal_calculation set simple_count = ?,totalbill = ?  WHERE showroom_id = ? and teriminal = ?";
                 var query = database.query(sql, [pluevalue,totalcount,req.body.showroomid,req.body.data.terminalsel], function (errorsim, result) {        
                  if(errorsim){
                  res.send({
                    "code": 500,
                    "error": "error",
                  });
                }else{
                  if(req.body.emaillan == 0 ){
                    res.send({  
                      "code": 200,
                      "sucess":result,
                      "message": "Dear Customer, Thanks for choosing Tanishq. Your Token Number is " + billname + " ,"+req.body.data.floorno+" Floor , Terminal "+req.body.data.terminalsel +".",
                    });
                  }else{
                    var nodemailer = require('nodemailer');
                    var notification = nodemailer.createTransport({
                      service: 'gmail',
                      auth: {
                        user: 'tanishqtoken@gmail.com',
                        pass: 'Tanishq@123'
                      }  
                    });
                    var email = req.body.data.email
                    var mailOptions = {
                      from: 'tanishqtoken@gmail.com',
                      to: email,
                      subject: 'Tanishq Team',
                      text: "Dear Customer, Thanks for Choosing Tanishq. Your Token Number is " + billname + " , "+ req.body.data.floorno +" Floor ,Terminal "+req.body.data.terminalsel,
                    };
                    notification.sendMail(mailOptions, function (errormail) {
                      if (errormail) {
                        res.send({ 
                          "code": 400,
                          "message": "error"
                        });
                      }else{
                        res.send({ 
                          "code": 200,
                          "sucess":results,
                          "message": "Dear Customer, Thanks for Choosing Tanishq. Your Token Number is " + billname + " , "+req.body.data.floorno+" Floor ,Terminal "+req.body.data.terminalsel + ".",
                        });
                      }
                    });
                  }
                }
              })
             }
            })
            }else{
              if(req.body.data.billtype == 'M'){
                database.query('SELECT * FROM terminal_calculation WHERE showroom_id = ? and teriminal=?', [req.body.showroomid,req.body.data.terminalsel], function (errorterminalsel, resultterminalsel, fields) {
                    if (errorterminalsel){
                      res.send({
                    "code": 400,
                    "message": "error ocurred " + errorterminalsel
                  })
                 }else{
                  if(req.body.emaillan == 0 ){
                    var pluevalue = resultterminalsel[0].modurate_count + 1
                    var totalcount = resultterminalsel[0].totalbill + 1
                    var sql = "UPDATE terminal_calculation set modurate_count=?,totalbill=? WHERE showroom_id = ? and teriminal = ?";
                    var query = database.query(sql, [pluevalue,totalcount,req.body.showroomid,req.body.data.terminalsel], function (errormodu, result) {        
                      if(errormodu){
                        res.send({
                          "code": 500,
                          "error": "error",
                        });
                      }else{
                        res.send({ 
                          "code": 200,
                          "sucess":results,
                          "message": "Dear Customer Your Token Number is " + billname + " Please Visite at "+req.body.data.terminalsel,
                        });
                      }
                    })
                   
                  }else{
                    var pluevalue = resultterminalsel[0].modurate_count + 1
                    var totalcount = resultterminalsel[0].totalbill + 1

                    var sql = "UPDATE terminal_calculation set modurate_count=?,totalbill=? WHERE showroom_id = ? and teriminal = ?";
                    var query = database.query(sql, [pluevalue,totalcount,req.body.showroomid,req.body.data.terminalsel], function (errormodu, result) {        
                      if(errormodu){
                        res.send({
                          "code": 500,
                          "error": "error",
                        });
                      }else{
                        var nodemailer = require('nodemailer');
                        var notification = nodemailer.createTransport({
                          service: 'gmail',
                          auth: {
                            user: 'tanishqtoken@gmail.com',
                            pass: 'Tanishq@123'
                          } 
                        });
                        var email = req.body.data.email
                        
                        var mailOptions = {
                          from: 'tanishqtoken@gmail.com',
                          to: email,
                          subject: 'Tanishq Team',
                          text: "Dear Customer, Thanks for Choosing Tanishq. Your Token Number is " + billname + " , "+ req.body.data.floorno +" , "+req.body.data.terminalsel,
                        };
                        notification.sendMail(mailOptions, function (errormail) {
                          
                          if (errormail) {
                            res.send({ 
                              "code": 400,
                              "message": "error"
                            });
                          }else{
                            res.send({ 
                              "code": 200,
                              "sucess":results,
                              "message": "Dear Customer Your Token Number is " + billname + " Please Visite at "+req.body.data.terminalsel + " & Email has been sent ",
                            });
                          }
                        });
                      }
                    })
                  }
                 }
                })
            }else{
              if(req.body.data.billtype == 'C'){
                database.query('SELECT * FROM terminal_calculation WHERE showroom_id = ? and teriminal=?', [req.body.showroomid,req.body.data.terminalsel], function (errorterminalsel, resultterminalsel, fields) {
                  if (errorterminalsel) {
                    res.send({
                   "code": 400,
                   "message": "error ocurred " + error
                 })
                 }else{ 
                  var pluevalue = resultterminalsel[0].complex_count + 1
                  var totalcount = resultterminalsel[0].totalbill + 1
                  var sql = "UPDATE terminal_calculation set complex_count=?,totalbill=? WHERE showroom_id = ? and teriminal = ?";
                  var query = database.query(sql, [pluevalue,totalcount,req.body.showroomid,req.body.data.terminalsel], function (errorcom, result) {   
                    if(errorcom){
                      res.send({
                        "code": 500,
                        "error": "error",
                      });
                    }else{
                      if(req.body.emaillan == 0 ){
                        res.send({ 
                          "code": 200,
                          "sucess":results,
                          "message": "Dear Customer,Thanks for Choosing Tanishq. Your Token Number is "  + billname + " ,"+req.body.data.floorno+" Floor , Terminal "+req.body.data.terminalsel+".",
                        });
                      }else{
                        var nodemailer = require('nodemailer');
                        var notification = nodemailer.createTransport({
                          service: 'gmail',
                          auth: {
                            user: 'tanishqtoken@gmail.com',
                            pass: 'Tanishq@123'
                          } 
                        });
                        var email = req.body.data.email
                        var mailOptions = {
                          from: 'gowthamarajv@gmail.com',
                          to: email,
                          subject: 'From Tanishq Team',
                          text: "Dear Customer, Thanks for Choosing Tanishq. Your Token Number is " + billname + " , "+ req.body.data.floorno +" Floor ,Terminal "+req.body.data.terminalsel,
                        };
                        notification.sendMail(mailOptions, function (errormail) {
                          if (errormail) {
                            res.send({ 
                              "code": 400,
                              "message": "error"
                            });
                          }else{
                            res.send({ 
                              "code": 200,
                              "sucess":results,
                              "message": "Dear Customer,Thanks for Choosing Tanishq. Your Token Number is "  + billname + " ,"+req.body.data.floorno+" Floor, Terminal "+req.body.data.terminalsel+".",

                              // "message": "Dear Customer Your Token Number is " + billname + " Please Visite at "+req.body.data.terminalsel + " & Email has been sent ",
                            });
                          }
                        });
                      }
                    }
                  })
                 }
                })
               
              }
            }
          }
           }
         });
       }
      }) 
}


// hold reason 
exports.holdreasonfunction = function (req, res){
    database.query('SELECT * FROM terminal_calculation WHERE showroom_id = ? and teriminal=?', [req.body.showroomid,req.body.teminal], function (errorterminalsel, resultterminalsel, fields) {
      if (errorterminalsel) {
        res.send({
       "code": 400,
       "message": "error ocurred " + error
     })
     }else{
       var pluevalue = resultterminalsel[0].holdlist + 1
      var sql = "UPDATE terminal_calculation set holdlist=? WHERE showroom_id = ? and teriminal = ?";
      var query = database.query(sql, [pluevalue,req.body.showroomid,req.body.teminal], function (errorsim, result) {        
        if(errorsim){
        res.send({
          "code": 500,
          "error": "error",
        });
      }else{
        var message = "Dear Customer Your bill on hold please wait"
        var sql = "UPDATE token_customerdetail set holdstatus=?,customerstatus=? WHERE showroom_id = ? and terminal = ? and id = ?";
        var query = database.query(sql, [1,message,req.body.showroomid,req.body.teminal,req.body.data.id], function (err, result) {        
          if(err){
          res.send({
            "code": 500,
            "error": "error",
          });
        }else{
          if(req.body.emaillan == 0){
            res.send({ 
              "code": 200,
              "message": "Bill on Hold",
            });
          }else{
            var nodemailer = require('nodemailer');
            var notification = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'tanishqtoken@gmail.com',
                pass: 'Tanishq@123'
              } 
            });
            var email = req.body.data.email
            var mailOptions = {
              from: 'tanishqtoken@gmail.com',
              to: email,
              subject: 'Tanishq - Your bill on hold',
              text: "Dear Customer Your Bill has been holded.Reason is " + req.body.data.reason,
            };
            notification.sendMail(mailOptions, function (errormail) {
              if (errormail) {
                res.send({ 
                  "code": 400,
                  "message": "error"
                });
              }else{
                res.send({ 
                  "code": 200,
                  "message": "Email has Been sent to Customer as hold",
                });
              }
            });
          }
          
        }
      })
      
      }
    })
  }
})
     
}

// notification 
exports.closenotificationemailfun = function (req, res){
 
            var nodemailer = require('nodemailer');
            var notification = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'tanishqtoken@gmail.com',
                pass: 'Tanishq@123'
              } 
            });
            var email = req.body.emaildetail.emailid
            var mailOptions = {
              from: 'tanishqtoken@gmail.com',
              to: email,
              subject: 'Tanishq - Your bill done',
              text: "Dear Customer Your Bill is successfully completed",
            };
            notification.sendMail(mailOptions, function (errormail) {
              if (errormail) {
                res.send({ 
                  "code": 400,
                  "message": "error"
                });
              }else{
                res.send({ 
                  "code": 200,
                  "message": "Email has Been sent to Customer",
                });
              }
            }); 
} 
  
//remove hold 
exports.removeholdbill = function (req, res){
    database.query('SELECT * FROM terminal_calculation WHERE showroom_id = ? and teriminal=?', [req.body.showroomid,req.body.teminal], function (errorterminalsel, resultterminalsel, fields) {
      if (errorterminalsel) {
        res.send({
       "code": 400, 
       "message": "error ocurred " + error
     })
     }else{
       var pluevalue = resultterminalsel[0].holdlist - 1
      var sql = "UPDATE terminal_calculation set holdlist=? WHERE showroom_id = ? and teriminal = ?";
      var query = database.query(sql, [pluevalue,req.body.showroomid,req.body.teminal], function (errorsim, result) {        
        if(errorsim){
        res.send({
          "code": 500,
          "error": "error",
        });
      }else{
        var message = "Dear customer your Bill Hold has been removed"
        var sql = "UPDATE token_customerdetail set holdstatus=?,customerstatus=? WHERE showroom_id = ? and terminal = ? and id = ?";
        var query = database.query(sql, [0,message,req.body.showroomid,req.body.teminal,req.body.data.id], function (err, result) {        
          if(err){
          res.send({
            "code": 500,
            "error": "error",
          });
        }else{
          res.send({ 
            "code": 200,
            "message": "Hold Has been removed",
          });
        }
      })
      
      }
    })
  }
 })
}

// swipefeature
exports.updateswipe = function (req, res){
    var sql = "UPDATE token_customerdetail set terminal=? WHERE showroom_id = ? and id = ?";
    var query = database.query(sql, [req.body.teminal,req.body.showroomid,req.body.data.id], function (errorsim, result) {        
      if(errorsim){
      res.send({
        "code": 500,
        "error": "error",
      });
    }else{
      var customermessage = "Dear Customer Your Token  is Moved to" + req.body.teminal + " Please Visite at "+ req.body.teminal
      var nodemailer = require('nodemailer');
      var notification = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'tanishqtoken@gmail.com',
          pass: 'Tanishq@123'
        } 
      });
      var email = req.body.data.emailid
      var mailOptions = {
        from: 'tanishqtoken@gmail.com',
        to: email,
        subject: 'Tanishq',
        text: "Dear Customer Your Token  is Moved to" + req.body.teminal + " Please Visite at "+ req.body.teminal,
      };
      notification.sendMail(mailOptions, function (errormail) {
        if (errormail) {
          res.send({ 
            "code": 400,
            "message": "error"
          });
        }else{
          res.send({ 
            "code": 200,
            "message": "Bill Has been moved",
            "cusmsg":   customermessage
          });
        }
      });
     
    }
  })
}

// terminal maintain
exports.addterminal = function (req, res) {
  database.query('SELECT * FROM terminal_count WHERE terminalname = ? and showroom_id=?', [req.body.data.terminal,req.body.showroomid], function (errorterminal, resultterminal, fields) {
    if(errorterminal){
      res.send({
        "code": 400,
        "message": "error ocurred " + errorterminal
      }) 
     }else{
      if(resultterminal.length == 0){
        var today = new Date();
        var dataset = {
        showroom_id: req.body.showroomid,
        teriminal:req.body.data.terminal,
        cashiername:req.body.data.cashiername,
        floor:req.body.data.floorno,
        created: today, 
        updated:today
        }
        database.query('INSERT INTO terminal_calculation SET ?', dataset, function (errorter, resultster, fields) {
        if(errorter){
          res.send({
            "code": 400,
            "message": "error ocurred " + errorter
          }) 
        }else{
        
          var today = new Date();
          var data = {
            idval:resultster.insertId,
          showroom_id: req.body.showroomid,
          username: req.body.data.username,
          password: req.body.data.password,
          terminalname: req.body.data.terminal,
          floor:req.body.data.floorno,
          cashiername:req.body.data.cashiername,
          transaction_type:req.body.data.billtype,
          created: today,
          updated:today
          } 
          database.query('INSERT INTO terminal_count SET ?', data, function (error, results, fields) {
          if (error) {
              res.send({
                "code": 400,
                "message": "error ocurred " + error
              }) 
            } else {
              res.send({
                "code": 200,
                "sucess":results,
                "message": "New Terminal Has been added successfully"
              });
            }
          });
      
        }
        })
      }
      else{
        res.send({
          "code": 300,
          "message": "This Username is Already avilable please Choose any Other name"
        }) 
      }
  }   
  })
}
exports.addtxdata = function (req, res) {
        var dataset = {
          showroom_id: req.body.showroomid,
          transactionname:req.body.txdata,
        }
        database.query('INSERT INTO transaction_type SET ?', dataset, function (errorter, resultster, fields) {
          if(errorter){
          res.send({
            "code": 400,
            "message": "error ocurred " + errorter
          }) 
        }else{
          res.send({
            "code": 200,
            "sucess":resultster,
            "message": "Transaction type added"
          });
        }
        })
    
}
exports.createterminallogin = function (req, res) {
  database.query('SELECT * FROM terminal_login WHERE username = ?', [req.body.data.username], function (errorterminal, resultterminal, fields) {
    if(errorterminal){
      res.send({
        "code": 400,
        "message": "error ocurred " + errorterminal
      }) 
     }else{
      if(resultterminal.length == 0){
        var today = new Date();
        var data = {
        showroom_id: req.body.showroomid,
        username: req.body.data.username,
        password: req.body.data.password,
        created: today,
        updated:today
        }
        database.query('INSERT INTO terminal_login SET ?', data, function (error, results, fields) {
        if (error) {
            res.send({
              "code": 400,
              "message": "error ocurred " + error
            }) 
          } else {
            res.send({
              "code": 200,
              "sucess":results,
              "message": "New Terminal login Has been added successfully"
            });
          }
        });
      }else{
        res.send({
          "code": 300,
          "message": "This Username is Already avilable please Choose any Other name"
        }) 
      }
     }
    })
         

}
exports.updateterminallogin = function (req, res) {
  
  var sql = "UPDATE terminal_login set username=?,password = ? WHERE id = ? and showroom_id = ?";
  var query = database.query(sql, [req.body.data.username,req.body.data.password,req.body.data.id,req.body.showroomid], function (error, result) {   
    if(error){
          res.send({
            "code": 400,
            "message": "error ocurred " + error
          }) 
        }else{
          res.send({
            "code": 200,
            "sucess":result,
            "message": "terminal Details has been updated successfully"
          }); 
        }
     })    
}
// status maintain
exports.closebilldetail = function (req, res) {
  
  var sql = "UPDATE token_customerdetail set close=? WHERE showroom_id = ? and id = ? and terminal =?";
  var query = database.query(sql, [1,req.body.showroomid,req.body.id,req.body.terminal], function (errorsim, result) {   
        if(errorsim){
          res.send({
            "code": 400,
            "message": "error ocurred " + error
          }) 
        }else{
          database.query('SELECT * FROM terminal_calculation WHERE showroom_id = ? and teriminal=?', [req.body.showroomid,req.body.terminal], function (errorterminalsel, resultterminalsel, fields) {
            if (errorterminalsel) {
              res.send({
             "code": 400,
             "message": "error ocurred " + error
           })
           }
           else{
            var tot = resultterminalsel[0].totalbill
            if(tot == 0){
              var totalvale = tot
            }else{
              var totalvale = tot  -1
            }
            var sql = "UPDATE terminal_calculation set totalbill=? WHERE showroom_id = ? and teriminal = ?";
            var query = database.query(sql, [totalvale,req.body.showroomid,req.body.terminal], function (errortot, result) {     
            if(errortot){
              res.send({
                "code": 400,
                "message": "total error ocurred "
              })
            }
            else{
            if(req.body.billtype == 'S'){
              var simcount = resultterminalsel[0].simple_count
              if(simcount == 0){
                var sql = "UPDATE terminal_calculation set simple_count=? WHERE showroom_id = ? and teriminal = ?";
                var query = database.query(sql, [simcount,req.body.showroomid,req.body.terminal], function (errorsim, result) {        
                  if(errorsim){
                    res.send({
                      "code": 400,
                      "message": "error ocurred " + error
                    })
                  }else{
                    res.send({
                      "code": 200,
                      "sucess":'success',
                      "message": "Bill Closed - Successfully"
                    });
                  }
  
                })
              }else{
                var simpleupdate = simcount - 1
                var sql = "UPDATE terminal_calculation set simple_count=? WHERE showroom_id = ? and teriminal = ?";
                var query = database.query(sql, [simpleupdate,req.body.showroomid,req.body.terminal], function (errorsim, result) {        
                  if(errorsim){
                    res.send({
                      "code": 400,
                      "message": "error ocurred " + error
                    })
                  }else{
                    res.send({
                      "code": 200,
                      "sucess":'success',
                      "message": "Bill Closed - Successfully"
                    });
                  }
                })
              }
            }else{
              if(req.body.billtype == 'M'){
                var modurate = resultterminalsel[0].modurate_count
                if(modurate == 0){
                  var sql = "UPDATE terminal_calculation set modurate_count=? WHERE showroom_id = ? and teriminal = ?";
                  var query = database.query(sql, [modurate,req.body.showroomid,req.body.terminal], function (errorsim, result) {        
                    if(errorsim){
                      res.send({
                        "code": 400,
                        "message": "error ocurred " + error
                      })
                    }else{
                      res.send({
                        "code": 200,
                        "sucess":'success',
                        "message": "Bill Closed - Successfully"
                      });
                    }
                  })
                }else{
                  var modurateupdate = modurate - 1
                  var sql = "UPDATE terminal_calculation set modurate_count=? WHERE showroom_id = ? and teriminal = ?";
                  var query = database.query(sql, [modurateupdate,req.body.showroomid,req.body.terminal], function (errorsim, result) {        
                    if(errorsim){
                      res.send({
                        "code": 400,
                        "message": "error ocurred " + error
                      })
                    }else{
                      res.send({
                        "code": 200,
                        "sucess":'success',
                        "message": "Bill Closed - Successfully"
                      });
                    }
                  })
                }
                
              }else{
                if(req.body.billtype == 'C'){
                  var complex = resultterminalsel[0].complex_count
                  if(complex == 0){
                var sql = "UPDATE terminal_calculation set complex_count=? WHERE showroom_id = ? and teriminal = ?";
                var query = database.query(sql, [complex,req.body.showroomid,req.body.terminal], function (errorsim, result) {        
                  if(errorsim){
                    res.send({
                      "code": 400,
                      "message": "error ocurred " + error
                    })
                  }else{
                    res.send({
                      "code": 200,
                      "sucess":'success',
                      "message": "Bill Closed - Successfully"
                    });
                  }
                })

                  }else{
                    var complexupdate = complex - 1
                    var sql = "UPDATE terminal_calculation set complex_count=? WHERE showroom_id = ? and teriminal = ?";
                    var query = database.query(sql, [complexupdate,req.body.showroomid,req.body.terminal], function (errorsim, result) {        
                      if(errorsim){
                        res.send({
                          "code": 400,
                          "message": "error ocurred " + error
                        })
                      }else{
                        res.send({
                          "code": 200,
                          "sucess":'success',
                          "message": "Bill Closed - Successfully"
                        });
                      }
                    })
    
                  }
                }
              }
            }
          }
           })
           }
          })
        }
     })    
}
exports.secondcustomerupdate = function (req, res) {
  if(req.body.timebasedontype == 'S'){
    var message = "Dear Customer Your Billing turn will be in another 5 mins , Kindely Wait at lounge / Look our new collections"
    var sql = "UPDATE token_customerdetail set customerstatus=? WHERE showroom_id = ? and terminal = ? and id =?";
    var query = database.query(sql, [message,req.body.showroomid,req.body.data.terminal,req.body.data.id], function (error, result) {        
      if(error){
      res.send({ 
        "code": 400,
        "message": "update status error"
      });
    }
    else{
      var sql = "UPDATE token_customerdetail set startstatus=? WHERE showroom_id = ? and terminal = ? and id =?";
      var query = database.query(sql, [1,req.body.showroomid,req.body.data.terminal,req.body.startchangeid], function (error, result) {        
          if(error){
              res.send({ 
                "code": 400,
                "message": "update status error"
              });
           }
        else{
          res.send({ 
            "code": 200,
            "message": "update success",
            "cusmsg":message
          });
        }
     })
    }
    })
  }else{ 
    if(req.body.timebasedontype == 'C'){
      var message = "Dear Customer Your Billing turn will be in another 15 mins , Kindely Wait at lounge / Look our new collections"
 
      // var message = "Dear Customer Please visite " + req.body.data.terminal + " with in 15 mins"
      var sql = "UPDATE token_customerdetail set customerstatus=? WHERE showroom_id = ? and terminal = ? and id =?";
      var query = database.query(sql, [message,req.body.showroomid,req.body.data.terminal,req.body.data.id], function (error, result) {   
        if(error){
          res.send({ 
            "code": 400,
            "message": "update status error"
          });
        }
        else{
          var sql = "UPDATE token_customerdetail set startstatus=? WHERE showroom_id = ? and terminal = ? and id =?";
      var query = database.query(sql, [1,req.body.showroomid,req.body.data.terminal,req.body.startchangeid], function (error, result) {   
        if(error){
          res.send({ 
            "code": 400,
            "message": "update status error",
            "cusmsg":message

          });
        }else{
          res.send({ 
            "code": 200,
            "message": "update success",
            "cusmsg":message

          });
        }
      })
          
        }
      })
      
    }else{
      if(req.body.timebasedontype == 'M'){
        var message = "Dear Customer Your Billing turn will be in another 8 mins , Kindely Wait at lounge / Look our new collections"

        // var message = "Dear Customer Please visite " + req.body.data.terminal + " with in 8 mins"
        var sql = "UPDATE token_customerdetail set customerstatus=? WHERE showroom_id = ? and terminal = ? and id =?";
        var query = database.query(sql, [message,1,req.body.showroomid,req.body.data.terminal,req.body.data.id], function (error, result) {   
  
          if(error){
            res.send({ 
              "code": 400,
              "message": "update status error"
            });
          }else{
            var sql = "UPDATE token_customerdetail set startstatus=? WHERE showroom_id = ? and terminal = ? and id =?";
            var query = database.query(sql, [1,req.body.showroomid,req.body.data.terminal,req.body.startchangeid], function (error, result) {   
              if(error){
                res.send({ 
                  "code": 400,
                  "message": "update status error"
                });
              }else{
                res.send({ 
                  "code": 200,
                  "message": "update success",
                  "cusmsg":message

                });
              }
            })
            
          }
        })
      }
    }

  }
}
exports.lastbillstatus = function (req, res) {
    var sql = "UPDATE token_customerdetail set startstatus=? WHERE showroom_id = ? and id =?";
    var query = database.query(sql, [1,req.body.showroomid,req.body.startchangeid], function (error, result) {        
        if(error){
            res.send({ 
              "code": 400,
              "message": "update status error"
            });
         }
      else{
        res.send({ 
          "code": 200,
          "message": "update success"
        });
      }
   })
  
  }  
//  secone Customer maintain
exports.secondcustomernotification = function (req, res){
      if(req.body.timebasedontype == 'S'){
        var message = "Dear Customer Your Billing turn will be in another 5 mins , Kindely Wait at lounge / Look our new collections"
        // var message = "Dear Customer Please visite " + req.body.data.terminal + " with in 5 mins"
        var sql = "UPDATE token_customerdetail set customerstatus=? WHERE showroom_id = ? and terminal = ? and id =?";
        var query = database.query(sql, [message,req.body.showroomid,req.body.data.terminal,req.body.data.id], function (error, result) {        
          if(error){
          res.send({ 
            "code": 400,
            "message": "update status error"
          });
        }
        else{
          var sql = "UPDATE token_customerdetail set startstatus=? WHERE showroom_id = ? and terminal = ? and id =?";
          var query = database.query(sql, [1,req.body.showroomid,req.body.data.terminal,req.body.startchangeid], function (error, result) {        
          if(error){
          res.send({ 
            "code": 400,
            "message": "update status error"
          });
        }else{
          var nodemailer = require('nodemailer');
          var notification = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'tanishqtoken@gmail.com',
              pass: 'Tanishq@123'
            } 
          });
          var email = req.body.data.emailid
         
          var mailOptions = {
            from: 'tanishqtoken@gmail.com',
            to: email,
            subject: 'Tanishq',
          
            text: message

            // text: "Dear Customer Your Token Number is " + req.body.data.token + " Please Visite at "+req.body.data.terminal + ' With In 5 Mins',
          };
          notification.sendMail(mailOptions, function (errormail) {
            if (errormail) {
              res.send({ 
                "code": 400,
                "message": "error"
              });
            }else{
              res.send({ 
                "code": 200,
                "message": "Email has Been sent to next Customer,next customer will reach with in 5 mins",
                "cucmessage": message

              });
            }
          });
        }
      })
        
        }
        })
  
      }
      else{
        if(req.body.timebasedontype == 'C'){
          var message = "Dear Customer Your Billing turn will be in another 15 mins , Kindely Wait at lounge / Look our new collections"

        // var message = "Dear Customer Please visite " + req.body.data.terminal + " with in 15 mins"
        var sql = "UPDATE token_customerdetail set customerstatus=? WHERE showroom_id = ? and terminal = ? and id =?";
        var query = database.query(sql, [message,req.body.showroomid,req.body.data.terminal,req.body.data.id], function (error, result) {   
  
          if(error){
            res.send({ 
              "code": 400,
              "message": "update status error"
            });
          }
          else{
            var sql = "UPDATE token_customerdetail set startstatus=? WHERE showroom_id = ? and terminal = ? and id =?";
            var query = database.query(sql, [1,req.body.showroomid,req.body.data.terminal,req.body.startchangeid], function (error, result) {        
            if(error){
            res.send({ 
              "code": 400,
              "message": "update status error"
            });
          }else{
            var nodemailer = require('nodemailer');
            var notification = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'tanishqtoken@gmail.com',
                pass: 'Tanishq@123'
              } 
            });
            var email = req.body.data.emailid
            var mailOptions = {
              from: 'tanishqtoken@gmail.com',
              to: email,
              subject: 'Tanishq',
              text: message

              // text: "Dear Customer Your Token Number is " + req.body.data.token + " Please Visite at "+req.body.data.terminal + ' With In 15 Mins',
            };
            notification.sendMail(mailOptions, function (errormail) {
              if (errormail) {
                res.send({ 
                  "code": 400,
                  "message": "error"
                });
              }else{
                res.send({ 
                  "code": 200,
                  "message": "Email has Been sent to next Customer,next customer will reach with in 15 mins",
                  "cucmessage": message

                });
              }
            });
          }
        })
      }
     })
        
        }else{
          if(req.body.timebasedontype == 'M'){
            var message = "Dear Customer Your Billing turn will be in another 8 mins , Kindely Wait at lounge / Look our new collections"

            // var message = "Dear Customer Please visite " + req.body.data.terminal + " with in 8 mins"
        var sql = "UPDATE token_customerdetail set customerstatus=? WHERE showroom_id = ? and terminal = ? and id =?";
        var query = database.query(sql, [message,req.body.showroomid,req.body.data.terminal,req.body.data.id], function (error, result) {   
  
          if(error){
            res.send({ 
              "code": 400,
              "message": "update status error"
            });
          }else{
            var sql = "UPDATE token_customerdetail set startstatus=? WHERE showroom_id = ? and terminal = ? and id =?";
            var query = database.query(sql, [1,req.body.showroomid,req.body.data.terminal,req.body.startchangeid], function (error, result) {        
            if(error){
            res.send({ 
              "code": 400,
              "message": "update status error"
            });
          }else{
            var nodemailer = require('nodemailer');
            var notification = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'tanishqtoken@gmail.com',
                pass: 'Tanishq@123'
              } 
            });
            var email = req.body.data.emailid
            var mailOptions = {
              from: 'tanishqtoken@gmail.com',
              to: email,
              subject: 'Tanishq',
              text: message,
            };
            notification.sendMail(mailOptions, function (errormail) {
              if (errormail) {
                res.send({ 
                  "code": 400,
                  "message": "error"
                });
              }else{
                res.send({ 
                  "code": 200,
                  "message": "Email has Been sent to next Customer,next customer will reach with in 8 mins",
                  "cucmessage": message

                });
              }
            });
          }
        })
          
          }
        })
           
          }
        }
  
      }
  }

// update,delete feature - admin & rso,terminal
exports.upadmin = function (request, response) {
    var today = new Date();
    var sql = "UPDATE titan_admin set company_name=?,company_address=?,username=?,password=? WHERE id = ?";
    var query = database.query(sql, [request.body.admincompanyname,request.body.companyaddress,request.body.username,request.body.password,request.body.id], function (error, result) {
      if (error) {
        response.send({
          "code": 400,
          "message": "error ocurred " + error
        })
      } else {
        response.send({
          "code": 200,
          "message": "Admin is updated sucessfully"
        });
      }
    });
}
exports.updatersologin = function (req, res) {
    var sql = "UPDATE login set username=?,password = ? WHERE id = ? and showroom_id = ?";
    var query = database.query(sql, [req.body.data.username,req.body.data.password,req.body.data.id,req.body.showroomid], function (error, result) {   
      if(error){
            res.send({
              "code": 400,
              "message": "error ocurred " + error
            }) 
          }else{
            res.send({
              "code": 200,
              "sucess":result,
              "message": "RSO Details has been updated successfully"
            });
          }
       })    
}
exports.updateterminal = function (req, res) {

  database.query('SELECT * FROM terminal_count WHERE terminalname = ? and showroom_id=?', [req.body.data.terminal,req.body.showroomid], function (errorterminal, resultterminal, fields) {
    if(errorterminal){
      res.send({
        "code": 400,
        "message": "error ocurred " + errorterminal
      }) 
     }else{
       if(resultterminal.length == 0){
        var sql = "UPDATE terminal_count set terminalname=?,floor = ?,cashiername=?,transaction_type=? WHERE id = ? and showroom_id = ?";
        var query = database.query(sql, [req.body.data.terminal,req.body.data.floorno,req.body.data.cashiername,req.body.data.billtype,req.body.data.id,req.body.showroomid], function (error, result) {   
          if(error){
                res.send({
                  "code": 400,
                  "message": "error ocurred " + error
                }) 
              }else{
                var sql = "UPDATE terminal_calculation set teriminal=?,floor = ?,cashiername=? WHERE id = ? and showroom_id = ?";
                var query = database.query(sql, [req.body.data.terminal,req.body.data.floorno,req.body.data.cashiername,req.body.data.idval,req.body.showroomid], function (errorr, result) {   
               if(errorr){
                res.send({
                  "code": 400,
                  "message": "error ocurred " + errorr
                })
               }else{
                res.send({
                  "code": 200,
                  "sucess":result,
                  "message": "Terminal Details has been updated successfully"
                });
                 }
                })        
              }
           })    
       }else{
         
             if(resultterminal[0].id == req.body.data.id ){
              var sql = "UPDATE terminal_count set terminalname=?,floor = ?,cashiername=?,transaction_type=? WHERE id = ? and showroom_id = ?";
              var query = database.query(sql, [req.body.data.terminal,req.body.data.floorno,req.body.data.cashiername,req.body.data.billtype,req.body.data.id,req.body.showroomid], function (error, result) {   
                if(error){ 
                      res.send({
                        "code": 400,
                        "message": "error ocurred " + error
                      }) 
                    }else{
                      var sql = "UPDATE terminal_calculation set teriminal=?,floor = ?,cashiername=? WHERE id = ? and showroom_id = ?";
                      var query = database.query(sql, [req.body.data.terminal,req.body.data.floorno,req.body.data.cashiername,req.body.data.idval,req.body.showroomid], function (errorr, result) {   
                     if(errorr){
                      res.send({
                        "code": 400,
                        "message": "error ocurred " + errorr
                      })
                     }else{
                      res.send({
                        "code": 200,
                        "sucess":result,
                        "message": "Terminal Details has been updated successfully"
                      });
                       }
                      })        
                    }
                 })    
             }else{
              res.send({
                "code": 300,
                "message": "This Username is Already avilable please Choose any Other name"
              }) 
             }
       }
     }
    })
  
}
exports.deleteadmin = function (req, res) {
  var sql = "DELETE from titan_admin WHERE id = ?";
  var query = database.query(sql, [req.body.id], function (err, result) {
    if (err) {
      res.send({
        "code": 400, 
        "message": "admin is not Deleted! kindly tray again"
      }) 
    } else {
      res.send({
        "code": 200,
        "message": "admin is Deleted sucessfully."
      });
    }
  });
}
exports.updatedisplay = function (req, res) {
      var sql = "UPDATE displaylogin set username=?,password = ? WHERE id = ? and showroom_id = ?";
      var query = database.query(sql, [req.body.data.username,req.body.data.password,req.body.data.id,req.body.showroomid], function (error, result) {   
        if(error){
              res.send({
                "code": 400,
                "message": "error ocurred " + error
              }) 
            }else{
              res.send({
                "code": 200,
                "sucess":result,
                "message": "Display Details has been updated successfully"
              });
            }
         })    
}
exports.updatestart = function (req, res) {
     
      var sql = "UPDATE terminal_calculation set status=?  WHERE showroom_id = ? and teriminal = ? and id= ?" ;
      var query = database.query(sql, [1,req.body.showroomid,req.body.data.teriminal,req.body.data.id], function (error, result) {   
   
        if(error){
              res.send({
                "code": 400,
                "message": "error ocurred " + error
              }) 
            }else{
              res.send({
                "code": 200,
                "sucess":result,
                "message": req.body.data.teriminal + "Has Been started"
              });
            }
         })    
}
exports.logoutbyanotherperson = function (req, res) {
 
  var sql = "UPDATE terminal_calculation set status=?,logoutby=?  WHERE showroom_id = ? and teriminal = ? and id =?";
  var query = database.query(sql, [0,req.body.iddetail.logoutby,req.body.showroomid,req.body.data.teriminal,req.body.data.id], function (error, result) {   

    if(error){
          res.send({
            "code": 400,
            "message": "error ocurred "
          }) 
        }else{
          res.send({
            "code": 200,
            "sucess":result,
            "message":"Logout done"
          });
        }
     })    
}
exports.updateprogresstostart = function (req, res) {
      
        var sql = "UPDATE terminal_calculation set status=?  WHERE showroom_id = ? and teriminal = ? and id = ?";
        var query = database.query(sql, [0,req.body.showroomid,req.body.terminal,req.body.terminalidvalue], function (error, result) {   
          if(error){
                res.send({
                  "code": 400,
                  "message": "error ocurred " + error
                }) 
              }else{
                res.send({
                  "code": 200,
                  "sucess":result,
                  "message":"You Have logout"
                });
              }
           })    
}

// break feature for cashier
exports.breakeupdate = function (req, res) {
        
          var sql = "UPDATE terminal_calculation set status=?  WHERE showroom_id = ? and teriminal = ?";
          var query = database.query(sql, [2,req.body.showroomid,req.body.terminal], function (error, result) {   
            if(error){
                  res.send({
                    "code": 400,
                    "message": "error ocurred " + error
                  }) 
                }else{
                  res.send({
                    "code": 200,
                    "sucess":result,
                    "message":"Cashier on  break"
                  });
                }
             })    
}
exports.continueonwork = function (req, res) {
            var sql = "UPDATE terminal_calculation set status=?  WHERE showroom_id = ? and teriminal = ?";
            var query = database.query(sql, [1,req.body.showroomid,req.body.terminal], function (error, result) {   
              if(error){
                    res.send({
                      "code": 400,
                      "message": "error ocurred " + error
                    }) 
                  }else{
                    res.send({
                      "code": 200,
                      "sucess":result,
                      "message":"Cashier on  break"
                    });
                  }
               })    
}

// rso dashboard deatil
exports.addrsodetail = function (req, res) {
  database.query('SELECT * FROM login WHERE username = ?',req.body.data.username, function (errorrs, resultsrs, fields) {
  if(errorrs){
    res.send({
      "code": 400,
      "message": "error ocurred " + errorrs
    }) 
  }else{
    if(resultsrs.length == 0){
      var today = new Date();
      var data = {
       showroom_id: req.body.showroomid,
       username: req.body.data.username,
       password: req.body.data.password,
       created: today,
       updated:today
      }
      database.query('INSERT INTO login SET ?', data, function (error, results, fields) {
       if (error) {
          res.send({
            "code": 400,
            "message": "error ocurred " + error
          }) 
        } else {
          res.send({
            "code": 200,
            "sucess":results,
            "message": "New Terminal Has been added successfully"
          });
        }
      });
    }else{
      res.send({
        "code": 300,
        "message": "This Username is Already avilable please Choose any Other name"
      }) 
    }
  }
  })

}

// terminal dashboard 
exports.adddisplaydetsil = function (req, res) {
  database.query('SELECT * FROM displaylogin WHERE username = ?',req.body.data.username, function (errorrs, resultsrs, fields) {
  if(errorrs){
    res.send({
      "code": 400,
      "message": "error ocurred " + errorrs
    }) 
  }else{
    if(resultsrs.length == 0){
      var today = new Date();
      var data = {
       showroom_id: req.body.showroomid,
       username: req.body.data.username,
       password: req.body.data.password,
       created: today,
       updated:today
      }
      database.query('INSERT INTO displaylogin SET ?', data, function (error, results, fields) {
       if (error) {
          res.send({
            "code": 400,
            "message": "error ocurred " + error
          }) 
        } else {
          res.send({
            "code": 200,
            "sucess":results,
            "message": "New Display Has been added successfully"
          });
        }
      });
    }else{
      res.send({
        "code": 300,
        "message": "This Username is Already avilable please Choose any Other name"
      }) 
    }
  }
  })

}
exports.getterminal = function (req, res) { 
 
database.query('SELECT * FROM terminal_count WHERE showroom_id = ?',req.body.showroomid, function (error, results, fields) {
  if (error) {
    res.send({
      "code": 400,
      "success": "error ocurred " + error
    })
  } else { 
    if (results.length == 0) {
      return res.send({
        "code": 200,
        "success": results,
        "message": "values shown below"
      });
    } else {
      return res.send({
        "code": 200,
        "success": results,
        "message": "values shown below"
      });
    }
  }
}); 
}
exports.gettransaction = function (req, res) { 
 
  database.query('SELECT * FROM transaction_type WHERE showroom_id = ?',req.body.showroomid, function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}
exports.getterminallogindetail = function (req, res) { 
  database.query('SELECT * FROM terminal_login WHERE showroom_id = ?',req.body.showroomid, function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}

// customer details
exports.getcustomerdetail = function (req, res) { 
  
  database.query('SELECT * FROM token_customerdetail WHERE showroom_id = ? and terminal = ? and close = ?',[req.body.showroomid,req.body.login,0], function (error, results, fields) {
    if (error) {
      res.send({ 
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}
exports.getfullcustomerdetail = function (req, res) { 
  database.query('SELECT * FROM token_customerdetail WHERE showroom_id = ?  and close = ?',[req.body.showroomid,0], function (error, results, fields) {
    if (error) {
      res.send({ 
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}
exports.getterminalvalwithcount = function (req, res) { 
  database.query('SELECT * FROM terminal_calculation WHERE showroom_id = ?',req.body.showroomid, function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}

// titan super admin
exports.superadminlogin = function (req, res) { 
  database.query('SELECT * FROM titan_admin WHERE username = ? and password =?',[req.body.email,req.body.password], function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 300,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); }
exports.getterminalvalwithcountwithterminalname = function (req, res) { 
    database.query('SELECT * FROM terminal_calculation WHERE showroom_id = ? and teriminal =?',[req.body.showroomid,req.body.terminal], function (error, results, fields) {
      if (error) {
        res.send({
          "code": 400,
          "success": "error ocurred " + error
        })
      } else {
        if (results.length == 0) {
          return res.send({
            "code": 200,
            "success": results,
            "message": "values shown below"
          });
        } else {
          return res.send({
            "code": 200,
            "success": results,
            "message": "values shown below"
          });
        }
      }
    }); 
}
exports.getrsodetail = function (req, res) { 
  database.query('SELECT * FROM login WHERE showroom_id = ?',req.body.showroomid, function (error, results, fields) {
  
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}
exports.addshowroomnewui = function (req, res) { 
  database.query('SELECT * FROM admin WHERE id ',function (error, results, fields) {
   var calsrid = results[results.length - 1].id + 1
   var srid ="sr-"+ calsrid
   var dataset = {
    showroom_id: srid,
    username:req.body.value.username,
    password:req.body.value.password,
    lat:req.body.value.lat,
    lon:req.body.value.lon,
    address:req.body.value.address
  }
  
  database.query('INSERT INTO admin SET ?', dataset, function (errorter, resultster, fields) {
    
    if(errorter){
    res.send({
      "code": 400,
      "message": "error ocurred " + errorter
    }) 
  }else{
    res.send({
      "code": 200,
      "sucess":resultster,
      "message": "Admin Created"
    });
  }
  })
  })
}

//req for Data (report module)
exports.gettokenlist = function (req, res) { 
  database.query('SELECT * FROM token_customerdetail WHERE showroom_id = ?',req.body.showroomid, function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      res.send({
        "code": 200,
        "success": results,
        "message": "success"
      }) 
    }
  })
}
exports.editshowroom = function (req, res) { 
  var sql = "UPDATE admin set username=?,password = ?,address=?,lat=?,lon=? WHERE id = ?";
  var query = database.query(sql, [req.body.value.username,req.body.value.password,req.body.value.address,req.body.value.lattitude,req.body.value.longitude,req.body.value.id], function (error, result) {   
    if(error){
          res.send({
            "code": 400,
            "message": "error ocurred " + error
          }) 
        }else{
          res.send({
            "code": 200,
            "message": "success"
          }) 
        }
      })
}
exports.getcustomerreport = function (req, res) { 
  database.query('SELECT * FROM token_customerdetail WHERE showroom_id = ?',req.body.showroomid, function (error, results, fields) {
  
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}
exports.changestatus = function (req, res) { 
  database.query('SELECT * FROM admin WHERE managerstatus = 1', function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " 
      })
    } else {  
      for(let i = 0;i<results.length;i++){
            var today = new Date();
            let hours = today.getHours();
            let minutes = today.getMinutes();
            let sec = today.getSeconds();

             var totmin = minutes - results[i].min
             var totsec = sec - results[i].seconds

             console.log(totmin)
             console.log(totsec)

             if((1<=totmin || 0>totmin) || (totsec > 5 || totsec < 0) ){
               console.log("yes")
              var sql = "UPDATE admin set managerstatus=? WHERE id = ?";
              var query = database.query(sql, [0,results[i].id], function (error, result) {
                if (error) {

                   }else{

                }
              })
             }
           }

      database.query('SELECT * FROM admin WHERE rsostatus = 1', function (errorr, resultss, fields) {
      if (errorr) {
        res.send({
          "code": 400,
          "success": "error ocurred " 
        })
      }else{
        for(let i = 0;i<resultss.length;i++){
          var today = new Date();
          let hours = today.getHours();
          let minutes = today.getMinutes();
          let rssec = today.getSeconds();

           var totmin = minutes - resultss[i].rmin
           var totsec = rssec - resultss[i].rsosec

          //  if((1<=totmin || 0>totmin) || (totsec > 5 || totsec < 0) ){

           if((1<=totmin || 0>totmin) || ((totsec > 5 || totsec < 0))){
            var sql = "UPDATE admin set rsostatus=? WHERE id = ?";
            var query = database.query(sql, [0,resultss[i].id], function (error, result) {
              if (error) {

                 }else{

              }
            })
           }
         }

         return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
          });
      }
 
      })
    }
  });
}
exports.getadmin = function (req, res) { 
  database.query('SELECT * FROM titan_admin WHERE id', function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}
exports.getshowroom = function (req, res) { 
  database.query('SELECT * FROM admin WHERE id', function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}
exports.getzeroshowroom = function (req, res) { 
  database.query('SELECT * FROM admin WHERE showroom_id NOT IN (SELECT showroom_id FROM token_customerdetail)', function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}
exports.gettokendetails = function (req, res) {
  database.query('SELECT * FROM token_customerdetail WHERE  showroom_id = ?',req.body.value.sroom, function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      return res.send({
        "code": 200,
        "success": results,
        "message": "values shown below"
      });
    }
  }); 
}
exports.getfullreport = function (req, res) {
  database.query('SELECT * FROM token_customerdetail WHERE  id ', function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      return res.send({
        "code": 200,
        "success": results,
        "message": "values shown below"
      });
    }
  }); 
}
exports.statusfromtanishqmanager = function (req, res) {
  var today = new Date();
  let hours = today.getHours();
  let minutes = today.getMinutes();
  let seconds = today.getSeconds();
  var time = hours 
  var min = minutes
  var sec = seconds
  var sql = "UPDATE admin set managerstatus = ?,time=?,min=?,seconds=?  WHERE showroom_id = ?";
  var query = database.query(sql, [1,time,min,sec,req.body.showroomid], function (errorsim, result) {        
   if(errorsim){
   res.send({
     "code": 500,
     "error": "error",
   });
  }else{
    res.send({
      "code": 200,
      "message": "success",
    });
    }
  })
}
exports.rsostatuschange = function (req, res) {
  var today = new Date();
  let hours = today.getHours();
  let minutes = today.getMinutes();
  let secon = today.getSeconds();
  var time = hours 
  var min = minutes
  var sec = secon

  var sql = "UPDATE admin set rsostatus = ?,rtime=?,rmin=?,rsosec=?  WHERE showroom_id = ?";
  var query = database.query(sql, [1,time,min,sec,req.body.showroomid], function (errorsim, result) {        
   if(errorsim){
   res.send({
     "code": 500,
     "error": "error",
   });
  }else{
    res.send({
      "code": 200,
      "message": "success",
     });
    }
  })
}

// showrrom delete
exports.deleteshowroom = function (req, res) { 
  var sql = "DELETE from admin WHERE id = ?";
  var query = database.query(sql, [req.body.value.id], function (err, result) {
    if (err) {
      res.send({
        "code": 400, 
        "message": "admin is not Deleted! kindly tray again"
      }) 
    }else{
      res.send({
        "code": 200,
        "message": "admin is Deleted sucessfully."
      });
    }
  })
}
exports.gettokencount = function (req, res) { 
  database.query('SELECT * FROM token_customerdetail WHERE id', function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}
exports.showroomwithentiredetails = function (req, res) { 
  database.query('SELECT admin.showroom_id,admin.username,admin.managerstatus,admin.rsostatus,admin.password, count(token_customerdetail.showroom_id) as detail FROM token_customerdetail INNER JOIN admin ON admin.showroom_id=token_customerdetail.showroom_id  GROUP BY token_customerdetail.showroom_id', function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}
exports.admin = function (req, res) { 
  var dataset = {
    company_name: req.body.admincompanyname,
    company_address:req.body.companyaddress,
    username:req.body.username,
    password:req.body.password,
  }
  database.query('INSERT INTO titan_admin SET ?', dataset, function (errorter, resultster, fields) {
    if(errorter){
    res.send({
      "code": 400,
      "message": "error ocurred " + errorter
    }) 
  }else{
    res.send({
      "code": 200,
      "sucess":resultster,
      "message": "Admin Created"
    });
  }
  })
}
exports.getbilldetailsbysr = function (req, res) { 
  database.query('SELECT * FROM token_customerdetail WHERE showroom_id = ? and close = ?',[req.body.showroomid,0], function (error, results, fields) {
  
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}

// finial feature for display
exports.getdisplaydetailvalue = function (req, res) { 
  database.query('SELECT * FROM displaylogin WHERE showroom_id = ?',req.body.showroomid, function (error, results, fields) {
    if (error) {
      res.send({
        "code": 400,
        "success": "error ocurred " + error
      })
    } else {
      if (results.length == 0) {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      } else {
        return res.send({
          "code": 200,
          "success": results,
          "message": "values shown below"
        });
      }
    }
  }); 
}