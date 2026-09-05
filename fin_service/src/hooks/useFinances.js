import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { DEMO_PERSONAS, DEFAULT_PERSONA_ID } from "../constants/personas.constants";
import { clearAiCache } from "../utils/aiCache";

const SANDBOX_STORAGE_KEY = "finsage_guest_sandbox_v1";
const SANDBOX_PERSONA_KEY = "finsage_active_persona_id";

/**
 * Custom Hook for Centralized Financial Data & Guest Persona Sandbox
 */
export function useFinances() {
  const { currentUser, isGuestMode: authIsGuest } = useAuth();
  const isGuestMode = Boolean(authIsGuest || !currentUser || currentUser.uid === "guest");
  const isFirestoreUser = Boolean(currentUser && currentUser.uid !== "guest");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [finances, setFinances] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activePersonaId, setActivePersonaId] = useState(() => {
    return localStorage.getItem(SANDBOX_PERSONA_KEY) || DEFAULT_PERSONA_ID;
  });

  // Load active finances from Firestore or Local Sandbox
  const loadFinances = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isFirestoreUser) {
        // Authenticated user -> Firestore
        const docRef = doc(db, "userFinances", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFinances(data.finances || null);
          setTransactions(data.transactions || []);
        } else {
          // New authenticated user: check if sandbox has prior guest data to migrate
          const savedSandbox = localStorage.getItem(SANDBOX_STORAGE_KEY);
          if (savedSandbox) {
            try {
              const parsed = JSON.parse(savedSandbox);
              setFinances(parsed.finances || null);
              setTransactions(parsed.transactions || []);
              // Auto-save to Firestore
              await setDoc(docRef, {
                finances: parsed.finances,
                transactions: parsed.transactions || [],
                updatedAt: new Date().toISOString(),
              });
            } catch {
              setFinances(null);
              setTransactions([]);
            }
          } else {
            setFinances(null);
            setTransactions([]);
          }
        }
      } else {
        // Guest user -> Local Sandbox
        const savedSandbox = localStorage.getItem(SANDBOX_STORAGE_KEY);
        const activeId = localStorage.getItem(SANDBOX_PERSONA_KEY) || DEFAULT_PERSONA_ID;
        setActivePersonaId(activeId);

        if (savedSandbox) {
          try {
            const parsed = JSON.parse(savedSandbox);
            if (parsed && parsed.finances && typeof parsed.finances === "object") {
              setFinances(parsed.finances);
              setTransactions(Array.isArray(parsed.transactions) ? parsed.transactions : []);
            } else {
              const defaultPersona = DEMO_PERSONAS[activeId] || DEMO_PERSONAS[DEFAULT_PERSONA_ID];
              setFinances(defaultPersona.finances);
              setTransactions(defaultPersona.transactions);
            }
          } catch {
            const defaultPersona = DEMO_PERSONAS[activeId] || DEMO_PERSONAS[DEFAULT_PERSONA_ID];
            setFinances(defaultPersona.finances);
            setTransactions(defaultPersona.transactions);
          }
        } else {
          const defaultPersona = DEMO_PERSONAS[activeId] || DEMO_PERSONAS[DEFAULT_PERSONA_ID];
          setFinances(defaultPersona.finances);
          setTransactions(defaultPersona.transactions);
          localStorage.setItem(
            SANDBOX_STORAGE_KEY,
            JSON.stringify({
              finances: defaultPersona.finances,
              transactions: defaultPersona.transactions,
            })
          );
        }
      }
    } catch (err) {
      console.error("Error loading finances:", err);
      setError(err.message || "Failed to load financial records.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, isFirestoreUser]);

  useEffect(() => {
    loadFinances();
  }, [loadFinances]);

  // Save / Update Finances
  const saveFinances = async (newFinances, updatedTransactions = null) => {
    setSaving(true);
    setError(null);

    const txs = updatedTransactions !== null ? updatedTransactions : transactions;

    try {
      if (isFirestoreUser) {
        const docRef = doc(db, "userFinances", currentUser.uid);
        await setDoc(
          docRef,
          {
            finances: newFinances,
            transactions: txs,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        clearAiCache(currentUser.uid);
      } else {
        localStorage.setItem(
          SANDBOX_STORAGE_KEY,
          JSON.stringify({
            finances: newFinances,
            transactions: txs,
            updatedAt: new Date().toISOString(),
          })
        );
        clearAiCache("guest");
      }

      setFinances(newFinances);
      if (updatedTransactions !== null) {
        setTransactions(updatedTransactions);
      }
      return true;
    } catch (err) {
      console.error("Error saving finances:", err);
      setError(err.message || "Failed to save financial records.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Add single transaction
  const addTransaction = async (newTx) => {
    const enrichedTx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      date: new Date().toISOString().split("T")[0],
      ...newTx,
    };

    const nextTxs = [enrichedTx, ...transactions];
    setTransactions(nextTxs);

    if (isFirestoreUser) {
      const docRef = doc(db, "userFinances", currentUser.uid);
      await setDoc(docRef, { transactions: nextTxs }, { merge: true });
    } else {
      localStorage.setItem(
        SANDBOX_STORAGE_KEY,
        JSON.stringify({
          finances,
          transactions: nextTxs,
          updatedAt: new Date().toISOString(),
        })
      );
    }
    return enrichedTx;
  };

  // Switch guest persona
  const switchPersona = (personaId) => {
    const targetPersona = DEMO_PERSONAS[personaId];
    if (!targetPersona) return;

    localStorage.setItem(SANDBOX_PERSONA_KEY, personaId);
    localStorage.setItem(
      SANDBOX_STORAGE_KEY,
      JSON.stringify({
        finances: targetPersona.finances,
        transactions: targetPersona.transactions,
        personaId,
      })
    );

    setActivePersonaId(personaId);
    setFinances(targetPersona.finances);
    setTransactions(targetPersona.transactions);
    clearAiCache("guest");
  };

  // Reset sandbox to current persona defaults
  const resetSandbox = () => {
    const targetPersona = DEMO_PERSONAS[activePersonaId] || DEMO_PERSONAS[DEFAULT_PERSONA_ID];
    localStorage.setItem(
      SANDBOX_STORAGE_KEY,
      JSON.stringify({
        finances: targetPersona.finances,
        transactions: targetPersona.transactions,
        personaId: targetPersona.id,
      })
    );
    setFinances(targetPersona.finances);
    setTransactions(targetPersona.transactions);
    clearAiCache("guest");
  };

  return {
    finances,
    transactions,
    loading,
    saving,
    error,
    isGuestMode,
    activePersonaId,
    activePersona: DEMO_PERSONAS[activePersonaId] || DEMO_PERSONAS[DEFAULT_PERSONA_ID],
    saveFinances,
    addTransaction,
    switchPersona,
    resetSandbox,
    refresh: loadFinances,
  };
}
