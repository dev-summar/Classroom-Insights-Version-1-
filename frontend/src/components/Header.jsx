import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="app-header">
            <div className="header-logo-container">
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="header-logo-icon">
                        <img
                            src="https://mietjmu.in/wp-content/uploads/2020/11/miet-logo-white.png"
                            alt="MIET Logo"
                            style={{ width: '250px', height: 'auto', objectFit: 'contain' }}
                        />
                    </div>
                </Link>
            </div>
            <div className="header-title-group">
                <span className="header-institute-name">MODEL INSTITUTE OF ENGINEERING AND TECHNOLOGY</span>
                <span className="header-subtitle">CLASSROOM INSIGHTS</span>
            </div>
        </header>
    );
};

export default Header;
