import { Link } from "react-router-dom";
import "../css/Landing.css";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 2L20 7V15L11 20L2 15V7L11 2Z"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M11 6L16 9V13L11 16L6 13V9L11 6Z"
          fill="currentColor"
          opacity="0.3"
        />
        <circle cx="11" cy="11" r="2" fill="currentColor" />
      </svg>
    ),
    title: "JWT Authentication",
    desc: "HTTP-only cookie-based auth with access & refresh token rotation. XSS-proof by design.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M16 5l1.5 1.5L20 4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Role-Based Access",
    desc: "3-tier RBAC: user, moderator, admin. Granular permissions at route and resource level.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect
          x="3"
          y="4"
          width="16"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M7 9h8M7 13h5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle
          cx="17"
          cy="6"
          r="3"
          fill="var(--bg-surface)"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M15.5 6h3M17 4.5v3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Task Management",
    desc: "Full CRUD with status, priority, tags, due dates, and assignment. Paginated & filterable.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M3 7h16M3 11h10M3 15h7"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="17" cy="15" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M16 15l.8.8L18.5 13.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "API Documentation",
    desc: "Interactive Swagger UI at /api/v1/docs. Full OpenAPI 3.0 spec for every endpoint.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <rect
          x="12"
          y="3"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <rect
          x="3"
          y="12"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M15.5 12v7M12 15.5h7"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Scalable Architecture",
    desc: "Modular MVC structure. Stateless JWT scales horizontally. MongoDB compound indexes built-in.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 3C7.686 3 5 5.686 5 9c0 4 6 10 6 10s6-6 6-10c0-3.314-2.686-6-6-6z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="11" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
    title: "Security Hardened",
    desc: "Helmet headers, rate limiting, NoSQL injection prevention, bcrypt hashing, input validation.",
  },
];

const techStack = [
  { name: "Node.js", color: "#34d399" },
  { name: "Express 5", color: "#7a8ba8" },
  { name: "MongoDB", color: "#4f8ef7" },
  { name: "JWT", color: "#fbbf24" },
  { name: "React 19", color: "#22d3ee" },
  { name: "Vite 8", color: "#a78bfa" },
  { name: "Swagger", color: "#34d399" },
  { name: "Winston", color: "#f87171" },
];

