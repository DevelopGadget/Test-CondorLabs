import React, { useEffect, useRef, useReducer } from 'react';
import Message from './Message';
import ConversationController from '../Controllers/Conversation.controller';
import iziToast from 'izitoast';
import UIfx from 'uifx';
import ChatSound from '../Sounds/chat.mp3';
import Modal from './Modal';
import InfoGroup from './InfoGroup';

//Socket on Chat:Message
function HandlerMessage(data, _id, setMessages, Messages, Socket) {
    if (data.Room === _id) {
        Socket.emit('Chat:Typing', { Room: _id, Username: 'is not typing' });
        setMessages(Messages.concat([data.Message]));
        new UIfx(ChatSound, { volume: 1 }).play();
    }
}

//Data push new message conversation
function PushMessageConversation(text, IndexUser, Conversation, Token, Messages, setMessages, Socket, _Put, isGroup) {
    _Put({
        'Message': text,
        'IndexUser': IndexUser
    }, Token, Conversation._id).then(message => {
        Socket.emit('Chat:Message', {
            Room: Conversation._id,
            Message: message.Messages[message.Messages.length - 1],
            Member: isGroup ? {
                //socket emit last message and group or user
                Member: Conversation.Group.Members[message.Messages[message.Messages.length - 1].IndexUser],
                Group: {
                    UrlImage: Conversation.Group.UrlImage,
                    DisplayName: Conversation.Group.DisplayName
                }
            } :
                Conversation.Members[message.Messages[message.Messages.length - 1].IndexUser],
            isGroup: isGroup
        });
        Socket.emit('Chat:Typing', { Room: Conversation._id, Username: 'is not typing' });
        //clear text area
        document.getElementById('Message').value = '';
        //add new message array
        setMessages(Messages.concat([message.Messages[message.Messages.length - 1]]));
    }).catch(err => iziToast.error(err));
}

//Data push new Message
function PushMessage(IndexUser, Conversation, Token, Messages, setMessages, Socket, isGroup) {
    const text = document.getElementById('Message').value;
    if (text !== null && text !== '' && text.replace(/\s/g, '').length) {
        if (isGroup)
            PushMessageConversation(text, IndexUser, Conversation, Token, Messages,
                setMessages, Socket, ConversationController._PutGroup, isGroup);
        else
            PushMessageConversation(text, IndexUser, Conversation, Token, Messages,
                setMessages, Socket, ConversationController._Put, isGroup);
    }
}

function FindIndex(Array, User) { return Array.findIndex(item => item._id === User._id); }

//Change Image in chat
function ChangeImageGroup(path) { document.getElementById('imageChat').src = path; }

//Component
const Chat = ({ Conversation, Socket, isGroup }) => {
    const { User, Token } = JSON.parse(localStorage.getItem('User'));
    var Member;
    if (!isGroup)
        Member = Conversation.Members.filter(function (item) { return item._id !== User._id; });
    const IndexUser = isGroup ? FindIndex(Conversation.Group.Members, User) : FindIndex(Conversation.Members, User);
    const [Messages, setMessages] = useReducer((state, action) => action, Conversation.Messages);
    const Change = useRef(true);

    //useEffect for props
    useEffect(() => {
        setMessages(Conversation.Messages);
        Change.current = true;
    }, [Conversation._id, Conversation.Messages]);

    //useEffect for all
    useEffect(() => {
        const handler = (data) => HandlerMessage(data, Conversation._id, setMessages, Messages, Socket);
        const handleTyping = (data) => {
            document.getElementById('typing').innerHTML = data.Room ===
                Conversation._id && data.Username !== 'is not typing' ?
                `<h6 className="animated fadeIn">${data.Username} is typing...</h6>` : '';
            document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
        }
        Socket.on('Chat:Message', handler);
        Socket.on('Chat:Typing', handleTyping);
        return () => {
            //this is important so that the event is not repeated 
            Socket.off('Chat:Message', handler);
            Socket.off('Chat:Typing', handleTyping);
        };
    })

    //useEffect for Messages
    useEffect(() => {
        document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
        Change.current = true;
    }, [Messages]);

    //Listener onchage text
    function OnChange(text) {
        if (text.target.value === '')
            Socket.emit('Chat:Typing', { Room: Conversation._id, Username: 'is not typing' });
    }

    //Listener onkeypress
    function onKeyPress(event) {
        //if enter sent message
        if (event.which === 13 && !event.shiftKey)
            PushMessage(IndexUser, Conversation, Token, Messages, setMessages, Socket, isGroup)
        else
            Socket.emit('Chat:Typing', { Room: Conversation._id, Username: User.Username })
    }

    function Body() {
        //updated changes
        if (Change.current) {
            Change.current = false;
            //return message in chat
            return Messages.map((item, index) => {
                var msg = isGroup ? Conversation.Group.Members[item.IndexUser] : Conversation.Members[item.IndexUser];
                if (msg !== undefined) {
                    return <Message Image={msg.UrlImage} Username={msg.Username} Message={item.Message}></Message>
                } else {
                    return <Message Image={''} Username={'User deleted'} Message={item.Message}></Message>;
                }
            })
        } else {
            return null;
        }
    }

    return (
        <div className="card bg-transparent chat">
            <div className="card-header border-shadow">
                <div className="row">
                    <div className="col">
                        <div className="row align-items-center">
                            <img src={isGroup ? Conversation.Group.UrlImage : Member[0].UrlImage} className="rounded-circle ml-2"
                                alt="Profile" height={30} width={30}
                                onError={(img) => img.target.src = 'https://image.flaticon.com/icons/svg/660/660611.svg'} 
                                id="imageChat" />
                            <div className="col pl-1">
                                <p className="font-weight-bold text-white mb-0 ml-1">{isGroup ? Conversation.Group.DisplayName :
                                    Member[0].Username}</p>
                                <div id="typing" className="text-info mb-0 ml-1"></div>
                            </div>
                        </div>
                    </div>
                    {
                        isGroup ? <div className="col-1 align-self-center">
                            <div className="row justify-content-center">
                                <button className="btn text-white" type="button" data-toggle="modal" data-target="#ModalInfo">
                                    <i className="fas fa-info-circle fa-lg text-white"></i>
                                </button>
                            </div>
                        </div> : null
                    }

                </div>
            </div>
            <div className="card-body border-shadow overflow-auto" id="scroll" >
                {Body()}
            </div>
            <div className="card-footer">
                <div className="input-group">
                    <textarea name="" className="form-control type_msg" placeholder="Type your message..." id="Message"
                        style={{ resize: 'none' }} onKeyPress={onKeyPress.bind(this)} onChange={OnChange.bind(this)} />
                    <div className="input-group-append">
                        <button className="input-group-text send_btn"
                            onClick={() => PushMessage(IndexUser, Conversation, Token, Messages, setMessages, Socket, isGroup)}>
                            <i className="fas fa-location-arrow"></i>
                        </button>
                    </div>
                </div>
            </div>
            {
                isGroup ? <Modal Id="ModalInfo" Title="Information Group"
                    Content={<InfoGroup Group={Conversation.Group} Token={Token} User={User}
                        Image={ChangeImageGroup} Socket={Socket} />} /> : null
            }
        </div>
    );
}

export default Chat;
