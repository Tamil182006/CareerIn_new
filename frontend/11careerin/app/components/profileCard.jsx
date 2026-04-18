'use client';

export default function ProfileCard() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Loki
            </h1>
            <p className="text-slate-600 mt-1">
              Data Scientist
            </p>
          </div>

          <div className="flex gap-3">
            <img src="" alt="" srcset="" className="w-32 h-32 rounded-full object-cover" />
          </div>
        </div>

        <p className="text-slate-600 mt-1">
              Email ID: xxxx@gmail.com
        </p>
        <p className="text-slate-600 mt-1">
              Phone: xxx xxx xxxx
        </p>
        <p className="text-slate-600 mt-1">
             Location: Chennai, Tamil Nadu
        </p>
        {/* About */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">
            About Me
          </h2>
          <p className="mt-3 text-slate-700 leading-relaxed">
            Passionate about Data Science, Machine Learning, Web & Native App
            Development. Strong problem solver with hands-on experience in
            Python, DSA, and AI-driven projects. Actively preparing for
            product-based company internships and technical interviews.
          </p>
        </div>

        {/* Skills */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">
            Skills
          </h2>

          <div className="flex flex-wrap gap-2 mt-4">
            {[
              "Python",
              "Data Structures",
              "Machine Learning",
              "Deep Learning",
              "Next.js",
              "SQL",
              "Git",
              "REST APIs",
            ].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-sm rounded-full bg-blue-400 text-white"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">
            Education
          </h2>
          <ul className="mt-3 list-disc list-inside text-slate-700 space-y-2">
            <li>ABC Higher Secondary school - 75%</li>
            <li>XYZ University - degree - 8.3</li>
          </ul>
        </div>

        {/* Eligiblity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">
            Current Eligible roles
          </h2>
          <ul className="mt-3 list-disc list-inside text-slate-700 space-y-2">
            <li>Software developer - 80%</li>
            <li>Data Scientist - 65%</li>
          </ul>
        </div>

        {/* Goals */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">
            Current Focus
          </h2>
          <ul className="mt-3 list-disc list-inside text-slate-700 space-y-2">
            <li>Django</li>
            <li>AI/ML</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
