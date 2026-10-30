const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const LOCAL_DB_FILE = path.join(__dirname, '../../local-db.json');
const TMP_DB_FILE = path.join(os.tmpdir(), 'kazilink-local-db.json');
let inMemoryDB = null;
let lastCleanupTime = 0;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // Run auto-check every 10 minutes

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

// Clean production-ready seed: ONLY the Admin user, zero fake/test jobs or demo users
function getInitialSeed() {
  const now = new Date().toISOString();
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kazilink.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'KaziLink#Melki$2026!';
  const adminHash = bcrypt.hashSync(adminPass, 10);

  return {
    users: [
      {
        id: 'adm-main-001',
        email: adminEmail,
        phone: '0682847653',
        passwordHash: adminHash,
        fullName: 'KaziLink Admin',
        role: 'ADMIN',
        locationCity: 'Dar es Salaam',
        isVerified: true,
        isActive: true,
        lastActiveAt: now,
        refreshToken: null,
        createdAt: now,
        updatedAt: now
      }
    ],
    employerProfiles: [],
    workerProfiles: [],
    workerSkills: [],
    jobs: [],
    applications: [],
    transactions: [],
    ratings: [],
    disputes: []
  };
}

function runAutoCleanup(db, forceNow = false) {
  const now = Date.now();
  if (!forceNow && now - lastCleanupTime < CLEANUP_INTERVAL_MS) {
    return null;
  }
  lastCleanupTime = now;

  if (!db) return null;
  if (!db.disputes) db.disputes = [];
  if (!db.jobs) db.jobs = [];
  if (!db.applications) db.applications = [];
  if (!db.transactions) db.transactions = [];
  if (!db.ratings) db.ratings = [];

  let expiredJobsRemoved = 0;
  let completedJobsArchived = 0;
  let oldApplicationsRemoved = 0;
  let oldTransactionsRemoved = 0;
  let resolvedDisputesRemoved = 0;
  let changed = false;

  // Find jobs with open/in-review disputes so we never delete an active dispute's job
  const activeDisputeJobIds = new Set(
    db.disputes
      .filter(d => d.status !== 'RESOLVED')
      .map(d => d.jobId)
  );

  // Find jobs with active in-progress transactions
  const activeTxJobIds = new Set(
    db.transactions
      .filter(t => t.status !== 'RELEASED' && t.status !== 'REFUNDED')
      .map(t => t.jobId)
  );

  const jobsToRemove = new Set();

  for (const job of db.jobs) {
    if (activeDisputeJobIds.has(job.id)) continue;

    // 1. Expired uncompleted jobs older than 7 days
    if (
      (job.status === 'ACTIVE' || job.status === 'DRAFT' || job.status === 'CANCELLED') &&
      !activeTxJobIds.has(job.id) &&
      (job.workersAccepted || 0) === 0
    ) {
      const refDateStr = job.applicationDeadline || job.jobDate || job.createdAt;
      const refTime = refDateStr ? new Date(refDateStr).getTime() : now;
      if (!isNaN(refTime) && now - refTime > SEVEN_DAYS_MS) {
        jobsToRemove.add(job.id);
        expiredJobsRemoved++;
        changed = true;
        continue;
      }
    }

    // 2. Completed jobs older than 30 days (WorkerProfile stats are preserved on workerProfiles)
    if (job.status === 'COMPLETED' && !activeTxJobIds.has(job.id)) {
      const completedDateStr = job.updatedAt || job.createdAt;
      const completedTime = completedDateStr ? new Date(completedDateStr).getTime() : now;
      if (!isNaN(completedTime) && now - completedTime > THIRTY_DAYS_MS) {
        jobsToRemove.add(job.id);
        completedJobsArchived++;
        changed = true;
      }
    }
  }

  if (jobsToRemove.size > 0) {
    db.jobs = db.jobs.filter(j => !jobsToRemove.has(j.id));

    const prevApps = db.applications.length;
    db.applications = db.applications.filter(a => !jobsToRemove.has(a.jobId));
    oldApplicationsRemoved += prevApps - db.applications.length;

    const prevTxs = db.transactions.length;
    db.transactions = db.transactions.filter(t => !jobsToRemove.has(t.jobId));
    oldTransactionsRemoved += prevTxs - db.transactions.length;

    db.ratings = db.ratings.filter(r => !jobsToRemove.has(r.jobId));
  }

  // Also clean up any standalone RELEASED transactions older than 30 days
  const prevStandaloneTxs = db.transactions.length;
  db.transactions = db.transactions.filter(t => {
    if (t.status !== 'RELEASED') return true;
    if (activeDisputeJobIds.has(t.jobId)) return true;
    const txTime = new Date(t.updatedAt || t.createdAt).getTime();
    return isNaN(txTime) || now - txTime <= THIRTY_DAYS_MS;
  });
  if (db.transactions.length !== prevStandaloneTxs) {
    oldTransactionsRemoved += prevStandaloneTxs - db.transactions.length;
    changed = true;
  }

  // 3. Clean up RESOLVED disputes older than 30 days
  const prevDisputes = db.disputes.length;
  db.disputes = db.disputes.filter(d => {
    if (d.status !== 'RESOLVED') return true;
    const dTime = new Date(d.updatedAt || d.createdAt).getTime();
    return isNaN(dTime) || now - dTime <= THIRTY_DAYS_MS;
  });
  if (db.disputes.length !== prevDisputes) {
    resolvedDisputesRemoved += prevDisputes - db.disputes.length;
    changed = true;
  }

  if (changed) {
    saveDB(db);
  }

  return {
    expiredJobsRemoved,
    completedJobsArchived,
    oldApplicationsRemoved,
    oldTransactionsRemoved,
    resolvedDisputesRemoved,
    cleanedAt: new Date(now).toISOString()
  };
}

