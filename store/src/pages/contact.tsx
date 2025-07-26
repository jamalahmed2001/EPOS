import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { api } from "@/utils/api";

const ContactPage: NextPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const submitForm = api.contact.submitForm.useMutation({
    onSuccess: () => {
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitError("");
    },
    onError: (error) => {
      setSubmitError(error.message || "Failed to send message. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    submitForm.mutate(formData);
  };

  return (
    <>
      <Head>
        <title>Contact Us - Ministry of Vapes</title>
        <meta name="description" content="Get in touch with Ministry of Vapes. We're here to help with any questions about our products or services." />
      </Head>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
            Contact Us
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Send us a message</h2>
              
              {submitSuccess ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                  <p className="text-green-800">Thank you for your message! We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitForm.isPending}
                    className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitForm.isPending ? "Sending..." : "Send Message"}
                  </button>
                  {submitError && (
                    <p className="text-red-500 text-sm mt-2">{submitError}</p>
                  )}
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Get in touch</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Store Hours</h3>
                  <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 8:00 PM</p>
                  <p className="text-muted-foreground">Saturday: 10:00 AM - 6:00 PM</p>
                  <p className="text-muted-foreground">Sunday: 12:00 PM - 5:00 PM</p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">Phone</h3>
                  <p className="text-muted-foreground">+44 20 1234 5678</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM GMT</p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">Email</h3>
                  <p className="text-muted-foreground">support@ministryofvapes.com</p>
                  <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">Address</h3>
                  <p className="text-muted-foreground">
                    123 Vape Street<br />
                    London, UK<br />
                    W1A 1AA
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-foreground mb-2">Need immediate assistance?</h3>
                <p className="text-sm text-muted-foreground">
                  For urgent matters, please call us during business hours or visit our store location.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage; 