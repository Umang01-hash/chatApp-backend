const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const _ = require('lodash');



const app = express();

app.use(cors());


const server = require('http').createServer(app);
const io = require('socket.io')(server,{
  cors: {
    // Client Port
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const {User} = require('./Helpers/UserClass');


require('./socket/streams')(io, User , _);
require('./socket/private')(io);

const dbconfig = require("./config/secret");
const auth = require("./routes/authRoutes");
const posts = require('./routes/postRoutes');
const users = require('./routes/userRoutes');
const friends = require('./routes/friendsRoute');
const message=require('./routes/messageRoutes');
const image = require('./routes/imageRoutes');


app.use((req, res, next) => {
  res.header("Access-COntrol-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET",
    "POST",
    "DELETE",
    "PUT",
    "OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
// app.use(logger('dev'));

mongoose.Promise = global.Promise;
mongoose.connect(dbconfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


app.use("/api/chatapp", auth);
app.use('/api/chatapp', posts);
app.use('/api/chatapp',users);
app.use('/api/chatapp', friends);
app.use('/api/chatapp', message);
app.use('/api/chatapp',image);

server.listen(3000, () => {
  console.log("Running on Port 3000");
});
