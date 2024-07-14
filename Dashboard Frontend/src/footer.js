import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="footer__content">
              <h3 className="footer__content-heading">Subscribe to get tips and tactics to grow the way you want.</h3>
              <form className="footer__content-form">
                <input type="email" className="form-control" placeholder="Your email address" />
                <button type="submit" className="btn btn-primary">Board meetings</button>
              </form>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6">
            <ul className="footer__list">
              <li className="footer__list-item">
                Help
              </li>
              <li className="footer__list-item">
                Features
              </li>
              <li className="footer__list-item">
                Blog
              </li>
              <li className="footer__list-item">
                Pricing
              </li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6">
            <ul className="footer__list">
              <li className="footer__list-item">
                Terms of Service
              </li>
              <li className="footer__list-item">
                Privacy Policy
              </li>
            </ul>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="footer__content">
              <p className="footer__content-text">© Gumroad, Inc.</p>
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="footer__content-social">
                <i className="fab fa-facebook-f"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
