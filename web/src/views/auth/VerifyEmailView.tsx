import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useResendVerificationEmailMutation } from '../../store/services/authApi';
import { getErrorMessage } from '../../utils/apiError';

export const VerifyEmailView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [resendEmail, { isLoading, error: apiError }] = useResendVerificationEmailMutation();

  const cleanupTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanupTimer;
  }, [cleanupTimer]);

  const handleResend = async () => {
    setValidationError(null);
    if (!email) {
      setValidationError(t('auth.verifyEmail.errors.emailRequired'));
      return;
    }

    try {
      await resendEmail({ email }).unwrap();
      setResendStatus('sent');
      cleanupTimer();
      resetTimerRef.current = setTimeout(() => setResendStatus('idle'), 5000);
    } catch {
      // Handled by apiError
    }
  };

  const errorMessage = validationError || (apiError ? getErrorMessage(apiError) : null);

  return (
    <div className="space-y-6 text-center animate-in fade-in duration-200">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
        <MailCheck className="w-8 h-8 animate-subtle-float" />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('auth.verifyEmail.title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          {t('auth.verifyEmail.message', {
            emailSuffix: email ? ` (${email})` : '',
          })}
        </p>
      </div>

      {/* Status or error feedback */}
      {resendStatus === 'sent' && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('auth.verifyEmail.resentSuccess')}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!emailParam && (
        <Input
          label={t('auth.verifyEmail.emailLabel')}
          type="email"
          placeholder={t('auth.verifyEmail.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={() => navigate('/auth/login')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {t('auth.verifyEmail.continue')}
        </Button>

        <Button
          variant="secondary"
          size="md"
          className="w-full"
          onClick={handleResend}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          {t('auth.verifyEmail.resend')}
        </Button>
      </div>

      {/* Back Link */}
      <div className="text-center pt-2">
        <Link
          to="/auth/login"
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
        >
          {t('auth.verifyEmail.signInAnother')}
        </Link>
      </div>
    </div>
  );
};
