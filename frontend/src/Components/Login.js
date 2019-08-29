import React from 'react';

const Login = (props) => {
    return (
        <div className="container h-100 animated fadeIn">
            <div className="row h-100 justify-content-center">
                <div className="col align-self-center">
                    <div className="row align-items-center pb-5">
                        <div className="col align-self-center">
                            <picture>
                                <source type="image/svg+xml" />
                                <img src="https://image.flaticon.com/icons/svg/174/174240.svg" className="rounded mx-auto d-block" alt="..." width={200} height={200} />
                            </picture>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-md-6 align-self-center">
                            <div className="card border-card">
                                <div className="card-header gradient border-shadow">
                                    <p className="text-center font-weight-bold text-white mb-0">DevChat</p>
                                </div>
                                <div className="card-body border-shadow border-bottom">
                                    <form>
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text" id="user"><i className="fa fa-user"></i></span>
                                            </div>
                                            <input type="text" className="form-control" id="Username" placeholder="Username" aria-describedby="user"></input>
                                        </div>
                                        <div className="input-group pt-3">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text" id="pass"><i className="fa fa-key"></i></span>
                                            </div>
                                            <input type="text" className="form-control" id="Password" placeholder="Password" aria-describedby="pass"></input>
                                        </div>
                                        <div className="pt-3"></div>
                                        <div className="row justify-content-center">
                                            <div className="col align-self-center">
                                                <button type="button" className="btn btn-primary w-100 gradient">
                                                    <span className="pr-1"><i className="fas fa-angle-double-right"></i></span>
                                                    Login
                                        </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center pt-3">
                        <div className="col-md-3 align-self-center">
                            <button type="button" className="btn btn-primary w-100 gradient" onClick={() => props.history.push('/SignUp')}>
                                <div className="row justify-content-center">
                                    <span className="pr-1"><i className="fas fa-user-plus fa-lg"></i></span>
                                </div>
                                <div className="row justify-content-center">
                                    You do not have an account?
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
