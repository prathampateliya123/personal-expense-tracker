/**
 * components/OtpInput.jsx
 * 6-digit OTP input fields.
 */

import { useRef } from "react";
import { authInputClass } from "./AuthCard";

const OtpInput = ({ value, onChange, disabled }) => {
  const inputsRef = useRef([]);

  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const focusInput = (index) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index, char) => {
    const cleaned = char.replace(/\D/g, "");
    const arr = value.padEnd(6, " ").split("").slice(0, 6);

    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6);
      onChange(pasted);
      focusInput(Math.min(pasted.length, 5));
      return;
    }

    arr[index] = cleaned || " ";
    const next = arr.join("").replace(/ /g, "").slice(0, 6);
    onChange(next);

    if (cleaned && index < 5) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      focusInput(index - 1);
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          disabled={disabled}
          value={digit.trim()}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={`${authInputClass} h-12 w-10 text-center text-lg font-semibold sm:h-14 sm:w-12`}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