function loadDB() {
  try {
    let parsed = null;
    if (fs.existsSync(TMP_DB_FILE)) {
      parsed = JSON.parse(fs.readFileSync(TMP_DB_FILE, 'utf8'));
    } else if (fs.existsSync(LOCAL_DB_FILE)) {
      parsed = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf8'));
    } else if (inMemoryDB) {
      parsed = inMemoryDB;
    } else {
      parsed = getInitialSeed();
      saveDB(parsed);
    }
    if (!parsed.disputes) parsed.disputes = [];
    runAutoCleanup(parsed, false);
    return parsed;
  } catch (e) {
    if (!inMemoryDB) inMemoryDB = getInitialSeed();
    return inMemoryDB;
  }
}

function getStorageMetrics() {
  const db = loadDB();
  const serialized = JSON.stringify(db);
  const sizeBytes = Buffer.byteLength(serialized, 'utf8');
  return {
    sizeBytes,
    sizeKB: Number((sizeBytes / 1024).toFixed(2)),
    counts: {
      users: (db.users || []).length,
      jobs: (db.jobs || []).length,
      applications: (db.applications || []).length,
      transactions: (db.transactions || []).length,
      disputes: (db.disputes || []).length
    },
    retentionPolicy: {
      expiredUncompletedJobsDays: 7,
      completedJobsAndTransactionsDays: 30,
      resolvedDisputesDays: 30
    }
  };
}

function saveDB(data) {
  inMemoryDB = data;
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    try {
      fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (_) {}
  }
}

function matchesWhere(item, where) {
  if (!where || Object.keys(where).length === 0) return true;
  for (const [key, cond] of Object.entries(where)) {
    if (key === 'OR' && Array.isArray(cond)) {
      if (!cond.some(sub => matchesWhere(item, sub))) return false;
      continue;
    }
    if (cond && typeof cond === 'object' && !(cond instanceof Date)) {
      if ('in' in cond && Array.isArray(cond.in)) {
        if (!cond.in.includes(item[key])) return false;
        continue;
      }
      if ('notIn' in cond && Array.isArray(cond.notIn)) {
        if (cond.notIn.includes(item[key])) return false;
        continue;
      }
    }
    if (item[key] !== cond) return false;
  }
  return true;
}

function attachUserRelations(db, user) {
  if (!user) return null;
  const copy = { ...user };
  const ep = db.employerProfiles.find(p => p.userId === user.id) || null;
  const wp = db.workerProfiles.find(p => p.userId === user.id) || null;
  if (wp) {
    wp.verifiedSkills = db.workerSkills.filter(s => s.workerProfileId === wp.id);
  }
  copy.employerProfile = ep;
  copy.workerProfile = wp;
  return copy;
}

