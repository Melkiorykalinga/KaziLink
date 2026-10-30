const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const DB_FILE = path.join(__dirname, '../../local-db.json');

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

function getInitialSeed() {
  const now = new Date().toISOString();
  const adminHash = bcrypt.hashSync('admin123', 10);
  const empHash = bcrypt.hashSync('employer123', 10);
  const workerHash = bcrypt.hashSync('worker123', 10);

  const empId = 'emp-default-001';
  const workerId = 'wrk-default-001';
  const adminId = 'adm-default-001';
  const workerProfileId = 'wp-default-001';
  const empProfileId = 'ep-default-001';

  const job1Id = 'job-sample-001';
  const job2Id = 'job-sample-002';

  return {
    users: [
      {
        id: adminId,
        email: 'admin@kazilink.com',
        phone: '0700000000',
        passwordHash: adminHash,
        fullName: 'System Admin',
        role: 'ADMIN',
        locationCity: 'Dar es Salaam',
        isVerified: true,
        isActive: true,
        lastActiveAt: now,
        refreshToken: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: empId,
        email: 'employer@kazilink.com',
        phone: '0755123456',
        passwordHash: empHash,
        fullName: 'Melki Logistics & Builders',
        role: 'EMPLOYER',
        locationCity: 'Dar es Salaam',
        isVerified: true,
        isActive: true,
        lastActiveAt: now,
        refreshToken: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: workerId,
        email: 'worker@kazilink.com',
        phone: '0788654321',
        passwordHash: workerHash,
        fullName: 'Juma Fundi',
        role: 'WORKER',
        locationCity: 'Dar es Salaam',
        isVerified: true,
        isActive: true,
        lastActiveAt: now,
        refreshToken: null,
        createdAt: now,
        updatedAt: now
      }
    ],
    employerProfiles: [
      {
        id: empProfileId,
        userId: empId,
        businessName: 'Melki Logistics & Builders',
        businessDescription: 'Construction, moving, and warehouse services in Tanzania.',
        industry: 'Construction & Logistics',
        logoUrl: null,
        totalJobsPosted: 2,
        createdAt: now,
        updatedAt: now
      }
    ],
    workerProfiles: [
      {
        id: workerProfileId,
        userId: workerId,
        bio: 'Mchapakazi hodari wa ujenzi, kupakia mizigo, na usafi.',
        skills: ['Ujenzi', 'Kupakia Mizigo', 'Usafi'],
        availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        availabilityTimes: '07:00 - 18:00',
        preferredRadiusKm: 15,
        averageRating: 4.9,
        totalJobsCompleted: 12,
        totalEarned: 340000,
        availabilityStatus: 'AVAILABLE_NOW',
        createdAt: now,
        updatedAt: now
      }
    ],
    workerSkills: [
      {
        id: 'sk-001',
        workerProfileId,
        name: 'Kupakia na Kupanga Mizigo (Warehousing)',
        isVerified: true,
        createdAt: now
      },
      {
        id: 'sk-002',
        workerProfileId,
        name: 'Ujenzi & Ukarabati (Construction)',
        isVerified: true,
        createdAt: now
      }
    ],
    jobs: [
      {
        id: job1Id,
        employerId: empId,
        title: 'Kupakia na Kupanga Mizigo Godown (Warehouse Assistant)',
        description: 'Tunahitaji vijana wachapakazi wa kupanga maboksi kwenye godown letu Mikocheni kwa siku moja. Chakula cha mchana kinatolewa na malipo ni papo hapo kazi ikiisha.',
        category: 'Warehousing',
        workersNeeded: 3,
        workersAccepted: 0,
        jobDate: now,
        startTime: '08:00',
        durationHours: 8,
        locationAddress: 'Mikocheni B, Dar es Salaam',
        locationLat: -6.764,
        locationLng: 39.248,
        payPerWorker: 30000,
        totalPayWithFee: 30000,
        paymentMethod: 'MPESA',
        applicationDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        specialRequirements: 'Uwe na kitambulisho (NIDA au Kura) na viatu imara.',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      },
      {
        id: job2Id,
        employerId: empId,
        title: 'Usafi wa Ofisi Mpya (Office Deep Cleaning)',
        description: 'Kufanya usafi wa vioo, sakafu na kupanga samani kwenye ofisi mpya iliyopo Posta Mpya.',
        category: 'Cleaning',
        workersNeeded: 2,
        workersAccepted: 0,
        jobDate: now,
        startTime: '09:00',
        durationHours: 6,
        locationAddress: 'Posta Mpya, Dar es Salaam',
        locationLat: -6.816,
        locationLng: 39.289,
        payPerWorker: 25000,
        totalPayWithFee: 25000,
        paymentMethod: 'MPESA',
        applicationDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        specialRequirements: 'Uzoefu wa usafi wa maofisi.',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      }
    ],
    applications: [],
    transactions: [],
    ratings: []
  };
}

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const seed = getInitialSeed();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
      return seed;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return getInitialSeed();
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
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

function attachUserRelations(db, user, includeOrSelect) {
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

class LocalPrismaClient {
  constructor() {
    loadDB(); // ensure initialized
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

  async $transaction(fn) {
    return await fn(this);
  }

  async $disconnect() {}
}

module.exports = { PrismaClient: LocalPrismaClient };
