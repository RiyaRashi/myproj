require('dotenv').config(); //use in case we need google authentication
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require("express-session");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const moment = require('moment'); //use for cureent date time format
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const homecontent = "WELCOME guys,have a good experience......";
const aboutcontent = "HERE we use to post receiepes of different varieties of foods.helpful for alll age groups who are interested in cooking ";
const contactcontent = "A warm welcome to you.For further details you can contact to our chefs on the following mail addresses:abc@gmail.com,wert@gmail.com.For further details cal on:XXXXXXXXXX";


const app = express();
app.use(cookieParser('secret'));
app.use(express.static("public"));
app.use('/images', express.static(path.join(__dirname, "images")));
app.set('view engine', 'ejs');
app.set('views', 'views'); ///data pass krne ke liye
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "our lil secret.",
  resave: false,
  saveUninitialized: false,
  maxAge: null
}));
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {

    cb(null, false);
  }
};
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).single('image'));
app.use((req, res, next) => {
  app.locals.message = req.flash('success');
  next();
});
app.use((req, res, next) => {
  app.locals.message1 = req.flash('error');
  delete req.flash('error');
  next();
});
app.use((req, res, next) => {
  res.locals.isAuth = req.isAuthenticated()
  next();
});
try {
  mongoose.connect('mongodb://riya:123@cluster0-shard-00-00.ttv3z.mongodb.net:27017,cluster0-shard-00-01.ttv3z.mongodb.net:27017,cluster0-shard-00-02.ttv3z.mongodb.net:27017/<dbname>?ssl=true&replicaSet=atlas-ccr1xt-shard-0&authSource=admin&retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
} catch (error) {
  handleError(error);
}
mongoose.connection.once('open', function() {
  console.log("Connection Established");
}).on('error', function(error) {
  console.log("Connection Error", error);
})
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
//following two when we need only login register without google
//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/compose",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo" //for ouath + authentication
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({
      googleId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));

const postSchema = {
  title: String,
  content: String,
  author: String,
  created_at: Date,
  imageurl: String
};
const feedSchema = {
  content: String,
  created_at: Date,
  author: String
};
const Post = mongoose.model("Post", postSchema);
const Feed = mongoose.model("Feed", feedSchema);
app.get("/", function(req, res) {
  res.render("home", {
    homecontent: homecontent
  });
});

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile']
  }));
app.get('/auth/google/compose',
  passport.authenticate('google', {
    failureRedirect: '/account'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/compose');
  });
app.get("/reciepes", function(req, res) {
  Post.find({}, function(Err, posts) {
    res.render("reciepes", {
      posts: posts,
    });
  });
});
app.get("/feedbacks", function(req, res) {
  Feed.find({}, function(err, feeds) {
    res.render("feedbacks", {
      feeds: feeds,
    });
  });
});
app.get("/compose", function(req, res) {
  if (req.isAuthenticated()) {
    const message = req.flash('success');
    const message1 = req.flash('error');
    res.render("compose", {
      moment: moment().format('LLLL')
    });
  } else {
    res.redirect("/account");
  }
});
app.get("/compose2", function(req, res) {
  res.render("compose2", {
    moment: moment().format('LLLL')
  });
});

app.get("/about", function(req, res) {
  res.render("about", {
    aboutcontent: aboutcontent
  });
});
app.get("/contact", function(req, res) {
  res.render("contact", {
    contactcontent: contactcontent
  });
});
app.get("/account", function(req, res) {
  res.render("account");
});
app.get("/login", function(req, res) {
  let message1 = req.flash('error');
  res.render("login");
});
app.get("/register", function(req, res) {
  let message1 = req.flash('error');
  res.render("register");
});

app.post("/create", function(req, res) {
  res.redirect("/reciepes");
});
app.post("/feed", function(req, res) {
  res.redirect("/compose2");
});
app.post("/login", function(req, res) {
  res.redirect("/login");
});
app.post("/register", function(req, res) {
  res.redirect("/register");
});
app.post("/back", function(req, res) {
  res.redirect("/");
});
app.post("/forward", function(req, res) {

  res.redirect("/compose");
});
app.post("/register1", function(req, res) {
  const username = req.body.username;
  const pw = req.body.password;
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {

    if (pw.length === 0 || username.length === 0) {
      console.log(err);
      req.flash('error', 'Empty!!please fill the details.');
      //req.flash(err);
      res.redirect("/register");
    } else if (err) {
      console.log(err);

      req.flash('error', 'User is already registered');
      res.redirect("/register");
    } else if (username.length > 20 || pw.length > 15) {
      console.log('too long');
      req.flash('error', 'User or password too long. ');
      //req.flash(err);
      res.redirect("/register");
    } else if (pw.length > 0 && pw.length < 4) {
      console.log('less');

      req.flash('error', 'size of password must be more than 4');
      res.redirect("/register");
    } else if (pw.includes('@') === false && pw.includes('#') === false && pw.includes('*') === false && pw.includes('$') === false) {
      console.log('special chars missing');

      req.flash('error', 'must include any of the following @,#,*,$');
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        req.flash('success', 'Welcome,you are registered');
        console.log(' successfully registered');
        res.redirect("/");
      });
    }
  });
});

app.post('/login1', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  successFlash: {
    type: 'success',
    message: 'successfully logged in'
  },
  failureFlash: {
    type: 'error',
    message: 'Invalid username or password.'
  }
}));

app.post("/comp", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/compose");
  } else {
    res.redirect("/account");
  }
});

app.post("/make", function(req, res) {
  console.log(req.file);
  if (!req.file) {
    req.flash('error', 'must include a image file');
    res.redirect("/compose");
  } else {
    const post = new Post({
      title: req.body.postTitle,
      content: req.body.postBody,
      author: req.body.postAuthor,
      created_at: moment().format(),
      imageurl: req.file.path
    });
    post.save(function(err) {
      if (!err) {
        User.created_at;
        res.redirect("/reciepes");
      } else {
        console.log(err);
      }
    });
  }
});
app.post("/make1", function(req, res) {
  const feed = new Feed({
    content: req.body.feedbody,
    author: req.body.postAuthor,
    created_at: moment().format()
  });
  feed.save(function(err) {
    if (!err) {
      User.created_at;
      res.redirect("/feedbacks");
    } else {
      console.log(err);
    }
  });
});
app.post("/feedback", function(req, res) {
  res.redirect("/feedbacks");
});
app.get("/posts/:postId", function(req, res) {

  const requestedPostId = req.params.postId;

  Post.findOne({
    _id: requestedPostId
  }, function(err, post) {
    res.render("post", {
      title: post.title,
      content: post.content,
      author: post.author,
      imageurl: post.imageurl
    });
  });
});

app.post("/one", function(req, res) {
  res.redirect("/feedbacks");
});
app.post("/two", function(req, res) {
  res.redirect("/");
});

app.get("/logout", function(req, res) {
  if (req.isAuthenticated()) {
    req.logout();
    res.redirect("logout");

  } else {
    res.render('logout');
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("server started at port 3000");
});
