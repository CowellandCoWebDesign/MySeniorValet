/**
 * Password Validation Service
 * Implements Google's strong password standards
 */

export interface PasswordStrength {
  score: number; // 0-5
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    notCommon: boolean;
  };
  feedback: string[];
}

// Common weak passwords to check against
const COMMON_PASSWORDS = [
  'password', '12345678', '123456789', 'password123', 'admin', 'letmein',
  'welcome', 'monkey', '1234567890', 'qwerty', 'abc123', 'Password1',
  'password1', 'welcome123', 'admin123', 'root', 'toor', 'pass',
  'changeme', 'password!', 'Password123', 'password123!', 'qwerty123',
  'mysenirvalet', 'senior123', 'senior2025'
];

export function validatePassword(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase())
  };

  const feedback: string[] = [];
  let score = 0;

  // Check each requirement
  if (!requirements.minLength) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score++;
  }

  if (!requirements.hasUppercase) {
    feedback.push('Include at least one uppercase letter');
  } else {
    score++;
  }

  if (!requirements.hasLowercase) {
    feedback.push('Include at least one lowercase letter');
  } else {
    score++;
  }

  if (!requirements.hasNumber) {
    feedback.push('Include at least one number');
  } else {
    score++;
  }

  if (!requirements.hasSpecialChar) {
    feedback.push('Include at least one special character (!@#$%^&*...)');
  } else {
    score++;
  }

  if (!requirements.notCommon) {
    feedback.push('This password is too common. Please choose something more unique');
    score = Math.max(0, score - 2); // Heavily penalize common passwords
  }

  // Additional strength checks
  if (password.length >= 12) {
    score = Math.min(5, score + 0.5);
  }
  if (password.length >= 16) {
    score = Math.min(5, score + 0.5);
  }

  // All requirements must be met for password to be valid
  const isValid = Object.values(requirements).every(req => req === true);

  if (isValid && feedback.length === 0) {
    feedback.push('Strong password!');
  }

  return {
    score: Math.min(5, score),
    isValid,
    requirements,
    feedback
  };
}

export function getPasswordStrengthLabel(score: number): string {
  if (score <= 1) return 'Very Weak';
  if (score <= 2) return 'Weak';
  if (score <= 3) return 'Fair';
  if (score <= 4) return 'Good';
  return 'Strong';
}

export function getPasswordStrengthColor(score: number): string {
  if (score <= 1) return 'text-red-600';
  if (score <= 2) return 'text-orange-500';
  if (score <= 3) return 'text-yellow-500';
  if (score <= 4) return 'text-blue-500';
  return 'text-green-600';
}