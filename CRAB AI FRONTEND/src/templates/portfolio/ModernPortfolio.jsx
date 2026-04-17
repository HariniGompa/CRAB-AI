const ModernPortfolio = ({ data, sections }) => {
  return (
    <div className="min-h-full font-sans">
      
      {/* Hero */}
      <div className="bg-black text-white p-10 text-center">
        <h1 className="text-4xl font-bold">{data.personal.fullName}</h1>
        <p className="text-lg mt-2 opacity-80">{data.personal.title}</p>
      </div>

      <div className="p-8 max-w-5xl mx-auto space-y-10">

        {/* About */}
        {sections.about && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">About</h2>
            <p className="text-gray-600">{data.about}</p>
          </section>
        )}

        {/* Skills */}
        {sections.skills && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">Skills</h2>
            <div className="grid grid-cols-3 gap-3">
              {data.skills.map((skill, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-100 rounded text-center text-sm"
                >
                  {skill}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {sections.projects && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Projects</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {data.projects.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ModernPortfolio;
