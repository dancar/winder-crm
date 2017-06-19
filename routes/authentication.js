module.exports = function (app, passport) {
    const { User }= require('../models')
    app.get('/user', (req, res) => {
        if (!req.user) {
            return res.status(400).send()
        }
        const {email, firstName, lastName, isSuperuser} = req.user
        return res.status(200).send({email,firstName, lastName, isSuperuser})
    })

    app.post('/login', passport.authenticate('local'), function (req, res) {
        if (!req.user) {
            return res.status(400)
        }
        const { firstName, lastName, email, isSuperuser} = req.user;
        return res.status(200).send({user: {firstName, lastName, email, isSuperuser}})
    });

    app.post('/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    })

    app.post('/signup', (req, res) => {
        let {email, firstName, lastName, password} = req.body
        return User.create({email: email.toLowerCase(), firstName, lastName, password})
            .then( (newUser) => {
                req.login(newUser, function (error) {
                    if (error) {
                        res.status(400).send()
                    }
                    res.status(200).send({
                        user: {email, firstName, lastName}
                    })
                })
            }).catch( (e) => {
                console.log(e)
                res.status(400).send(e.errors);
            })
    })
}
