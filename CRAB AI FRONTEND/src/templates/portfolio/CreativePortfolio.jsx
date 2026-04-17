const CreativePortfolio = ({ data, sections }) => {
  return (
    <div className="min-h-full flex font-sans">

      {/* Sidebar */}
      <div className="w-64 bg-purple-700 text-white p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{data.personal.fullName}</h1>
          <p className="text-sm opacity-80">{data.personal.title}</p>
        </div>

        {sections.skills && (
          <div>
            <h2 className="font-semibold mb-2">Skills</h2>
            <div className="space-y-1 text-sm">
              {data.skills.map((skill, i) => (
                <div key={i}>{skill}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-10 space-y-10">

        {/* About */}
        {sections.about && (
          <section>
            <h2 className="text-2xl font-bold mb-3">About Me</h2>
            <p className="text-gray-700">{data.about}</p>
          </section>
        )}

        {/* Projects */}
        {sections.projects && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Projects</h2>

            <div className="space-y-4">
              {data.projects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 border-l-4 border-purple-600 bg-gray-50"
                >
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-gray-600">
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

export default CreativePortfolio;
