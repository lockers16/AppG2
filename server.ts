import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("grades.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    blocked BOOLEAN DEFAULT FALSE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    weight INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS grades (
    student_id TEXT,
    task_id INTEGER,
    grade INTEGER,
    reported BOOLEAN DEFAULT FALSE,
    reported_date TEXT,
    PRIMARY KEY (student_id, task_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  // Add Manager
  db.prepare("INSERT INTO users (id, password, name, birth_date, role) VALUES (?, ?, ?, ?, ?)").run(
    "admin", "admin123", "ישראל ישראלי", "01/01/1980", "manager"
  );

  // Add Students
  const students = [
    ["123456789", "pass123", "אברהם כהן", "2000-05-12"],
    ["987654321", "pass123", "שרה לוי", "2001-03-20"],
    ["111222333", "pass123", "יצחק מזרחי", "1999-04-05"],
    ["444555666", "pass123", "רבקה אהרוני", "2002-04-25"]
  ];
  const insertUser = db.prepare("INSERT INTO users (id, password, name, birth_date, role) VALUES (?, ?, ?, ?, 'student')");
  students.forEach(s => insertUser.run(...s));

  // Add Tasks
  const tasks = [
    ["מבחן אמצע סמסטר", 30],
    ["עבודת בית 1: מבוא", 5],
    ["פרויקט מחקר שלב א׳", 15],
    ["בוחן פתע: הגדרות יסוד", 5],
    ["סיכום קריאה שבועי", 5],
    ["עבודת בית 2: ניתוח נתונים", 10],
    ["סמינריון אמצע", 10],
    ["עבודת גמר - הגשה ראשונית", 10],
    ["מבחן סופי (סיכום)", 10]
  ];
  const insertTask = db.prepare("INSERT INTO tasks (name, weight) VALUES (?, ?)");
  tasks.forEach(t => insertTask.run(...t));

  // Add some initial grades
  const allStudents = db.prepare("SELECT id FROM users WHERE role = 'student'").all() as { id: string }[];
  const allTasks = db.prepare("SELECT id FROM tasks").all() as { id: number }[];
  
  const insertGrade = db.prepare("INSERT INTO grades (student_id, task_id, grade, reported, reported_date) VALUES (?, ?, ?, ?, ?)");
  
  allStudents.forEach(student => {
    allTasks.forEach((task, index) => {
      // Report first 7 tasks
      if (index < 7) {
        const randomGrade = Math.floor(Math.random() * 25) + 75; // 75-100
        insertGrade.run(student.id, task.id, randomGrade, 1, "2024-05-15");
      } else {
        insertGrade.run(student.id, task.id, null, 0, null);
      }
    });
  });

  // Initial Settings
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("support_contact", "support@example.com\n050-1234567");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("login_bg_url", "https://picsum.photos/seed/library/1920/1080");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("header_bg_url", "https://picsum.photos/seed/study/800/400");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("primary_color", "#1c74e9");
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all() as { key: string, value: string }[];
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsMap);
  });

  app.post("/api/settings", (req, res) => {
    const { support_contact, login_bg_url, header_bg_url, primary_color } = req.body;
    if (support_contact !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'support_contact'").run(support_contact);
    if (login_bg_url !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'login_bg_url'").run(login_bg_url);
    if (header_bg_url !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'header_bg_url'").run(header_bg_url);
    if (primary_color !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'primary_color'").run(primary_color);
    res.json({ success: true });
  });

  app.post("/api/login", (req, res) => {
    const { id, password, birthDate } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ? AND password = ?").get(id, password) as any;
    
    if (user) {
      if (user.blocked) {
        return res.status(403).json({ error: "הגישה למערכת חסומה עבורך. פנה למנהל." });
      }
      // For students, also check birth date
      if (user.role === 'student' && user.birth_date !== birthDate) {
        return res.status(401).json({ error: "פרטים שגויים" });
      }
      res.json({ id: user.id, name: user.name, role: user.role });
    } else {
      res.status(401).json({ error: "פרטים שגויים" });
    }
  });

  app.get("/api/student/:id", (req, res) => {
    const studentId = req.params.id;
    const tasks = db.prepare(`
      SELECT t.id, t.name, t.weight, g.grade, g.reported, g.reported_date
      FROM tasks t
      LEFT JOIN grades g ON t.id = g.task_id AND g.student_id = ?
    `).all(studentId);
    res.json(tasks);
  });

  app.get("/api/manager/students", (req, res) => {
    const students = db.prepare("SELECT id, name, password, birth_date, blocked FROM users WHERE role = 'student'").all() as any[];
    const tasks = db.prepare("SELECT id, name, weight FROM tasks").all() as any[];
    
    const data = students.map(student => {
      const grades = db.prepare("SELECT task_id, grade FROM grades WHERE student_id = ?").all(student.id) as any[];
      const gradeMap: any = {};
      grades.forEach(g => {
        gradeMap[g.task_id] = g.grade;
      });
      return { ...student, grades: gradeMap };
    });
    
    res.json({ students: data, tasks });
  });

  app.post("/api/manager/update-grades", (req, res) => {
    const { updates } = req.body; // Array of { studentId, taskId, grade }
    const updateStmt = db.prepare("UPDATE grades SET grade = ?, reported = 1, reported_date = ? WHERE student_id = ? AND task_id = ?");
    const today = new Date().toISOString().split('T')[0];

    const transaction = db.transaction((updates) => {
      for (const update of updates) {
        updateStmt.run(update.grade, today, update.studentId, update.taskId);
      }
    });

    try {
      transaction(updates);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update grades" });
    }
  });

  app.post("/api/manager/add-student", (req, res) => {
    const { id, name, password, birthDate } = req.body;
    try {
      db.prepare("INSERT INTO users (id, name, password, birth_date, role) VALUES (?, ?, ?, ?, 'student')").run(id, name, password, birthDate);
      
      // Initialize grades for the new student
      const tasks = db.prepare("SELECT id FROM tasks").all() as { id: number }[];
      const insertGrade = db.prepare("INSERT INTO grades (student_id, task_id, grade, reported) VALUES (?, ?, null, 0)");
      tasks.forEach(t => insertGrade.run(id, t.id));
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Student ID already exists" });
    }
  });

  app.post("/api/manager/update-student", (req, res) => {
    const { id, name, password, birthDate, blocked, originalId } = req.body;
    try {
      db.prepare("UPDATE users SET id = ?, name = ?, password = ?, birth_date = ?, blocked = ? WHERE id = ?").run(id, name, password, birthDate, blocked ? 1 : 0, originalId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to update student" });
    }
  });

  app.delete("/api/manager/student/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  app.post("/api/manager/update-task", (req, res) => {
    const { id, name, weight } = req.body;
    try {
      db.prepare("UPDATE tasks SET name = ?, weight = ? WHERE id = ?").run(name, weight, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
