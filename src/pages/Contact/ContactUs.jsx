import React from 'react';
import './ContactUs.css';
import AIChatbot from '../../components/AIChatbot/AIChatbot';

const ContactUs = () => {

  return (
    <> 
      <div className='contact-page'>
        <div className="contact-header">
          <h1 className='title'>Contact Us</h1>
          <p className='subtitle'>
            Have a question, feedback, or need assistance that our AI Chatbot couldn't resolve? 
            Reach out to the DishIQ support team directly.
          </p>
        </div>
          
        <div className="contact-list-container"> 
            
            {/* Phone Support Card */}
            <div className="contact-card">
                <div className='contact-icon-container'>
                   {/* Simple visual representation for Phone */}
                   <span className="contact-icon">📞</span>
                </div>

                <div className='contact-details'>
                    <h2 className='contact-method-name'>Phone Support</h2>
                    <p className='contact-description'>
                        Our support team is available to help with urgent inquiries and order issues.
                    </p>
                    <a href="tel:+12126788212" className='contact-link'>+1-212-678-8212</a>
                </div>
            </div>

            {/* Email Support Card */}
            <div className="contact-card">
                <div className='contact-icon-container'>
                   {/* Simple visual representation for Email */}
                   <span className="contact-icon">✉️</span>
                </div>

                <div className='contact-details'>
                    <h2 className='contact-method-name'>Email Us</h2>
                    <p className='contact-description'>
                        Send us a message regarding account management, feedback, or general questions.
                    </p>
                    <a href="mailto:contact@dishiq.com" className='contact-link'>contact@dishiq.com</a>
                </div>
            </div>

        </div>
      </div>
      
      {/* Chatbot wrapper included as standard per system design */}
      <div className="chatbot-wrapper">
        <AIChatbot />
      </div>
    </>
  );
};

export default ContactUs;