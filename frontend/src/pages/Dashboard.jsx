import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import "../css/Dashboard.css";

// ── Constants ──────────────────────────────────────────────────
const STATUSES = ["todo", "in-progress", "review", "done"];
const PRIORITIES = ["low", "medium", "high", "critical"];

const STATUS_META = {
  todo: {
    label: "Todo",
    color: "#7a8ba8",
    bg: "rgba(122,139,168,0.1)",
    dot: "#7a8ba8",
  },
  "in-progress": {
    label: "In Progress",
    color: "#4f8ef7",
    bg: "rgba(79,142,247,0.1)",
    dot: "#4f8ef7",
  },
  review: {
    label: "Review",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    dot: "#fbbf24",
  },
  done: {
    label: "Done",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    dot: "#34d399",
  },
};

const PRIORITY_META = {
  low: { label: "Low", color: "#7a8ba8", icon: "▽" },
  medium: { label: "Medium", color: "#4f8ef7", icon: "◇" },
  high: { label: "High", color: "#fbbf24", icon: "△" },
  critical: { label: "Critical", color: "#f87171", icon: "▲" },
};

const ROLE_META = {
  user: { color: "#4f8ef7", bg: "rgba(79,142,247,0.12)" },
  moderator: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  admin: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
};

const EMPTY_FORM = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  tags: "",
  dueDate: "",
};

// ── Helpers ────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === "done") return false;
  return new Date(dueDate) < new Date();
}

// ── Sub-components ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META["todo"];
  return (
    <span className="status-badge" style={{ color: m.color, background: m.bg }}>
      <span className="status-dot" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const m = PRIORITY_META[priority] || PRIORITY_META["medium"];
  return (
    <span className="priority-badge" style={{ color: m.color }}>
      {m.icon} {m.label}
    </span>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast toast--${toast.type} animate-fadeIn`}>
      {toast.type === "error" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 5v4M8 11v.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M5 8l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {toast.msg}
    </div>
  );
}

// ── Task Card ──────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, isElevated }) {
  const [deleting, setDeleting] = useState(false);
  const overdue = isOverdue(task.dueDate, task.status);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(task._id);
    setDeleting(false);
  };

  return (
    <div
      className={`task-card animate-fadeUp ${deleting ? "task-card--deleting" : ""}`}
    >
      <div className="task-card__header">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      <h3 className="task-card__title">{task.title}</h3>

      {task.description && (
        <p className="task-card__desc">{task.description}</p>
      )}

      {task.tags?.length > 0 && (
        <div className="task-card__tags">
          {task.tags.map((tag) => (
            <span key={tag} className="task-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-card__meta">
        {task.dueDate && (
          <span className={`task-due ${overdue ? "task-due--overdue" : ""}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect
                x="1"
                y="2"
                width="10"
                height="9"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M4 1v2M8 1v2M1 5h10"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            {overdue ? "Overdue · " : ""}
            {formatDate(task.dueDate)}
          </span>
        )}

        {task.assignedTo && (
          <span className="task-assignee">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle
                cx="6"
                cy="4"
                r="2"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M1 10c0-2.21 2.239-4 5-4s5 1.79 5 4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            {task.assignedTo.name}
          </span>
        )}
      </div>

      <div className="task-card__actions">
        <button
          className="task-btn task-btn--edit"
          onClick={() => onEdit(task)}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M9 2l2 2L4 11H2V9L9 2z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          Edit
        </button>
        <button
          className="task-btn task-btn--delete"
          onClick={handleDelete}
          disabled={deleting}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M2 4h9M5 4V2.5h3V4M10 4l-.5 6.5H3.5L3 4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {deleting ? "…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

// ── Task Form Modal ────────────────────────────────────────────
function TaskModal({ task, onClose, onSaved, isElevated }) {
  const [form, setForm] = useState(
    task
      ? {
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          tags: task.tags?.join(", ") || "",
          dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
        }
      : { ...EMPTY_FORM },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || form.title.trim().length < 3) {
      return setError("Title must be at least 3 characters.");
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        dueDate: form.dueDate || null,
      };
      if (task) {
        await API.put(`/tasks/${task._id}`, payload);
      } else {
        await API.post("/tasks", payload);
      }
      onSaved(task ? "Task updated!" : "Task created!");
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(
        msgs?.length
          ? msgs[0]
          : err.response?.data?.message || "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  const field = (key, val, setter) => ({
    value: val,
    onChange: (e) => setter({ ...form, [key]: e.target.value }),
  });

  return (
    <div
      className="modal-overlay animate-fadeIn"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="modal animate-scaleIn">
        <div className="modal__header">
          <h2 className="modal__title">{task ? "Edit Task" : "New Task"}</h2>
          <button className="modal__close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="modal__error animate-fadeIn">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle
                cx="7.5"
                cy="7.5"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M7.5 4.5v3.5M7.5 10.5v.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="modal__form">
          <div className="mfield">
            <label className="mlabel">
              Title <span className="mreq">*</span>
            </label>
            <input
              className="minput"
              placeholder="Task title (min 3 chars)"
              {...field("title", form.title, setForm)}
              autoFocus
              maxLength={120}
            />
          </div>

          <div className="mfield">
            <label className="mlabel">Description</label>
            <textarea
              className="minput minput--textarea"
              placeholder="Optional details…"
              {...field("description", form.description, setForm)}
              maxLength={1000}
            />
          </div>

          <div className="mfield-row">
            <div className="mfield">
              <label className="mlabel">Status</label>
              <select
                className="minput"
                {...field("status", form.status, setForm)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mfield">
              <label className="mlabel">Priority</label>
              <select
                className="minput"
                {...field("priority", form.priority, setForm)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mfield-row">
            <div className="mfield">
              <label className="mlabel">
                Tags <span className="mhint">(comma-separated)</span>
              </label>
              <input
                className="minput"
                placeholder="design, backend, urgent"
                {...field("tags", form.tags, setForm)}
              />
            </div>

            <div className="mfield">
              <label className="mlabel">Due Date</label>
              <input
                className="minput"
                type="date"
                {...field("dueDate", form.dueDate, setForm)}
              />
            </div>
          </div>

          <div className="modal__actions">
            <button
              type="button"
              className="mbtn mbtn--cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="mbtn mbtn--save" disabled={saving}>
              {saving ? (
                <>
                  <span className="btn-spinner" />
                  Saving…
                </>
              ) : task ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Stats widget ───────────────────────────────────────────────
function StatsBar({ stats }) {
  const items = [
    { key: "total", label: "Total", val: stats.total, color: "#7a8ba8" },
    {
      key: "todo",
      label: "Todo",
      val: stats.byStatus?.todo || 0,
      color: STATUS_META["todo"].dot,
    },
    {
      key: "in-progress",
      label: "In Progress",
      val: stats.byStatus?.["in-progress"] || 0,
      color: STATUS_META["in-progress"].dot,
    },
    {
      key: "review",
      label: "Review",
      val: stats.byStatus?.review || 0,
      color: STATUS_META["review"].dot,
    },
    {
      key: "done",
      label: "Done",
      val: stats.byStatus?.done || 0,
      color: STATUS_META["done"].dot,
    },
  ];

  return (
    <div className="stats-bar">
      {items.map((item, i) => (
        <div
          key={item.key}
          className="stat-item animate-fadeUp"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <span className="stat-val" style={{ color: item.color }}>
            {item.val}
          </span>
          <span className="stat-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byPriority: {},
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const isElevated = ["admin", "moderator"].includes(user?.role);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get("/tasks/stats");
      setStats(res.data.data);
    } catch {
      // non-critical
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (searchQ.trim()) params.search = searchQ.trim();
      const res = await API.get("/tasks", { params });
      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      notify("Failed to load tasks.", "error");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, searchQ, page]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterPriority, searchQ]);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      notify("Task deleted.");
      fetchTasks();
      fetchStats();
    } catch (err) {
      notify(err.response?.data?.message || "Delete failed.", "error");
    }
  };

  const handleSaved = (msg) => {
    notify(msg);
    setShowModal(false);
    setEditTask(null);
    fetchTasks();
    fetchStats();
  };

  const openCreate = () => {
    setEditTask(null);
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setShowModal(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const rm = ROLE_META[user?.role] || ROLE_META.user;

  return (
    <div className="dash">
      {/* ── Navbar ── */}
      <header className="navbar">
        <div className="navbar__brand">
          <div className="navbar__logo">
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
          <span className="navbar__name">TaskFlow</span>
        </div>

        <div className="navbar__right">
          <div className="navbar__user">
            <div className="navbar__avatar">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="navbar__userinfo">
              <span className="navbar__username">{user?.name}</span>
              <span
                className="navbar__role"
                style={{ color: rm.color, background: rm.bg }}
              >
                {user?.role}
              </span>
            </div>
          </div>
          <button className="navbar__logout" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M5 7.5h8M10 5l3 2.5-3 2.5M8 3H3a1 1 0 00-1 1v7a1 1 0 001 1h5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* ── Toast ── */}
      <Toast toast={toast} />

      <main className="dash__main">
        {/* ── Page header ── */}
        <div className="dash__heading">
          <div>
            <h1 className="dash__title">
              Good{" "}
              {new Date().getHours() < 12
                ? "morning"
                : new Date().getHours() < 18
                  ? "afternoon"
                  : "evening"}
              ,{" "}
              <span className="dash__title--name">
                {user?.name?.split(" ")[0]}
              </span>
            </h1>
            <p className="dash__subtitle">Here's what's on your plate today.</p>
          </div>
          <button className="new-task-btn" onClick={openCreate}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            New Task
          </button>
        </div>

        {/* ── Stats ── */}
        <StatsBar stats={stats} />

        {/* ── Filters ── */}
        <div className="filters">
          <div className="search-wrap">
            <svg
              className="search-icon"
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="5"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M10.5 10.5l3 3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <input
              className="search-input"
              placeholder="Search tasks…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
            {searchQ && (
              <button className="search-clear" onClick={() => setSearchQ("")}>
                ×
              </button>
            )}
          </div>

          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </select>

          {(filterStatus || filterPriority || searchQ) && (
            <button
              className="filter-clear"
              onClick={() => {
                setFilterStatus("");
                setFilterPriority("");
                setSearchQ("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Task grid ── */}
        {loading ? (
          <div className="loading-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-card"
                style={{ animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect
                  x="5"
                  y="8"
                  width="30"
                  height="26"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M13 16h14M13 22h10M13 28h6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="30"
                  cy="10"
                  r="6"
                  fill="var(--bg-surface)"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M27 10h6M30 7v6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="empty-state__title">No tasks found</h3>
            <p className="empty-state__sub">
              {filterStatus || filterPriority || searchQ
                ? "Try adjusting your filters"
                : "Create your first task to get started"}
            </p>
            {!filterStatus && !filterPriority && !searchQ && (
              <button className="empty-state__btn" onClick={openCreate}>
                Create a task
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="task-grid">
              {tasks.map((task, i) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isElevated={isElevated}
                  style={{ animationDelay: `${i * 0.04}s` }}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!pagination.hasPrev}
                >
                  ← Prev
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Modal ── */}
      {showModal && (
        <TaskModal
          task={editTask}
          onClose={() => {
            setShowModal(false);
            setEditTask(null);
          }}
          onSaved={handleSaved}
          isElevated={isElevated}
        />
      )}
    </div>
  );
}
