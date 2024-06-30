import React, { useContext, useState } from 'react';
import './Auth.css';
import { AuthContext } from './auth-context';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        sender: '',
        email: '',
        password: ''
    });
    const [loginMethod, setLoginMethod] = useState("login");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((prevInputs) => ({
            ...prevInputs,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = loginMethod === 'signup' ? 'http://localhost:5000/api/auth/signup' : 'http://localhost:5000/api/auth/login';
        const body = loginMethod === 'signup' ? 
            { sender: inputs.sender, email: inputs.email, password: inputs.password } :
            { email: inputs.email, password: inputs.password };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || 'Something went wrong');
            }
            if(response.ok) {
                auth.login(responseData.userId, responseData.token, responseData.name);
                navigate('/chatScreen');
            } else alert("Some error occurred");
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSwitch = () => {
        setLoginMethod((prevMethod) => (prevMethod === 'login' ? 'signup' : 'login'));
    };

    return (
        <div className="container">
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <h1 style={{ margin: "0 0 3rem", fontSize: "3rem" }}>{loginMethod === 'login' ? "LOGIN" : "SIGN UP"}</h1>

                    {loginMethod !== 'login' && 
                        <input className='authInput' type="text" placeholder="Username" name='sender' 
                        value={inputs.sender} onChange={handleChange} />}

                    <input className='authInput' type="email" placeholder="Email" name='email'
                    value={inputs.email} onChange={handleChange} />

                    <input className='authInput' type="password" placeholder="Password" name='password'
                    value={inputs.password} onChange={handleChange} />

                    <p onClick={handleSwitch}>Switch to {loginMethod === 'login' ? "Sign up" : "Login"}</p>
                    <button type='submit'>{loginMethod === 'login' ? "LOGIN" : "SIGNUP"}</button>
                </form>
            </div>
        </div>
    );
};

export default AuthForm;
