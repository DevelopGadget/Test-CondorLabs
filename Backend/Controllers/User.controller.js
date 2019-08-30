const { User } = require('../Models/User.model');
const { CreateToken } = require('../Services/Auth.service');

exports._Get = (req, res) => {
    User.find().skip(parseInt(req.params.Skip)).limit(50).where('_id').ne(req.headers._id).then((user) => {
        return res.status(200).send(user);
    }).catch((err) => {
        return res.status(406).send(err);
    });
}

exports._GetId = (req, res) => {
    User.findById(req.headers._id).then(user => {
        return res.status(200).send(user);
    }).catch(err => {
        return res.status(406).send(err);
    });
}

exports._Post = (req, res) => {
    new User(req.body).save().then(user => {
        return res.status(200).send({
            User: user.toJSON(),
            Token: CreateToken(user.toJSON())
        });
    }).catch(err => {
        return res.status(406).send(err);
    });
}

exports._Put = (req, res) => {
    User.findByIdAndUpdate(req.headers._id, req.body, { new: true }).then(user => {
        return res.status(200).send(user);
    }).catch(err => {
        return res.status(406).send(err);
    });
}

exports._Delete = (req, res) => {
    User.findByIdAndDelete(req.headers._id).then(user => {
        return res.status(200).send(user);
    }).catch(err => {
        return res.status(406).send(err);
    });
}

exports._Login = (req, res) => {
    User.findOne().where('Username').equals(req.body.Username).where('Password').equals(req.body.Password).then(user => {
        return res.status(200).send({
            User: user.toJSON(),
            Token: CreateToken(user.toJSON())
        });
    }).catch(err => {
        return res.status(406).send(err);
    });
}