function attachJobRelations(db, job, include) {
  if (!job) return null;
  const copy = { ...job };
  if (include?.employer) {
    const emp = db.users.find(u => u.id === job.employerId);
    copy.employer = emp ? attachUserRelations(db, emp) : null;
  }
  if (include?.applications) {
    let apps = db.applications.filter(a => a.jobId === job.id);
    if (include.applications.where) {
      apps = apps.filter(a => matchesWhere(a, include.applications.where));
    }
    apps = apps.map(a => {
      const worker = db.users.find(u => u.id === a.workerId);
      return {
        ...a,
        worker: worker ? attachUserRelations(db, worker) : null
      };
    });
    copy.applications = apps;
  }
  return copy;
}

function attachTxRelations(db, tx, include) {
  if (!tx) return null;
  const copy = { ...tx };
  if (include?.job) {
    copy.job = db.jobs.find(j => j.id === tx.jobId) || null;
  }
  if (include?.employer) {
    copy.employer = db.users.find(u => u.id === tx.employerId) || null;
  }
  if (include?.worker) {
    copy.worker = db.users.find(u => u.id === tx.workerId) || null;
  }
  return copy;
}

function attachDisputeRelations(db, d) {
  if (!d) return null;
  const copy = { ...d };
  const reporter = db.users.find(u => u.id === d.reporterId) || null;
  const job = db.jobs.find(j => j.id === d.jobId) || null;
  copy.reporter = reporter
    ? { id: reporter.id, fullName: reporter.fullName, email: reporter.email, phone: reporter.phone, role: reporter.role }
    : null;
  if (job) {
    const employer = db.users.find(u => u.id === job.employerId) || null;
    const jobTxs = db.transactions
      .filter(t => t.jobId === job.id)
      .map(t => {
        const w = db.users.find(u => u.id === t.workerId) || null;
        return {
          id: t.id,
          status: t.status,
          amount: t.amount,
          worker: w ? { id: w.id, fullName: w.fullName, email: w.email, phone: w.phone } : null
        };
      });
    copy.job = {
      ...job,
      employer: employer ? { id: employer.id, fullName: employer.fullName, email: employer.email, phone: employer.phone } : null,
      transactions: jobTxs
    };
  } else {
    copy.job = null;
  }
  return copy;
}

class LocalPrismaClient {
  constructor() {
    loadDB();
  }

  get user() {
    return {
      findUnique: async ({ where, include, select } = {}) => {
        const db = loadDB();
        const found = db.users.find(u => matchesWhere(u, where));
        return attachUserRelations(db, found, include || select);
      },
      findFirst: async ({ where, include, select } = {}) => {
        const db = loadDB();
        const found = db.users.find(u => matchesWhere(u, where));
        return attachUserRelations(db, found, include || select);
      },
      findMany: async ({ where } = {}) => {
        const db = loadDB();
        return db.users
          .filter(u => matchesWhere(u, where))
          .map(u => attachUserRelations(db, u))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      },
      count: async ({ where } = {}) => {
        const db = loadDB();
        return db.users.filter(u => matchesWhere(u, where)).length;
      },
      create: async ({ data }) => {
        const db = loadDB();
        const now = new Date().toISOString();
        const newUser = {
          id: uuid(),
          isVerified: false,
          isActive: true,
          lastActiveAt: now,
          refreshToken: null,
          ...data,
          createdAt: now,
          updatedAt: now
        };
        db.users.push(newUser);
        saveDB(db);
        return newUser;
      },
      update: async ({ where, data }) => {
        const db = loadDB();
        const idx = db.users.findIndex(u => matchesWhere(u, where));
        if (idx === -1) throw new Error('User not found');
        db.users[idx] = { ...db.users[idx], ...data, updatedAt: new Date().toISOString() };
        saveDB(db);
        return attachUserRelations(db, db.users[idx]);
      }
    };
  }

  get employerProfile() {
    return {
      findUnique: async ({ where }) => {
        const db = loadDB();
        return db.employerProfiles.find(p => matchesWhere(p, where)) || null;
      },
      create: async ({ data }) => {
        const db = loadDB();
        const now = new Date().toISOString();
        const item = { id: uuid(), totalJobsPosted: 0, ...data, createdAt: now, updatedAt: now };
        db.employerProfiles.push(item);
        saveDB(db);
        return item;
      },
      update: async ({ where, data }) => {
        const db = loadDB();
        const idx = db.employerProfiles.findIndex(p => matchesWhere(p, where));
        if (idx === -1) return null;
        db.employerProfiles[idx] = { ...db.employerProfiles[idx], ...data, updatedAt: new Date().toISOString() };
        saveDB(db);
        return db.employerProfiles[idx];
      }
    };
  }

