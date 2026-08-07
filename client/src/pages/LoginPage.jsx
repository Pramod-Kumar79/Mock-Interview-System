import React, { useContext, useState } from 'react';
import '../css/AuthPages.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastErrorStyle, toastSuccessStyle } from '../components/utils/toastStyle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { GlobalContext } from '../components/utils/GlobalState';

function LoginPage() {
    const { loginUser } = useContext(GlobalContext);
    const navigate = useNavigate();
    const serverURL = process.env.REACT_APP_SERVER_URL;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password) {
            toast.error("Please enter both email and password!", { ...toastErrorStyle(), autoClose: 2000 });
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post(`${serverURL}/api/auth/login`, {
                email: email.trim(),
                password
            });

            loginUser(response.data.user, response.data.token);
            toast.success("Welcome back!", { ...toastSuccessStyle(), autoClose: 1200 });

            navigate(response.data.user.role === 'recruiter' ? '/recruiter' : '/', { replace: true });
        } catch (error) {
            toast.error(error.response ? error.response.data.errorMsg : error.message || error,
                { ...toastErrorStyle(), autoClose: 2500 }
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='auth-page'>
            <div className='auth-card'>
                <h1 className='auth-title'>Welcome Back</h1>
                <p className='auth-subtitle'>Log in to continue your interview journey</p>

                <form className='auth-form' onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input type='email' value={email} placeholder='you@example.com'
                        onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />

                    <label>Password</label>
                    <input type='password' value={password} placeholder='••••••••'
                        onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />

                    <button type='submit' className='auth-submit-btn' disabled={isLoading}>
                        {isLoading ? <> Logging in <FontAwesomeIcon icon={faSpinner} spin /> </> : 'Log In'}
                    </button>
                </form>

                <p className='auth-switch-text'>
                    Don't have an account? <Link to='/register'>Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
