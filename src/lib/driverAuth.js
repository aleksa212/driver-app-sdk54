import { getItemAsync, setItemAsync, deleteItemAsync } from "expo-secure-store";
import { API_BASE_URL } from "../constants/api";

const TOKEN_KEY = "driverAuthToken";
const DRIVER_KEY = "driverInfo";

async function request(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
  }
  return data;
}

async function persistSession({ token, driver }) {
  await setItemAsync(TOKEN_KEY, token);
  await setItemAsync(DRIVER_KEY, JSON.stringify(driver));
}

export async function register(email, password, confirmPassword) {
  const data = await request("/driver-auth/register", { email, password, confirmPassword });
  await persistSession(data);
  return data;
}

export async function login(email, password) {
  const data = await request("/driver-auth/login", { email, password });
  await persistSession(data);
  return data;
}

// Checked on app launch so a driver who already logged in doesn't have
// to log in again every time they open the app.
export async function getStoredSession() {
  const token = await getItemAsync(TOKEN_KEY);
  const driverJson = await getItemAsync(DRIVER_KEY);
  if (!token || !driverJson) return null;
  return { token, driver: JSON.parse(driverJson) };
}

export async function logout() {
  await deleteItemAsync(TOKEN_KEY);
  await deleteItemAsync(DRIVER_KEY);
}
