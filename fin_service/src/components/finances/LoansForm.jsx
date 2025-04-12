import React, { useState } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import InputField from './InputField';
import { formatCurrency } from '../../utils/financialUtils';

const LoansForm = ({ 
  loans, 
  handleLoansChange, 
  totalLoans, 
  setActiveTab, 
  saving: parentSaving,
  income,
  fixedExpenses,
  variableExpenses,
  investments
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Save all financial data, not just loans
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError("You must be logged in to save your financial data");
      return;
    }
    
    setSaving(true);
    setError("");
    
    try {
      // Create complete finances data object with all categories
      const financesData = {
        income,
        fixedExpenses,
        variableExpenses,
        investments,
        loans,
        updatedAt: new Date().toISOString()
      };
      
      // Save the complete data
      await setDoc(doc(db, "userFinances", currentUser.uid), {
        finances: financesData
      });
      
      setSuccess(true);
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error saving financial data:", error);
      setError("Failed to save your financial data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Loan Repayments</h3>
      <p className="mt-1 text-sm text-gray-500">Enter your monthly EMIs and other debt payments</p>
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">All financial data saved successfully! Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <InputField label="Home Loan EMI" name="home" value={loans.home} onChange={handleLoansChange} />
        <InputField label="Car Loan EMI" name="car" value={loans.car} onChange={handleLoansChange} />
        <InputField label="Education Loan EMI" name="education" value={loans.education} onChange={handleLoansChange} />
        <InputField label="Personal Loan EMI" name="personal" value={loans.personal} onChange={handleLoansChange} />
        <InputField label="Credit Card Payments" name="credit_card" value={loans.credit_card} onChange={handleLoansChange} />
        <InputField label="Other Loan Payments" name="other" value={loans.other} onChange={handleLoansChange} />
      </div>
      
      <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-900">Total Monthly Loan Payments: <span className="font-bold">{formatCurrency(totalLoans)}</span></p>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setActiveTab("investments")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || parentSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {saving ? 'Saving...' : 'Save and Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoansForm;