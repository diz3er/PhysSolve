import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  Timestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let isSigningIn = false;

export async function signInWithGoogle() {
  if (isSigningIn) return;
  isSigningIn = true;
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      alert("The sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
    } else if (error.code === 'auth/cancelled-popup-request') {
      console.log("Previous sign-in request cancelled by a new one.");
    } else if (error.code === 'auth/popup-closed-by-user') {
      // User closed it, no need for intrusive alert
    } else {
      console.error("Error signing in with Google:", error);
      alert("An error occurred during sign-in. Please try again.");
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    // Try to fetch a non-existent document just to check connectivity
    await getDocFromServer(doc(db, '_health_check', 'status'));
    console.log("Firestore connection verified.");
  } catch (error: any) {
    console.warn("Firestore connection attempt failed:", error.message);
    if (error.code === 'unavailable') {
      console.error("Firestore backend is currently unavailable. This may be a transient network issue or the database index is still provisioning.");
    }
  }
}

testConnection();
