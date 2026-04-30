"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import styles from "./page.module.css";
import { BookOpen, BarChart2, Home } from "lucide-react";

// Inline SVGs for the Brand Pillars
const LearnIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1A8B95' }}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    <path d="M8 7h6"/>
    <path d="M8 11h8"/>
  </svg>
);

const GrowIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1D9E75' }}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

const SucceedIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#5A40B8' }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* 1. STICKY NAVIGATION */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="/">
            <Image
              src="/images/hpln-logo.png"
              alt="Home Plus Online Learning"
              width={160}
              height={44}
              className={styles.headerLogo}
              priority
            />
          </a>

          <nav className={styles.navCenter}>
            <a href="#about" className={styles.navLink}>About</a>
            <a href="#how-it-works" className={styles.navLink}>How it works</a>
            <a href="https://www.myprps.com/home-plus-forms-and-registration" className={styles.navLink} target="_blank" rel="noopener noreferrer">Register</a>
          </nav>

          <div className={styles.navRight}>
            <button 
              onClick={() => signIn('demo', { role: 'STUDENT', callbackUrl: '/dashboard' })} 
              className={`${styles.pillBtn} ${styles.pillGradient}`}
            >
              Student sign in
            </button>
            <button 
              onClick={() => signIn('demo', { role: 'TEACHER', callbackUrl: '/dashboard' })} 
              className={`${styles.pillBtn} ${styles.pillOutline}`}
            >
              Teacher sign in
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className={styles.hero} id="about">
        <div className={styles.heroInner}>
          {/* Left Column */}
          <div className={styles.heroLeft}>
            <Image
              src="/images/hpln-logo.png"
              alt="Home Plus"
              width={480}
              height={150}
              className={styles.heroLogo}
              priority
            />
            
            <div className={styles.eyebrow}>
              <div className={styles.pulseDot} />
              Alberta Curriculum · Grades 1–9
            </div>

            <h1 className={styles.heroH1}>
              Learning that fits your <span className={styles.gradientText}>family&apos;s life</span>
            </h1>

            <p className={styles.heroSub}>
              A flexible, asynchronous learning program that supports students in building strong academic skills through guided independent learning at home.
            </p>

            <div className={styles.heroActions}>
              <a 
                href="https://www.myprps.com/home-plus-forms-and-registration" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${styles.pillBtn} ${styles.pillGradient}`}
              >
                Register today
              </a>
              <a href="#how-it-works" className={`${styles.pillBtn} ${styles.pillOutline}`}>
                Learn more
              </a>
            </div>
          </div>

          {/* Right Column: Pillars Visual */}
          <div className={styles.heroRight}>
            <div className={styles.pillarCards}>
              <div className={styles.pillarCard}>
                <div className={`${styles.pillarIconWrap} ${styles.c1}`}>
                  <LearnIcon />
                </div>
                <div className={`${styles.pillarLabel} ${styles.c1}`}>Learn</div>
                <p className={styles.pillarDesc}>High-quality curriculum delivered flexibly</p>
              </div>

              <div className={styles.pillarCard}>
                <div className={`${styles.pillarIconWrap} ${styles.c2}`}>
                  <GrowIcon />
                </div>
                <div className={`${styles.pillarLabel} ${styles.c2}`}>Grow</div>
                <p className={styles.pillarDesc}>Teacher support every step of the way</p>
              </div>

              <div className={styles.pillarCard}>
                <div className={`${styles.pillarIconWrap} ${styles.c4}`}>
                  <SucceedIcon />
                </div>
                <div className={`${styles.pillarLabel} ${styles.c4}`}>Succeed</div>
                <p className={styles.pillarDesc}>Mastery based progression</p>
              </div>
            </div>

            <div className={styles.statsBanner}>
              <div className={styles.statCol}>
                <div className={styles.statNumber}>1–9</div>
                <div className={styles.statLabel}>Grade levels</div>
              </div>
              <div className={styles.statCol}>
                <div className={styles.statNumber}>4</div>
                <div className={styles.statLabel}>Core subjects</div>
              </div>
              <div className={styles.statCol}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>Alberta aligned</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST BAR */}
      <section className={styles.trustBar}>
        <div className={styles.trustItem}>
          <div className={styles.trustDot} />
          Aligned to Alberta curriculum
        </div>
        <div className={styles.trustItem}>
          <div className={styles.trustDot} />
          Asynchronous — learn anytime
        </div>
        <div className={styles.trustItem}>
          <div className={styles.trustDot} />
          Teacher-monitored progress
        </div>
        <div className={styles.trustItem}>
          <div className={styles.trustDot} />
          Works on any device
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className={styles.howItWorks} id="how-it-works">
        <div className={styles.sectionHeader}>
          <h2>Structure that supports, freedom that inspires</h2>
        </div>

        <div className={styles.stepGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepGradientTop} style={{ background: 'linear-gradient(90deg, var(--c1), var(--c2))' }} />
            <div className={styles.stepNumber}>01</div>
            <div className={styles.stepTitle}>Flexible learning</div>
            <p className={styles.stepDesc}>Students learn at their own pace with structured lessons they can access anytime, fitting perfectly into family schedules.</p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepGradientTop} style={{ background: 'linear-gradient(90deg, var(--c2), var(--c3))' }} />
            <div className={styles.stepNumber}>02</div>
            <div className={styles.stepTitle}>Clear direction</div>
            <p className={styles.stepDesc}>Every lesson provides defined targets and checkpoints so students always know exactly what to do next.</p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepGradientTop} style={{ background: 'linear-gradient(90deg, var(--c3), var(--c4))' }} />
            <div className={styles.stepNumber}>03</div>
            <div className={styles.stepTitle}>Teacher support</div>
            <p className={styles.stepDesc}>Alberta-certified teachers monitor progress and provide feedback—students are never learning alone.</p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepGradientTop} style={{ background: 'linear-gradient(90deg, var(--c4), var(--c1))' }} />
            <div className={styles.stepNumber}>04</div>
            <div className={styles.stepTitle}>Quality curriculum</div>
            <p className={styles.stepDesc}>Engaging activities, videos, and mastery-based assessments ensure deep understanding of core concepts.</p>
          </div>
        </div>
      </section>

      {/* 5. BUILT FOR EVERYONE */}
      <section className={styles.builtFor}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>Built for everyone</div>
          <h2>Designed with you in mind</h2>
        </div>

        <div className={styles.builtGrid}>
          <div className={styles.builtCard}>
            <div className={`${styles.builtIconWrap} ${styles.c1}`}>
              <BookOpen size={28} />
            </div>
            <h3 className={styles.builtTitle}>For students</h3>
            <p className={styles.builtDesc}>Learn at your own speed with engaging lessons and clear progress tracking.</p>
            <ul className={styles.builtList}>
              <li>Interactive lessons with videos</li>
              <li>Clear mastery tracking</li>
              <li>Self-paced independent learning</li>
            </ul>
          </div>

          <div className={styles.builtCard}>
            <div className={`${styles.builtIconWrap} ${styles.c3}`}>
              <BarChart2 size={28} />
            </div>
            <h3 className={styles.builtTitle}>For teachers</h3>
            <p className={styles.builtDesc}>Monitor progress in real time, identify needs, and offer targeted support.</p>
            <ul className={styles.builtList}>
              <li>Real-time progress dashboard</li>
              <li>Automated grading & reports</li>
              <li>Intervention alerts</li>
            </ul>
          </div>

          <div className={styles.builtCard}>
            <div className={`${styles.builtIconWrap} ${styles.c4}`}>
              <Home size={28} />
            </div>
            <h3 className={styles.builtTitle}>For families</h3>
            <p className={styles.builtDesc}>Support your child's learning at home with a proven, structured curriculum.</p>
            <ul className={styles.builtList}>
              <li>Alberta curriculum standards</li>
              <li>Visible completion tracking</li>
              <li>Guided independent learning</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} />
        <div className={styles.ctaInner}>
          <div className={styles.ctaTag}>Ready to begin?</div>
          <h2 className={styles.ctaHeading}>Join <span>Home Plus</span> today</h2>
          <p className={styles.ctaSub}>
            Register through Prairie Rose Public Schools to get started, or sign in if you are already enrolled.
          </p>
          
          <div className={styles.ctaActions}>
            <a 
              href="https://www.myprps.com/home-plus-forms-and-registration" 
              className={`${styles.pillBtn} ${styles.pillWhite}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Register with PRPS
            </a>
            <button 
              onClick={() => signIn('demo', { role: 'STUDENT', callbackUrl: '/dashboard' })} 
              className={`${styles.pillBtn} ${styles.pillGhost}`}
            >
              Student sign in
            </button>
            <button 
              onClick={() => signIn('demo', { role: 'TEACHER', callbackUrl: '/dashboard' })} 
              className={`${styles.pillBtn} ${styles.pillGhost}`}
            >
              Teacher sign in
            </button>
          </div>
        </div>
      </section>

      {/* 7. CONTACT SECTION */}
      <section className={styles.contactSection}>
        <div className={styles.sectionHeader} style={{ marginBottom: '2.5rem' }}>
          <div className={styles.sectionTag}>Let's talk</div>
          <h2>Interested in Home Plus?</h2>
        </div>

        <div className={styles.contactCard}>
          <div className={styles.contactGradientTop} />
          <h3 className={styles.contactName}>Jenn LaDouceur</h3>
          <div className={styles.contactRole}>Home Plus Learning Network · Prairie Rose Public Schools</div>
          
          <div className={styles.contactActions}>
            <a href="tel:403-526-3186" className={`${styles.contactPillBtn} ${styles.contactPillBlue}`}>
              403-526-3186
            </a>
            <a href="mailto:jennladouceur@prrd8.ca" className={`${styles.contactPillBtn} ${styles.contactPillGradient}`}>
              jennladouceur@prrd8.ca
            </a>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Link href="/">
              <Image
                src="/images/hpln-logo.png"
                alt="Home Plus"
                width={160}
                height={50}
                className={styles.footerBrandLogo}
              />
            </Link>
            <div className={styles.footerTagline}>Learn. Grow. Succeed.</div>
          </div>

          <div className={styles.footerCol}>
            <h4>Platform</h4>
            <button onClick={() => signIn('demo', { role: 'STUDENT', callbackUrl: '/dashboard' })}>Student sign in</button>
            <button onClick={() => signIn('demo', { role: 'TEACHER', callbackUrl: '/dashboard' })}>Teacher sign in</button>
            <a href="https://www.myprps.com/home-plus-forms-and-registration" target="_blank" rel="noopener noreferrer">Register</a>
          </div>

          <div className={styles.footerCol}>
            <h4>Contact</h4>
            <a href="tel:403-526-3186">403-526-3186</a>
            <a href="mailto:jennladouceur@prrd8.ca">jennladouceur@prrd8.ca</a>
          </div>

          <div className={styles.footerCol}>
            <h4>Legal</h4>
            <a href="#">Privacy policy</a>
            <a href="#">Terms of use</a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          © {new Date().getFullYear()} Home Plus Online Learning. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
