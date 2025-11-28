const express = require(`express`)
const app = express()
const fs = require(`fs`);
const hbs = require(`hbs`);
app.set('view engine', 'hbs');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))
app.get('/favicon.ico', (req, res) => res.status(204));
hbs.registerPartials(__dirname + '/views/partials', function (err) {});

// read file from highscores.json
const readFile = (path)=>{
  return new Promise(
    (resolve, reject)=>
    {
      fs.readFile(path, `utf8`, (err, data) => {
        if (err) {
         reject(err)
        }
        else
        {
          resolve(data)
        }
      });
    })
}
// write file to highscores.json
const writeFile = (path, data)=> {
  return new Promise(
    (resolve, reject)=>
    {
      fs.writeFile(path, data, (err) => {
        if (err) {
          reject(err);
        }
        else
        {
          resolve();
        }
      });
    })
  }

app.get(`/`, (req, res)=>{
  const filePath = path.join(__dirname, `public`, `index.html`)
  res.sendFile(filePath);
})

app.get('/highscores', async (req, res) => {
  var data = await readFile(`./data/highscores.json`);
  res.send(JSON.parse(data));
  });

app.post('/highscores', async (req, res) => { 
    var oldData =  await readFile(`./data/highscores.json`, 'utf8');
    var existingScores = JSON.parse(oldData);
    var newScore =  req.body;
    var newData = existingScores;

    // sort the scores and keep only the top 5
    existingScores.push(newScore);
    existingScores.sort((a, b) => b.score - a.score);
    if(existingScores.length > 5){
      newData = existingScores.slice(0, 5);
  }
    newScore.push(req.body)
    const jsonString = JSON.stringify(newData);
    await fs.writeFile('./data/highscores.json', jsonString, err => {
      if (err) {
          console.log('Error writing file', err)
      } else {
          console.log('Successfully wrote file')
      }
    });
    res.send(jsonString);
});

//Start up the server on port 3000.
var port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log("Server Running at Localhost:3000")
})

//[{"name":0,"score":0}]'