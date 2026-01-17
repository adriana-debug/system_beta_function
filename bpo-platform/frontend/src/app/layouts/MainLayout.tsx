import { Fragment } from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut, Sun, Moon } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';

import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../providers/ThemeProvider';
import { Sidebar } from '../../components/Sidebar';
import type { BrandVariant } from '../../themes';

const brandVariants: { value: BrandVariant; label: string; color: string }[] = [
  { value: 'blue', label: 'Corporate Blue', color: 'bg-blue-600' },
  { value: 'green', label: 'Operations Green', color: 'bg-green-600' },
  { value: 'purple', label: 'Analytics Purple', color: 'bg-purple-600' },
];

export function MainLayout() {
  const { user, logout } = useAuthStore();
  const { mode, variant, toggleMode, setVariant } = useTheme();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="h-16 flex items-center justify-between px-6">
              <div className="flex-1" />

              <div className="flex items-center gap-4">
                {/* Theme switcher */}
                <button
                  onClick={toggleMode}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
                >
                  {mode === 'light' ? (
                    <Moon size={20} className="text-gray-600" />
                  ) : (
                    <Sun size={20} className="text-gray-600" />
                  )}
                </button>

                {/* Brand variant switcher */}
                <Menu as="div" className="relative">
                  <Menu.Button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-gray-200 focus:outline-none">
                      <div className="p-1">
                        {brandVariants.map((brand) => (
                          <Menu.Item key={brand.value}>
                            {({ active }) => (
                              <button
                                onClick={() => setVariant(brand.value)}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } ${
                                  variant === brand.value
                                    ? 'text-blue-600'
                                    : 'text-gray-700'
                                } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                              >
                                <span
                                  className={`mr-3 h-4 w-4 rounded-full ${brand.color}`}
                                />
                                {brand.label}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>

                {/* Example Dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    Actions
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-gray-200 focus:outline-none">
                      <div className="p-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                            >
                              Action 1
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                            >
                              Action 2
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>

                {/* User menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.fullName}
                    </span>
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-gray-200 focus:outline-none">
                      <div className="p-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.fullName}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          {user?.role?.name}
                        </p>
                      </div>
                      <div className="p-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } text-red-600 group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                            >
                              <LogOut className="mr-3 h-5 w-5" />
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto bg-gray-100">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
