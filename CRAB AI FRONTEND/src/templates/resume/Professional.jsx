export default function ProfessionalTemplate({ formData, experiences=[], education=[], projects=[], profileLinks=[], achievements=[], certifications=[], internships=[], userType }) {
  const skills = (formData.skills||"").split(",").map(s=>s.trim()).filter(Boolean);
  const links = profileLinks.filter(l=>l.platform&&l.url);
  const exps  = experiences.filter(e=>e.title||e.company);
  const edus  = education.filter(e=>e.degree||e.institution);
  const projs = projects.filter(p=>p.name);
  const achs  = achievements.filter(a=>a.title);
  const certs = certifications.filter(c=>c.name);
  const ints  = internships.filter(i=>i.title||i.company);

  const S = {
    page: { fontFamily:"Arial,Helvetica,sans-serif", color:"#1a1a1a", fontSize:"11px", lineHeight:"1.45", background:"#fff", padding:"28px 36px", width:"100%", boxSizing:"border-box" },
    name: { fontSize:"22px", fontWeight:"700", color:"#1a365d", letterSpacing:"0.5px", marginBottom:"3px" },
    contact: { display:"flex", flexWrap:"wrap", gap:"8px 16px", fontSize:"10px", color:"#444", marginTop:"4px" },
    contactLink: { color:"#1a365d", textDecoration:"none" },
    divider: { borderBottom:"2px solid #1a365d", margin:"8px 0 6px" },
    section: { marginBottom:"10px" },
    sectionTitle: { fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1.5px", color:"#1a365d", borderBottom:"1px solid #cbd5e0", paddingBottom:"2px", marginBottom:"6px" },
    row: { display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
    bold: { fontWeight:"700", color:"#1a1a1a" },
    sub: { color:"#4a5568", fontStyle:"italic", fontSize:"10.5px" },
    date: { color:"#718096", fontSize:"10px", whiteSpace:"nowrap", paddingLeft:"8px" },
    desc: { margin:"2px 0 0", color:"#2d3748", fontSize:"10.5px" },
    bullet: { margin:"1px 0 0 12px", color:"#2d3748", fontSize:"10.5px" },
    tag: { display:"inline-block", background:"#ebf4ff", color:"#2b6cb0", borderRadius:"3px", padding:"1px 7px", fontSize:"10px", margin:"2px 3px 2px 0" },
    skill: { display:"inline-block", borderRight:"1px solid #ccc", paddingRight:"8px", marginRight:"8px", fontSize:"10.5px", lineHeight:"1.8" },
  };

  const hasContent = (arr) => arr && arr.length > 0;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ borderBottom:"3px solid #1a365d", paddingBottom:"8px", marginBottom:"2px" }}>
        <div style={S.name}>{formData.fullName||"Your Name"}</div>
        <div style={S.contact}>
          {formData.email && <a href={`mailto:${formData.email}`} style={S.contactLink}>✉ {formData.email}</a>}
          {formData.phone && <span>📞 {formData.phone}</span>}
          {links.map((l,i) => (
            <a key={i} href={l.url.startsWith("http")?l.url:`https://${l.url}`} target="_blank" rel="noopener noreferrer" style={S.contactLink}>
              🔗 {l.platform}
            </a>
          ))}
        </div>
      </div>

      {/* Summary */}
      {formData.summary && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Professional Summary</div>
          <p style={{ ...S.desc, textAlign:"justify" }}>{formData.summary}</p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Technical Skills</div>
          <div style={{ lineHeight:"1.8" }}>
            {skills.map((s,i) => <span key={i} style={S.tag}>{s}</span>)}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {hasContent(exps) && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Work Experience</div>
          {exps.map((e,i) => (
            <div key={i} style={{ marginBottom:"8px" }}>
              <div style={S.row}>
                <span style={S.bold}>{e.title}</span>
                <span style={S.date}>{e.duration}</span>
              </div>
              <div style={S.sub}>{e.company}</div>
              {e.description && <p style={{ ...S.desc, textAlign:"justify" }}>{e.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Internships */}
      {hasContent(ints) && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Internships</div>
          {ints.map((e,i) => (
            <div key={i} style={{ marginBottom:"8px" }}>
              <div style={S.row}>
                <span style={S.bold}>{e.title}</span>
                <span style={S.date}>{e.duration}</span>
              </div>
              <div style={S.sub}>{e.company}</div>
              {e.description && <p style={{ ...S.desc, textAlign:"justify" }}>{e.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {hasContent(projs) && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Projects</div>
          {projs.map((p,i) => (
            <div key={i} style={{ marginBottom:"8px" }}>
              <div style={S.row}>
                <span style={S.bold}>{p.name}</span>
                {p.githubLink && (
                  <a href={p.githubLink.startsWith("http")?p.githubLink:`https://${p.githubLink}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ ...S.date, color:"#2b6cb0", textDecoration:"none" }}>
                    GitHub ↗
                  </a>
                )}
              </div>
              {p.description && <p style={{ ...S.desc, textAlign:"justify" }}>{p.description}</p>}
              {p.technologies && (
                <div style={{ marginTop:"3px" }}>
                  {p.technologies.split(",").map((t,j) => <span key={j} style={{ ...S.tag, background:"#f0fff4", color:"#276749" }}>{t.trim()}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {hasContent(edus) && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Education</div>
          {edus.map((e,i) => (
            <div key={i} style={{ marginBottom:"6px" }}>
              <div style={S.row}>
                <span style={S.bold}>{e.degree}</span>
                <span style={S.date}>{e.year}</span>
              </div>
              <div style={S.sub}>{e.institution}{e.cgpa ? ` | CGPA: ${e.cgpa}` : ""}</div>
            </div>
          ))}
        </div>
      )}

      {/* Two-column: Certs + Achievements */}
      {(hasContent(certs) || hasContent(achs)) && (
        <div style={{ display:"grid", gridTemplateColumns: hasContent(certs)&&hasContent(achs) ? "1fr 1fr" : "1fr", gap:"0 20px" }}>
          {hasContent(certs) && (
            <div style={S.section}>
              <div style={S.sectionTitle}>Certifications</div>
              {certs.map((c,i) => (
                <div key={i} style={{ marginBottom:"4px" }}>
                  <span style={S.bold}>{c.name}</span>
                  <span style={{ color:"#718096", fontSize:"10px" }}> — {c.issuer}{c.date?` (${c.date})`:""}</span>
                </div>
              ))}
            </div>
          )}
          {hasContent(achs) && (
            <div style={S.section}>
              <div style={S.sectionTitle}>Achievements</div>
              {achs.map((a,i) => (
                <div key={i} style={{ marginBottom:"4px" }}>
                  <span style={{ color:"#1a365d" }}>▸ </span>
                  <span style={S.bold}>{a.title}</span>
                  {a.description && <span style={{ color:"#4a5568", fontSize:"10px" }}> — {a.description}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
