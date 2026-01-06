import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Lottie from "lottie-react";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./landing.css";

/* ================= LOTTIES ================= */
import analyticsAnim from "../../assets/lottie/analytics.json";
import isometricAnim from "../../assets/lottie/isometric.json";
import revenueAnim from "../../assets/lottie/Revenue.json";
import contactAnim from "../../assets/lottie/Contact Us.json";

/* ================= MOTION VARIANTS ================= */

const sectionFade = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ================= COUNTER ================= */

function AnimatedCounter({ value }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, Math.round);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(motionValue, value, { duration: 1.6, ease: "easeOut" });
        }
      },
      { threshold: 0.6 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
    </span>
  );
}

/* ================= PAGE ================= */

export default function Landing() {
  const navigate = useNavigate();
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowCTA(window.scrollY > 700);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ================= NAV ================= */}
      <header className="nav glass">
        <div>
          <h2 className="logo">Borezy</h2>
          <span className="logo-tagline">Rental OS</span>
        </div>

        <nav>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
          <span className="nav-trust">ISO-grade Security</span>
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </nav>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="parallax-bg" />
        <div className="glow-orb" />

        <motion.div
          className="hero-left"
          initial="hidden"
          animate="visible"
          variants={sectionFade}
        >
          <span className="badge">🚀 Enterprise Rental Platform</span>

          <h1>
            The Operating System
            <br />
            for <span>Scalable Rental Businesses</span>
          </h1>

          <p>
            Eliminate booking errors, payment leakages, and operational chaos —
            with one system built for scale and control.
          </p>

          <div className="hero-actions">
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              Get a Free Workflow Demo <FaArrowRight />
            </motion.button>

            <button className="btn-ghost">See How It Works</button>
          </div>

          <p className="hero-proof">
            Used by 300+ rental businesses • ₹80Cr+ revenue tracked
          </p>
        </motion.div>

        <motion.div
          className="hero-right glass"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Lottie animationData={analyticsAnim} loop />
        </motion.div>
      </section>

      {/* ================= TRUST ================= */}
      <motion.section
        className="trust"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <p className="trust-text">
          Powering multi-location rental businesses across India
        </p>
        <div className="trust-logos">
          <span>Event Rentals</span>
          <span>Camera Rentals</span>
          <span>Wedding Rentals</span>
          <span>Construction Rentals</span>
          <span>Furniture Rentals</span>
        </div>
      </motion.section>

         <motion.section
        id="features"
        className="story"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2>Everything You Need. Nothing You Don’t.</h2>

        <div className="story-grid">
          {[
            {
              anim: isometricAnim,
              title: "Smart Inventory",
              text: "Live availability with automated return tracking.",
            },
            {
              anim: revenueAnim,
              title: "Rent & Deposit Logic",
              text: "Automatic balances with zero reconciliation.",
            },
            {
              anim: analyticsAnim,
              title: "Live Analytics",
              text: "Decision-ready reports without spreadsheets.",
            },
            {
              anim: contactAnim,
              title: "Customer Management",
              text: "Complete booking & customer history in one place.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="story-card glass"
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <Lottie animationData={item.anim} style={{ height: 220 }} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </motion.div>
          ))}
        </div>

        <p className="feature-footer">
          And 20+ more features built for real rental workflows
        </p>
      </motion.section>


      {/* ================= METRICS ================= */}
      <motion.section
        className="metrics"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <p className="metrics-subtitle">
          Real impact across growing rental businesses
        </p>

        <div className="metrics-grid">
          {[
            { label: "Rentals Managed Reliably", value: 125000 },
            { label: "Revenue Tracked Without Leakage (₹)", value: 82000000 },
            { label: "Businesses Scaling with Borezy", value: 340 },
            { label: "Operational Hours Saved / Month", value: 42 },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="metric-card glass"
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <h2>
                <AnimatedCounter value={item.value} />
              </h2>
              <p>{item.label}</p>
              <small>Last 12 months</small>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================= WORKFLOW ================= */}
      <motion.section
        className="workflow"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2>How Borezy Works</h2>

        <div className="workflow-grid">
          {[
            {
              step: "01",
              title: "Model Your Inventory",
              text: "Items, pricing, deposits & locations.",
            },
            {
              step: "02",
              title: "Automate Bookings",
              text: "No overlaps. No manual errors.",
            },
            {
              step: "03",
              title: "Control Cash Flow",
              text: "Rent & deposits stay balanced.",
            },
            {
              step: "04",
              title: "Scale with Insights",
              text: "Live revenue & utilization data.",
            },
          ].map((w, i) => (
            <motion.div
              key={i}
              className="workflow-card glass"
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <span>{w.step}</span>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================= DEEP FEATURE ================= */}
      <motion.section
        className="deep-feature"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="deep-grid">
          <div>
            <h2>Inventory Intelligence</h2>
            <p>
              Always know what’s available, rented, delayed, or returning —
              across dates and locations.
            </p>

            <ul>
              <li><FaCheck /> 99.9% booking accuracy</li>
              <li><FaCheck /> Zero overlap guarantee</li>
              <li><FaCheck /> Multi-location ready</li>
            </ul>

            <div className="proof-strip">
              <div><strong>99.9%</strong><span>Accuracy</span></div>
              <div><strong>0</strong><span>Overbookings</span></div>
              <div><strong>Multi-Location</strong><span>Ready</span></div>
            </div>

            <small>
              Used by event, camera & construction rentals
            </small>
          </div>

          <div className="glass preview-box">
            <Lottie animationData={isometricAnim} />
          </div>
        </div>
      </motion.section>

      {/* ================= FEATURES ================= */}
   
      {/* ================= SECURITY ================= */}
      <motion.section
        className="security"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2>Enterprise-grade Security & Reliability</h2>
        <p className="security-subtitle">
          Built with infrastructure designed for scale, compliance, and uptime.
        </p>

        <div className="security-grid">
          <div className="security-card glass">
            <h4>Data Protection</h4>
            <p>Encrypted at rest & in transit</p>
          </div>
          <div className="security-card glass">
            <h4>Reliability</h4>
            <p>Daily backups & monitored uptime</p>
          </div>
          <div className="security-card glass">
            <h4>Scalability</h4>
            <p>Optimized for high-volume rentals</p>
          </div>
          <div className="security-card glass">
            <h4>Support</h4>
            <p>Onboarding & priority assistance</p>
          </div>
        </div>
      </motion.section>

      {/* ================= PRICING ================= */}
      <motion.section
        id="pricing"
        className="pricing"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2>Simple Pricing. Built for Growth.</h2>

        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <h1>₹25,000+</h1>
            <p>Custom workflows, roles & integrations</p>
            <button className="btn-ghost full">Talk to Sales</button>
          </div>

          <div className="pricing-card popular">
            <span className="popular-tag">Most Chosen</span>
            <h3>Pro</h3>
            <h1>₹1,100 / month</h1>
            <p>Trusted by growing rental teams</p>
            <button className="btn-primary full">
              Start Free Demo
            </button>
          </div>

          <div className="pricing-card">
            <h3>Starter</h3>
            <p>For early-stage teams validating workflows</p>
            <h1>₹0</h1>
            <button className="btn-ghost full">Try Now</button>
          </div>
        </div>

        <p className="pricing-note">
          No credit card required • Cancel anytime
        </p>
      </motion.section>

      {/* ================= CONTACT ================= */}
      <motion.section
        id="contact"
        className="contact"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="contact-grid">
          <div className="glass">
            <span className="contact-badge">Free Strategy Demo</span>
            <h2>See How Borezy Fits Your Business</h2>
            <p>
              No sales pressure. Just a clear walkthrough of how Borezy
              fits your rental operation.
            </p>

            <form>
              <input placeholder="Your name" />
              <input placeholder="Business email" />
              <input placeholder="Business type (Event, Camera, etc.)" />
              <button className="btn-primary full">
                Request Demo
              </button>
            </form>

            <small>We usually respond within 24 hours</small>
          </div>

          <div className="glass">
            <Lottie animationData={contactAnim} style={{ height: 320 }} />
          </div>
        </div>
      </motion.section>

      {/* ================= FINAL CTA ================= */}
      <motion.section
        className="final-cta"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2>
          Replace spreadsheets with a system
          <br /> built for scale and control.
        </h2>
        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
        >
          Get Free Demo
        </motion.button>
      </motion.section>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        © 2025 Borezy • Privacy • Terms • Security
      </footer>

      {/* ================= STICKY CTA ================= */}
      {showCTA && (
        <motion.div
          className="sticky-cta glass"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
        >
          <span>Ready to modernize your rental business?</span>
          <button className="btn-primary">Get Free Demo</button>
          <button onClick={() => setShowCTA(false)}>✕</button>
        </motion.div>
      )}
    </>
  );
}
