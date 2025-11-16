-- Initial schema for the minibus application

-- Announcements table
CREATE TABLE announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pricelists table
CREATE TABLE pricelists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    content TEXT NOT NULL, -- Could be JSON or just text/markdown
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Schedules table
CREATE TABLE schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER NOT NULL,
    departure_time TEXT NOT NULL,
    days_of_week TEXT NOT NULL, -- e.g., "Mon,Tue,Wed,Thu,Fri"
    notes TEXT,
    FOREIGN KEY (route_id) REFERENCES routes (id)
);

-- Indexes for performance
CREATE INDEX idx_schedules_route_id ON schedules (route_id);
