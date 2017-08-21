var config = require("../config/config.json");
var db_pool = {};
var db_conn = {};
//var poolCluster = null;

var initConn = function(db_name)
{
  console.log("initConn:"+db_name);
  if(db_name === undefined) db_name = "COMMON";

  if(db_conn[db_name] === undefined)
  {
    console.log("Db시작 : "+db_name);

    db_name_json = config.MYSQL_CONNECT[db_name];

    if(db_name_json === undefined)
    {
      return "존재하지 않는 DB입니다.";
    }

    db_conn[db_name] = require("mysql2/promise").createConnection(db_name_json);
    //db_conn[db_name].connect();
  }

  return db_conn[db_name];
};

var getConn = function(db_name)
{
  var conn = initConn(db_name);

  return conn;
};

var initPool = function(db_name)
{
  console.log("initPool:"+db_name);
  if(db_name === undefined) db_name = "COMMON";

  /*
  if(db_pool[db_name] === undefined)
  {
    console.log("db시작"+db_name);
    //db_name_json = eval("config.MYSQL_CONNECT." + db_name);
    db_name_json = config.MYSQL_CONNECT[db_name];

    if(db_name_json === undefined)
    {
      return "존재하지 않는 DB입니다.";
    }

    db_pool[db_name] = require("mysql2/promise").createPool(db_name_json);
  }
  */
  db_name_json = config.MYSQL_CONNECT[db_name];
  db_pool[db_name] = require("mysql2/promise").createPool(db_name_json);

  return db_pool[db_name];
};

var getPool = function(db_name)
{
  /*
  var pool = init(db_name);

    if(pool === undefined)
    {
      error("존재하지 않는 DB입니다.");
    }
    else
    {
    */
    //  console.log(pool);

        var pool = initPool(db_name);
        //console.log(pool);
        return pool.getConnection();
        //.then(function(conn){
      //    return conn;
        //})
        /*
        .then(function(conn)
        {
          console.log("pool:"+db_name);
          //console.log(conn);
          //return conn;
          return new Promise(function(resolve,reject){
            resolve(conn);
          });
        })
        */
        /*
        .catch(function(err)
        {
          console.log(err);
        });*/
    //}
};

var release = function(pool)
{
  if(pool !== undefined || pool !== null)
  {
    try {
        pool.release();
    } catch (e) {
      //console.log(e);
        pool.end();
    }
  }
};

var beginTransaction = function(conn)
{
  return new Promise(function(resolve,reject)
  {
    conn.query("begin")
    .then(function(ret)
    {
      console.log("beginTransaction");
      console.log(ret);
      resolve(ret);
    })
    .catch(function(err)
    {
      console.log(err);
      reject(err);
    });
  });

};

var commit = function(conn)
{
  console.log("Commit");

  return new Promise(function(resolve,reject)
  {
    conn.query("commit")
    .then(function(ret)
    {
      resolve(ret);
    })
    .catch(function(err)
    {
      reject(err);
    });
  });

};

var rollback = function(conn)
{
  console.log("RollBack");
  return new Promise(function(resolve,reject)
  {
    conn.query("rollback")
    .then(function(ret)
    {
      resolve(ret);
    })
    .catch(function(err)
    {
      reject(err);
    });
  });
};

module.exports.initConn = initPool;
module.exports.initPool = initConn;
module.exports.getConn = getConn;
module.exports.getPool = getPool;
module.exports.release = release;
module.exports.beginTransaction = beginTransaction;
module.exports.commit = commit;
module.exports.rollback = rollback;
