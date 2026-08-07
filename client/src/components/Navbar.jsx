import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GlobalContext } from '../components/utils/GlobalState';
import '../css/Navbar.css';

function Navbar() {
    const { gUser, logoutUser } = useContext(GlobalContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/login', { replace: true });
    };

    return (
        <div className='nav-bar'>
            <Link to={gUser?.role === 'recruiter' ? '/recruiter' : '/'} className='nav-brand'>
                MOCK INTERVIEW
            </Link>

            <div className='nav-links'>
                {gUser && gUser.role === 'candidate' && (
                    <>
                        <Link to='/' className='nav-link'>New Interview</Link>
                        <Link to='/history' className='nav-link'>My History</Link>
                    </>
                )}
                {gUser && gUser.role === 'recruiter' && (
                    <Link to='/recruiter' className='nav-link'>Dashboard</Link>
                )}

                {gUser ? (
                    <div className='nav-user'>
                        <span className='nav-user-name'>{gUser.name}</span>
                        <span className='nav-user-role'>{gUser.role}</span>
                        <button className='nav-logout-btn' onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <>
                        <Link to='/login' className='nav-link'>Login</Link>
                        <Link to='/register' className='nav-link'>Sign Up</Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default Navbar;
