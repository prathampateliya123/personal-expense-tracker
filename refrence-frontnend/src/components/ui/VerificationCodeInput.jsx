import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { NON_DIGIT_REGEX, OTP_CODE_REGEX, RESEND_TIME } from "../../utils/constants";

export default function VerificationCodeInput({
  className = '',
  verificationCode,
  setVerificationCode,
  onSubmit = () => { },
  onResendCode = () => { },
  error = '',
  loading = false,
  showResend = true,
  showSubmitButton = true,
  footer = null,
  goBackTo = null,
  label = 'ENTER CODE',
  submitLabel = 'Verify code'
}) {
  const inputsRef = useRef([]);
  const [digits, setDigits] = useState(() => Array(6).fill(''));
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCount, setResendCount] = useState(RESEND_TIME);
  const [resendRunning, setResendRunning] = useState(true);

  useEffect(() => {
    let nextDigits = null;

    if (verificationCode === '') {
      nextDigits = Array(6).fill('');
    } else if (typeof verificationCode === 'string' && OTP_CODE_REGEX.test(verificationCode)) {
      nextDigits = verificationCode.split('');
    }

    if (!nextDigits) return undefined;

    const timeoutId = window.setTimeout(() => setDigits(nextDigits), 0);
    return () => window.clearTimeout(timeoutId);
  }, [verificationCode]);

  const commitDigits = (nextDigits) => {
    setDigits(nextDigits);
    setVerificationCode(nextDigits.join(''));
  };

  const handleChange = (index, e) => {
    const value = e.target.value.replace(NON_DIGIT_REGEX, '');
    const digit = value.slice(-1);

    if (digit) {
      const next = [...digits];
      next[index] = digit;
      commitDigits(next);
      if (index < inputsRef.current.length - 1) {
        setTimeout(() => {
          inputsRef.current[index + 1]?.focus();
        }, 0);
      }
    } else {
      const next = [...digits];
      next[index] = '';
      commitDigits(next);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        e.preventDefault();
        const next = [...digits];
        next[index] = '';
        commitDigits(next);
        return;
      }

      if (!e.currentTarget.value && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.();
    }
  };

  const handlePaste = (index, e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const digits = paste.replace(NON_DIGIT_REGEX, '').slice(0, 6).split('');

    if (digits.length === 0) return;

    const next = Array(6).fill('');
    const startIndex = digits.length === 6 ? 0 : index;
    digits.forEach((d, i) => {
      const targetIndex = startIndex + i;
      if (targetIndex < 6) next[targetIndex] = d;
    });
    commitDigits(next);

    const lastFilledIndex = Math.min(5, startIndex + digits.length - 1);
    if (lastFilledIndex >= 0 && inputsRef.current[lastFilledIndex]) {
      inputsRef.current[lastFilledIndex].focus();
    }
  };

  const handleFocus = (index, e) => {
    const el = e.target;
    const len = el.value?.length || 0;
    requestAnimationFrame(() => {
      try {
        el.setSelectionRange(len, len);
      } catch { void 0; }
    });
  };

  const renderedDigits = useMemo(() => {
    return Array.isArray(digits) && digits.length === 6 ? digits : Array(6).fill('');
  }, [digits]);

  useEffect(() => {
    if (!resendRunning) return;
    const interval = setInterval(() => {
      setResendCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendRunning]);

  const handleResendClick = () => {
    if (resendCount > 0 || resendLoading) return;
    setResendLoading(true);
    Promise.resolve(onResendCode?.()).then(() => {
      setResendCount(RESEND_TIME);
      setResendRunning(true);
    }).finally(() => setResendLoading(false));
  };

  return (
    <div className='space-y-4'>
      {label &&
        <label className="mb-2 block text-[var(--ink)] text-[12px] font-semibold ml-1 uppercase tracking-[0.06em]">
          {label}
        </label>
      }
      <div className='flex justify-center gap-1 sm:gap-2'>
        {[0, 1, 2, 3, 4, 5].map((item, index) => {
          const digit = renderedDigits[index] || '';
          return (
            <input
              key={item}
              type='text'
              inputMode='numeric'
              maxLength={1}
              value={digit}
              autoFocus={index === 0}
              placeholder='0'
              className={`
                w-full h-[46px] sm:h-[50px] min-w-0 rounded-[7px]
                border text-center text-[18px] sm:text-[20px] font-bold outline-none focus:outline-none
                bg-[var(--surface)] text-[var(--ink)] placeholder:text-[var(--ink)]/45
                transition-all border-[var(--ink)]/20
                ${className}
                ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-[var(--brand-orange)] hover:border-[var(--ink)]/40'}
              `}
              ref={(el) => inputsRef.current[index] = el}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={(e) => handleFocus(index, e)}
              onPaste={(e) => handlePaste(index, e)} />);

        })}
      </div>
      <p
        className={`
            absolute z-50 rounded-[7px]
            bg-red-50 border border-red-500 shadow-lg
            px-3 py-1.5 text-xs text-red-600 max-w-[260px] w-fit text-center
            transition-all duration-200 ease-out transform
            ${error ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'}
          `}>

        {error || ' '}
        <span className="absolute -top-1 left-7 w-2 h-2 bg-red-50 border-t border-l border-red-500 transform rotate-45" />
      </p>
      {footer ?
        footer :
        showResend ?
          <div className='flex flex-col items-stretch gap-2 pt-0 pb-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3'>
            <p className='text-sm font-medium tracking-[-0.14px] text-[var(--ink)]'>
              {resendCount > 0 ? `Resend in ${resendCount} Sec` : "Didn't get the code?"}
            </p>
            <button
              type='button'
              onClick={handleResendClick}
              disabled={resendCount > 0 || resendLoading}
              className='w-full px-4 py-2.5 rounded-[7px] bg-[var(--brand-orange)] text-[15px] font-semibold leading-[100%] tracking-[0.3px] uppercase text-white hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50 sm:w-auto'>

              {resendLoading ? '...' : 'Resend Code'}
            </button>
          </div> :
          null}

      <div className='space-y-2.5 sm:space-y-3 pt-1 sm:pt-2'>
        {showSubmitButton &&
          <button
            type='button'
            className='w-full h-[46px] sm:h-[50px] rounded-[7px] bg-[var(--brand-orange)] hover:opacity-90 active:opacity-80 transition-all text-white font-semibold text-[14px] sm:text-[15px] flex items-center justify-center uppercase disabled:opacity-70 disabled:cursor-not-allowed'
            onClick={onSubmit}
            disabled={loading}>

            {loading ?
              <span className="inline-flex shrink-0 border-[3px] border-white/30 border-t-white rounded-full animate-spin w-5 h-5" /> :

              submitLabel
            }
          </button>
        }

        {goBackTo &&
          <Link
            to={goBackTo}
            className='flex w-full h-[46px] sm:h-[50px] rounded-[7px] border border-[var(--ink)]/20 bg-[var(--surface)] hover:bg-[var(--brand-orange)]/10 items-center justify-center text-[14px] sm:text-[15px] font-semibold uppercase text-[var(--ink)] transition-all'>

            Go back
          </Link>
        }
      </div>
    </div>);

}