import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

type Tab = 'login' | 'register';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <!-- Animated background -->
    <div class="auth-bg">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <div class="auth-wrap">
      <div class="auth-card glass-card">

        <!-- Logo -->
        <div class="auth-logo">
          <div class="logo-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span class="logo-text">TaskFlow</span>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab-btn" [class.active]="tab() === 'login'"    (click)="tab.set('login')">Sign In</button>
          <button class="tab-btn" [class.active]="tab() === 'register'" (click)="tab.set('register')">Sign Up</button>
          <div class="tab-bar" [class.right]="tab() === 'register'"></div>
        </div>

        <!-- LOGIN FORM -->
        @if (tab() === 'login') {
          <form class="auth-form" [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input class="form-input" type="email" placeholder="you@example.com" formControlName="email" id="login-email" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <input class="form-input" type="password" placeholder="Enter your password" formControlName="password" id="login-password" />
              </div>
            </div>

            @if (loginError()) {
              <div class="alert alert-error">{{ loginError() }}</div>
            }

            <button class="btn btn-primary btn-full" type="submit" [disabled]="loginLoading()">
              @if (loginLoading()) { <span class="spinner"></span> }
              Sign In
            </button>
          </form>
        }

        <!-- REGISTER FORM -->
        @if (tab() === 'register') {
          <form class="auth-form" [formGroup]="registerForm" (ngSubmit)="onRegister()">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input class="form-input" type="text" placeholder="John Doe" formControlName="fullName" id="reg-name" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input class="form-input" type="email" placeholder="you@example.com" formControlName="email" id="reg-email" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <input class="form-input" type="password" placeholder="Create a password" formControlName="password" id="reg-password" />
              </div>
            </div>

            @if (regError()) {
              <div class="alert alert-error">{{ regError() }}</div>
            }
            @if (regSuccess()) {
              <div class="alert alert-success">{{ regSuccess() }}</div>
            }

            <button class="btn btn-primary btn-full" type="submit" [disabled]="regLoading()">
              @if (regLoading()) { <span class="spinner"></span> }
              Create Account
            </button>
            <p class="auth-note">New accounts are assigned the <strong>Employee</strong> role by default.</p>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex; min-height: 100vh;
      align-items: center; justify-content: center;
      position: relative; background: var(--bg-primary);
    }
    .auth-bg {
      position: fixed; inset: 0; pointer-events: none; overflow: hidden;
    }
    .orb {
      position: absolute; border-radius: 50%;
      filter: blur(100px); opacity: .22;
    }
    .orb-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #6366f1, transparent 70%);
      top: -150px; left: -150px;
      animation: float1 12s ease-in-out infinite;
    }
    .orb-2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #8b5cf6, transparent 70%);
      bottom: -100px; right: -100px;
      animation: float2 15s ease-in-out infinite;
    }
    .orb-3 {
      width: 300px; height: 300px;
      background: radial-gradient(circle, #3b82f6, transparent 70%);
      top: 50%; left: 50%; transform: translate(-50%,-50%);
      animation: float3 10s ease-in-out infinite;
    }
    @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,40px)} }
    @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,-30px)} }
    @keyframes float3 { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.15)} }

    .auth-wrap { position: relative; z-index: 1; width: 100%; max-width: 440px; padding: 24px; }
    .auth-card { padding: 40px 36px; }

    .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
    .logo-icon {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, var(--accent), #8b5cf6);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center; color: #fff;
      box-shadow: 0 4px 16px var(--accent-glow); flex-shrink: 0;
    }
    .logo-text {
      font-size: 22px; font-weight: 700;
      background: linear-gradient(135deg, var(--accent-light), #c4b5fd);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    /* Tabs */
    .tabs {
      display: flex; position: relative;
      background: rgba(255,255,255,.04);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md); padding: 4px;
      margin-bottom: 28px;
    }
    .tab-btn {
      flex: 1; padding: 10px;
      border: none; background: transparent;
      color: var(--text-secondary);
      font-family: inherit; font-size: 14px; font-weight: 500;
      cursor: pointer; border-radius: var(--radius-sm);
      position: relative; z-index: 1;
      transition: color var(--transition);
    }
    .tab-btn.active { color: var(--text-primary); }
    .tab-bar {
      position: absolute; top: 4px; bottom: 4px; left: 4px;
      width: calc(50% - 4px);
      background: linear-gradient(135deg, var(--accent), #8b5cf6);
      border-radius: calc(var(--radius-sm) - 2px);
      transition: transform var(--spring);
      box-shadow: 0 4px 12px var(--accent-glow);
    }
    .tab-bar.right { transform: translateX(100%); }

    /* Forms */
    .auth-form { display: flex; flex-direction: column; gap: 18px; }
    .form-group { display: flex; flex-direction: column; }
    .auth-note  { font-size: 12px; color: var(--text-muted); text-align: center; margin-top: -8px; }

    @media (max-width: 480px) {
      .auth-card { padding: 28px 18px; }
    }
  `],
})
export class AuthComponent {
  private fb     = inject(FormBuilder);
  private authSvc = inject(AuthService);
  private router  = inject(Router);
  private toast   = inject(ToastService);

  tab = signal<Tab>('login');

  loginError   = signal('');
  loginLoading = signal(false);
  regError     = signal('');
  regSuccess   = signal('');
  regLoading   = signal(false);

  loginForm = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  registerForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loginLoading.set(true);
    this.loginError.set('');

    this.authSvc.login(this.loginForm.getRawValue()).subscribe({
      next: (res) => {
        this.loginLoading.set(false);
        this.toast.success(`Welcome back, ${res.user.fullName}! 👋`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loginLoading.set(false);
        this.loginError.set(err?.error?.message || err?.error || 'Invalid email or password.');
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.regLoading.set(true);
    this.regError.set('');
    this.regSuccess.set('');

    this.authSvc.register(this.registerForm.getRawValue()).subscribe({
      next: () => {
        this.regLoading.set(false);
        this.regSuccess.set('✅ Account created! You can now sign in.');
        this.registerForm.reset();
        setTimeout(() => this.tab.set('login'), 1800);
      },
      error: (err) => {
        this.regLoading.set(false);
        this.regError.set(err?.error?.message || err?.error || 'Registration failed.');
      },
    });
  }
}
