import React from 'react';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a href="/" className="logo">
          Opus
        </a>
      </div>
      <div className="navbar-center">
        <ul className="nav-links">
          <li>
            <a href="/about">About</a>
          </li>
          <li>
            <a href="/rlogin">Requesters</a>
          </li>
          <li>
            <a href="/wlogin">Workers</a>
          </li>
          <li>
            <a href="/tasks">Tasks</a>
          </li>
          <li>
            <a href="/dashboard">Dashboard</a>
          </li>
          <li>
            <a href="/contact">Contact</a>
          </li>
        </ul>
      </div>
      <div className="navbar-right">
        <a href="/wlogin" className="login">
          <i className="login" />
        </a>
        <a href="/wregister" className="register">
          <i className="register" />
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
