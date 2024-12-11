import React, { useState } from 'react';
import { Mail, AlertTriangle, KeyRound, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Simulating code send (replace with actual API call)
    setError('');
    setCodeSent(true);

    // Redirecting to the reset password page after sending the code
    setTimeout(() => navigate('/password'), 2000); // Delay for UX
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
          <p className="text-gray-600 mt-2">
            Enter your email to receive a verification code
          </p>
        </div>

        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertTriangle className="mr-2" size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {codeSent ? 'Code Sent' : 'Send Verification Code'}
          </button>
        </form>

        {codeSent && (
          <div className="mt-4 text-center text-green-600">
            Verification code has been sent to your email
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;



// New Password Component
const NewPassword: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Simulating password reset (replace with actual API call)
    setError('');
    alert('Password reset successful!');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 mt-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            Enter your verification code and new password
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertTriangle className="mr-2" size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export { ForgetPassword, NewPassword };