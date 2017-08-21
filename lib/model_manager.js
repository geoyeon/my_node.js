var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var path = require("path");

var model = {};

var loadModel = function(model_name)
{
  return new Promise(function(resolve,reject)
  {
    if(!model[model_name])
    {
      console.log("Load Model :" + model_name);

      var file_path = path.resolve("./model/"+model_name+".json");

      return fs.readFileAsync(file_path)
      .then(JSON.parse)
      .then(function(model_data)
      {
          model[model_name] = model_data;
          console.log("fs");
          resolve(model[model_name]);
      })
      .catch(function(err)
      {
        console.log(err);
        reject(Error(err));
      });
    }
    else
    {
      console.log("Already Load Model :" + model_name);
      resolve(model[model_name]);
    }
  });
};

var getModel = function(model_name,sub_model,sub_model2,sub_model3)
{
  return new Promise(function(resolve,reject)
  {
    var ret = {};

    if(!model[model_name])
    {
      return loadModel(model_name)
      .then(function(data){
        console.log(data);

        if(sub_model3 !== undefined)
        {
          ret = data[sub_model][sub_model2][sub_model3];
        }
        else if(sub_model2 !== undefined)
        {
          ret = data[sub_model][sub_model2];
        }
        else if(sub_model !== undefined)
        {
          ret = data[sub_model];
        }
        else {
          ret = data;
        }

        if(!ret) ret = {};

        resolve(ret);
      })
      .catch(function(err){
        reject(Error(err));
      });
    }
    else {
      if(sub_model3 !== undefined)
      {
        ret = model[model_name][sub_model][sub_model2][sub_model3];
      }
      else if(sub_model2 !== undefined)
      {
        ret = model[model_name][sub_model][sub_model2];
      }
      else if(sub_model !== undefined)
      {
        ret = model[model_name][sub_model];
      }
      else {
        ret = model[model_name];
      }

      if(!ret) ret = {};

      resolve(ret);
    }
  });
};

module.exports.loadModel = loadModel;
module.exports.getModel = getModel;
