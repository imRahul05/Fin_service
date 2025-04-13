// import { useState, useRef } from "react";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { db } from "../firebase/config";
// import { useAuth } from "../context/AuthContext";
// import Footer from "../components/common/Footer";

// function ContactUsPage() {
//   const { currentUser } = useAuth();
//   const nameRef = useRef();
//   const emailRef = useRef();
//   const subjectRef = useRef();
//   const messageRef = useRef();
  
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitStatus, setSubmitStatus] = useState({
//     success: false,
//     error: false,
//     message: "",
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     setIsSubmitting(true);
//     setSubmitStatus({ success: false, error: false, message: "" });
    
//     try {
//       // Prepare inquiry data
//       const inquiryData = {
//         name: nameRef.current.value,
//         email: emailRef.current.value || (currentUser ? currentUser.email : ""),
//         subject: subjectRef.current.value,
//         message: messageRef.current.value,
//         status: "new",
//         createdAt: serverTimestamp(),
//         userId: currentUser ? currentUser.uid : null,
//       };
      
//       // Add document to "contactInquiries" collection
//       await addDoc(collection(db, "contactInquiries"), inquiryData);
      
//       // Reset form
//       e.target.reset();
      
//       // Show success message
//       setSubmitStatus({
//         success: true,
//         error: false,
//         message: "Your message has been sent successfully! Our team will get back to you soon.",
//       });
//     } catch (error) {
//       console.error("Error submitting contact form:", error);
//       setSubmitStatus({
//         success: false,
//         error: true,
//         message: "Failed to send message. Please try again or contact us directly at contact@finsage-ai.com",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="relative py-12 bg-gradient-to-b from-blue-800 to-blue-600">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
//               Contact Us
//             </h1>
//             <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
//               Have questions about FinSage AI? We're here to help!
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="lg:grid lg:grid-cols-2">
//             <div className="py-10 px-6 sm:px-10 lg:col-span-1 xl:p-12 bg-gradient-to-br from-blue-700 to-blue-900">
//               <div className="mt-6">
//                 <h3 className="text-lg font-medium text-white">Contact Information</h3>
//                 <dl className="mt-8 space-y-6">
//                   <dt><span className="sr-only">Email</span></dt>
//                   <dd className="flex text-base text-blue-50">
//                     <svg className="flex-shrink-0 h-6 w-6 text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                     </svg>
//                     <span className="ml-3">contact@finsage-ai.com</span>
//                   </dd>
//                   <dt><span className="sr-only">Phone number</span></dt>
//                   <dd className="flex text-base text-blue-50">
//                     <svg className="flex-shrink-0 h-6 w-6 text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                     </svg>
//                     <span className="ml-3">+91 9572280546</span>
//                   </dd>
//                   <dt><span className="sr-only">Address</span></dt>
//                   <dd className="flex text-base text-blue-50">
//                     <svg className="flex-shrink-0 h-6 w-6 text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                     </svg>
//                     <span className="ml-3">
//                       Gandhi Path, Saharsa<br />
//                       Bihar, India 852201
//                     </span>
//                   </dd>
//                 </dl>
//                 <p className="mt-12 text-base text-blue-50">
//                   Looking for customer support?
//                 </p>
//                 <p className="mt-1 text-sm text-blue-200">
//                   Our support team is available Monday-Friday from 10AM to 6PM IST.
//                 </p>
//               </div>
//             </div>
//             <div className="py-10 px-6 sm:px-10 lg:col-span-1 xl:p-12">
//               <h3 className="text-lg font-medium text-gray-900">Send us a message</h3>
//               {submitStatus.success && (
//                 <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
//                   {submitStatus.message}
//                 </div>
//               )}
              
//               {submitStatus.error && (
//                 <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
//                   {submitStatus.message}
//                 </div>
//               )}
              
//               <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
//                 <div className="sm:col-span-2">
//                   <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
//                   <div className="mt-1">
//                     <input
//                       type="text"
//                       name="name"
//                       id="name"
//                       ref={nameRef}
//                       autoComplete="name"
//                       required
//                       className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
//                     />
//                   </div>
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//                   <div className="mt-1">
//                     <input
//                       id="email"
//                       name="email"
//                       type="email"
//                       ref={emailRef}
//                       autoComplete="email"
//                       defaultValue={currentUser ? currentUser.email : ""}
//                       required
//                       className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
//                     />
//                   </div>
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
//                   <div className="mt-1">
//                     <input
//                       type="text"
//                       name="subject"
//                       id="subject"
//                       ref={subjectRef}
//                       required
//                       className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
//                     />
//                   </div>
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
//                   <div className="mt-1">
//                     <textarea
//                       id="message"
//                       name="message"
//                       ref={messageRef}
//                       rows="6"
//                       required
//                       className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
//                     ></textarea>
//                   </div>
//                 </div>
//                 <div className="sm:col-span-2">
//                   <button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Sending...
//                       </>
//                     ) : "Send Message"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
        
//         {/* FAQ Section */}
//         {/* <div className="mt-16">
//           <h2 className="text-2xl font-extrabold text-gray-900 text-center">Frequently Asked Questions</h2>
//           <div className="mt-6 max-w-3xl mx-auto">
//             <dl className="space-y-6 divide-y divide-gray-200">
//               <div className="pt-6">
//                 <dt className="text-lg font-medium text-gray-900">How secure is my financial data?</dt>
//                 <dd className="mt-2 text-base text-gray-500">
//                   Your data is encrypted both in transit and at rest. We use industry-standard security practices and regularly audit our systems to ensure your financial information remains protected.
//                 </dd>
//               </div>
//               <div className="pt-6">
//                 <dt className="text-lg font-medium text-gray-900">Can I export my financial data?</dt>
//                 <dd className="mt-2 text-base text-gray-500">
//                   Yes, you can export your financial data in CSV format from your account settings at any time. You always maintain ownership of your data.
//                 </dd>
//               </div>
//               <div className="pt-6">
//                 <dt className="text-lg font-medium text-gray-900">Is FinSage AI available as a mobile app?</dt>
//                 <dd className="mt-2 text-base text-gray-500">
//                   Currently, FinSage AI is a web application optimized for both desktop and mobile browsers. We're working on native mobile apps that will be available soon!
//                 </dd>
//               </div>
//               <div className="pt-6">
//                 <dt className="text-lg font-medium text-gray-900">How do I cancel my subscription?</dt>
//                 <dd className="mt-2 text-base text-gray-500">
//                   You can cancel your subscription at any time from the billing section in your profile settings. There are no cancellation fees.
//                 </dd>
//               </div>
//             </dl>
//           </div>
//         </div> */}
//       </div>
      
//       <Footer />
//     </div>
//   );
// }

// export default ContactUsPage;