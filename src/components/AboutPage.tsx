import React from 'react';
import './AboutPage.css';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';


const AboutPage: React.FC = () => {
    return (
        <div className="single-menu-page about-page">
            {/* Hero Cover Section */}
            <div className="hero-cover">
                <motion.div 
                    className="hero-overlay"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <Link to="/" className="back-button">
                        ← Retour au menu
                    </Link>
                    <img src="/images/logo.png" alt="icon" className="logo-img" />
                    <div className="hero-divider"></div>
                    <p className="hero-subtitle">Café Carthage</p>
                    <p className="hero-tagline">À Propos de Nous</p>
                </motion.div>
            </div>

            {/* About Content */}
            <div className="menu-container about-content-container">

                <motion.div 
                    className="about-section"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="section-header">
                        <span className="category-icon-emoji">📍</span>
                        <h3 className="section-title">Informations</h3>
                    </div>
                    <div className="contact-info">
                        <div className="info-item">
                            <strong>Adresse:</strong> Route de Robbana, El May — Djerba, Tunisie
                            
                            <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d20882.749035530058!2d-0.007080890546345273!3d0.0002519642953389438!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13aabb5e1f7b32db%3A0x101e59dd91fa6ad5!2sCarthage%20Coffe!5e0!3m2!1sfr!2stn!4v1776800169163!5m2!1sfr!2stn" width="100%"  height="300"  style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps Location"></iframe>
                            <Link to="https://www.google.com/maps/place/Carthage+Coffe/@33.795104,10.8777076,16z/data=!4m22!1m15!4m14!1m6!1m2!1s0x13aabc0ec4d08941:0x84d9a69806b487da!2sRobbana!2m2!1d10.8959568!2d33.7754967!1m6!1m2!1s0x13aabb822f5e5e33:0x5265ffc63dc5cc51!2sEl+May!2m2!1d10.8818401!2d33.8015836!3m5!1s0x13aabb5e1f7b32db:0x101e59dd91fa6ad5!8m2!3d33.7951023!4d10.8861473!16s%2Fg%2F11s_zwhwls?entry=ttu&g_ep=EgoyMDI2MDQxOS4wIKXMDSoASAFQAw%3D%3D" className="gm-button" target="_blank">Ouvrir dans Google Maps</Link>
                        </div>
                        <div className="info-item">
                            <strong>Horaires:</strong> Ouvert tous les jours de 05h00 à 02h00
                        </div>
                        
                    </div>
                </motion.div>

                {/* Thank You Footer */}
                <div className="thank-you-footer">
                    <h2 className="thank-you-title">Merci!</h2>
                    <p className="thank-you-arabic">شكرا</p>
                    <div className="thank-you-divider"></div>
                    <p className="thank-you-text">Café Carthage</p>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
