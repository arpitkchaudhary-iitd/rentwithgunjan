import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

export async function readUsers() {
  await ensureDataDir();
  if (!existsSync(USERS_FILE)) {
    return [] as Record<string, unknown>[];
  }

  const raw = await readFile(USERS_FILE, 'utf8');
  return JSON.parse(raw) as Record<string, unknown>[];
}

export async function writeUsers(users: Record<string, unknown>[]) {
  await ensureDataDir();
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

export async function addUser(user: Record<string, unknown>) {
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
  return user;
}
