export default function MinimalTemplate({ formData, experiences=[], education=[], projects=[], profileLinks=[], achievements=[], certifications=[], internships=[], userType }) {
  const skills = (formData.skills||"").split(",").map(s=>s.trim()).filter(Boolean);
  const links = profileLinks.filter(l=>l.platform&&l.url);
  const exps  = experiences.filter(e=>e.title||e.company);
  const edus  = education.filter(e=>e.degree||e.institution);
  const projs = projects.filter(p=>p.name);
  const achs  = achievements.filter(a=>a.title);
  const certs = certifications.filter(c=>c.name);
  const ints  = internships.filter(i=>i.title||i.company);

  const page = { fontFamily:"'Helvetica Neue',Arial,sans-serif", color:"#111", fontSize:"11px", lineHeight:"1.55", background:"#fff", padding:"32px 40px", width:"100%", boxSizing:"border-box" };
  const secTitle = { fontSize:"10px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"2.5px", color:"#777", borderBottom:"1px solid #ddd", paddingBottom:"3px", marginBottom:"8px", marginTop:"14px" };
  const row = { display:"flex", justifyContent:"space-between", alignItems:"flex-start" };
  const linkStyle = { color:"#333", textDecoration:"none" };

  const Sec = ({ title }) => <div style={secTitle}>{title}</div>;

  return (
    <div style={page}>
      {/* Header */}
      <div style={{ marginBottom:"16px" }}>
        <div style={{ fontSize:"24px", fontWeight:"300", letterSpacing:"3px", marginBottom:"4px" }}>
          {(formData.fullName||"YOUR NAME").toUpperCase()}
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 16px", fontSize:"10px", color:"#555" }}>
          {formData.email && <a href={`mailto:${formData.email}`} style={linkStyle}>{formData.email}</a>}
          {formData.phone && <span>{formData.phone}</span>}
          {links.map((l,i) => (
            <a key={i} href={l.url.startsWith("http")?l.url:`https://${l.url}`} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              {l.platform}
            </a>
          ))}
        </div>
      </div>

      {formData.summary && (<><Sec title="About"/><p style={{ color:"#333", textAlign:"justify", marginBottom:"2px" }}>{formData.summary}</p></>)}

      {skills.length>0 && (<><Sec title="Skills"/><p style={{ color:"#333", lineHeight:"2" }}>{skills.join("  ·  ")}</p></>)}

      {exps.length>0 && (<><Sec title="Experience"/>
        {exps.map((e,i)=>(
          <div key={i} style={{ marginBottom:"9px" }}>
            <div style={row}><strong>{e.title}</strong><span style={{ fontSize:"10px", color:"#777" }}>{e.duration}</span></div>
            <div style={{ fontSize:"10.5px", color:"#555", marginBottom:"2px" }}>{e.company}</div>
            {e.description&&<p style={{ fontSize:"10.5px", color:"#333", textAlign:"justify" }}>{e.description}</p>}
          </div>
        ))}
      </>)}

      {ints.length>0 && (<><Sec title="Internships"/>
        {ints.map((e,i)=>(
          <div key={i} style={{ marginBottom:"9px" }}>
            <div style={row}><strong>{e.title}</strong><span style={{ fontSize:"10px", color:"#777" }}>{e.duration}</span></div>
            <div style={{ fontSize:"10.5px", color:"#555" }}>{e.company}</div>
            {e.description&&<p style={{ fontSize:"10.5px", color:"#333", textAlign:"justify" }}>{e.description}</p>}
          </div>
        ))}
      </>)}

      {projs.length>0 && (<><Sec title="Projects"/>
        {projs.map((p,i)=>(
          <div key={i} style={{ marginBottom:"9px" }}>
            <div style={row}>
              <strong>{p.name}</strong>
              {p.githubLink && <a href={p.githubLink.startsWith("http")?p.githubLink:`https://${p.githubLink}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:"10px", color:"#555", textDecoration:"none" }}>GitHub ↗</a>}
            </div>
            {p.description&&<p style={{ fontSize:"10.5px", color:"#333", textAlign:"justify" }}>{p.description}</p>}
            {p.technologies&&<p style={{ fontSize:"10px", color:"#777", marginTop:"2px" }}>{p.technologies}</p>}
          </div>
        ))}
      </>)}

      {edus.length>0 && (<><Sec title="Education"/>
        {edus.map((e,i)=>(
          <div key={i} style={{ ...row, marginBottom:"7px", alignItems:"flex-start" }}>
            <div><strong>{e.degree}</strong><div style={{ fontSize:"10.5px", color:"#555" }}>{e.institution}{e.cgpa?` · ${e.cgpa}`:""}</div></div>
            <span style={{ fontSize:"10px", color:"#777" }}>{e.year}</span>
          </div>
        ))}
      </>)}

      {certs.length>0 && (<><Sec title="Certifications"/>
        {certs.map((c,i)=>(
          <div key={i} style={{ ...row, marginBottom:"4px" }}>
            <span style={{ fontSize:"10.5px" }}>{c.name}</span>
            <span style={{ fontSize:"10px", color:"#777" }}>{c.issuer}{c.date?` · ${c.date}`:""}</span>
          </div>
        ))}
      </>)}

      {achs.length>0 && (<><Sec title="Achievements"/>
        {achs.map((a,i)=>(
          <div key={i} style={{ marginBottom:"4px", fontSize:"10.5px" }}>
            — <strong>{a.title}</strong>
            {a.description&&<span style={{ color:"#555" }}> {a.description}</span>}
          </div>
        ))}
      </>)}
    </div>
  );
}
