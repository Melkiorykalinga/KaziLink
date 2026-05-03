const { z } = require('zod');

const jobCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(2000),
  category: z.string().min(2).max(100),
  workersNeeded: z.number().int().positive(),
  jobDate: z.coerce.date(),
  startTime: z.string().min(1).max(20),
  durationHours: z.number().positive(),
  locationAddress: z.string().min(3).max(500),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
  payPerWorker: z.number().positive(),
  paymentMethod: z.enum(['MPESA', 'AIRTEL']),
  applicationDeadline: z.coerce.date(),
  specialRequirements: z.string().nullable().optional()
});

const jobUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(5).max(2000).optional(),
  category: z.string().min(2).max(100).optional(),
  workersNeeded: z.number().int().positive().optional(),
  jobDate: z.coerce.date().optional(),
  startTime: z.string().min(1).max(20).optional(),
  durationHours: z.number().positive().optional(),
  locationAddress: z.string().min(3).max(500).optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
  payPerWorker: z.number().positive().optional(),
  paymentMethod: z.enum(['MPESA', 'AIRTEL']).optional(),
  applicationDeadline: z.coerce.date().optional(),
  specialRequirements: z.string().nullable().optional()
}).strict(); // strict() prevents mass assignment of sensitive fields natively

const transactionCreateSchema = z.object({
  jobId: z.string().min(1),
  workerId: z.string().min(1),
  paymentMethod: z.enum(['MPESA', 'AIRTEL']).optional()
});

const transactionFundSchema = z.object({
  transactionId: z.string().min(1)
});

const transactionVerifySchema = z.object({
  transactionId: z.string().min(1)
});

const userRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  fullName: z.string().min(2).max(100),
  phone: z.string().min(9).max(15).nullable().optional(),
  locationCity: z.string().min(2).max(100).nullable().optional(),
  role: z.enum(['EMPLOYER', 'WORKER'])
});

const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

module.exports = {
  jobCreateSchema,
  jobUpdateSchema,
  transactionCreateSchema,
  transactionFundSchema,
  transactionVerifySchema,
  userRegisterSchema,
  userLoginSchema
};
