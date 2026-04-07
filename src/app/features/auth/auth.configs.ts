import { Validators } from '@angular/forms';
import { AuthCardConfig } from '@core/models/auth-form-config.model';
import { matches, rule } from '@shared/utils/validators';

const emailValidators = [
  rule(Validators.required, 'Email is required'),
  rule(Validators.email, 'Please enter a valid email address'),
];

const passwordValidators = [
  rule(Validators.required, 'Password is required'),
  rule(Validators.minLength(8), 'Password must be at least 8 characters'),
  matches(/[A-Z]/, 'Password must contain at least one uppercase letter'),
  matches(/[a-z]/, 'Password must contain at least one lowercase letter'),
  matches(/[0-9]/, 'Password must contain at least one number'),
];

export const LOGIN_CONFIG: AuthCardConfig = {
  title: 'Welcome to GexChat',
  subtitle: "Let's see if you still remember your login.",
  submitLabel: 'Sign in',
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      validators: emailValidators,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      validators: passwordValidators,
    },
  ],
  secondaryButton: {
    label: 'Continue as guest',
    routerLink: '/guest',
  },
  footerLink: {
    prefixText: "Don't have an account?",
    linkText: 'Sign up here',
    routerLink: '/register',
  },
};

export const REGISTER_CONFIG: AuthCardConfig = {
  title: 'Create an Account',
  subtitle: 'Join GexChat today.',
  submitLabel: 'Create user',
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      validators: emailValidators,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      validators: passwordValidators,
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      validators: [rule(Validators.required, 'Please confirm your password')],
    },
  ],
  footerLink: {
    prefixText: 'Already have a user?',
    linkText: 'Sign in',
    routerLink: '/login',
  },
};

export const GUEST_CONFIG: AuthCardConfig = {
  title: 'Continue as Guest',
  subtitle: 'Pick a username to get started.',
  submitLabel: 'Create guest session',
  fields: [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      validators: [
        rule(Validators.required, 'Username is required'),
        rule(Validators.minLength(3), 'Username must be at least 3 characters'),
      ],
    },
  ],
  secondaryButton: {
    label: 'Back to login',
    routerLink: '/login',
  },
  footerLink: {
    prefixText: 'Already have a user?',
    linkText: 'Sign in',
    routerLink: '/login',
  },
};

export const VERIFY_CONFIG: AuthCardConfig = {
  title: 'Verify your Email',
  subtitle: "We've sent a verification link to your email address.",
  submitLabel: 'Resend verification email',
  fields: [],
  secondaryButton: {
    label: 'Back to login',
    routerLink: '/login',
  },
};
