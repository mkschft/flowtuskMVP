import Link from "next/link";

export function Footer() {
  return (
    <>
      {/* Demo Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-16 mt-20">
        <div className="px-6 md:px-12 lg:px-24 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Book a Demo
          </h2>
          <p className="text-base text-gray-600 mb-8">
            See how Flowtusk can transform your brand strategy in minutes. Schedule a personalized demo today.
          </p>
          <div id="demo-form" className="flex items-center justify-center w-full max-w-lg mx-auto">
            <a
              href="https://calendar.app.google/fVMLbGtD9LWPeoTL9"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' }}>
              Book a Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-base-200">
        <div className="px-6 md:px-12 lg:px-24 py-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            {/* Left Side: Logo and Copyright */}
            <div className="flex flex-col">
              {/* Logo */}
              <Link href="/" className="inline-flex items-center gap-3 mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_footer_logo)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.77414 11.1191C4.92097 11.1191 4.09399 11.0411 3.31862 10.9546C1.88688 10.7951 0.73818 9.64836 0.58452 8.21213C0.501935 7.44022 0.428955 6.61984 0.428955 5.77389C0.428955 4.92792 0.501935 4.10754 0.58452 3.33563C0.73818 1.89941 1.88688 0.752702 3.31862 0.593115C4.09399 0.506687 4.92097 0.428707 5.77414 0.428707C6.62729 0.428707 7.45427 0.506687 8.22964 0.593115C9.66138 0.7527 10.8101 1.89941 10.9637 3.33563C11.0463 4.10754 11.1193 4.92792 11.1193 5.77389C11.1193 6.61984 11.0463 7.44022 10.9637 8.21213C10.8101 9.64836 9.66138 10.7951 8.22964 10.9546C7.45427 11.0411 6.62729 11.1191 5.77414 11.1191ZM16.7747 1.13848C17.5183 0.192147 18.9382 0.192147 19.6819 1.13848C19.9459 1.47456 20.1297 1.82188 20.2742 2.09504C20.3013 2.14637 20.3272 2.19507 20.3517 2.24059C20.5142 2.54047 20.6713 2.79575 20.9389 3.06332C21.2063 3.33088 21.4616 3.48796 21.7616 3.65038C21.807 3.67498 21.8556 3.7007 21.9068 3.7278C22.1801 3.87231 22.5276 4.05621 22.8636 4.32032C23.81 5.06401 23.81 6.48377 22.8636 7.22746C22.5276 7.49155 22.1803 7.6753 21.9072 7.81982C21.8557 7.84698 21.807 7.87275 21.7616 7.8974C21.4618 8.05982 21.2065 8.2169 20.9389 8.48446C20.6713 8.75203 20.5142 9.00732 20.3519 9.30721C20.3272 9.35272 20.3015 9.40143 20.2742 9.45274C20.1297 9.72591 19.9459 10.0732 19.6819 10.4093C18.9382 11.3556 17.5185 11.3556 16.7747 10.4093C16.5106 10.0732 16.3269 9.72591 16.1823 9.45276C16.1552 9.40143 16.1294 9.35272 16.1048 9.30721C15.9423 9.00732 15.7853 8.75203 15.5177 8.48446C15.2501 8.2169 14.9949 8.05984 14.695 7.89742C14.6497 7.87285 14.6012 7.8472 14.5501 7.82018C14.2769 7.67566 13.929 7.49157 13.5929 7.22746C12.6465 6.48377 12.6465 5.06401 13.5929 4.32032C13.929 4.05623 14.2762 3.87248 14.5494 3.72796C14.6007 3.7008 14.6494 3.67503 14.6949 3.65038C14.9948 3.48796 15.2501 3.33088 15.5177 3.06332C15.7852 2.79575 15.9423 2.54047 16.1047 2.24059C16.1293 2.19516 16.155 2.14657 16.1821 2.09536C16.3266 1.82221 16.5106 1.47456 16.7747 1.13848ZM3.31862 23.4087C4.09399 23.4951 4.92097 23.5731 5.77414 23.5731C6.62729 23.5731 7.45427 23.4951 8.22964 23.4087C9.66138 23.2491 10.8101 22.1025 10.9637 20.6662C11.0463 19.8944 11.1193 19.074 11.1193 18.228C11.1193 17.3821 11.0463 16.5617 10.9637 15.7898C10.8101 14.3535 9.66138 13.2068 8.22964 13.0472C7.45427 12.9608 6.62729 12.8828 5.77414 12.8828C4.92097 12.8828 4.09399 12.9608 3.31862 13.0472C1.88688 13.2068 0.73818 14.3535 0.58452 15.7898C0.501935 16.5617 0.428955 17.3821 0.428955 18.228C0.428955 19.074 0.501935 19.8944 0.58452 20.6662C0.73818 22.1025 1.88688 23.2491 3.31862 23.4087ZM18.2282 23.5731C17.3751 23.5731 16.5481 23.4951 15.7727 23.4087C14.341 23.2491 13.1923 22.1025 13.0386 20.6662C12.956 19.8944 12.8831 19.074 12.8831 18.228C12.8831 17.3821 12.956 16.5617 13.0386 15.7898C13.1923 14.3535 14.341 13.2068 15.7727 13.0472C16.5481 12.9608 17.3751 12.8828 18.2282 12.8828C19.0815 12.8828 19.9083 12.9608 20.6838 13.0472C22.1155 13.2068 23.2641 14.3535 23.4179 15.7898C23.5004 16.5617 23.5734 17.3821 23.5734 18.228C23.5734 19.074 23.5004 19.8944 23.4179 20.6662C23.2641 22.1025 22.1155 23.2491 20.6838 23.4087C19.9083 23.4951 19.0815 23.5731 18.2282 23.5731Z" fill="url(#paint0_linear_footer_logo)"/>
                  </g>
                  <defs>
                    <linearGradient id="paint0_linear_footer_logo" x1="23.4945" y1="23.5783" x2="-3.91363" y2="8.16067" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#7c3aed"/>
                      <stop offset="1" stopColor="#8b5cf6"/>
                    </linearGradient>
                    <clipPath id="clip0_footer_logo">
                      <rect width="24.0016" height="24.0016" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <span className="text-xl font-semibold text-black">Flowtusk</span>
              </Link>
              {/* Copyright */}
              <p className="text-xs text-gray-400">&copy; 2025 Makeshift Digital Oy. All rights reserved.</p>
            </div>
            
            {/* Right Side: Email and Helsinki Message */}
            <div className="flex flex-col items-end md:items-end text-right">
              <span className="text-sm text-gray-600 mb-6">hello@flowtusk.com</span>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                Made with 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#paint0_linear_heart)"/>
                  <defs>
                    <linearGradient id="paint0_linear_heart" x1="12" y1="3" x2="12" y2="21.35" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#7c3aed"/>
                      <stop offset="1" stopColor="#8b5cf6"/>
                    </linearGradient>
                  </defs>
                </svg>
                in Helsinki
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
