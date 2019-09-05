import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import ListConversations from './ListConversations';
import Chat from './Chat';
import ListUsers from './ListUsers';
import izitoast from 'izitoast';
import { _Put } from '../Controllers/User.controller';
import ConversationController from '../Controllers/Conversation.controller';
import AddGroup from './AddGroup';
import Io from 'socket.io-client';
import Modal from './Modal';
import UserConfig from './UserConfig';

const Socket = Io();
const _user = JSON.parse(localStorage.getItem('User'));
if (_user !== null) {
    const { Token } = _user;
    Socket.on('connect', () => {
        _Put(Token, { Status: true });
    });
}


function Home() {
    var Local = JSON.parse(localStorage.getItem('User'));

    //Change to chat
    function ChangeChat(id) {
        ConversationController._GetOne(Local.Token, id).then(conversation => {
            if (conversation !== null && JSON.stringify({}) !== JSON.stringify(conversation)) {
                setSelect(<Chat Conversation={conversation} Socket={Socket}></Chat>);
            } else {
                ConversationController._Post({ Members: [Local.User._id, id] }, Local.Token).then(conversation => {
                    setSelect(<Chat Conversation={conversation} Socket={Socket}></Chat>);
                    setInit(true);
                    Socket.emit('Chat:Room', { Members: [Local.User._id, id] });
                }).catch(err => {
                    izitoast.error(err);
                });
            }
        }).catch(err => {
            izitoast.error(err);
        });
    }

    //variable that controls the main 
    const [Select, setSelect] = useState(<ListUsers Change={ChangeChat}></ListUsers>);
    const [Groups, setGroups] = useState([]);
    const [Init, setInit] = useState(true);
    const [Conversations, setConversations] = useState([]);
    const [SearchConversation, setSearchConversation] = useState([]);
    const ref = useRef(false);

    useEffect(() => {
        if (Init && Local != null) _get();
    });

    //get chats
    function _get() {
        ConversationController._GetGroups(Local.Token).then(groups => {
            if (groups) {
                groups.map((item, index) => {
                    Socket.emit('Room:Join', item._id);
                });
                setGroups(groups);
            }
        });
        ConversationController._Get(Local.Token).then(conversations => {
            if (conversations) {
                conversations.map((item, index) => {
                    Socket.emit('Room:Join', item._id);
                });
                setConversations(conversations);
            }
        });
        setInit(false);
    }

    //search conversations
    function Search(text) {
        if (text.target.value === '') {
            setSearchConversation([]);
        } else {
            const all = Conversations.concat(Groups);
            setSearchConversation(all.filter(item => {
                return item.Group === undefined ?
                    item.Members.filter(user => user.DisplayName.includes(text.target.value.toUpperCase())).length > 0 :
                    item.Group.DisplayName.includes(text.target.value.toUpperCase())
            }));
        }
    }

    if (Local != null) {
        const { User, Token } = Local;
        if (!ref.current) {
            Socket.on('Chat:Room', room => {
                const all = Conversations.concat(Groups);
                if (room.Members.filter(item => item === User._id).length >= 1 && all.filter(item => {
                    return item.Group === undefined ?
                        item.Members.filter(user => user._id === User._id) <= 0 :
                        item.Group.Members.filter(user => user._id === User._id) <= 0
                })) {
                    _get();
                }
            });
            ref.current = true;
        }

        //logout
        function _Logout() {
            izitoast.question({
                timeout: 20000,
                close: false,
                overlay: true,
                displayMode: 'once',
                id: 'question',
                zindex: 999,
                title: 'Hey',
                message: 'are you sure to leave?',
                position: 'center',
                buttons: [
                    ['<button><b>YES</b></button>', function (instance, toast) {
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                        _Put(Token, { Status: false }).then(user => {
                            localStorage.clear();
                            window.location.reload();
                        }).catch(err => {
                            izitoast.error(err);
                        });
                    }, true],
                    ['<button>NO</button>', function (instance, toast) { instance.hide({ transitionOut: 'fadeOut' }, toast, 'button'); }],
                ],
            });
        }

        return (
            <div className="container-fluid h-100 animated fadeIn h-100">
                <div className="row h-100">
                    <nav className="col-md-3 col-xl-2 d-none d-md-block bg-light sidebar gradient ">
                        <div className="row pt-3 justify-content-center">
                            <div className="col-5">
                                <img src={User.UrlImage} className="rounded-circle float-right" alt="Cinque Terre" />
                            </div>
                            <div className="col">
                                <div className="row">
                                    <h6 className="text-center font-weight-bold text-white">
                                        {User.Username}
                                    </h6>
                                </div>
                                <div className="row">
                                    <span>
                                        <i className="fas fa-meteor" style={{ color: 'green' }}></i>
                                    </span>
                                    <h6 className="text-center text-white pl-1">Online</h6>
                                </div>
                            </div>
                        </div>
                        <div className="row w-100 justify-content-between mx-0 pt-3">
                            <button type="button" className="btn btn-link text-white" onClick={() => setSelect(<ListUsers Change={ChangeChat}></ListUsers>)}>
                                <i className="fas fa-users fa-lg"></i>
                            </button>
                            <button type="button" className="btn btn-link text-white" data-toggle="modal" data-target="#Modal1">
                                <i className="fas fa-user-cog fa-lg"></i>
                            </button>
                            <button type="button" className="btn btn-link text-white" onClick={_Logout.bind(this)}>
                                <i className="fas fa-sign-out-alt fa-lg"></i>
                            </button>
                        </div>
                        <div className="row pt-3 justify-content-center">
                            <div className="input-group w-75">
                                <input className="form-control py-2 border-right-0 border bg-transparent text-white" type="search" placeholder="Seek conversation" onChange={Search.bind(this)} />
                                <span className="input-group-append">
                                    <div className="btn btn-link border-left-0 border text-white">
                                        <i className="fa fa-search"></i>
                                    </div>
                                </span>
                            </div>
                        </div>
                        {
                            SearchConversation.length >= 1 ?
                                <div className="row pt-3 justify-content-center">
                                    <ListConversations Conversations={SearchConversation} Change={ChangeChat}></ListConversations>
                                </div>
                                :
                                <div className="row pt-3 justify-content-center">
                                    <div className="accordion w-100" id="accordionExample">
                                        <div className="card bg-transparent w-100">
                                            <div className="card-header" id="headingOne">
                                                <h2 className="mb-0">
                                                    <button className="btn text-white w-100" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne" id="collapse">
                                                        <h6 className="text-center font-weight-bold text-white float-left">Direct Messages</h6>
                                                        <span className="float-right"><i className="fas fa-angle-double-down text-white"></i></span>
                                                    </button>
                                                </h2>
                                            </div>
                                            <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
                                                <div className="card-body px-0 pt-0 pb-0">
                                                    <ListConversations Conversations={Conversations} Change={ChangeChat}></ListConversations>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card bg-transparent">
                                            <div className="card-header" id="headingTwo">
                                                <h2 className="mb-0">
                                                    <div className="row w-100 mx-0 justify-content-between">
                                                        <button className="btn text-white w-75" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo" id="collapse">
                                                            <h6 className="text-center font-weight-bold text-white float-left">Groups</h6>
                                                            <span className="float-right"><i className="fas fa-angle-double-down text-white"></i></span>
                                                        </button>
                                                        <button className="btn text-white w-25" type="button" data-toggle="modal" data-target="#Modal">
                                                            <span className="float-right"><i className="fas fa-plus-circle text-white"></i></span>
                                                        </button>
                                                    </div>
                                                </h2>
                                            </div>
                                            <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
                                                <div className="card-body px-0 pt-0 pb-0">
                                                    <ListConversations Conversations={Groups} Change={ChangeChat}></ListConversations>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        }
                    </nav>
                    <main role="main" className="col-md-9 ml-sm-auto col-xl-10 pt-3 px-4">
                        {Select}
                    </main>
                </div>
                <Modal Id="Modal" Title="Add Group" Content={<AddGroup Conversations={Conversations} Add={(group) => setGroups(Groups.concat(group))} Socket={Socket}></AddGroup>}></Modal>
                <Modal Id="Modal1" Title="User Configuration" Content={<UserConfig></UserConfig>}></Modal>
            </div>
        );
    } else {
        return (
            <Redirect to={{ pathname: '/Login' }}></Redirect>
        );
    }
}

export default Home;