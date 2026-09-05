import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub, FaInstagram, FaTimes } from 'react-icons/fa';

const Footer = () => {
    const year = new Date().getFullYear();
    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    
    return (
        <>
            <footer className="bg-card text-foreground border-t border-border/80 mt-auto transition-colors">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="mb-4 md:mb-0">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                                <span>FinSage</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-foreground inline-block"></span>
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                Empowering your financial journey with precision modeling and strategic guidance.
                            </p>
                            <p className="mt-4 text-sm text-muted-foreground">
                                <a href="mailto:rahulkumar20000516@gmail.com" className="hover:text-foreground transition-colors">
                                    rahulkumar20000516@gmail.com
                                </a>
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-xs font-semibold text-foreground tracking-wider uppercase mb-4">
                                Quick Links
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Analytics
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/advisor" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Advisor
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/scenarios" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Scenarios
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="text-xs font-semibold text-foreground tracking-wider uppercase mb-4">
                                Legal
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <button 
                                        onClick={() => setShowPrivacyPolicy(true)} 
                                        className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors bg-transparent border-0 p-0"
                                    >
                                        Privacy Policy
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => setShowTerms(true)} 
                                        className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors bg-transparent border-0 p-0"
                                    >
                                        Terms of Service
                                    </button>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="mt-8 flex justify-center space-x-6">
                        <a href="https://www.facebook.com/imrahul97/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <span className="sr-only">Facebook</span>
                            <FaFacebookF className="h-4 w-4" />
                        </a>
                        <a href="https://x.com/imrahul165" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <span className="sr-only">Twitter</span>
                            <FaTwitter className="h-4 w-4" />
                        </a>
                        <a href="https://www.linkedin.com/in/imrahul05/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <span className="sr-only">LinkedIn</span>
                            <FaLinkedinIn className="h-4 w-4" />
                        </a>
                        <a href="https://github.com/imRahul05" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <span className="sr-only">GitHub</span>
                            <FaGithub className="h-4 w-4" />
                        </a>
                        <a href="https://www.instagram.com/imrahul512" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <span className="sr-only">Instagram</span>
                            <FaInstagram className="h-4 w-4" />
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="mt-8 border-t border-border/60 pt-4 text-center">
                        <p className="text-xs text-muted-foreground">
                            &copy; {year} FinSage. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Privacy Policy Modal */}
            {showPrivacyPolicy && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
                    <div className="bg-card border border-border/80 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-card animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center p-5 border-b border-border/70">
                            <h2 className="text-lg font-bold text-foreground">Privacy Policy</h2>
                            <button 
                                onClick={() => setShowPrivacyPolicy(false)}
                                className="text-muted-foreground hover:text-foreground focus:outline-none p-1 rounded-full cursor-pointer"
                            >
                                <FaTimes className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6 text-muted-foreground text-sm">
                            <h3 className="text-base font-semibold mb-2 text-foreground">1. Information We Collect</h3>
                            <p className="mb-4 leading-relaxed">
                                FinSage collects personal information that you voluntarily provide when using our services. This may include your name, email address, and financial parameters necessary for providing financial modeling.
                            </p>

                            <h3 className="text-base font-semibold mb-2 text-foreground">2. How We Use Your Information</h3>
                            <p className="mb-4 leading-relaxed">
                                We use your information to provide financial analytics, personalize your experience, and generate insights.
                            </p>

                            <h3 className="text-base font-semibold mb-2 text-foreground">3. Data Security</h3>
                            <p className="mb-4 leading-relaxed">
                                We implement appropriate security measures adhering to India's DPDP Act 2023. All financial parameters are encrypted using industry-standard protocols.
                            </p>

                            <h3 className="text-base font-semibold mb-2 text-foreground">4. Your Rights</h3>
                            <p className="mb-4 leading-relaxed">
                                You have the right to access, correct, or delete your personal information at any time.
                            </p>

                            <p className="text-xs text-muted-foreground mt-6">Last updated: {year}</p>
                        </div>
                        <div className="p-4 border-t border-border/70 flex justify-end">
                            <button 
                                onClick={() => setShowPrivacyPolicy(false)}
                                className="px-5 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 font-medium text-xs cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Terms of Service Modal */}
            {showTerms && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
                    <div className="bg-card border border-border/80 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-card animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center p-5 border-b border-border/70">
                            <h2 className="text-lg font-bold text-foreground">Terms of Service</h2>
                            <button 
                                onClick={() => setShowTerms(false)}
                                className="text-muted-foreground hover:text-foreground focus:outline-none p-1 rounded-full cursor-pointer"
                            >
                                <FaTimes className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6 text-muted-foreground text-sm">
                            <h3 className="text-base font-semibold mb-2 text-foreground">1. Acceptance of Terms</h3>
                            <p className="mb-4 leading-relaxed">
                                By accessing or using FinSage, you agree to be bound by these Terms of Service.
                            </p>

                            <h3 className="text-base font-semibold mb-2 text-foreground">2. Description of Service</h3>
                            <p className="mb-4 leading-relaxed">
                                FinSage provides financial tracking, investment scenario analysis, and tax regime estimation for informational purposes.
                            </p>

                            <h3 className="text-base font-semibold mb-2 text-foreground">3. Governing Law</h3>
                            <p className="mb-4 leading-relaxed">
                                These Terms shall be governed by and construed in accordance with the laws of India.
                            </p>

                            <p className="text-xs text-muted-foreground mt-6">Last updated: {year}</p>
                        </div>
                        <div className="p-4 border-t border-border/70 flex justify-end">
                            <button 
                                onClick={() => setShowTerms(false)}
                                className="px-5 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 font-medium text-xs cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;