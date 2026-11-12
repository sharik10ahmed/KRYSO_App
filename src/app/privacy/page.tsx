import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail, Lock, FileText, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Kryso Music Academy",
  description: "Privacy Policy and Data Safety statement for Kryso Music Academy web and mobile applications.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      {/* Header bar */}
      <header className="border-b border-white/10 bg-[#0B0F17]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Kryso
          </Link>
          <span className="text-xs uppercase tracking-wider text-white/50">Official Policy</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Google Play Data Safety Compliant
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-white/60 text-sm">
            Last Updated: November 12, 2026 • Effective Date: November 12, 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-white/80 text-sm md:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              1. Overview
            </h2>
            <p>
              Welcome to <strong>Kryso Music Academy</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to
              protecting your privacy and ensuring the security of your personal information. This Privacy
              Policy applies to our website, progressive web application, and official Android mobile application
              available on the Google Play Store.
            </p>
            <p>
              By accessing our applications or enrolling in courses, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              2. Information We Collect
            </h2>
            <p>We only collect data necessary to provide music education services, track streaming, and process course admissions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Student Identification & Contact Data:</strong> Name, email address, phone number, and city
                submitted when making admission enquiries or enrolling in courses (e.g. DJing, Music Production, Piano, Guitar).
              </li>
              <li>
                <strong>Payment Information:</strong> When you purchase or enroll in a course, transactions are
                processed securely by our certified payment gateway provider (<strong>Razorpay</strong>). We do not
                collect, view, or store full credit/debit card numbers or bank credentials on our servers.
              </li>
              <li>
                <strong>Device & Usage Data:</strong> Standard technical information such as device model, operating system
                version, and app session metrics collected automatically by Android and modern browsers to ensure stable
                audio playback and video streaming.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To register and administer your music course enrollments and batch scheduling.</li>
              <li>To issue tax invoices and official admission confirmation receipts via email (SMTP).</li>
              <li>To respond to your inquiries regarding studio sessions, live bookings, or tech riders.</li>
              <li>To improve audio playback, application performance, and user experience.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              4. Data Sharing & Third-Party Services
            </h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties. We utilize industry-standard,
              secure third-party services exclusively to deliver our application features:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Razorpay:</strong> Payment processing adhering to PCI-DSS Level 1 compliance.</li>
              <li><strong>MongoDB Atlas:</strong> Encrypted cloud database for enrollment records.</li>
              <li><strong>Cloudinary:</strong> Content delivery network (CDN) for optimized music artwork, gallery photos, and audio.</li>
              <li><strong>Google Play Services:</strong> Core application delivery and system update notifications.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-400" />
              5. Data Retention, Rights & Contact Us
            </h2>
            <p>
              You retain the right to request access to, correction of, or permanent deletion of your personal contact
              data and enrollment records from our systems at any time.
            </p>
            <p>
              To exercise these rights, or if you have any questions regarding this Privacy Policy, please contact our
              administrative team:
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="font-semibold text-white">Kryso Music Academy</p>
              <p className="text-white/70">Email: <a href="mailto:sharikahmed731@gmail.com" className="text-amber-400 underline">sharikahmed731@gmail.com</a></p>
              <p className="text-white/70">Location: Pune, Maharashtra, India</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Kryso Music Academy. All rights reserved.
      </footer>
    </div>
  );
}
