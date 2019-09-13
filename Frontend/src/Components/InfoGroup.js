import React, { useState } from 'react';
import GroupController from '../Controllers/Group.controller';
import izitoast from 'izitoast';

//get change image
async function ChangeImageGroup(Token, File, setGroupState, setLoading, Id, Image) {
    if (File.name !== undefined) {
        setLoading(true);
        await GroupController._PutUpload(Token, File, Id).then(group => {
            if (group !== null && JSON.stringify({}) !== JSON.stringify(group)) {
                group.UrlImage = group.UrlImage + '?' + Date.now();
                setGroupState(group);
                Image(group.UrlImage);
            }
        }).catch(err => {
            izitoast.error(err);
        });
        setLoading(false);
    }
}

const InfoGroup = ({ Group, Token, Image }) => {

    const [Loading, setLoading] = useState(false);
    const [Conversations, setConversations] = useState([]);
    const [GroupState, setGroupState] = useState(Group);

    return (
        <div className="card gradient">
            <div className="card-body">
                <div className="row justify-content-center" style={{ height: '100px' }}>
                    <div className="hovereffect rounded-circle" style={{ width: '100px' }}>
                        {
                            Loading ? <div class="spinner-border text-light" role="status">
                                <span class="sr-only">Loading...</span>
                            </div> : <img className="rounded-circle img-fluid" src={GroupState.UrlImage} alt="Profile Photo" id="photo" onError={(img) => img.target.src = 'https://image.flaticon.com/icons/svg/660/660611.svg'} />
                        }
                        <div className="overlay rounded-circle">
                            <input type="file" name="image" id="image" style={{ visibility: 'hidden' }} accept="image/x-png,image/gif,image/jpeg" onChange={(files) => ChangeImageGroup(Token, files.target.files[0], setGroupState, setLoading, GroupState._id, Image)} />
                            <label for="image">
                                <i className="fas fa-upload text-white"></i>
                            </label>
                        </div>
                    </div>
                </div>
                <h5 className="text-white text-center pt-1">{GroupState.DisplayName}</h5>
                <div className="row">
                    <div className="col">
                        <h5 className="text-white text-center pt-1">Members</h5>
                        <ul className="list-group w-100 bg-transparent" style={{ maxHeight: '170px' }}>
                            {
                                GroupState.Members.map((Member, index) =>
                                    <div className="list-group-item bg-transparent d-flex justify-content-start align-items-center">
                                        <img src={Member.UrlImage} className="rounded-circle float-left" alt="Cinque Terre" width={30} height={30} onError={(img) => img.target.src = 'https://image.flaticon.com/icons/svg/660/660611.svg'} />
                                        <h6 className="text-center font-weight-bold text-white mb-0 ml-1">{Member.DisplayName}</h6>
                                    </div>
                                )
                            }
                        </ul>
                    </div>
                    {
                        Conversations.length > 0 ? <div className="col">
                            <h5 className="text-white text-center pt-1">Conversations</h5>
                            <ul className="list-group w-100 bg-transparent" style={{ maxHeight: '170px' }}>
                                {
                                    Conversations.map((Member, index) =>
                                        <div className="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                                            <img src={Member.UrlImage} className="rounded-circle float-left" alt="Cinque Terre" width={30} height={30} onError={(img) => img.target.src = 'https://image.flaticon.com/icons/svg/660/660611.svg'} />
                                            <h6 className="text-center font-weight-bold text-white mb-0 ml-1">{Member.DisplayName}</h6>
                                            <button className="btn text-white float-right" type="button">
                                                <span><i className="fas fa-plus-circle text-white"></i></span>
                                            </button>
                                        </div>
                                    )
                                }
                            </ul>
                        </div> : null
                    }
                </div>
            </div>
        </div>
    )
}

export default InfoGroup;
