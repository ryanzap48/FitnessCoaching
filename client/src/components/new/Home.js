import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import gymMe from '../../assets/gymMe.PNG';
import profMe from '../../assets/profMe.png';


gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const testimonialsRef = useRef(null);
  const leadMagnetRef = useRef(null);
  const footerRef = useRef(null);
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  useEffect(() => {
    const sections = [
      { ref: aboutRef },
      { ref: servicesRef },
      { ref: testimonialsRef },
      { ref: leadMagnetRef },
      { ref: footerRef },
    ];

    sections.forEach(({ ref }) => {
      if (!ref.current) return;

      gsap.fromTo(ref.current,
        { autoAlpha: 0, y: 50 },
        {
          duration: 1,
          autoAlpha: 1,
          y: 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 100%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill()); // Cleanup on unmount
    };
  }, []);

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#222' }}>

      {/* HERO */}
      <section 
        style={{
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        >
          <source src="/workout.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Optional overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
          }}
        />

        {/* Hero text content */}
        <div style={{ zIndex: 2, padding: '0 1rem', maxWidth: '700px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900' }}>
            Get Fit Anywhere with Custom Coaching
          </h1>
          <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
            Online training built around your goals and your schedule.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <button onClick={() => navigate('/consultationform')}
              style={{
                backgroundColor: '#00c853',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                marginRight: '1rem',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Free Consultation
            </button>
            <button onClick={() => navigate('/question0')}
              style={{
                backgroundColor: 'transparent',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                border: '1px solid #fff',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT ME */}
      <section
        ref={aboutRef}
        id="about"
        style={{
          maxWidth: '900px',
          margin: '4rem auto',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          opacity: 0, // initial hidden for gsap fade-in
        }}
      >
        <img
          src={profMe}
          alt="Friendly fitness coach smiling"
          style={{ width: '300px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
        />
        <img
          src={gymMe}
          alt="Friendly fitness coach smiling"
          style={{ width: '304px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
        />
        <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',        // horizontally center content
              justifyContent: 'center',    // vertically center (if container has height)
              textAlign: 'center',         // center the text itself
            }}
          >
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0077cc' }}>About Me</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Hey, I’m Ryan Zappone, a fitness coach dedicated to helping you reach your goals no matter where you are. With years of experience, I create personalized workout plans that fit your lifestyle and keep you motivated.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            Whether you’re just starting or looking to level up, I’m here to guide you every step of the way.
          </p>
        </div>
      </section>

      {/* WHAT I OFFER */}
      <section
        ref={servicesRef}
        id="offer"
        style={{ backgroundColor: '#f9f9f9', padding: '4rem 1rem', opacity: 0 }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '2rem', color: '#0077cc' }}>
            Our Offer
          </h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            maxWidth: '800px',
            margin: '0 auto',
          }}>
            {[
              { icon: '💪', title: '1-on-1 Coaching', desc: 'Personalized sessions to push your limits.' },
              { icon: '📋', title: 'Custom Plans', desc: 'Tailored workout & nutrition plans.' },
              { icon: '📱', title: 'Anywhere Access', desc: 'Train on your schedule, from anywhere.' },
              { icon: '🧘‍♂️', title: 'Lifestyle Guidance', desc: 'Holistic approach to wellness.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '1.5rem',
                boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
                width: '220px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
                <h3 style={{ marginBottom: '0.75rem', color: '#333' }}>{title}</h3>
                <p style={{ fontSize: '1rem', color: '#666' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section
        ref={testimonialsRef}
        id="success-stories"
        style={{ maxWidth: '900px', margin: '4rem auto', padding: '0 1rem', opacity: 0 }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: '#0077cc' }}>
          Success Stories
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            {
              name: 'Jessica R.',
              text: 'I lost 20 pounds and feel stronger than ever thanks to the personalized coaching!',
              img: 'https://randomuser.me/api/portraits/women/68.jpg',
            },
            {
              name: 'Mark D.',
              text: 'The plans fit perfectly into my busy schedule and helped me build muscle fast.',
              img: 'https://randomuser.me/api/portraits/men/45.jpg',
            },
            {
              name: 'Sara K.',
              text: 'I never thought I’d enjoy working out until I started these workouts. Highly recommend!',
              img: 'https://randomuser.me/api/portraits/women/44.jpg',
            },
          ].map(({ name, text, img }) => (
            <blockquote
              key={name}
              style={{
                backgroundColor: '#f1f1f1',
                borderRadius: '15px',
                padding: '1.5rem',
                boxShadow: '0 6px 10px rgba(0,0,0,0.1)',
                maxWidth: '280px',
                fontStyle: 'italic',
                color: '#555',
              }}
            >
              <p>"{text}"</p>
              <footer style={{ marginTop: '1rem', fontWeight: '700', color: '#0077cc' }}>
                — {name}
              </footer>
              <img
                src={img}
                alt={name}
                style={{ width: '50px', height: '50px', borderRadius: '50%', marginTop: '1rem', border: '2px solid #0077cc' }}
              />
            </blockquote>
          ))}
        </div>
      </section>

      {/* LEAD MAGNET */}
      <section
        ref={leadMagnetRef}
        id="lead-magnet"
        style={{
          background: 'linear-gradient(to right, rgb(85, 77, 77), #000000)',
          color: 'white',
          textAlign: 'center',
          padding: '3rem 1rem',
          opacity: 0,
        }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Not Convinced?
        </h2>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Sign up now to receive a detailed guide with tips, workouts, and nutrition plans you can start today and if you don't see results in the first 3 weeks, get your money back.
        </p>
        <button onClick={() => navigate('/question0')}
          style={{
            marginTop: '1.5rem',
            padding: '1rem 3rem',
            fontSize: '1.2rem',
            borderRadius: '30px',
            border: 'none',
            backgroundColor: '#ff5722',
            color: 'white',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(255,87,34,0.6)',
            transition: 'background-color 0.3s',
          }}
            onMouseOver={e => e.target.style.backgroundColor = '#e64a19'}
            onMouseOut={e => e.target.style.backgroundColor = '#ff5722'}

          >
          Get Started
        </button>
      </section>

        <footer
        ref={footerRef}
        style={{
          backgroundColor: '#0e0e0e',
          color: '#fff',
          padding: '2rem 2rem',
          marginTop: '10rem',
          fontFamily: 'Segoe UI, sans-serif',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '2rem',
          opacity: 0, // start hidden for animation
        }}
      >
        <div style={{ flex: '1 1 250px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Zappone Fit Coaching</h2>
          <p style={{ lineHeight: '1.6' }}>
            Helping you unlock your fitness potential with personalized training and lifestyle insights.
          </p>
        </div>

        <div style={{ flex: '1 1 200px' }}> 
          <h3 style={{ marginBottom: '1rem' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              { label: 'About Me', href: '/#about' },
              { label: 'Our Offer', href: '/#offer' },
              { label: 'Terms of Service', href: '/#' },
              { label: 'Privacy Policy', href: '/#' },
              { label: 'Contact', href: '/consultationform' }
            ].map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    display: 'inline-block',
                    margin: '0.4rem 0',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={e => (e.target.style.opacity = 0.75)}
                  onMouseOut={e => (e.target.style.opacity = 1)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Contact</h3>
          <p style={{ marginBottom: '0.5rem' }}>📧 zapponefitcoaching@gmail.com</p>
          <p style={{ marginBottom: '0.5rem' }}>📞 (860) 597-0221</p>
        </div>

        <div
          style={{
            flexBasis: '100%',
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.3)',
            paddingTop: '1rem',
            marginTop: '2rem',
            fontSize: '0.9rem',
            color: '#e0f7fa'
          }}
        >
          &copy; {new Date().getFullYear()} Zappone Fit Coaching. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
