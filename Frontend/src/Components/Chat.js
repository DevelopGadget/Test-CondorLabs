import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import ConversationController from '../Controllers/Conversation.controller';

//Socket on Chat:Message
function HandlerMessage(data, _id, setMessages, Messages, Socket) {
    if (data.Room === _id) {
        Socket.emit('Chat:Typing', { Room: _id, Username: 'is not typing' });
        setMessages(Messages.concat([data.Message]));
    } else {

    }
}

//Data push new Message
function PushMessage(IndexUser, Conversation, Token, Messages, setMessages, Socket) {
    const text = document.getElementById('Message').value;
    if (text !== null && text !== '') {
        ConversationController._Put({
            'Message': text,
            'IndexUser': IndexUser
        }, Token, Conversation._id).then(message => {
            Socket.emit('Chat:Message', {
                Room: Conversation._id,
                Message: message.Messages[message.Messages.length - 1],
                Member: Conversation.Members[message.Messages[message.Messages.length - 1].IndexUser]
            });
            Socket.emit('Chat:Typing', { Room: Conversation._id, Username: 'is not typing' });
            document.getElementById('Message').value = '';
            setMessages(Messages.concat([message.Messages[message.Messages.length - 1]]));
        }).catch(err => console.log(err));
    }
}

function FindIndex(Array, User) { return Array.findIndex(item => item._id === User._id); }

//Component
const Chat = ({ Conversation, Socket, isGroup }) => {
    const { User, Token } = JSON.parse(localStorage.getItem('User'));
    var Member;
    if (!isGroup)
        Member = Conversation.Members.filter(function (item) {
            return item._id !== User._id;
        });
    const IndexUser = isGroup ? FindIndex(Conversation.Group.Members, User) : FindIndex(Conversation.Members, User);
    const [Messages, setMessages] = useState(Conversation.Messages);

    Socket.on('Chat:Typing', (data) => {
        document.getElementById('typing').innerHTML = data.Room === Conversation._id && data.Username !== 'is not typing' ? `<h6 className="animated fadeIn">${data.Username} is typing...</h6>` : '';
        document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
    });

    //useEffect for props
    useEffect(() => {
        setMessages(Conversation.Messages);
    }, [Conversation._id]);

    //useEffect for all
    useEffect(() => {
        const handler = (data) => HandlerMessage(data, Conversation._id, setMessages, Messages, Socket);
        Socket.on('Chat:Message', handler);
        return () => {
            Socket.off('Chat:Message', handler);
        };
    })

    //useEffect for Messages
    useEffect(() => {
        document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
    }, [Messages]);

    //Listener onchage text
    function OnChange(text) {
        if (text.target.value === '')
            Socket.emit('Chat:Typing', { Room: Conversation._id, Username: 'is not typing' });
    }

    return (
        <div className="card bg-transparent chat">
            <div className="card-header border-shadow">
                <div className="row">
                    <div className="col">
                        <div className="row align-items-center">
                            <img src={isGroup ? Conversation.Group.UrlImage : Member[0].UrlImage} className="rounded-circle ml-2" alt="Cinque Terre" height={30} width={30} />
                            <div className="col">
                                <p className="font-weight-bold text-white mb-0 ml-2">{isGroup ? Conversation.Group.DisplayName : Member[0].Username}</p>
                                <div id="typing" className="text-info mb-0 ml-2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body border-shadow overflow-auto" id="scroll" >
                {
                    Messages.map((item, index) => <Message Image={isGroup ? Conversation.Group.Members[item.IndexUser].UrlImage : Conversation.Members[item.IndexUser].UrlImage} Username={isGroup ? Conversation.Group.Members[item.IndexUser].Username : Conversation.Members[item.IndexUser].Username} Message={item.Message}></Message>)
                }
            </div>
            <div className="card-footer">
                <div className="input-group">
                    <textarea name="" className="form-control type_msg" placeholder="Type your message..." id="Message" style={{ resize: 'none' }} onKeyPress={() => Socket.emit('Chat:Typing', { Room: Conversation._id, Username: User.Username })} onChange={OnChange.bind(this)}></textarea>
                    <div className="input-group-append">
                        <button className="input-group-text send_btn" onClick={() => PushMessage(IndexUser, Conversation, Token, Messages, setMessages, Socket)}><i className="fas fa-location-arrow"></i></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;
