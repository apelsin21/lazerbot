const https = require("https");
const fs = require('fs');

const baseurl = "https://ddnet.org/players/?json2=";

module.exports = {
    contains_discord_name: (data, discord_name) => {
        return data.findIndex(u => u.discord_name == discord_name) != -1;
    },
    contains_ddnet_name: (data, ddnet_name) => {
        return data.findIndex(u => u.ddnet_name == ddnet_name) != -1;
    },
    ddnet_user_exists: (ddnet_name) => {
        return new Promise((resolve, reject) => {
            https.get(baseurl+ddnet_name, function(res){
                res.on('end', function(){
                    if(body == null) {
                        resolve(false);
                    }              
                    resolve(true);
                });
            }).on('error', function(e){
                resolve(false);
            });
        });
    },
    get_current_time: (ddnet_name) => {
        if(ddnet_name==null || ddnet_name.length < 1) {
            console.log("get_current_time for invalid " + ddnet_name);
            return;
        }

        var url = baseurl+ddnet_name;

        return new Promise((resolve, reject) => {
        https.get(url, function(res){
                var body = '';

                res.on('data', function(chunk){
                    body += chunk;
                });

                res.on('end', function(){
                    if(body == null) {
                        reject({});
                    }              

                    var json = JSON.parse(body);

                    var finishes_multeasy = [];

                    if(json.last_finishes) {
                        finishes_multeasy = json.last_finishes.filter(f => f.map === "Multeasymap");
                    }

                    var quickest_last_finish = null;

                    for(var finish of finishes_multeasy) {
                        if(quickest_last_finish == null || finish.time < quickest_last_finish) {
                            quickest_last_finish = finish.time;
                        }
                    }

                    if(json.types && json.types.Novice && json.types.Novice.maps && json.types.Novice.maps.Multeasymap) {
                        if(quickest_last_finish == null) {
                            resolve(json.types.Novice.maps.Multeasymap.time);
                        } else {
                            resolve(Math.min(quickest_last_finish, json.types.Novice.maps.Multeasymap.time));
                        }
                    } else {
                        resolve(-9999);
                    }
                });
            }).on('error', function(e){
                  console.log("Got an error: ", e);
                  reject(e);
            });
        });
    },
    buildTimeFromDec: (dec) => {
        var hours = Math.floor(dec / 60 / 60);
        var minutes = Math.floor((dec / 60)%60);
        var seconds = Math.floor(dec % 60);

        return String(hours).padStart(2, 0) + ":" + String(minutes).padStart(2, 0) + ":" + String(seconds).padStart(2, 0);
    },
    sleep: (ms) => {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    },
    removeUserFromData: (data, discord_name) => {
        return data.filter(a => a.discord_name != discord_name);
    },
    save: (data) => {
        console.log("Updating storage.");
        fs.writeFileSync('storage.json', JSON.stringify({user_data:data}));
    }
};
