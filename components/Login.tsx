import React, { useState } from 'react';
import { useTranslations } from '../context/LanguageContext';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const { t } = useTranslations();
  
  // Default user, can be updated by registration
  const [registeredUser, setRegisteredUser] = useState({ email: 'admin@notafacil.com', password: 'password123' });

  // State for login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // State for registration
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');


  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (email === registeredUser.email && password === registeredUser.password) {
      onLogin();
    } else {
      setLoginError(t('login.invalidCredentials'));
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== confirmPassword) {
      alert(t('login.passwordMismatch'));
      return;
    }
    setRegisteredUser({ email: regEmail, password: regPassword });
    setRegisterSuccess(t('login.registerSuccess'));
    
    // Reset fields and switch to login form
    setName('');
    setRegEmail('');
    setRegPassword('');
    setConfirmPassword('');
    setIsRegistering(false);
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setLoginError('');
    setRegisterSuccess('');
  };

  const LogoIcon = () => (
    <svg className="w-12 h-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg dark:bg-slate-800">
        <div className="text-center">
            <div className="flex justify-center mb-4">
                <LogoIcon />
            </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {isRegistering ? t('login.createAccountTitle') : 'NotaFácil'}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {isRegistering ? t('login.createAccountSubtitle') : t('login.welcomeBack')}
          </p>
          {registerSuccess && !isRegistering && (
            <p className="mt-4 text-sm text-green-600 dark:text-green-400">{registerSuccess}</p>
          )}
        </div>

        {isRegistering ? (
          // Registration Form
          <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">{t('login.fullNamePlaceholder')}</label>
                <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder={t('login.fullNamePlaceholder')} />
              </div>
              <div>
                <label htmlFor="reg-email-address" className="sr-only">{t('login.emailPlaceholder')}</label>
                <input id="reg-email-address" name="email" type="email" autoComplete="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder={t('login.emailPlaceholder')} />
              </div>
              <div>
                <label htmlFor="reg-password" className="sr-only">{t('login.passwordPlaceholder')}</label>
                <input id="reg-password" name="password" type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder={t('login.passwordPlaceholder')} />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">{t('login.confirmPasswordPlaceholder')}</label>
                <input id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder={t('login.confirmPasswordPlaceholder')} />
              </div>
            </div>
            <div>
              <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {t('login.registerButton')}
              </button>
            </div>
          </form>
        ) : (
          // Login Form
          <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">{t('login.emailPlaceholder')}</label>
                <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder={t('login.emailPlaceholder')} />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">{t('login.passwordPlaceholder')}</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder={t('login.passwordPlaceholder')} />
              </div>
            </div>
            
            {loginError && (
              <p className="text-sm text-red-500 text-center">{loginError}</p>
            )}

            <div>
              <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {t('login.loginButton')}
              </button>
            </div>
          </form>
        )}

        <div className="text-sm text-center">
            <button onClick={toggleForm} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              {isRegistering ? t('login.toggleToLogin') : t('login.toggleToRegister')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;