  get workerProfile() {
    return {
      findUnique: async ({ where }) => {
        const db = loadDB();
        const wp = db.workerProfiles.find(p => matchesWhere(p, where)) || null;
        if (wp) wp.verifiedSkills = db.workerSkills.filter(s => s.workerProfileId === wp.id);
        return wp;
      },
      create: async ({ data }) => {
        const db = loadDB();
        const now = new Date().toISOString();
        const item = {
          id: uuid(),
          skills: [],
          availabilityDays: [],
          averageRating: 5.0,
          totalJobsCompleted: 0,
          totalEarned: 0,
          availabilityStatus: 'AVAILABLE_NOW',
          ...data,
          createdAt: now,
          updatedAt: now
        };
        db.workerProfiles.push(item);
        saveDB(db);
        return item;
      },
      update: async ({ where, data }) => {
        const db = loadDB();
        const idx = db.workerProfiles.findIndex(p => matchesWhere(p, where));
        if (idx === -1) return null;
        db.workerProfiles[idx] = { ...db.workerProfiles[idx], ...data, updatedAt: new Date().toISOString() };
        saveDB(db);
        return db.workerProfiles[idx];
      }
    };
  }

  get workerSkill() {
    return {
      create: async ({ data }) => {
        const db = loadDB();
        const exists = db.workerSkills.find(
          s => s.workerProfileId === data.workerProfileId && s.name.toLowerCase() === data.name.toLowerCase()
        );
        if (exists) throw new Error('Skill already exists');
        const item = { id: uuid(), isVerified: false, ...data, createdAt: new Date().toISOString() };
        db.workerSkills.push(item);
        saveDB(db);
        return item;
      }
    };
  }

  get job() {
    return {
      findUnique: async ({ where, include } = {}) => {
        const db = loadDB();
        const found = db.jobs.find(j => matchesWhere(j, where));
        return attachJobRelations(db, found, include);
      },
      findMany: async ({ where, include } = {}) => {
        const db = loadDB();
        return db.jobs
          .filter(j => matchesWhere(j, where))
          .map(j => attachJobRelations(db, j, include))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      },
      count: async ({ where } = {}) => {
        const db = loadDB();
        return db.jobs.filter(j => matchesWhere(j, where)).length;
      },
      create: async ({ data }) => {
        const db = loadDB();
        const now = new Date().toISOString();
        const item = {
          id: uuid(),
          workersAccepted: 0,
          status: 'ACTIVE',
          ...data,
          jobDate: data.jobDate instanceof Date ? data.jobDate.toISOString() : data.jobDate,
          applicationDeadline: data.applicationDeadline instanceof Date ? data.applicationDeadline.toISOString() : data.applicationDeadline,
          createdAt: now,
          updatedAt: now
        };
        db.jobs.push(item);
        saveDB(db);
        return item;
      },
      update: async ({ where, data }) => {
        const db = loadDB();
        const idx = db.jobs.findIndex(j => matchesWhere(j, where));
        if (idx === -1) throw new Error('Job not found');
        const next = { ...db.jobs[idx] };
        for (const [k, v] of Object.entries(data)) {
          if (v && typeof v === 'object' && 'increment' in v) {
            next[k] = (next[k] || 0) + v.increment;
          } else {
            next[k] = v;
          }
        }
        next.updatedAt = new Date().toISOString();
        db.jobs[idx] = next;
        saveDB(db);
        return next;
      }
    };
  }

  get application() {
    return {
      findUnique: async ({ where } = {}) => {
        const db = loadDB();
        return db.applications.find(a => matchesWhere(a, where)) || null;
      },
      findFirst: async ({ where } = {}) => {
        const db = loadDB();
        return db.applications.find(a => matchesWhere(a, where)) || null;
      },
      create: async ({ data }) => {
        const db = loadDB();
        const now = new Date().toISOString();
        const item = { id: uuid(), status: 'PENDING', ...data, appliedAt: now, updatedAt: now };
        db.applications.push(item);
        saveDB(db);
        return item;
      },
      update: async ({ where, data }) => {
        const db = loadDB();
        const idx = db.applications.findIndex(a => matchesWhere(a, where));
        if (idx === -1) throw new Error('Application not found');
        db.applications[idx] = { ...db.applications[idx], ...data, updatedAt: new Date().toISOString() };
        saveDB(db);
        return db.applications[idx];
      },
      updateMany: async ({ where, data }) => {
        const db = loadDB();
        let count = 0;
        db.applications = db.applications.map(a => {
          if (matchesWhere(a, where)) {
            count++;
            return { ...a, ...data, updatedAt: new Date().toISOString() };
          }
          return a;
        });
        saveDB(db);
        return { count };
      }
    };
  }

