"use client";

import { useState } from "react";
import Link from "next/link";

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-black/5 sticky top-0 z-50 bg-white">
      <div className="w-full mx-auto px-8 max-w-7xl lg:px-16">
        <div className="relative flex flex-col w-full py-5 mx-auto lg:items-center lg:justify-between lg:flex-row lg:px-6">
          <div className="flex flex-row items-center justify-between lg:justify-start">
            <Link href="/" className="text-black inline-flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <g clipPath="url(#clip0_nav_logo)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.77414 11.1191C4.92097 11.1191 4.09399 11.0411 3.31862 10.9546C1.88688 10.7951 0.73818 9.64836 0.58452 8.21213C0.501935 7.44022 0.428955 6.61984 0.428955 5.77389C0.428955 4.92792 0.501935 4.10754 0.58452 3.33563C0.73818 1.89941 1.88688 0.752702 3.31862 0.593115C4.09399 0.506687 4.92097 0.428707 5.77414 0.428707C6.62729 0.428707 7.45427 0.506687 8.22964 0.593115C9.66138 0.7527 10.8101 1.89941 10.9637 3.33563C11.0463 4.10754 11.1193 4.92792 11.1193 5.77389C11.1193 6.61984 11.0463 7.44022 10.9637 8.21213C10.8101 9.64836 9.66138 10.7951 8.22964 10.9546C7.45427 11.0411 6.62729 11.1191 5.77414 11.1191ZM16.7747 1.13848C17.5183 0.192147 18.9382 0.192147 19.6819 1.13848C19.9459 1.47456 20.1297 1.82188 20.2742 2.09504C20.3013 2.14637 20.3272 2.19507 20.3517 2.24059C20.5142 2.54047 20.6713 2.79575 20.9389 3.06332C21.2063 3.33088 21.4616 3.48796 21.7616 3.65038C21.807 3.67498 21.8556 3.7007 21.9068 3.7278C22.1801 3.87231 22.5276 4.05621 22.8636 4.32032C23.81 5.06401 23.81 6.48377 22.8636 7.22746C22.5276 7.49155 22.1803 7.6753 21.9072 7.81982C21.8557 7.84698 21.807 7.87275 21.7616 7.8974C21.4618 8.05982 21.2065 8.2169 20.9389 8.48446C20.6713 8.75203 20.5142 9.00732 20.3519 9.30721C20.3272 9.35272 20.3015 9.40143 20.2742 9.45274C20.1297 9.72591 19.9459 10.0732 19.6819 10.4093C18.9382 11.3556 17.5185 11.3556 16.7747 10.4093C16.5106 10.0732 16.3269 9.72591 16.1823 9.45276C16.1552 9.40143 16.1294 9.35272 16.1048 9.30721C15.9423 9.00732 15.7853 8.75203 15.5177 8.48446C15.2501 8.2169 14.9949 8.05984 14.695 7.89742C14.6497 7.87285 14.6012 7.8472 14.5501 7.82018C14.2769 7.67566 13.929 7.49157 13.5929 7.22746C12.6465 6.48377 12.6465 5.06401 13.5929 4.32032C13.929 4.05623 14.2762 3.87248 14.5494 3.72796C14.6007 3.7008 14.6494 3.67503 14.6949 3.65038C14.9948 3.48796 15.2501 3.33088 15.5177 3.06332C15.7852 2.79575 15.9423 2.54047 16.1047 2.24059C16.1293 2.19516 16.155 2.14657 16.1821 2.09536C16.3266 1.82221 16.5106 1.47456 16.7747 1.13848ZM3.31862 23.4087C4.09399 23.4951 4.92097 23.5731 5.77414 23.5731C6.62729 23.5731 7.45427 23.4951 8.22964 23.4087C9.66138 23.2491 10.8101 22.1025 10.9637 20.6662C11.0463 19.8944 11.1193 19.074 11.1193 18.228C11.1193 17.3821 11.0463 16.5617 10.9637 15.7898C10.8101 14.3535 9.66138 13.2068 8.22964 13.0472C7.45427 12.9608 6.62729 12.8828 5.77414 12.8828C4.92097 12.8828 4.09399 12.9608 3.31862 13.0472C1.88688 13.2068 0.73818 14.3535 0.58452 15.7898C0.501935 16.5617 0.428955 17.3821 0.428955 18.228C0.428955 19.074 0.501935 19.8944 0.58452 20.6662C0.73818 22.1025 1.88688 23.2491 3.31862 23.4087ZM18.2282 23.5731C17.3751 23.5731 16.5481 23.4951 15.7727 23.4087C14.341 23.2491 13.1923 22.1025 13.0386 20.6662C12.956 19.8944 12.8831 19.074 12.8831 18.228C12.8831 17.3821 12.956 16.5617 13.0386 15.7898C13.1923 14.3535 14.341 13.2068 15.7727 13.0472C16.5481 12.9608 17.3751 12.8828 18.2282 12.8828C19.0815 12.8828 19.9083 12.9608 20.6838 13.0472C22.1155 13.2068 23.2641 14.3535 23.4179 15.7898C23.5004 16.5617 23.5734 17.3821 23.5734 18.228C23.5734 19.074 23.5004 19.8944 23.4179 20.6662C23.2641 22.1025 22.1155 23.2491 20.6838 23.4087C19.9083 23.4951 19.0815 23.5731 18.2282 23.5731Z" fill="url(#paint0_linear_nav_logo)" />
                </g>
                <defs>
                  <linearGradient id="paint0_linear_nav_logo" x1="23.4945" y1="23.5783" x2="-3.91363" y2="8.16067" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7c3aed" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                  <clipPath id="clip0_nav_logo">
                    <rect width="24.0016" height="24.0016" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span className="font-bold text-lg">Flowtusk</span>
            </Link>
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="main-navigation"
              aria-label="Toggle navigation menu"
              className="inline-flex items-center justify-center p-2 text-base-400 hover:text-black focus:outline-none focus:text-black lg:hidden">
              <svg
                className={`w-6 h-6 transition-transform duration-300 ease-in-out ${open ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                {!open ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16">
                  </path>
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12">
                  </path>
                )}
              </svg>
            </button>
          </div>
          <nav
            id="main-navigation"
            className={`flex-col items-center flex-grow gap-4 lg:gap-4 flex overflow-hidden lg:pb-0 lg:flex lg:justify-end lg:flex-row ${open ? 'h-auto' : 'h-0'} lg:h-auto`}>
            <div className="inline-flex items-center gap-3 list-none py-px lg:ml-auto">
              <Link
                href="/auth/login"
                className="btn-secondary flex items-center justify-center h-9 px-5 py-2 text-sm font-medium rounded-md transition-all hover:bg-base-100">
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="flex items-center justify-center focus:ring-2 focus:outline-none focus:ring-purple-500/50 h-9 px-5 py-2 text-sm font-semibold text-white rounded-md transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' }}>
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
