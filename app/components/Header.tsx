import { Link } from "remix";

export default function Header() {
  return (
    <div className="px-4 py-2 border-0 shadow-md light z-10 w-full">
      <nav className="flex justify-between items-center container max-w-4xl container">
        <Link to="/">
          <h1
            className="text-2xl text-center font-header font-bold flex items-center 
          justify-center gap-x-2"
          >
            <img
              className="inline h-6 object-fill"
              src="../icons/logo.svg"
              alt="logo"
            />
            <span className="hidden sm:inline">Plurality</span>
          </h1>
        </Link>
        <div className="flex items-center space-x-8 ">
          <ul className="hidden sm:flex space-x-8">
            <li>
              <Link to="/questions">Questions</Link>
            </li>
            <li>
              <Link to="/">Help</Link>
            </li>
            <li>
              <Link to="/">Contact Us</Link>
            </li>
          </ul>
          <button
            className="px-2 py-1 rounded-sm border-button text-button 
      bg-[#F9F1F0] font-bold border-2 shadow"
          >
            <img
              className="inline mr-2"
              src="../icons/wallet.svg"
              alt="wallet"
            />
            Connect wallet
          </button>
        </div>
      </nav>
    </div>
  );
}
