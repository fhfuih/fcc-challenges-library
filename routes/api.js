/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app, cb = () => {}) {
  
  MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) {
    if (err) {
      console.warn(err);
    }
    const collection = client.db('infoSec').collection('books');
    console.log('Connected to database');
    
    app.route('/api/books')
      .get(async function (req, res){
        //response will be array of book objects
        //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        try {
          const data = await collection
            .aggregate([
              {
                $addFields: {
                  commentcount: {
                    $size: "$comments"
                  },
                }
              },
              {
                $project: {
                  comments: 0,
                }
              }
            ])
            .toArray();
          res.json(data);
        } catch (error) {
          console.warn(error);
          res.status(500).json({error});
        }
      })

      .post(async function (req, res){
        var title = req.body.title;
        //response will contain new book object including atleast _id and title
        title = title || "";
        try {
          const { insertedId } = await collection.insertOne({ title, comments: [] });
          res.json({
            _id: insertedId.toString(),
            title,
            commentcount: 0,
          })
        } catch (error) {
          console.warn(error);
          res.status(500).json({error});
        }
      })

      .delete(async function(req, res){
        //if successful response will be 'complete delete successful'
        try {
          await collection.deleteMany({});
          res.send('complete delete successful');
        } catch (error) {
          console.warn(error);
          res.status(500).json({error});
        }
      });



    app.route('/api/books/:id')
      .get(async function (req, res){
        var bookid = req.params.id;
        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
        var _id;
      
        try {
          _id = new ObjectId(bookid);
        } catch (error) {
          return res.status(400).json({error});
        }
      
        try {
          const doc = await collection.findOne({ _id });
          if (!doc) {
            return res.status(404).send('no book exists');
          }
          res.json(doc);
        } catch (error) {
          console.warn(error);
          res.status(500).json({error});
        }
      })

      .post(async function(req, res){
        var bookid = req.params.id;
        var comment = req.body.comment;
        //json res format same as .get
        var _id;
      
        try {
          _id = new ObjectId(bookid);
        } catch (error) {
          return res.status(400).json({error});
        }
      
        try {
          const { matchedCount } = await collection.updateOne(
            { _id },
            { $push: { comments: comment } }
          );
          
          if (!matchedCount) {
            return res.status(404).send('no book exists');
          }
          
          const doc = await collection.findOne({ _id });
          res.json(doc);
        } catch (error) {
          console.log(error);
          res.status(500).json({error});
        }
      })

      .delete(async function(req, res){
        var bookid = req.params.id;
        //if successful response will be 'delete successful'
        var _id;
      
        try {
          _id = new ObjectId(bookid);
        } catch (error) {
          return res.status(400).json({error});
        }
      
        try {
          const { result: { n } } = await collection.deleteOne({ _id });
          if (!n) {
            return res.status(404).send('no book exists');
          }
          res.send('delete successful');
        } catch (error) {
          console.log(error);
          res.status(500).json({error});
        }
      });
    
    cb();
  });
};