export default function Landing() {
  return (
    <div className="land">
      {/* ── Nav ── */}
      <nav className="land-nav">
        <div className="land-nav__inner">
          <div className="land-nav__brand">
            <div className="land-nav__logo">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 2L24 8V20L14 26L4 20V8L14 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M14 7L20 10.5V17.5L14 21L8 17.5V10.5L14 7Z"
                  fill="currentColor"
                  opacity="0.4"
                />
                <circle cx="14" cy="14" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <span className="land-nav__name">TaskFlow</span>
          </div>
          <div className="land-nav__links">
            <a href="#features" className="land-nav__link">
              Features
            </a>
            <a href="#stack" className="land-nav__link">
              Stack
            </a>
            <a href="#api" className="land-nav__link">
              API
            </a>
          </div>
          <div className="land-nav__actions">
            <Link to="/login" className="land-nav__login">
              Sign In
            </Link>
            <Link to="/register" className="land-nav__cta">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="land-hero">
        <div className="land-hero__bg-grid" />
        <div className="land-hero__glow land-hero__glow--1" />
        <div className="land-hero__glow land-hero__glow--2" />
        <div className="land-hero__glow land-hero__glow--3" />

        <div className="land-hero__content">
          <div className="land-hero__badge animate-fadeUp">
            <span className="land-hero__badge-dot" />
            Production-Grade REST API · JWT · RBAC · React
          </div>

          <h1
            className="land-hero__title animate-fadeUp"
            style={{ animationDelay: "0.08s" }}
          >
            Build tasks.
            <br />
            <span className="land-hero__title--accent">Ship fast.</span>
          </h1>

          <p
            className="land-hero__sub animate-fadeUp"
            style={{ animationDelay: "0.16s" }}
          >
            A full-stack task management platform with secure JWT
            authentication, role-based access control, and a clean React
            dashboard. Built for scale.
          </p>

          <div
            className="land-hero__actions animate-fadeUp"
            style={{ animationDelay: "0.24s" }}
          >
            <Link to="/register" className="land-hero__btn-primary">
              Start for free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <a
              href="http://localhost:5000/api/v1/docs"
              target="_blank"
              rel="noreferrer"
              className="land-hero__btn-ghost"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="2"
                  y="3"
                  width="12"
                  height="10"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M5 7h6M5 10h4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              View API Docs
            </a>
          </div>

          {/* Stats row */}
          <div
            className="land-hero__stats animate-fadeUp"
            style={{ animationDelay: "0.32s" }}
          >
            {[
              { val: "15+", label: "API Endpoints" },
              { val: "3", label: "Access Roles" },
              { val: "JWT", label: "Auth Method" },
              { val: "v2.0", label: "API Version" },
            ].map((s) => (
              <div key={s.label} className="land-stat">
                <span className="land-stat__val">{s.val}</span>
                <span className="land-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div
          className="land-hero__visual animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="land-mockup">
            <div className="land-mockup__bar">
              <span />
              <span />
              <span />
              <div className="land-mockup__url">
                localhost:5000/api/v1/tasks
              </div>
            </div>
            <div className="land-mockup__body">
              <div className="land-mockup__line">
                <span className="lm-key">"success"</span>
                <span className="lm-colon">: </span>
                <span className="lm-bool">true</span>
                <span className="lm-comma">,</span>
              </div>
              <div className="land-mockup__line">
                <span className="lm-key">"data"</span>
                <span className="lm-colon">: [</span>
              </div>
              <div className="land-mockup__line land-mockup__line--indent">
                <span className="lm-brace">{"{"}</span>
              </div>
              <div className="land-mockup__line land-mockup__line--indent2">
                <span className="lm-key">"title"</span>
                <span className="lm-colon">: </span>
                <span className="lm-str">"Design landing page"</span>
                <span className="lm-comma">,</span>
              </div>
              <div className="land-mockup__line land-mockup__line--indent2">
                <span className="lm-key">"status"</span>
                <span className="lm-colon">: </span>
                <span className="lm-str">"in-progress"</span>
                <span className="lm-comma">,</span>
              </div>
              <div className="land-mockup__line land-mockup__line--indent2">
                <span className="lm-key">"priority"</span>
                <span className="lm-colon">: </span>
                <span className="lm-str">"high"</span>
                <span className="lm-comma">,</span>
              </div>
              <div className="land-mockup__line land-mockup__line--indent2">
                <span className="lm-key">"tags"</span>
                <span className="lm-colon">: </span>
                <span className="lm-arr">["design", "frontend"]</span>
              </div>
              <div className="land-mockup__line land-mockup__line--indent">
                <span className="lm-brace">{"}"}</span>
              </div>
              <div className="land-mockup__line">
                <span className="lm-colon">],</span>
              </div>
              <div className="land-mockup__line">
                <span className="lm-key">"pagination"</span>
                <span className="lm-colon">: </span>
                <span className="lm-brace">{"{"} </span>
                <span className="lm-key">"total"</span>
                <span className="lm-colon">: </span>
                <span className="lm-num">42</span>
                <span className="lm-brace"> {"}"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="land-features" id="features">
        <div className="land-section-inner">
          <div className="land-section-head">
            <span className="land-section-tag">Features</span>
            <h2 className="land-section-title">Everything you need</h2>
            <p className="land-section-sub">
              Built with best practices for security, scalability, and developer
              experience.
            </p>
          </div>

          <div className="land-features__grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="land-feat-card animate-fadeUp"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="land-feat-card__icon">{f.icon}</div>
                <h3 className="land-feat-card__title">{f.title}</h3>
                <p className="land-feat-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="land-stack" id="stack">
        <div className="land-section-inner">
          <div className="land-section-head">
            <span className="land-section-tag">Stack</span>
            <h2 className="land-section-title">Modern tech, zero bloat</h2>
          </div>
          <div className="land-stack__pills">
            {techStack.map((t) => (
              <span
                key={t.name}
                className="land-stack__pill"
                style={{ "--pill-color": t.color }}
              >
                <span className="land-stack__pill-dot" />
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── API section ── */}
      <section className="land-api" id="api">
        <div className="land-section-inner">
          <div className="land-api__split">
            <div className="land-api__text">
              <span className="land-section-tag">API</span>
              <h2 className="land-section-title">RESTful & versioned</h2>
              <p className="land-section-sub">
                All endpoints follow REST conventions with proper HTTP status
                codes, consistent JSON responses, and full Swagger
                documentation.
              </p>
              <div className="land-api__routes">
                {[
                  {
                    method: "POST",
                    path: "/auth/register",
                    desc: "Create account",
                  },
                  {
                    method: "POST",
                    path: "/auth/login",
                    desc: "Login, get tokens",
                  },
                  {
                    method: "GET",
                    path: "/tasks",
                    desc: "List & filter tasks",
                  },
                  { method: "POST", path: "/tasks", desc: "Create task" },
                  {
                    method: "GET",
                    path: "/admin/stats",
                    desc: "Admin analytics",
                  },
                ].map((r) => (
                  <div key={r.path} className="land-api__route">
                    <span
                      className={`land-api__method land-api__method--${r.method.toLowerCase()}`}
                    >
                      {r.method}
                    </span>
                    <code className="land-api__path">{r.path}</code>
                    <span className="land-api__desc">{r.desc}</span>
                  </div>
                ))}
              </div>
              <a
                href="http://localhost:5000/api/v1/docs"
                target="_blank"
                rel="noreferrer"
                className="land-hero__btn-primary"
                style={{ display: "inline-flex", marginTop: "1.5rem" }}
              >
                Open Swagger UI
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
            <div className="land-api__security">
              <h3 className="land-api__security-title">Security Features</h3>
              {[
                "HTTP-only cookies (XSS-proof)",
                "Refresh token rotation",
                "Token reuse detection",
                "Multi-device sessions (5 max)",
                "Helmet security headers",
                "Rate limiting (200/15min)",
                "NoSQL injection prevention",
                "bcrypt password hashing (12 rounds)",
                "Input validation on all endpoints",
              ].map((item) => (
                <div key={item} className="land-api__sec-item">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle
                      cx="7"
                      cy="7"
                      r="6"
                      stroke="var(--green)"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M4.5 7l2 2 3-3"
                      stroke="var(--green)"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="land-cta">
        <div className="land-cta__glow" />
        <div className="land-cta__content">
          <h2 className="land-cta__title">Ready to get started?</h2>
          <p className="land-cta__sub">
            Create your account and start managing tasks in seconds.
          </p>
          <div className="land-cta__actions">
            <Link to="/register" className="land-hero__btn-primary">
              Create free account
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link to="/login" className="land-nav__login">
              Sign in instead
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="land-footer">
        <div className="land-footer__inner">
          <div className="land-footer__brand">
            <div className="land-nav__logo">
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 2L24 8V20L14 26L4 20V8L14 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M14 7L20 10.5V17.5L14 21L8 17.5V10.5L14 7Z"
                  fill="currentColor"
                  opacity="0.4"
                />
                <circle cx="14" cy="14" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <span className="land-nav__name">TaskFlow</span>
          </div>
          <p className="land-footer__copy">
            © {new Date().getFullYear()} TaskFlow · Built with Node.js, Express,
            MongoDB & React
          </p>
          <div className="land-footer__links">
            <Link to="/login" className="land-nav__link">
              Login
            </Link>
            <Link to="/register" className="land-nav__link">
              Register
            </Link>
            <a
              href="http://localhost:5000/api/v1/docs"
              target="_blank"
              rel="noreferrer"
              className="land-nav__link"
            >
              API Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
