import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useRegisterMutation } from '../../store/services/authApi';
import { getErrorMessage } from '../../utils/apiError';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { SocialLoginButtons } from '../../components/ui/SocialLoginButtons';
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from '../../utils/constants';

interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  agreeTerms: boolean;
}

export const RegisterView = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      agreeTerms: false,
    },
  });

  const passwordValue = watch('password');

  const [registerUser, { isLoading, error: apiError }] = useRegisterMutation();

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= MIN_PASSWORD_LENGTH) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(passwordValue);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-rose-500',
    'bg-amber-500',
    'bg-indigo-500',
    'bg-emerald-500',
  ];

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
      }).unwrap();

      navigate(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch {
      // Backend error is captured in apiError
    }
  };

  const serverErrorMessage = apiError ? getErrorMessage(apiError) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create an account
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Start generating AI-powered websites with SiteStore AI
        </p>
      </div>

      <SocialLoginButtons dividerLabel="Or register with email" />

      {/* Backend Error Alert */}
      {serverErrorMessage && <ErrorAlert message={serverErrorMessage} />}

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <Input
          label="Full Name"
          type="text"
          placeholder="Alex Tran"
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', {
            required: 'Full name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          })}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email address is required',
            pattern: {
              value: EMAIL_REGEX,
              message: 'Please enter a valid email address',
            },
          })}
        />

        <div className="space-y-1.5">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: MIN_PASSWORD_LENGTH,
                message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
              },
            })}
          />

          {/* Password Strength Bars */}
          {passwordValue.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex gap-1 h-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      i < strength
                        ? strengthColors[strength - 1]
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>
                  Strength: {strength > 0 ? strengthLabels[strength - 1] : 'Too weak'}
                </span>
                <span>8+ chars, uppercase & number recommended</span>
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          error={errors.passwordConfirmation?.message}
          {...register('passwordConfirmation', {
            required: 'Please confirm your password',
            validate: (value, formValues) =>
              value === formValues.password || 'Passwords do not match',
          })}
        />

        {/* Terms agreement checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500/20 dark:bg-slate-800 mt-0.5 shrink-0"
              {...register('agreeTerms', {
                required: 'You must accept the terms and privacy policy to continue',
              })}
            />
            <span className="leading-snug">
              I agree to the{' '}
              <a href="#terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-xs text-rose-500 mt-1">{errors.agreeTerms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Free Account
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
        Already have an account?{' '}
        <Link
          to="/auth/login"
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};
