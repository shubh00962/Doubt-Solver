import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-xl text-white">EduDoubt</span>
            </div>
            <p className="text-sm">AI-powered doubt solving for every student.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/doubt" className="hover:text-white transition-colors">Ask a Doubt</Link></li>
              <li><Link href="/experts" className="hover:text-white transition-colors">Find Experts</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Become an Expert</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Subjects</h4>
            <ul className="space-y-2 text-sm">
              {['Math', 'Physics', 'Chemistry', 'Biology', 'Computer Science'].map((s) => (
                <li key={s}><Link href={`/experts?subject=${s}`} className="hover:text-white transition-colors">{s}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          © {new Date().getFullYear()} EduDoubt. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
