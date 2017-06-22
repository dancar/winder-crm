const chai = require('chai')
const expect = chai.expect
chai.should()
chai.use(require('chai-http'))

const app = require('../../server')
const { User, Ticket, TicketUpdate } = require('../../models')

let goodGuyGreg, scrappy
const gggPassword = 'conference'

const makeGregAndScrappy = function () {
    return User.sync({force: true})
        .then(function () {
            return User.create({
                firstName: 'greg',
                lastName:  'goodguy',
                password:  gggPassword,
                isSuperuser: true,
                email:     'goodguygreg@deer.com'
            })
        })
        .then(function (ggg) {
            goodGuyGreg = ggg
        })
        .then(function () {
            return User.create({
                firstName: 'scrappy',
                lastName:  'coco',
                password:  gggPassword,
                isSuperuser: false,
                email:     'scrapptcoco@deer.com'
            })
        })
        .then(function (coco) {
            scrappy = coco
        })
}

const clearTickets = function () {
    return Promise.all([
        Ticket.sync({force: true}),
        TicketUpdate.sync({force: true})
    ])
}

describe('GET /tickets', function () {
    beforeEach(makeGregAndScrappy)
    beforeEach(clearTickets)
    it.only('should list all available tickets', function () {

        const agent = chai.request.agent(app)

        // Create tickets:
        const userId = scrappy.id
        const tickets = [
             ['ticket1 subject', 'ticket1 text'],
             ['ticket2 subject', 'ticket2 text'],
             ['ticket3 subject', 'ticket3 text'],
        ]
        return Promise.all(tickets.map( ([subject, text]) => { return Ticket.create({userId, subject}) }))

        // Receive them:
            .then(function () {
                return agent.post('/login').send({email: goodGuyGreg.email, password: gggPassword})
            })
            .then(function () {
                return agent.get('/tickets').send()
            })
            .then(function (response) {
                expect(response.status).to.equal(200)
                expect(response.body).to.be.a('array')
                expect(response.body).to.have.lengthOf(3)
            })
    })

    it('should list all available tickets for specific user', function () {
        const agent = chai.request.agent(app)

        // Create tickets:

        const tickets = [
            ['ticket1 subject', goodGuyGreg.id],
            ['ticket2 subject', goodGuyGreg.id],
            ['ticket3 subject', scrappy.id],
        ]
        return Promise.all(tickets.map( ([subject, userId]) => { return Ticket.create({userId, subject}) }))

        // Receive them:
            .then(function () {
                return agent.post('/login').send({email: scrappy.email, password: gggPassword})
            })
            .then(function () {
                return agent.get('/tickets').send()
            })
            .then(function (response) {
                expect(response.status).to.equal(200)
                expect(response.body).to.be.a('array')
                expect(response.body).to.have.lengthOf(1)
            })
    })

})

describe('POST /ticket', function () {
    beforeEach(makeGregAndScrappy)
    beforeEach(clearTickets)

    it('should allow creating a ticket for logged-in user', function () {
        const agent = chai.request.agent(app)

        //login:
        const creds = {
                email: goodGuyGreg.email,
                password: gggPassword
        }
        return agent.post('/login').send(creds)

        // Create ticket:
            .then(function (response) {
                expect(response.status).to.equal(200)
                return agent.post('/ticket')
                    .send({
                        content: 'I have problem',
                        room: '101'
                    })
            })

        // Check response
            .then(function (response) {
                response.status.should.equal(200)
                return Ticket.all()
            })

        // Check Database:
            .then(function (allTickets) {
                allTickets.should.have.lengthOf(1)
                const ticket = allTickets[0]
                expect(ticket).to.include({userId: goodGuyGreg.id})
                expect(ticket).to.have.property('details')
                expect(ticket.details).to.include({
                    content: 'I have problem',
                    room: '101'
                })
                // TODO check the ticket's TicketUpdate array somehow
            })
            .catch( (e) => {console.error(e); throw e})
    })

    it('/ticket:id should not work without login', function (done) {
        const agent = chai.request.agent(app)
        let ticketId
        Ticket.create({
            userId: goodGuyGreg.id,
            subject: 'problem with toaster'
        })
            .then(function (ticket) {
                ticketId = ticket.id
                TicketUpdate.create({
                    ticketId,
                    text: 'does no say lechayim'
                })

                    .then(function () {
                        agent.get(`/tickets/${ticketId}`)
                            .send()
                            .end(function (error, response) {
                                expect(response.status).to.equal(401)
                                done()

                            })
                    })
            })
    })

    it('/tickets/:id should return ticket information', function (done) {
        const agent = chai.request.agent(app)

        let ticketId
        Ticket.create({
            userId: goodGuyGreg.id,
            details: {
                name: 'john',
                content: 'problem with toaster'
            }
        })

            .then(function (ticket) {
                ticketId = ticket.id
                TicketUpdate.create({
                    ticketId,
                    text: 'does no say lechayim'
                })
            })

            .then(function() {
                agent.post('/login').send({
                    email: goodGuyGreg.email,
                    password: gggPassword
                })
                    .end(function (error, response) {
                        response.status.should.equal(200)
                        agent.get(`/tickets/${ticketId}`)
                            .send()
                            .end(function (error, response) {
                                expect(response.status).to.equal(200)
                                const ticket = response.body
                                expect(ticket).to.include({
                                    userId: goodGuyGreg.id
                                })
                                expect(ticket).to.have.property('details')
                                expect(ticket.details).to.include({
                                    name: 'john',
                                    content: 'problem with toaster'
                                })
                                expect(ticket).to.have.property('ticket_updates')
                                expect(ticket.ticket_updates).to.have.lengthOf(1)
                                expect(ticket.ticket_updates[0]).to.have.property('text', 'does no say lechayim')
                                expect(ticket).to.have.property('user')
                                done()
                            })
                    })
            })

            .catch( (e) => {console.error(e); throw e})
    })
})
