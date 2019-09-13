const { Group } = require('../Models/Groups.model');
const { ConversationGroup } = require('../Models/Conversation.model');
const { Storage, Cloudinaryv2 } = require('../Config/App.config');
const path = require('path');

exports._Get = async (req, res) => {
    Group.find().where('Members').in([req.headers._id])
        .populate({ path: 'Members', populate: { path: 'Members', select: '-Password' } }).then(groups => {
            return res.status(200).send(groups !== null ? groups : {});
        }).catch(err => {
            return res.status(406).send(err);
        });
}

exports._Post = async (req, res) => {
    new Group(req.body).save().then(group => {
        if (group !== null) {
            new ConversationGroup({ Group: group._id }).save().then(con => {
                con.populate('Group', (err, doc) => {
                    if (err) return res.status(400).send(err !== null ? err : {});
                    return res.status(200).send(doc !== null ? doc : {});
                });
            });
        }
    }).catch(err => {
        return res.status(406).send(err);
    });
}

exports._Put = async (req, res) => {
    Group.findByIdAndUpdate(req.params.Id, { '$push': { 'Members': { '$each': req.body.Members } } }, { new: true }).then(message => {
        return res.status(200).send(message !== null ? message : {});
    }).catch(err => {
        return res.status(406).send(err);
    });
}

exports._Delete = async (req, res) => {
    Group.findByIdAndDelete(req.params.Id).then(group => {
        ConversationGroup.deleteOne({ 'Group': group._id }).then(res => { }).catch(err => { });
        return res.status(200).send(group !== null ? group : {});
    }).catch(err => {
        return res.status(406).send(err);
    });
}

exports._DeleteMember = async (req, res) => {
    Group.findByIdAndUpdate(req.params.Id, { '$pull': { 'Members': req.body.Member } }).then(message => {
        return res.status(200).send(message !== null ? message : {});
    }).catch(err => {
        return res.status(406).send(err);
    });
}

exports._UploadImage = async (req, res) => {
    Storage(req.params.Id)(req, res, err => {
        if (err) return res.status(406).send(err);
        else {
            Cloudinaryv2.uploader.upload(req.file.path, { public_id: path.parse(req.file.filename).name }, function (err, image) {
                if (err) return res.status(406).send(err);
                require('fs').unlinkSync(req.file.path);
                Group.findByIdAndUpdate(req.params.Id, { 'UrlImage': image.secure_url }, { new: true })
                    .where('Members').in([req.headers._id])
                    .populate({ path: 'Members', populate: { path: 'Members', select: '-Password' } })
                    .then(user => {
                        return res.status(200).send(user !== null ? user : {});
                    }).catch(err => {
                        return res.status(406).send(err);
                    });
            });
        }
    });
}