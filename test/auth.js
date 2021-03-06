/* eslint handle-callback-err: "off"*/
process.env.NODE_ENV = 'test'

const User = require('../app/models/user')
const faker = require('faker')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
// eslint-disable-next-line no-unused-vars
const should = chai.should()
const loginDetails = {
  email: 'admin@admin.com',
  password: '12345'
}
const createdID = []
let verification = ''
let verificationFogot = ''
const email = faker.internet.email()

chai.use(chaiHttp)

describe('*********** AUTH ***********', () => {
  describe('/GET /', () => {
    it('it should GET home API url', done => {
      chai
        .request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    })
  })

  describe('/GET /404url', () => {
    it('it should GET 404 url', done => {
      chai
        .request(server)
        .get('/404url')
        .end((err, res) => {
          res.should.have.status(404)
          done()
        })
    })
  })

  describe('/POST login', () => {
    it('it should GET token', done => {
      chai
        .request(server)
        .post('/login')
        .send(loginDetails)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.include.keys('token')
          done()
        })
    })
  })

  describe('/POST register', () => {
    it('it should POST register', done => {
      const user = {
        name: faker.random.words(),
        email,
        password: faker.random.words()
      }
      chai
        .request(server)
        .post('/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.include.keys('token', 'user')
          createdID.push(res.body.user._id)
          verification = res.body.user.verification
          done()
        })
    })
    it('it should NOT POST a register if email already exists', done => {
      const user = {
        name: faker.random.words(),
        email,
        password: faker.random.words()
      }
      chai
        .request(server)
        .post('/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
  })

  describe('/POST verify', () => {
    it('it should POST verify', done => {
      chai
        .request(server)
        .post('/verify')
        .send({
          id: verification
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.include.keys('email', 'verified')
          res.body.verified.should.equal(true)
          done()
        })
    })
  })

  describe('/POST forgotPassword', () => {
    it('it shoud POST forgotPassword', done => {
      chai
        .request(server)
        .post('/forgot')
        .send({
          email
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.include.keys('msg', 'verification')
          verificationFogot = res.body.verification
          done()
        })
    })
  })

  describe('POST resetPassword', () => {
    it('it should POST resetPassword', done => {
      chai
        .request(server)
        .post('/reset')
        .send({
          id: verificationFogot,
          password: '12345'
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.include.keys('msg')
          res.body.msg.should.equal('PASSWORD_CHANGED')
          done()
        })
    })
  })

})
after(() => {
  createdID.forEach(id => {
    User.findByIdAndRemove(id, err => {
      if (err) {
        console.log(err)
      }
    })
  })
})
