var config = require("../config/config.json");
var Promise = require("bluebird");
var Redis = Promise.promisifyAll(require("ioredis"));

var getConnection = function()
{
    //var redis = Redis(config.REDIS_CONNECT);
    var redis = new Redis.Cluster(config.REDIS_CLUSTER_CONNECT);

    return redis;
};

module.exports.getConnection = getConnection;
