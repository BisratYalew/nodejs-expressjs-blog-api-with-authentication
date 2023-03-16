process.env.MODE = 'prod';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('..');
const rbg = require('../libraries/rbg');
let should = chai.should();

var token;
var userId;

chai.use(chaiHttp);

//Our parent block
describe('User Authentication', () => {
    beforeEach((done) => { 
        //Before each test we empty the database
           done();                  
    });
 /*
  * Test the /GET route
  */
  describe('/POST Register New User', () => {
      it('it should register a new user', (done) => {
        chai.request(server)
            .post('/api/v1/auth/register')
            .set('content-type', 'application/json')
            .send({
                "firstname": "aaaaa",
                "lastname": "bbbbb",
                "email": rbg(4) + "@aa.com",
                "password": "12341234"
            })
            .end((err, res) => {
                  res.should.have.status(201);
                  token = res?.body?.token?.accessToken;
                  userId = res?.body?.new_user?._id;
                  console.log(res?.body?.token?.accessToken);
                //   res.body.should.be.a('array');
                //   res.body.length.should.be.eql(0);
              done();
            });
      });
  });

  describe('/POST Login User', () => {
    it('it should login a user', (done) => {
      chai.request(server)
          .delete('/api/v1/users/' + userId)
          .auth(token, { type: 'bearer' })
          .end((err, res) => {
              // res.should.have.status(201);
              //   res.body.should.be.a('array');
              //   res.body.length.should.be.eql(0);
            done();
          });
    });
  });

  describe('/PUT Update User', () => {
    it('it should update a user', (done) => {
      chai.request(server)
          .delete('/api/v1/users/' + userId)
          .auth(token, { type: 'bearer' })
          .end((err, res) => {
              // res.should.have.status(201);
              //   res.body.should.be.a('array');
              //   res.body.length.should.be.eql(0);
            done();
          });
    });
  });

  describe('/DELETE Remove User', () => {
    it('it should remove a user', (done) => {

      chai.request(server)
          .delete(`/api/v1/users/${userId}`)
          .set({ "Authorization": `Bearer ${token}` })
          .end((err, res) => {
              res.should.have.status(404);
              //   res.body.should.be.a('array');
              //   res.body.length.should.be.eql(0);
            done();
          });
    });
  });

});