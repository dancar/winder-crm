const { onlySuperuser } = require('./helpers')
module.exports = function (app, passport) {
    const { User, Ticket, TicketUpdate  } = require('../models')

    app.post('/ticket', (req, res) => {
        let userId = req.user && req.user.id

        Ticket.create({
            details: req.body,
            status: 'open',
            userId
        })
            .then( (ticket) => {
                const { id, accessToken } = ticket
                res.status(200).send({id, accessToken})
            })

            .catch( (error) => {
                console.error(error)
                throw error
            })
    })

    app.post('/update_ticket', onlySuperuser, (req, res) => {
        const {ticketId, text} = req.body
        const userId = req.user.id
        Ticket.findById(ticketId).then( (ticket) => {
            return TicketUpdate.create({
                ticketId,
                text,
                userId
            })
        })
            .then( () => {
                res.status(200).send()
            })
            .catch( (error) => {
                res.status(400).send()
            })
    })

    app.get('/tickets/:id', function (req, res) {
        Ticket.findOne({
            where: {
                id: req.params.id
            },
            include: [{all: true, nested: true}],
            order: [[TicketUpdate, 'createdAt', 'DESC']]
        })
            .then( (ticket) => {
                const accessToken = req.query.accessToken
                const isSuperuser = req.user && req.user.isSuperuser

                if (ticket.accessToken === accessToken || isSuperuser) {
                    res.status(200).send(ticket)
                }
                else {
                    res.status(401).send()
                }
            })
            .catch ( (error) => {
                console.error(error)
                res.sendStatus(400)
            })
    })

    app.post('/tickets/:id', onlySuperuser, function (req, res) {
        const ticketId = req.params.id
        const { status } = req.body

        Ticket.findById(ticketId)
            .then( (ticket) => {
                if (ticket.status !== status) {
                    ticket.status = status
                    return ticket.save()
                        .then( () => {
                            return TicketUpdate.create({
                                ticketId,
                                userId: req.user.id,
                                status
                            })
                        })
                }
            })

            .then( () => {
                res.status(200).send()
            })

            .catch ( (error) => {
                console.error(error)
                res.sendStatus(400)
            })
    })

    app.get('/tickets', onlySuperuser, (req, res) => {
        Ticket.findAll({include: [TicketUpdate, User]})
            .then(function (tickets) {
                res.status(200).send(tickets.map( ticket => ticket.toJSON()))
            })

            .catch( (error) => {
                console.error(error)
                throw error
            })
    })
}
