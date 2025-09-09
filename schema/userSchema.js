const { z } = require('zod');

// Request schema for signup
const signupSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  mobile: z.string(),
  password: z.string().min(6),
  referralId: z.string(),
});

const signupResponse = z.object({
  email: z.string().email(),
  name: z.string(),
  password: undefined,
});

// Request schema for login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Response schema for success message
const successResponseSchema = z.object({
  message: z.string(),
  token: z.string(),
});

// Response schema for error message
const errorResponseSchema = z.object({
  error: z.string(),
});

// Response schema for JWT token
const tokenResponseSchema = z.object({
  message: z.string(),
  token: z.string(),
});

module.exports = {
  signupSchema,
  signupResponse,
  loginSchema,
  successResponseSchema,
  errorResponseSchema,
  tokenResponseSchema

}
