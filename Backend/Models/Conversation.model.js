const Moongoose = require('mongoose');
const schema = Moongoose.Schema;

const Messages = new schema({
    IndexUser: { type: Number, required: true },
    Message: { type: String, required: true },
    CreateAt: { type: Date, default: Date.now }
});

//Schema conversation 
const ConversationSchema = new schema({
    Messages: { type: [Messages], default: [] },
    Members: { type: [{ type: schema.Types.ObjectId, ref: 'User', required: true }], required: true },
    CreateAt: { type: Date, default: Date.now }
});

//Schema conversation group
const ConversationGroupSchema = new schema({
    Messages: { type: [Messages], default: [] },
    Group: { type: schema.Types.ObjectId, unique: true, ref: 'Group' },
    CreateAt: { type: Date, default: Date.now }
});


//Export model
exports.Conversation = Moongoose.model('Conversation', ConversationSchema);

//Export Model
exports.Messages = Messages;