// app.get("/account", function(req, res) {
//     res.render("account");
//   });
//   app.get("/login", function(req, res) {
//     let message1 = req.flash('error');
//     res.render("login");
//   });
//   app.get("/register", function(req, res) {
//     let message1 = req.flash('error');
//     res.render("register");
//   });
  exports.getAccount = (req, res, next) => {
    res.render('/account', {
        path:'/account'
    })

};