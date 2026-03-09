export interface AuthUser {
  email: string;
  username: string;
}

interface StoredUser extends AuthUser {
  password: string;
  createdAt: string;
}

const USERS_KEY = 'mindbloom_users_v1';
const SESSION_KEY = 'mindbloom_session_v1';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const signOut = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const signUp = (email: string, username: string, password: string): { ok: boolean; error?: string; user?: AuthUser } => {
  const normalized = normalizeEmail(email);

  if (!normalized || !username.trim() || password.length < 6) {
    return { ok: false, error: 'Please provide email, username, and a password with at least 6 characters.' };
  }

  const users = getUsers();
  if (users.some((u) => u.email === normalized)) {
    return { ok: false, error: 'An account with this email already exists.' };
  }

  const newUser: StoredUser = {
    email: normalized,
    username: username.trim(),
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setUsers(users);

  const sessionUser: AuthUser = { email: newUser.email, username: newUser.username };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return { ok: true, user: sessionUser };
};

export const signIn = (email: string, password: string): { ok: boolean; error?: string; user?: AuthUser } => {
  const normalized = normalizeEmail(email);
  const users = getUsers();
  const user = users.find((u) => u.email === normalized && u.password === password);

  if (!user) {
    return { ok: false, error: 'Invalid email or password.' };
  }

  const sessionUser: AuthUser = { email: user.email, username: user.username };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return { ok: true, user: sessionUser };
};
