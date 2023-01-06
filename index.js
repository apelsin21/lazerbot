const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const https = require("https");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const baseurl = "https://ddnet.org/players/?json2=";
const PREFIX = "#!";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildTimeFromDec(dec) {
	// convert from unix time to string (multiply by 1000 because js has in ms not s)
	return new Date(dec*1000).toLocaleString();
}

var usernames = ['Elysian', 'TheFlexbert', 'pegecko', 'Happy GrandPa', 'levi'];
function get_current_time(username) {
    if(username==null) {
        return;
    }

    var url = baseurl+EncodeURIComponent(username);

    console.log('Fetching current time for: ' + username + ": " + url);

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


                if(json.types && json.types.Novice && json.types.Novice.maps && json.types.Novice.maps.Multeasymap) {
                    resolve({
                        username: username,
                        time: json.types.Novice.maps.Multeasymap.time
                    });
                } else {
                    resolve({
                        username: username,
                        time: -9999
                    });
                }
            });
        }).on('error', function(e){
              console.log("Got an error: ", e);
                reject(e);
        });
    });
}

function get_current_times(usernames) {
    return usernames.map(async (a) => {
        await sleep(1000);
        return get_current_time(a);
    });
}

async function mainloop() {

    const channel = client.channels.cache.get('917836911748448319');

    channel.send("I keep track of scores for " + usernames);

    var earlier_times = [];

    while(true) {
        await sleep(10000);

        Promise.all(get_current_times(usernames)).then(current_times => {
            current_times.forEach(a => {
                var earlier_index = earlier_times.findIndex(e => e.username == a.username);

                if(earlier_index > -1 && a.time < earlier_times[earlier_index].time) {
                    var displayTime = buildTimeFromDec(a.time);
                    var oldDisplayTime = buildTimeFromDec(earlier_times[earlier_index].time);
                    channel.send(a.username + "'s got a new record, " + displayTime + "!!!!\n It is " + (earlier_times[earlier_index].time - a.time) + "s faster than earlier: " + oldDisplayTime);
                }
            });

            earlier_times = current_times;
        }).catch(e => {
            console.log('Error fetching time for user: ' + e);
        });
    }
}

client.once(Events.ClientReady, async (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    await mainloop();
});
client.on("message", (msg) => {
	if(msg.content.startsWith(PREFIX) {
		let str = msg.content.substring(PREFIX.length);
		msg.reply(get_current_time(str.split(" ")[0])
	}
})

client.login(token);

