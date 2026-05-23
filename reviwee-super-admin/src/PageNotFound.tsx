import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-(--primary-dark) text-white px-4">
      <h1 className="text-8xl font-bold mb-2 text-white">404</h1>
      <h2 className="text-2xl font-medium text-white/90 mb-6">Page Not Found</h2>
      <p className="text-white/70 text-center max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="rounded-lg px-6 py-3 bg-(--primary-main) text-white font-semibold hover:bg-(--primary-hover) transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default PageNotFound;
