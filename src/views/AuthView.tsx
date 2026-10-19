import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BusinessType } from '../types';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  Phone,
  User,
  MapPin,
  ArrowRight,
  Upload,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, registerBusiness, simulateGstCheck } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration form state
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('Retail Pharmacy');
  const [gstin, setGstin] = useState('');
  const [drugLicenceNumber, setDrugLicenceNumber] = useState('');
  const [licenceType, setLicenceType] = useState('Form 20 / Form 21 (Retail Chemist)');
  const [issuingAuthority, setIssuingAuthority] = useState('Food and Drugs Administration, Maharashtra (FDA)');
  const [licenceExpiryDate, setLicenceExpiryDate] = useState('2028-12-31');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('+91 98200 ');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400001');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // OTP Verification state for registration
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // GST format feedback
  const [gstCheckResult, setGstCheckResult] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail) {
      setLoginError('Please enter your registered email address.');
      return;
    }
    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleSendOtp = () => {
    if (!contactPhone || contactPhone.trim().length < 10) {
      setOtpError('Please provide a valid 10-digit Indian mobile number.');
      return;
    }
    setOtpSent(true);
    setOtpError(null);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.trim().length === 6) {
      setIsOtpVerified(true);
      setOtpError(null);
    } else {
      setOtpError('Invalid OTP code. Please enter the 6-digit verification code.');
    }
  };

  const handleGstinCheck = async () => {
    if (!gstin) return;
    const isValidFormat = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
      gstin.toUpperCase().trim()
    );
    if (!isValidFormat) {
      setGstCheckResult('Invalid GSTIN structure. Must be 15 characters (e.g. 27AAAAA0000A1Z5).');
    } else {
      const check = await simulateGstCheck(gstin.toUpperCase().trim());
      setGstCheckResult(check.responseSummary);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!legalName || !gstin || !drugLicenceNumber || !contactPerson || !contactEmail || !addressLine) {
      setRegError('Please complete all mandatory pharmaceutical registration fields.');
      return;
    }

    if (!isOtpVerified) {
      setRegError('Mobile number OTP verification is required before submission.');
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      setRegError('Password and confirmation do not match.');
      return;
    }

    registerBusiness({
      legalName,
      tradeName: tradeName || legalName,
      businessType,
      gstin: gstin.toUpperCase().trim(),
      drugLicenceNumber: drugLicenceNumber.toUpperCase().trim(),
      licenceType,
      issuingAuthority,
      licenceExpiryDate,
      contactPerson,
      contactEmail,
      contactPhone,
      addressLine,
      city,
      state,
      pincode,
      documentProofName: uploadedFileName || 'Drug_Licence_Certificate.pdf',
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10">
      {/* Top Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Medicine trading demo</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Welcome to MedEasy
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
          Sign in or register your pharmacy to buy and sell medicines.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50/70">
          <button
            onClick={() => {
              setMode('login');
              setLoginError(null);
            }}
            className={`flex-1 py-3.5 text-sm font-semibold text-center transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => {
              setMode('register');
              setRegError(null);
            }}
            className={`flex-1 py-3.5 text-sm font-semibold text-center transition-colors border-b-2 ${
              mode === 'register'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign up your business
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* LOGIN FLOW */}
          {mode === 'login' && (
            <div className="space-y-6">
              {loginError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. sunita@citycarepharmacy.in"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-xs transition-colors"
                >
                  Log in
                </button>
              </form>

              <div className="mx-auto max-w-md border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
                New here? Choose <strong>Sign up your business</strong> above. We will check the business licence before trading.
              </div>
            </div>
          )}

          {/* REGISTRATION FLOW */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {regError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Section 1: Business Identity */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>1. Business details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registered business name *
                    </label>
                    <input
                      type="text"
                      required
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder="e.g. Apollo Chemist & Healthcare Pvt Ltd"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Shop or business name
                    </label>
                    <input
                      type="text"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      placeholder="e.g. Apollo Pharmacy (Koramangala)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      What type of business is this? *
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Retail Pharmacy">Retail Pharmacy (Chemist / Form 20/21)</option>
                      <option value="Wholesale Distributor">Wholesale Distributor (C&F / Form 20B/21B)</option>
                      <option value="Manufacturer">Manufacturer (Form 25 / Form 28)</option>
                      <option value="Hospital / Institutional Pharmacy">Hospital / Institutional Pharmacy</option>
                    </select>
                  </div>

                  {/* GSTIN with live format check */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        GST number (15 letters and numbers) *
                      </label>
                      <button
                        type="button"
                        onClick={handleGstinCheck}
                        className="text-[10px] text-blue-600 font-semibold hover:underline"
                      >
                        Check number
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={gstin}
                      onChange={(e) => {
                        setGstin(e.target.value.toUpperCase());
                        setGstCheckResult(null);
                      }}
                      placeholder="27AAAAA0000A1Z5"
                      maxLength={15}
                      className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {gstCheckResult && (
                      <p className="text-[11px] text-blue-700 mt-1 leading-tight font-medium">
                        {gstCheckResult}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Medicine-selling licence */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>2. Medicine-selling licence</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Licence number *
                    </label>
                    <input
                      type="text"
                      required
                      value={drugLicenceNumber}
                      onChange={(e) => setDrugLicenceNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. MH-MZ2-20-89102"
                      className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      The number printed on your medicine-selling licence.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      What type of licence do you have? *
                    </label>
                    <select
                      value={licenceType}
                      onChange={(e) => setLicenceType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Form 20 / Form 21 (Retail Chemist)">
                        Form 20 / Form 21 (Allopathic Retail)
                      </option>
                      <option value="Form 20B / Form 21B (Wholesale Distribution)">
                        Form 20B / Form 21B (Wholesale Stockist)
                      </option>
                      <option value="Form 25 / Form 28 (Drug Manufacturing)">
                        Form 25 / Form 28 (Formulation Manufacturing)
                      </option>
                      <option value="Form 20F / Form 20G (Schedule X Restricted)">
                        Form 20F / Form 20G (Schedule X)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State or office that gave the licence *
                    </label>
                    <input
                      type="text"
                      required
                      value={issuingAuthority}
                      onChange={(e) => setIssuingAuthority(e.target.value)}
                      placeholder="e.g. Food and Drugs Administration, Maharashtra"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Licence expiry date *
                    </label>
                    <input
                      type="date"
                      required
                      value={licenceExpiryDate}
                      onChange={(e) => setLicenceExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Upload Certificate Proof */}
                <div className="mt-4 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <div className="text-xs text-slate-700 font-medium">
                      {uploadedFileName ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Attached: {uploadedFileName}
                        </span>
                      ) : (
                        <span>Upload a picture or file of your licence (PDF, PNG or JPG, under 10 MB)</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadedFileName(e.target.files[0].name);
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Contact & Registered Pharmacist */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>3. Contact details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Name of the person in charge *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Ramesh K. Patel (Reg. Pharmacist)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="compliance@business.in"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Mobile Number with OTP */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile phone number *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+91 98200 12345"
                          disabled={isOtpVerified}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                        />
                      </div>
                      {!isOtpVerified && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors shrink-0"
                        >
                          {otpSent ? 'Send code again' : 'Send code'}
                        </button>
                      )}
                      {isOtpVerified && (
                        <span className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>OTP Verified</span>
                        </span>
                      )}
                    </div>

                    {/* Interactive OTP Input Modal / Drawer */}
                    {otpSent && !isOtpVerified && (
                      <div className="mt-2.5 p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs text-blue-900 font-medium">
                          <span>SMS Gateway: 6-digit code dispatched to {contactPhone}</span>
                          <span className="font-mono text-blue-700 text-[11px] bg-blue-100 px-2 py-0.5 rounded">
                            Sandbox OTP: 482910
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 6-digit OTP (e.g. 482910)"
                            className="flex-1 px-3 py-1.5 text-xs font-mono tracking-widest bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Verify OTP
                          </button>
                        </div>
                        {otpError && (
                          <p className="text-[11px] text-rose-600 font-medium">{otpError}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Physical Premises Address */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>4. Shop address</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Shop address *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="Shop 12, Ground Floor, Commercial Complex, M.G. Road"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State / Union Territory *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PIN code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Password Security */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>5. Create a password</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Regulatory Notice before submit */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>Before you start trading:</strong> We check your business tax number and medicine licence. You can buy and sell after these checks are approved.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Already have an account? Sign In
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Create account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
