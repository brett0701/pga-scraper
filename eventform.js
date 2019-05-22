const puppeteer = require('puppeteer');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


let golfUrl = 'https://pgagolfbets.com/event-form/';
(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 926 });
    await page.goto(golfUrl);
    
    // get hotel details
    let golfData = await page.evaluate(() => {
        let golf = [];
        
        let i = 1;
        // get the golf elements
        let golfElms = document.querySelectorAll('tr');
        // get the golf data
        tournament = document.querySelector('h1.page_heading small').innerText;
        golfElms.forEach((golfelement) => {
            let golfJson = {};
            try {
                golfJson.rank = i;
                golfJson.name = golfelement.querySelector('td.column-2').innerText;
                //golfJson.tournament = document.querySelector('h1.page_heading').innerText;
                golfJson.tournament = document.querySelector('h2').innerText;
                // golfJson.SGApTG = golfelement.querySelector('td.column-3').innerText;
                // golfJson.BirdOrBetterPerc = golfelement.querySelector('td.column-4').innerText;
                // golfJson.Par4ScoreAvg = golfelement.querySelector('td.column-5').innerText;
                // golfJson.Total = golfelement.querySelector('td.column-6').innerText;
                i++;
            }
            catch (exception){

            }
            golf.push(golfJson);
            
        });
         return golf;
    });
    
    // console.log(golfData);
    await browser.close();
  
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("golf");
        var query = {};
        var tournament = {};
        var rank = {};
        var tournamentrank = {};
        var newvalue = {};
       
        for (var i = 0, l = golfData.length; i < l; i++) {
            var items = golfData[i];
            var keys = Object.keys(items);
            for (var j = 0, k = keys.length; j < k; j++) {
                //console.log(keys[j], items[keys[j]]);
                if (keys[j] == "name") {
                    query[keys[j]] = items[keys[j]];
                    // console.log(query);
                }
                if (keys[j] == "tournament") {
                    tournament[keys[j]] = items[keys[j]];
                    // console.log(tournament);
                }
                if (keys[j] == "rank") {
                    rank[keys[j]] = items[keys[j]];
                    // console.log(rank);
                }
                tournamentrank = Object.assign({}, tournament, rank);
                newvalue = { $push: { eventform: {$each: [ tournamentrank ]}}};
                // console.log(newvalue);
                }
                dbo.collection("golfdata").findOneAndUpdate(query, newvalue, function(err, res) {
                   if (err) throw err;
                });  
            }       
        db.close();

      }); 
    
})();
