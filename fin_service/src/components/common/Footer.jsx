import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub, FaInstagram, FaTimes } from 'react-icons/fa';

const Footer = () => {
    const year = new Date().getFullYear();
    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    
    return (
        <>
            <footer className="bg-gray-900 dark:bg-gray-950 text-white rounded-t-3xl shadow-lg border-t border-transparent dark:border-gray-800 mt-auto transition-colors">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="mb-4 md:mb-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                                <span>FinSage AI</span>
                            </h2>
                            <p className="mt-2 text-sm text-gray-400 dark:text-gray-400 leading-relaxed">
                                Empowering your financial journey with AI-driven insights and personalized guidance.
                            </p>
                            <p className="mt-4 text-sm text-gray-400">
                                <a href="mailto:rahulkumar20000516@gmail.com" className="hover:text-blue-400 transition-colors">
                                    rahulkumar20000516@gmail.com
                                </a>
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">
                                Quick Links
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/dashboard" className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/analytics" className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors">
                                        Analytics
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/advisor" className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors">
                                        AI Advisor
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/scenarios" className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors">
                                        Scenarios
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">
                                Legal
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <button 
                                        onClick={() => setShowPrivacyPolicy(true)} 
                                        className="text-gray-400 hover:text-white dark:hover:text-blue-400 cursor-pointer transition-colors bg-transparent border-0 p-0"
                                    >
                                        Privacy Policy
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => setShowTerms(true)} 
                                        className="text-gray-400 hover:text-white dark:hover:text-blue-400 cursor-pointer transition-colors bg-transparent border-0 p-0"
                                    >
                                        Terms of Service
                                    </button>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors">
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="mt-8 flex justify-center space-x-6">
                        <a href="https://www.facebook.com/imrahul97/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors">
                            <span className="sr-only">Facebook</span>
                            <FaFacebookF className="h-5 w-5" />
                        </a>
                        <a href="https://x.com/imrahul165" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors">
                            <span className="sr-only">Twitter</span>
                            <FaTwitter className="h-5 w-5" />
                        </a>
                        <a href="https://www.linkedin.com/in/imrahul05/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors">
                            <span className="sr-only">LinkedIn</span>
                            <FaLinkedinIn className="h-5 w-5" />
                        </a>
                        <a href="https://github.com/imRahul05" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors">
                            <span className="sr-only">GitHub</span>
                            <FaGithub className="h-5 w-5" />
                        </a>
                        <a href="https://www.instagram.com/imrahul512" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors">
                            <span className="sr-only">Instagram</span>
                            <FaInstagram className="h-5 w-5" />
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="mt-8 border-t border-gray-800 pt-4 text-center">
                        <p className="text-sm text-gray-400">
                            &copy; {year} FinSage AI. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Made with love by Rahul <span className="text-red-500">❤️</span>
                        </p>
                    </div>
                </div>
            </footer>

            {/* Privacy Policy Modal */}
            {showPrivacyPolicy && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
                            <button 
                                onClick={() => setShowPrivacyPolicy(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none p-1 rounded-md"
                            >
                                <FaTimes className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 text-gray-700 dark:text-gray-300">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">1. Information We Collect</h3>
                            <p className="mb-4 leading-relaxed">
                                FinSage AI collects personal information that you voluntarily provide when using our services. This may include your name, email address, and financial information necessary for providing our services. We also collect usage data to improve your experience.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">2. How We Use Your Information</h3>
                            <p className="mb-4 leading-relaxed">
                                We use your information to provide and improve our financial advisory services, personalize your experience, and communicate with you about our services and features. Your financial data is used to generate insights and recommendations through our AI algorithms.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">3. Data Security</h3>
                            <p className="mb-4 leading-relaxed">
                                We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. All financial data is encrypted using industry-standard protocols.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">4. Third-Party Services</h3>
                            <p className="mb-4 leading-relaxed">
                                FinSage AI uses third-party services such as Firebase for user authentication and data storage. These services have their own privacy policies, and we encourage you to review them.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">5. Your Rights</h3>
                            <p className="mb-4 leading-relaxed">
                                You have the right to access, correct, or delete your personal information at any time. You can manage your data through your account settings or by contacting us directly.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">6. Changes to This Policy</h3>
                            <p className="mb-4 leading-relaxed">
                                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">7. Contact Us</h3>
                            <p className="mb-4 leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us at contact@finsage-ai.com.
                            </p>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">Last updated: April 12, 2025</p>
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button 
                                onClick={() => setShowPrivacyPolicy(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
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
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Terms of Service</h2>
                            <button 
                                onClick={() => setShowTerms(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none p-1 rounded-md"
                            >
                                <FaTimes className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 text-gray-700 dark:text-gray-300">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">1. Acceptance of Terms</h3>
                            <p className="mb-4 leading-relaxed">
                                By accessing or using FinSage AI, you agree to be bound by these Terms of Service. If you do not agree to these Terms, you should not use our services.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">2. Description of Service</h3>
                            <p className="mb-4 leading-relaxed">
                                FinSage AI provides AI-powered financial advisory services, including expense tracking, investment recommendations, and financial planning. We do not provide professional financial advice, and our services are for informational purposes only.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">3. User Accounts</h3>
                            <p className="mb-4 leading-relaxed">
                                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">4. User Content</h3>
                            <p className="mb-4 leading-relaxed">
                                You retain ownership of any financial data and personal information you provide to FinSage AI. By submitting this data, you grant us a license to use it for providing and improving our services.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">5. Limitation of Liability</h3>
                            <p className="mb-4 leading-relaxed">
                                FinSage AI is not liable for any financial decisions you make based on our recommendations. Our insights are generated by AI algorithms and should be considered alongside professional financial advice.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">6. Termination</h3>
                            <p className="mb-4 leading-relaxed">
                                We reserve the right to terminate or suspend your account and access to our services at our discretion, without notice, for conduct that we believe violates these Terms or is harmful to our service or other users.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">7. Changes to Terms</h3>
                            <p className="mb-4 leading-relaxed">
                                We may modify these Terms of Service at any time. We will notify you of significant changes by posting a notice on our website or sending you an email.
                            </p>

                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">8. Governing Law</h3>
                            <p className="mb-4 leading-relaxed">
                                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                            </p>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">Last updated: April 12, 2025</p>
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button 
                                onClick={() => setShowTerms(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
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