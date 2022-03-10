export default function Header() {
  return (
    <div className="px-4 py-2 border-0 shadow-md light z-10 w-full">
      <nav className="flex justify-between items-center container">
        <h1
          className="text-2xl text-center font-header font-bold flex items-center 
          justify-center gap-x-2"
        >
          <img
            className="inline h-6 object-fill"
            src="./icons/logo.svg"
            alt="logo"
          />
          <span className="hidden sm:inline">Plurality</span>
        </h1>
        <div className="flex items-center space-x-4 ">
          <ul className="hidden sm:flex space-x-4">
            <li>Questions</li>
            <li>Help</li>
            <li>Contact Us</li>
          </ul>
          <button
            className="px-2 py-1 rounded-sm border-button text-button 
      bg-[#F9F1F0] font-bold border-2 shadow"
          >
            <img
              className="inline mr-2"
              src="./icons/wallet.svg"
              alt="wallet"
            />
            Connect wallet
          </button>
        </div>
      </nav>
    </div>
  );
}
