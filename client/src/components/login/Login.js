import React from 'react';

export default class Login extends React.Component {
    
    render() {
        return (
            <div id='login'>
                <div id='login-header'>
                    <h1>POLAR UNIVERSITY</h1>
                </div>
                <div id='login-body'>
                    <form id='user-login'>
                        <h2>LOGIN</h2>
                        <label for='login-user'><h3>Username</h3></label>
                        <input type='text' id='login-user' name='user'></input>
                        <label for='login-pass'><h3>Username</h3></label>
                        <input type='password' id='login-pass' name='pass'></input>
                        <div id='login-button'>
                            <button>Sign In</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

}