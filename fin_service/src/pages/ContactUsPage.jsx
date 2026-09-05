import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/common/Footer";
import emailjs from '@emailjs/browser';

function ContactUsPage() {
  const { currentUser } = useAuth();
  const formRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const subjectRef = useRef(null);
  const messageRef = useRef(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    error: false,
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setSubmitStatus({ success: false, error: false, message: "" });
    
    try {
      const templateParams = {
        from_name: nameRef.current?.value,
        reply_to: emailRef.current?.value,
        subject: subjectRef.current?.value,
        message: messageRef.current?.value,
        to_email: `rahulkumar20000516@gmail.com, ${emailRef.current?.value}`,
        user_email: emailRef.current?.value
      };
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicID = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      
      const result = await emailjs.send(
        serviceId, 
        templateId, 
        templateParams,
        publicID
      );
      
      console.log('Email sent successfully:', result.text);
      
      e.target.reset();
      
      setSubmitStatus({
        success: true,
        error: false,
        message: "Your message has been sent successfully! Our team will get back to you soon.",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      setSubmitStatus({
        success: false,
        error: true,
        message: "Failed to send message. Please try again or contact us directly at contact@finsage-ai.com",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Header Section */}
      <div className="pt-12 sm:pt-16 pb-8 text-center max-w-3xl mx-auto px-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border/70 mb-3">
          Support & Inquiries
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Contact Our Advisory Team
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Have questions about FinSage AI simulations, tax modeling, or institutional accounts? We're here to help.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Information Card */}
          <div className="lg:col-span-5 rounded-3xl bg-foreground text-background p-8 sm:p-10 shadow-card flex flex-col justify-between min-h-[440px]">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-background/15 text-background border border-background/20 mb-4">
                Reach Us Directly
              </span>
              <h3 className="text-2xl font-bold tracking-tight">Contact Information</h3>
              <p className="mt-2 text-xs sm:text-sm text-background/80 leading-relaxed">
                Connect with our product and engineering team directly for support, feedback, or custom advisory workflows.
              </p>

              <dl className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-background/10 border border-background/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wider text-background/60 font-semibold">Email</dt>
                    <dd className="text-sm font-medium text-background break-all">rahulkumar20000516@gmail.com</dd>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-background/10 border border-background/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wider text-background/60 font-semibold">Phone</dt>
                    <dd className="text-sm font-medium text-background">+91 9572280546</dd>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-background/10 border border-background/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0z" />
                    </svg>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wider text-background/60 font-semibold">Location</dt>
                    <dd className="text-sm font-medium text-background">Gandhi Path, Saharsa, Bihar, India 852201</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="mt-8 pt-6 border-t border-background/15 text-xs text-background/70">
              <p className="font-medium text-background">Live Support Hours</p>
              <p className="mt-0.5">Monday–Friday from 10:00 AM to 6:00 PM IST</p>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="lg:col-span-7 rounded-3xl bg-card border border-border/80 p-8 sm:p-10 shadow-card">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Send Us a Message</h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              We typically respond to financial inquiries within 24 business hours.
            </p>

            {submitStatus.success && (
              <div className="mt-5 bg-muted/60 border border-border/80 text-foreground px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{submitStatus.message}</span>
              </div>
            )}
            
            {submitStatus.error && (
              <div className="mt-5 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-2xl text-xs sm:text-sm">
                {submitStatus.message}
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-semibold text-foreground">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    ref={nameRef}
                    autoComplete="name"
                    required
                    placeholder="e.g. Rahul Kumar"
                    className="w-full p-3 text-xs rounded-2xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold text-foreground">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    ref={emailRef}
                    autoComplete="email"
                    defaultValue={currentUser ? currentUser.email : ""}
                    required
                    placeholder="name@example.com"
                    className="w-full p-3 text-xs rounded-2xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="subject" className="block text-xs font-semibold text-foreground">Subject</label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  ref={subjectRef}
                  required
                  placeholder="How can we help you?"
                  className="w-full p-3 text-xs rounded-2xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="block text-xs font-semibold text-foreground">Message</label>
                <textarea
                  id="message"
                  name="message"
                  ref={messageRef}
                  rows={5}
                  required
                  placeholder="Describe your inquiry or feedback in detail..."
                  className="w-full p-3 text-xs rounded-2xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-background bg-foreground hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-60 transition shadow-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Message...
                    </>
                  ) : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default ContactUsPage;