var config = require("./config/config.json");
var session = require("express-session");
var sharedsession = require("express-socket.io-session");
var express = require("express");
var app = express();
var Cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var http = require("http").Server(app);
var io = require("socket.io")(http,{'pingInterval':20000,'pingTimeout':50000});
var bodyParser = require("body-parser");
var Promise = require("bluebird");
var msgpack = require("msgpack-lite");
var date = require("date-and-time");

var modelManager = require("./lib/model_manager");
modelManager.loadModel("Unit");
modelManager.loadModel("Skill");
modelManager.loadModel("Stage");
modelManager.loadModel("UserLevel");
modelManager.loadModel("AreaPoint");
modelManager.loadModel("Item");
modelManager.loadModel("Equipment");
modelManager.loadModel("Reward");
modelManager.loadModel("Gacha");

//레디스
var Redis = Promise.promisifyAll(require("ioredis"));
var redis = new Redis.Cluster(config.REDIS_CLUSTER_CONNECT);
//var redis = Redis(config.REDIS_CONNECT);

var redisStore = require("connect-redis")(session);
//console.log(redis);

app.set("views",__dirname + "/views");
app.set("view engine","ejs");
app.engine("html",require("ejs").renderFile);

var ss = session({
	secret:"test",
	store:new redisStore({
		host:config.REDIS_CLUSTER_CONNECT[0].host,
		port:config.REDIS_CLUSTER_CONNECT[0].port,
		client:redis,
		prefix:"session:",
		db:config.REDIS_CLUSTER_CONNECT[0].db
	}),
	saveUninitialized:true,
	resave:true
});

app.use(ss);
io.use(sharedsession(ss));

app.use(bodyParser.raw({type:'application/j-msgpack'}));
app.use(bodyParser.raw({type:'application/o-msgpack'}));
app.use(bodyParser.json({type:'application/json'}));
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/static",express.static(__dirname + "/public"));
app.use("/admin",express.static(__dirname + "/admin"));

app.use(function(req,res,next){
	//console.log(req.body);
	//var aa = msgpack.encode(req.body);
	//console.log(aa);
	//console.log(msgpack.decode(req.body));

	//console.log(msgpack.decode(req.body));

	var cont_type = req.get("Content-Type");
	var json_obj = null;

	console.log(cont_type);

	if(cont_type == "application/j-msgpack")
	{
		json_obj = JSON.parse(msgpack.decode(req.body));
		req.body = json_obj;
	}
	else if(cont_type == "application/o-msgpack")
	{
		console.log(req.body.length);
		console.log(req.body);
		json_obj = msgpack.decode(req.body);
		console.log(json_obj);
		req.body = json_obj;
	}
	else if(cont_type == "application/json")
	{
		console.log(req.body);
		//json_obj = JSON.parse(req.body);
		//req.body = json_obj;
	}
	else
	{
	}

	/*
	if(typeof req.body === "string")
	{
		//var json_obj = JSON.parse(msgpack.decode(req.body));
		var json_obj = JSON.parse(req.body);
		console.log(json_obj);
		req.body = json_obj;
	}
	else {
		console.log(req.body);
		var json_obj = JSON.parse(msgpack.decode(req.body));
		req.body = json_obj;
		//req.body = {user_id:"test",user_pass:"1234"};
	}
	*/
	next();
});

var socket = require("./router/socket")(io);
var action = require("./router/action")(app);

app.use(errorHandler);

app.use(function(req, res, next) {
  //res.status(404).send(msgpack.encode({"retv":false,"errMsg":"NO_EXISTS_API"}));
	errorHandler(Error("NO_EXISTS_API"),req,res,next);
});

if(Cluster.isMaster)
{
	var workers = {};


  for (var i=0; i < numCPUs; i++)
    spawn();

  Cluster.on('exit', function(worker) {
    console.log('worker ' + worker.process.pid + ' exited');
    delete workers[worker.id];
    spawn();
  });
}
else
{
	process.on('message', function(msg) {
    if (msg.cmd) {
      if (msg.cmd == 'test') {
        console.log("################### test IPC Call");
        console.log('Worker ' + Cluster.worker.id + ' running!');
      }
    }
  });

	http.listen("3000",function(){
		console.log("server on!");
	});
}


function errorHandler(err, req, res, next) {
	console.log("make error");
	console.log(err.stack);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
	console.log(err);

	var cont_type = req.get("Content-Type");
	var json_obj = {"retv":false,"errMsg":err.message,"time":date.format(new Date(),"YYYY-MM-DD HH:mm:ss")};

	console.log(cont_type);

	if(cont_type == "application/j-msgpack" || cont_type == "application/o-msgpack")
	{
		//json_obj = JSON.parse(msgpack.decode(req.body));
		res.send(msgpack.encode(json_obj));
	}
	else if(cont_type == "application/json")
	{
		res.json(json_obj);
		//json_obj = JSON.parse(req.body);
		//req.body = json_obj;
	}
	else
	{
		res.send(err.message);
	}

}

function spawn() {
	worker = Cluster.fork();
	workers[worker.id] = worker;
	console.log(worker.process.pid + ' is Online');

	worker.on('message', messageHandler);
}

function messageHandler(msg) {
	if (msg.cmd && msg.cmd == 'test') {
		for (var worker in workers) {
			workers[worker].process.send({
				cmd : 'test'
			});
		}
	}
}
