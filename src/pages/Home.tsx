export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center text-center bg-gradient-to-br from-gray-50 to-blue-50">
      <h2 className="text-5xl font-bold mb-4 text-gray-800 tracking-tight">
        Welcome to <span className="text-blue-600">Real-Time Games</span>
      </h2>
      <p className="text-gray-600 text-lg max-w-xl">
        Learn, explore, and experiment with real-time scheduling concepts through
        interactive puzzles and visual tools.
      </p>
      <div className="mt-8 flex space-x-4">
        <a
          href="/free-scheduler"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          Try Free Scheduler
        </a>
        <a
          href="/chapter-1"
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-transform transform hover:scale-105"
        >
          Start Learning
        </a>
      </div>
    </div>
  );
}