  get transaction() {
    return {
      findUnique: async ({ where, include } = {}) => {
        const db = loadDB();
        const found = db.transactions.find(t => matchesWhere(t, where));
        return attachTxRelations(db, found, include);
      },
      findFirst: async ({ where, include } = {}) => {
        const db = loadDB();
        const found = db.transactions.find(t => matchesWhere(t, where));
        return attachTxRelations(db, found, include);
      },
      findMany: async ({ where, include } = {}) => {
        const db = loadDB();
        return db.transactions
          .filter(t => matchesWhere(t, where))
          .map(t => attachTxRelations(db, t, include))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      },
      aggregate: async ({ where } = {}) => {
        const db = loadDB();
        const list = db.transactions.filter(t => matchesWhere(t, where));
        const sumCommission = list.reduce((acc, t) => acc + (t.commission || 0), 0);
        return { _sum: { commission: sumCommission } };
      },
      create: async ({ data }) => {
        const db = loadDB();
        const now = new Date().toISOString();
        const item = { id: uuid(), status: 'FUNDED', paymentProof: null, ...data, createdAt: now, updatedAt: now };
        db.transactions.push(item);
        saveDB(db);
        return item;
      },
      update: async ({ where, data }) => {
        const db = loadDB();
        const idx = db.transactions.findIndex(t => matchesWhere(t, where));
        if (idx === -1) throw new Error('Transaction not found');
        db.transactions[idx] = { ...db.transactions[idx], ...data, updatedAt: new Date().toISOString() };
        saveDB(db);
        return db.transactions[idx];
      }
    };
  }

  get rating() {
    return {
      findFirst: async ({ where } = {}) => {
        const db = loadDB();
        return db.ratings.find(r => matchesWhere(r, where)) || null;
      },
      findMany: async ({ where } = {}) => {
        const db = loadDB();
        return db.ratings.filter(r => matchesWhere(r, where));
      },
      create: async ({ data }) => {
        const db = loadDB();
        const item = { id: uuid(), ...data, createdAt: new Date().toISOString() };
        db.ratings.push(item);
        saveDB(db);
        return item;
      }
    };
  }

  get dispute() {
    return {
      findUnique: async ({ where } = {}) => {
        const db = loadDB();
        const found = db.disputes.find(d => matchesWhere(d, where));
        return attachDisputeRelations(db, found);
      },
      findMany: async ({ where } = {}) => {
        const db = loadDB();
        return db.disputes
          .filter(d => matchesWhere(d, where))
          .map(d => attachDisputeRelations(db, d))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      },
      count: async ({ where } = {}) => {
        const db = loadDB();
        return db.disputes.filter(d => matchesWhere(d, where)).length;
      },
      create: async ({ data }) => {
        const db = loadDB();
        const now = new Date().toISOString();
        const item = {
          id: uuid(),
          status: 'OPEN',
          adminNotes: null,
          ...data,
          createdAt: now,
          updatedAt: now
        };
        db.disputes.push(item);
        saveDB(db);
        return attachDisputeRelations(db, item);
      },
      update: async ({ where, data }) => {
        const db = loadDB();
        const idx = db.disputes.findIndex(d => matchesWhere(d, where));
        if (idx === -1) throw new Error('Dispute not found');
        db.disputes[idx] = { ...db.disputes[idx], ...data, updatedAt: new Date().toISOString() };
        saveDB(db);
        return attachDisputeRelations(db, db.disputes[idx]);
      }
    };
  }

  async $transaction(fn) {
    return await fn(this);
  }

  async $disconnect() {}
}

module.exports = { PrismaClient: LocalPrismaClient, getInitialSeed, saveDB, loadDB, runAutoCleanup, getStorageMetrics };
