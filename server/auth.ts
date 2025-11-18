import bcrypt from "bcryptjs";
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
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  
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
