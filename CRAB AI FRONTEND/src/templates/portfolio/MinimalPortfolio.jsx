const MinimalPortfolio = ({ data, sections }) => {
  return (
    <div className="p-8 max-w-3xl mx-auto font-sans">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{data.personal.fullName}</h1>
        <p className="text-gray-600">{data.personal.title}</p>
      </header>

      {/* About */}
      {sections.about && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <p>{data.about}</p>
        </section>
      )}

      {/* Skills */}
      {sections.skills && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-gray-200 rounded text-sm">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {sections.projects && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Projects</h2>
          {data.projects.map((p) => (
            <div key={p.id} className="mb-4">
              <h3 className="font-medium">{p.name}</h3>
              <p className="text-sm text-gray-600">{p.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default MinimalPortfolio;
