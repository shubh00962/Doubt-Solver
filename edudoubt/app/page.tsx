import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import HeroSearch from '@/components/HeroSearch';

const subjects = [
  { name: 'Mathematics', icon: '📐', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' },
  { name: 'Physics', icon: '⚛️', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200' },
  { name: 'Chemistry', icon: '🧪', color: 'bg-green-50 dark:bg-green-900/20 border-green-200' },
  { name: 'Biology', icon: '🧬', color: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200' },
  { name: 'English', icon: '📚', color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200' },
  { name: 'History', icon: '🏛️', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200' },
  { name: 'Computer Science', icon: '💻', color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200' },
  { name: 'Economics', icon: '📊', color: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200' },
];

const testimonials = [
  { name: 'Priya Sharma', grade: 'Class 12', text: 'EduDoubt helped me understand calculus in minutes. The AI explanations are so clear!', avatar: 'PS' },
  { name: 'Rahul Verma', grade: 'Class 10', text: 'I was stuck on organic chemistry for days. The expert session cleared everything up.', avatar: 'RV' },
  { name: 'Ananya Singh', grade: 'JEE Aspirant', text: 'The step-by-step solutions with LaTeX rendering are perfect for math problems.', avatar: 'AS' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#6C63FF]/10 via-white to-[#00C9A7]/10 dark:from-[#6C63FF]/20 dark:via-gray-900 dark:to-[#00C9A7]/10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#6C63FF]/10 text-[#6C63FF] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>✨</span> AI-Powered Learning Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Get your doubt solved{' '}
            <span className="text-[#6C63FF]">in seconds</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Ask any academic question and get instant AI-powered answers. Connect with expert tutors for deeper understanding.
          </p>
          <HeroSearch />
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-gray-500">
            <span>✅ Free AI answers</span>
            <span>✅ Expert tutors available 24/7</span>
            <span>✅ All subjects covered</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#6C63FF] py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { value: '10,000+', label: 'Doubts Solved' },
            { value: '500+', label: 'Expert Tutors' },
            { value: '< 3 sec', label: 'AI Response' },
            { value: '4.9★', label: 'Student Rating' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-purple-200 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Browse by Subject</h2>
          <p className="text-gray-500">Expert help across all major academic subjects</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {subjects.map((subject) => (
            <Link
              key={subject.name}
              href={`/doubt?subject=${encodeURIComponent(subject.name)}`}
              className={`${subject.color} border rounded-2xl p-6 text-center hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer`}
            >
              <div className="text-4xl mb-3">{subject.icon}</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{subject.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">How It Works</h2>
            <p className="text-gray-500">Three simple steps to get your doubt solved</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '✍️', title: 'Ask Your Doubt', desc: 'Type your question or upload a photo of your textbook/notebook.' },
              { step: '02', icon: '🤖', title: 'AI Solves Instantly', desc: 'Our Claude AI provides step-by-step solutions with math rendering in under 3 seconds.' },
              { step: '03', icon: '👨‍🏫', title: 'Expert if Needed', desc: 'Still confused? Book a live video session with a verified expert tutor.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-[#6C63FF]/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-[#6C63FF] font-bold text-sm mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">What Students Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#6C63FF] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.grade}</div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm italic">"{t.text}"</p>
              <div className="flex mt-3 text-yellow-400">★★★★★</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#6C63FF] to-[#00C9A7]">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to solve your doubts?</h2>
          <p className="text-purple-100 mb-8">Join 10,000+ students already learning smarter with EduDoubt.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="bg-white text-[#6C63FF] font-bold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Get Started Free
            </Link>
            <Link href="/experts" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Browse Experts
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
