import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-surface-900">
              BPO Platform
            </h1>
            <p className="text-sm text-surface-600 mt-1">
              Internal Operations Management
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
