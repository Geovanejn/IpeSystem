import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "./storage";
import type { User } from "@shared/schema";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<User | null> {
  const user = await storage.getUserByUsername(username);
  
  if (!user) {
    return null;
  }

  const isValid = await comparePassword(password, user.password);
  
  if (!isValid) {
    return null;
  }

  return user;
}

export interface AuthSession {
  userId: string;
  username: string;
  role: string;
  memberId?: string | null;
  visitorId?: string | null;
}

// Mock session storage (em produção, usar express-session ou JWT)
const sessions = new Map<string, AuthSession>();

export function createSession(user: User): string {
  // Gera sessionId criptograficamente seguro com 32 bytes (64 caracteres hex)
  // Mantém prefixo "session_" para compatibilidade com cookies existentes
  const randomId = crypto.randomBytes(32).toString('hex');
  const sessionId = `session_${randomId}`;
  
  sessions.set(sessionId, {
    userId: user.id,
    username: user.username,
    role: user.role,
    memberId: user.memberId,
    visitorId: user.visitorId,
  });

  return sessionId;
}

export function getSession(sessionId: string): AuthSession | null {
  return sessions.get(sessionId) || null;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}
