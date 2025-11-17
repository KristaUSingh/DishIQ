import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="foot-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt=""/>
            <p>egejhdjbfjsdgf</p>
            <div className="footer-social-icons">
                <img src={assets.facebook_icon} alt="" />
                <img src={assets.x_icon} alt="" />
                <img src={assets.linkedin_icon} alt="" />
            </div>
        </div>
        <div className="footer-content-center">
             <h2>COMPANY</h2>  
             <u1>
                <li>Home</li>
                <li>About Us</li>
                <li>Delivery</li>
                <li>Privacy Policy</li>
             </u1>
        </div>
        <div className="footer-content-right">
            <h2>CONTACT US</h2>
            <u1>
                <li>+1-212-678-8212</li>
                <li>contact@dishiq.com</li>
             </u1>
        </div> 
      </div>
      <hr />
      <p className="footer-copyright">Copyright 2025 © DishIQ.com - All Rights Reserved.</p>
    </div>
  )
}

export default Footer
