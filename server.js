const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const url = "mongodb+srv://demo:demo@cluster0-q2ojb.mongodb.net/test?retryWrites=true";
const dbName = "demo";


MongoClient.connect(url, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db(dbName);
    const messageCollection = db.collection('messages')

    console.log("Connected to `" + dbName + "`!");

    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
    app.use(express.static('public'))
    
    app.get('/', (req, res) => {
     messageCollection.find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('index.ejs', {messages: result})
      })
    })
    
    app.post('/messages', (req, res) => {
     messageCollection.insertOne({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/')
      })
    })
    
    app.put('/messages', (req, res) => {
     messageCollection.findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp: req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })
    
    app.put('/downVote', (req, res) => {
     messageCollection.findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp: req.body.thumbUp - 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })
    
    app.delete('/messages', (req, res) => {
     messageCollection.findOneAndDelete(
       {  name: req.body.name, 
          msg: req.body.msg })

       .then(result => {
         if(result.deletedCount === 0){
           return res.json('No messages to delete')
         }
         res.send('Message deleted!')
       })
       .catch(error => console.error(error))
      
    })

    app.listen(3000,() => {
      console.log('listening on 3000');
    })
})
.catch(error => console.error(error))
