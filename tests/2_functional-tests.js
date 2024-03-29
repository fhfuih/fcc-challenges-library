/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test POST /api/books with title' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'Test POST /api/books with title');
            assert.equal(res.body.commentcount, 0);
            assert.property(res.body, '_id', 'Book should contain _id');
            done();
          })
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.title, '');
            assert.equal(res.body.commentcount, 0);
            assert.property(res.body, '_id', 'Book should contain _id');
            done();
          })
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
       chai.request(server)
        .get('/api/books')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          done();
        })
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
       chai.request(server)
        .get('/api/books/000000000000000000000000')
        .end(function(err, res){
          assert.equal(res.status, 404);
          assert.equal(res.text, 'no book exists');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  async function(){
        const requester = chai.request(server).keepOpen();
        const { body: [{ _id }] } = await requester.get('/api/books');
        const res = await requester.get(`/api/books/${_id}`);
        assert.equal(res.status, 200);
        assert.equal(res.body._id, _id);
        assert.property(res.body, 'title');
        assert.isArray(res.body.comments);
        requester.close();
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', async function(){
        const requester = chai.request(server).keepOpen();
        const { body: [{ _id }] } = await requester.get('/api/books');
        const res = await requester.post(`/api/books/${_id}`).send({ comment: 'Test POST /api/books/[id] with comment' });
        assert.equal(res.status, 200);
        assert.equal(res.body._id, _id);
        assert.property(res.body, 'title');
        assert.equal(res.body.comments[res.body.comments.length-1], 'Test POST /api/books/[id] with comment');
        requester.close();
      });
      
    });

  });

});
