import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub, FaInstagram, FaTimes } from 'react-icons/fa';

const Footer = () => {
    const year = new Date().getFullYear();
    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    
    return (
        <>
            <footer className="bg-slate-900 dark:bg-slate-950 text-white border-t border-slate-800 mt-auto transition-colors">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="mb-4 md:mb-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                                <span>FinSage</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-white inline-block"></span>
                            </h2>
                            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                                Empowering your financial journey with precision modeling and strategic guidance.
                            </p>
                            <p className="mt-4 text-sm text-slate-400">
                                <a href="mailto:rahulkumar20000516@gmail.com" className="hover:text-white transition-colors">
                                    rahulkumar20000516@gmail.com
                                </a>
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-4">
                                Quick Links
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/analytics" className="text-slate-400 hover:text-white transition-colors">
                                        Analytics
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/advisor" className="text-slate-400 hover:text-white transition-colors">
                                        Advisor
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/scenarios" className="text-slate-400 hover:text-white transition-colors">
                                        Scenarios
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-4">
                                Legal
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <button 
                                        onClick={() => setShowPrivacyPolicy(true)} 
                                        className="text-slate-400 hover:text-white cursor-pointer transition-colors bg-transparent border-0 p-0"
                                    >
                                        Privacy Policy
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => setShowTerms(true)} 
                                        className="text-slate-400 hover:text-white cursor-pointer transition-colors bg-transparent border-0 p-0"
                                    >
                                        Terms of Service
                                    </button>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="mt-8 flex justify-center space-x-6">
                        <a href="https://www.facebook.com/imrahul97/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                            <span className="sr-only">Facebook</span>
                            <FaFacebookF className="h-4 w-4" />
                        </a>
                        <a href="https://x.com/imrahul165" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                            <span className="sr-only">Twitter</span>
                            <FaTwitter className="h-4 w-4" />
                        </a>
                        <a href="https://www.linkedin.com/in/imrahul05/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                            <span className="sr-only">LinkedIn</span>
                            <FaLinkedinIn className="h-4 w-4" />
                        </a>
                        <a href="https://github.com/imRahul05" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                            <span className="sr-only">GitHub</span>
                            <FaGithub className="h-4 w-4" />
                        </a>
                        <a href="https://www.instagram.com/imrahul512" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                            <span className="sr-only">Instagram</span>
                            <FaInstagram className="h-4 w-4" />
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="mt-8 border-t border-slate-800 pt-4 text-center">
                        <p className="text-xs text-slate-500">
                            &copy; {year} FinSage. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Privacy Policy Modal */}
            {showPrivacyPolicy && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
                            <button 
                                onClick={() => setShowPrivacyPolicy(false)}
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white focus:outline-none p-1 rounded-md cursor-pointer"
                            >
                                <FaTimes className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6 text-slate-700 dark:text-slate-300 text-sm">
                            <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">1. Information We Collect</h3>
                            <p className="mb-4 leading-relaxed">
                                FinSage collects personal information that you voluntarily provide when using our services. This may include your name, email address, and financial parameters necessary for providing financial modeling.
                            </p>

                            <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">2. How We Use Your Information</h3>
                            <p className="mb-4 leading-relaxed">
                                We use your information to provide financial analytics, personalize your experience, and generate insights.
                            </p>

                            <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">3. Data Security</h3>
                            <p className="mb-4 leading-relaxed">
                                We implement appropriate security measures adhering to India's DPDP Act 2023. All financial parameters are encrypted using industry-standard protocols.
                            </p>

                            <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">4. Your Rights</h3>
                            <p className="mb-4 leading-relaxed">
                                You have the right to access, correct, or delete your personal information at any time.
                            </p>

                            <p className="text-xs text-slate-500 mt-6">Last updated: {year}</p>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                            <button 
                                onClick={() => setShowPrivacyPolicy(false)}
                                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 font-medium text-xs cursor-pointer"
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
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Terms of Service</h2>
                            <button 
                                onClick={() => setShowTerms(false)}
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white focus:outline-none p-1 rounded-md cursor-pointer"
                            >
                                <FaTimes className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6 text-slate-700 dark:text-slate-300 text-sm">
                            <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">1. Acceptance of Terms</h3>
                            <p className="mb-4 leading-relaxed">
                                By accessing or using FinSage, you agree to be bound by these Terms of Service.
                            </p>

                            <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">2. Description of Service</h3>
                            <p className="mb-4 leading-relaxed">
                                FinSage provides financial tracking, investment scenario analysis, and tax regime estimation for informational purposes.
                            </p>

                            <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">3. Governing Law</h3>
                            <p className="mb-4 leading-relaxed">
                                These Terms shall be governed by and construed in accordance with the laws of India.
                            </p>

                            <p className="text-xs text-slate-500 mt-6">Last updated: {year}</p>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                            <button 
                                onClick={() => setShowTerms(false)}
                                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 font-medium text-xs cursor-pointer"
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