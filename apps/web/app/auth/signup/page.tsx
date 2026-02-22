'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { LandingHeader, DarkFooter } from '@/components/landing';

const signupSchema = z
  .object({
    firstName: z.string().min(1, 'Prénom requis'),
    lastName: z.string().min(1, 'Nom requis'),
    email: z.string().email('Email invalide'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Au moins 8 caractères'),
    confirmPassword: z.string().min(1, 'Confirmation requise'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const inputClass =
  'w-full h-12 px-4 bg-[#3C3C3C] border border-white/15 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-landing-orange focus:ring-1 focus:ring-landing-orange/30 transition-colors';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-wider text-white mb-2';

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    setError('');
    try {
      const { confirmPassword: _confirmPassword, ...dto } = data;
      await authApi.signup(dto);
      const meRes = await authApi.getMe();
      setUser(meRes.data.data);
      router.push('/onboarding');
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const msg = res?.message;
      const text =
        typeof msg === 'string'
          ? msg
          : Array.isArray(msg)
            ? msg[0]
            : 'Une erreur est survenue';
      setError(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white flex flex-col">
      <LandingHeader />

      <main className="flex-1 pt-[72px] pb-16">
        <div className="landing-container flex justify-center px-4 sm:px-6 py-12 sm:py-16">
          <div className="w-full max-w-[420px]">
            <div className="bg-[#2A2A2A] rounded-lg border border-white/[0.08] p-8 sm:p-10">
              <h1 className="text-[28px] sm:text-[32px] font-bold leading-tight text-white">
                Créer un compte
              </h1>
              <p className="text-white/70 text-base mt-2 mb-8">
                Rejoignez Jambaar et commencez à apprendre
              </p>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 h-12 px-4 bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] font-medium hover:bg-gray-50 transition-colors"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>

              <div className="flex items-center gap-4 my-8">
                <span className="flex-1 h-px bg-white/15" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                  Ou continuez avec votre email
                </span>
                <span className="flex-1 h-px bg-white/15" />
              </div>

              {error && (
                <div
                  className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className={labelClass}>Prénom</label>
                  <input
                    {...register('firstName')}
                    placeholder=""
                    className={inputClass}
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Nom</label>
                  <input
                    {...register('lastName')}
                    placeholder=""
                    className={inputClass}
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Téléphone</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="221 00 000 00 00"
                    className={inputClass}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>E-mail</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder=""
                    className={inputClass}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Mot de passe</label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder=""
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors p-1"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Confirmer le mot de passe</label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder=""
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors p-1"
                      aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-landing-orange hover:bg-landing-orange-hover disabled:opacity-50 text-white font-semibold rounded-lg transition-colors mt-2"
                >
                  {loading ? 'Création...' : 'Créer un compte'}
                  <ArrowRight size={18} className="shrink-0" />
                </button>
              </form>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <span className="text-sm text-white/60">Vous avez déjà un compte ?</span>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-white hover:text-landing-orange flex items-center gap-1.5 transition-colors"
                >
                  Se connecter
                  <ArrowRight size={16} className="shrink-0" />
                </Link>
              </div>
            </div>

            <p className="text-center mt-8">
              <Link
                href="/"
                className="text-sm text-white/60 hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={16} className="shrink-0" />
                Retour à la page d&apos;accueil
              </Link>
            </p>
          </div>
        </div>
      </main>

      <DarkFooter />
    </div>
  );
}
