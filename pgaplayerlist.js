const puppeteer = require('puppeteer');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

//let golfUrl = 'https://www.pgatour.com/stats/stat.331.html/';
let golfUrl = 'https://www.pgatour.com/stats/stat.127.html';
(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 926 });
    await page.goto(golfUrl);

    // get hotel details
    let golfData = await page.evaluate(() => {
        let golf = [];
        // get the golf elements
        let golfElms = document.getElementById("statsTable").querySelectorAll('tr');
        // let golfElms = document.getElementById('statsTable').getElementsByTagName('tr')
        // let golfElms = document.getElementById("statsTable");
        // get the golf data
        

        golfElms.forEach((golfelement) => {
            let golfJson = {};
            try {
                // golfJson.RankThisWeek = golfelement.querySelector('td').innerText;
                // golfJson.RankLastWeek = golfelement.querySelector('td').innerText;
                // golfJson.rounds = golfelement.querySelector('td').innerText;
                golfJson.name = golfelement.querySelector('td.player-name').innerText;
                //console.log(golfelement.querySelector('td').innerText);
                // sleep(2000);
                // golfJson.rounds = golfelement.querySelector('td.hidden-small').innerText;
                // golfJson.avgDistance = golfelement.querySelector('td.hidden-small').innerText;
                // golfJson.BirdOrBetterPerc = golfelement.querySelector('td.column-4').innerText;
                // golfJson.Par4ScoreAvg = golfelement.querySelector('td.column-5').innerText;
                // golfJson.Total = golfelement.querySelector('td.column-6').innerText;
            
            }
            catch (exception){

            }
        
            golf.push(golfJson);
         });
        return golf;
    });

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("golf");
        dbo.collection("golfdata").insertMany(golfData, function(err, res) {
          if (err) throw err;
          console.log("Number of documents inserted: " + res.insertedCount);
          db.close();
        });
    });
    // console.log(golfData);
    await browser.close();
})();

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }