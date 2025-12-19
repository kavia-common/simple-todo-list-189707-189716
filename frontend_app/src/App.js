import React, { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3001";

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function TaskItem({ task, onToggle, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  const save = () => {
    onSave(task.id, { title, description, completed: task.completed }).then(() =>
      setEditing(false)
    );
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 12,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label={`Toggle ${task.title}`}
      />
      <div style={{ flex: 1 }}>
        {editing ? (
          <>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                marginBottom: 8,
              }}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={3}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #e5e7eb",
              }}
            />
          </>
        ) : (
          <>
            <div
              style={{
                fontWeight: 600,
                color: "#111827",
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.title}
            </div>
            {task.description ? (
              <div style={{ color: "#6b7280", marginTop: 4 }}>{task.description}</div>
            ) : null}
          </>
        )}
      </div>
      {editing ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={save}
            style={{
              background: "#06b6d4",
              color: "white",
              border: 0,
              borderRadius: 6,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            style={{
              background: "#e5e7eb",
              color: "#111827",
              border: 0,
              borderRadius: 6,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setEditing(true)}
            style={{
              background: "#3b82f6",
              color: "white",
              border: 0,
              borderRadius: 6,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{
              background: "#EF4444",
              color: "white",
              border: 0,
              borderRadius: 6,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchTasks = async () => {
    const data = await api("/tasks");
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks().catch((e) => console.error(e));
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const created = await api("/tasks", {
      method: "POST",
      body: JSON.stringify({ title: title.trim(), description: description.trim() || null }),
    });
    setTasks((prev) => [created, ...prev]);
    setTitle("");
    setDescription("");
  };

  const toggleTask = async (task) => {
    const updated = await api(`/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify({ completed: !task.completed }),
    });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTask = async (id) => {
    await api(`/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const saveTask = async (id, payload) => {
    const updated = await api(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, color: "#111827" }}>Todo List</h1>
        <p style={{ color: "#64748b", marginTop: 6 }}>Add, edit, delete and mark tasks complete.</p>
      </header>

      <form
        onSubmit={addTask}
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          display: "grid",
          gap: 8,
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          aria-label="Task title"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #e5e7eb",
          }}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={3}
          aria-label="Task description"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #e5e7eb",
          }}
        />
        <button
          type="submit"
          style={{
            background: "#3b82f6",
            color: "white",
            border: 0,
            borderRadius: 6,
            padding: "10px 14px",
            cursor: "pointer",
            width: "fit-content",
          }}
        >
          Add Task
        </button>
      </form>

      <div style={{ display: "grid", gap: 10 }}>
        {tasks.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No tasks yet. Add your first task above.</div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onSave={saveTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
