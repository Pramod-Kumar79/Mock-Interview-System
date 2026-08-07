import React, { useContext, useState } from 'react';
import '../css/AuthPages.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastErrorStyle, toastSuccessStyle } from '../components/utils/toastStyle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { GlobalContext } from '../components/utils/GlobalState';

function RegisterPage() {
    const { loginUser } = useContext(GlobalContext);
    const navigate = useNavigate();
    const serverURL = process.env.REACT_APP_SERVER_URL;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('candidate');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !password) {
            toast.error("Please fill in all the fields!", { ...toastErrorStyle(), autoClose: 2000 });
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters!", { ...toastErrorStyle(), autoClose: 2000 });
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!", { ...toastErrorStyle(), autoClose: 2000 });
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post(`${serverURL}/api/auth/register`, {
                name: name.trim(),
                email: email.trim(),
                password,
                role
            });

            loginUser(response.data.user, response.data.token);
            toast.success("Account created successfully!", { ...toastSuccessStyle(), autoClose: 1200 });

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
                <h1 className='auth-title'>Create Account</h1>
                <p className='auth-subtitle'>Sign up as a candidate or a recruiter</p>

                <div className='role-toggle'>
                    <button type='button' className={`role-btn ${role === 'candidate' ? 'active' : ''}`}
                        onClick={() => setRole('candidate')} disabled={isLoading}>
                        I'm a Candidate
                    </button>
                    <button type='button' className={`role-btn ${role === 'recruiter' ? 'active' : ''}`}
                        onClick={() => setRole('recruiter')} disabled={isLoading}>
                        I'm a Recruiter
                    </button>
                </div>
                <p className='role-hint'>
                    {role === 'candidate'
                        ? "Take mock interviews and track your own performance history."
                        : "View the interview performance history of every candidate."}
                </p>

                <form className='auth-form' onSubmit={handleSubmit}>
                    <label>Full Name</label>
                    <input type='text' value={name} placeholder='Jane Doe'
                        onChange={(e) => setName(e.target.value)} disabled={isLoading} />

                    <label>Email</label>
                    <input type='email' value={email} placeholder='you@example.com'
                        onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />

                    <label>Password</label>
                    <input type='password' value={password} placeholder='At least 6 characters'
                        onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />

                    <label>Confirm Password</label>
                    <input type='password' value={confirmPassword} placeholder='Re-enter password'
                        onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} />

                    <button type='submit' className='auth-submit-btn' disabled={isLoading}>
                        {isLoading ? <> Creating account <FontAwesomeIcon icon={faSpinner} spin /> </> : 'Sign Up'}
                    </button>
                </form>

                <p className='auth-switch-text'>
                    Already have an account? <Link to='/login'>Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
