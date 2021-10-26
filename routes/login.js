var express = require('express');
var router = express.Router();
var login_controller = require('../controllers/logincontroller');  //controller file



//router 
router.post('/login', login_controller.login); 
router.post('/customerdetail', login_controller.customerdetail);
router.post('/addterminal', login_controller.addterminal);
router.post('/updateterminal', login_controller.updateterminal);
router.post('/getterminal', login_controller.getterminal);
router.post('/gettransaction', login_controller.gettransaction);
router.post('/getterminalvalwithcount', login_controller.getterminalvalwithcount);
router.post('/getterminalvalwithcountwithterminalname', login_controller.getterminalvalwithcountwithterminalname);
router.post('/addrsodetail', login_controller.addrsodetail);
router.post('/adddisplaydetsil', login_controller.adddisplaydetsil);
router.post('/secondcustomernotification', login_controller.secondcustomernotification);
router.post('/holdreasonfunction', login_controller.holdreasonfunction);
router.post('/closenotificationemailfun', login_controller.closenotificationemailfun);
router.post('/removeholdbill', login_controller.removeholdbill); 
router.post('/getrsodetail', login_controller.getrsodetail);
router.post('/getadmin', login_controller.getadmin);
router.post('/upadmin', login_controller.upadmin);
router.post('/getcustomerreport',login_controller.getcustomerreport)
router.post('/superadminlogin',login_controller.superadminlogin)

// super admin
router.post('/getshowroom', login_controller.getshowroom);
router.post('/gettokencount', login_controller.gettokencount);
router.post('/showroomwithentiredetails', login_controller.showroomwithentiredetails);
router.post('/addshowroomnewui', login_controller.addshowroomnewui);
router.post('/getzeroshowroom', login_controller.getzeroshowroom);
router.post('/deleteshowroom', login_controller.deleteshowroom);
router.post('/editshowroom', login_controller.editshowroom);
router.post('/gettokendetails', login_controller.gettokendetails);
router.post('/getfullreport', login_controller.getfullreport);
router.post('/statusfromtanishqmanager', login_controller.statusfromtanishqmanager);
router.post('/rsostatuschange', login_controller.rsostatuschange);
router.post('/changestatus', login_controller.changestatus);

// super admin
router.post('/admin', login_controller.admin);
router.post('/getdisplaydetailvalue', login_controller.getdisplaydetailvalue);
router.post('/getcustomerdetail', login_controller.getcustomerdetail); 
router.post('/closebilldetail', login_controller.closebilldetail);
router.post('/secondcustomerupdate', login_controller.secondcustomerupdate); 
router.post('/lastbillstatus', login_controller.lastbillstatus);
router.post('/updateswipe', login_controller.updateswipe); 
router.post('/updatersologin', login_controller.updatersologin); 
router.post('/gettokenlist', login_controller.gettokenlist); 
router.post('/updatedisplay', login_controller.updatedisplay);
router.post('/updatestart', login_controller.updatestart);
router.post('/logoutbyanotherperson', login_controller.logoutbyanotherperson);

// Insert & update
router.post('/updateprogresstostart', login_controller.updateprogresstostart); 
router.post('/continueonwork', login_controller.continueonwork);
router.post('/breakeupdate', login_controller.breakeupdate);
router.post('/createterminallogin', login_controller.createterminallogin);
router.post('/getterminallogindetail', login_controller.getterminallogindetail);
router.post('/updateterminallogin', login_controller.updateterminallogin);
router.post('/addtxdata', login_controller.addtxdata);
router.post('/getbilldetailsbysr', login_controller.getbilldetailsbysr);
router.post('/getfullcustomerdetail', login_controller.getfullcustomerdetail); 


//module export
module.exports = router;