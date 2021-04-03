const homecontent = "WELCOME guys,have a good experience......";
const aboutcontent = "HERE we use to post recipes of different varieties of foods.helpful for alll age groups who are interested in cooking ";
const contactcontent = "A warm welcome to you.For further details you can contact to our chefs on the following mail addresses:abc@gmail.com,wert@gmail.com.For further details cal on:XXXXXXXXXX";
// app.get("/", function(req, res) {
//   res.render("home", {
//     homecontent: homecontent
//   });
// });
// app.get("/about", function(req, res) {
//     res.render("about", {
//       aboutcontent: aboutcontent
//     });
//   });
//   app.get("/contact", function(req, res) {
//     res.render("contact", {
//       contactcontent: contactcontent
//     });
//   });
exports.getHome = (req, res, next) => {
    res.render('/home', {
        homecontent: homecontent,
        path:'/'
    })

};
exports.getAbout = (req, res, next) => {
    res.render('/about', {
        homecontent: aboutcontent,
        path:'/about'
    })

};
exports.getContact = (req, res, next) => {
    res.render('/contact', {
        homecontent: contactcontent,
        path:'/contact'
    })

};
