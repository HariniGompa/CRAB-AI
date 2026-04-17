// Modern Template - Dark sidebar, colorful accents
export default function ModernTemplate({ formData, experiences=[], education=[], projects=[], profileLinks=[], achievements=[], certifications=[], internships=[], userType }) {
  const skills = (formData.skills||"").split(",").map(s=>s.trim()).filter(Boolean);
  const links = profileLinks.filter(l=>l.platform&&l.url);
  const exps = experiences.filter(e=>e.title||e.company);
  const edus = education.filter(e=>e.degree||e.institution);
  const projs = projects.filter(p=>p.name);
  const achs = achievements.filter(a=>a.title);
  const certs = certifications.filter(c=>c.name);
  const ints = internships.filter(i=>i.title||i.company);
  const accent="#6366f1"; const dark="#1e1b4b"; const side="#f8f7ff";
  const ST={fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:accent,borderBottom:`2px solid ${accent}`,paddingBottom:3,marginBottom:10,marginTop:14};
  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",display:"flex",minHeight:"297mm",background:"#fff"}}>
      <div style={{width:200,background:dark,color:"#e2e8f0",padding:"32px 20px",flexShrink:0}}>
        <div style={{textAlign:"center",marginBottom:20,paddingBottom:16,borderBottom:"1px solid #3730a3"}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:accent,margin:"0 auto 8px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"#fff"}}>{(formData.fullName||"U").charAt(0).toUpperCase()}</div>
          <h2 style={{fontSize:13,fontWeight:700,margin:0,color:"#fff"}}>{formData.fullName||"Your Name"}</h2>
        </div>
        <div style={{fontSize:9,color:"#a5b4fc",marginBottom:4,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>Contact</div>
        {formData.email&&<div style={{fontSize:9,marginBottom:3,wordBreak:"break-all"}}>{formData.email}</div>}
        {formData.phone&&<div style={{fontSize:9,marginBottom:3}}>{formData.phone}</div>}
        {links.map((l,i)=><div key={i} style={{fontSize:9,marginBottom:3}}>{l.platform}: {l.url}</div>)}
        {skills.length>0&&<><div style={{fontSize:9,color:"#a5b4fc",marginTop:14,marginBottom:6,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>Skills</div>{skills.map((s,i)=><div key={i} style={{background:"#3730a3",borderRadius:3,padding:"3px 8px",fontSize:9,marginBottom:3,color:"#c7d2fe"}}>{s}</div>)}</>}
        {certs.length>0&&<><div style={{fontSize:9,color:"#a5b4fc",marginTop:14,marginBottom:6,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>Certifications</div>{certs.map((c,i)=><div key={i} style={{fontSize:9,marginBottom:4}}><div style={{fontWeight:600,color:"#e2e8f0"}}>{c.name}</div><div style={{color:"#a5b4fc"}}>{c.issuer}</div></div>)}</>}
      </div>
      <div style={{flex:1,padding:"32px 28px",fontSize:11}}>
        {formData.summary&&<><div style={ST}>Summary</div><p style={{margin:"0 0 4px",color:"#374151"}}>{formData.summary}</p></>}
        {exps.length>0&&<><div style={ST}>Experience</div>{exps.map((e,i)=><div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between"}}><b style={{color:dark}}>{e.title}</b><span style={{fontSize:10,color:"#6b7280"}}>{e.duration}</span></div><div style={{color:accent,fontSize:10,marginBottom:2}}>{e.company}</div>{e.description&&<p style={{margin:0,fontSize:10,color:"#374151"}}>{e.description}</p>}</div>)}</>}
        {ints.length>0&&<><div style={ST}>Internships</div>{ints.map((e,i)=><div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between"}}><b style={{color:dark}}>{e.title}</b><span style={{fontSize:10,color:"#6b7280"}}>{e.duration}</span></div><div style={{color:accent,fontSize:10}}>{e.company}</div>{e.description&&<p style={{margin:"2px 0",fontSize:10,color:"#374151"}}>{e.description}</p>}</div>)}</>}
        {projs.length>0&&<><div style={ST}>Projects</div>{projs.map((p,i)=><div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between"}}><b style={{color:dark}}>{p.name}</b>{p.githubLink&&<span style={{fontSize:9,color:accent}}>{p.githubLink}</span>}</div>{p.description&&<p style={{margin:"2px 0",fontSize:10,color:"#374151"}}>{p.description}</p>}{p.technologies&&<div style={{marginTop:3}}>{p.technologies.split(",").map((t,j)=><span key={j} style={{display:"inline-block",background:"#ede9fe",color:"#5b21b6",borderRadius:3,padding:"1px 6px",fontSize:9,margin:"1px 2px"}}>{t.trim()}</span>)}</div>}</div>)}</>}
        {edus.length>0&&<><div style={ST}>Education</div>{edus.map((e,i)=><div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between"}}><b style={{color:dark}}>{e.degree}</b><span style={{fontSize:10,color:"#6b7280"}}>{e.year}</span></div><div style={{color:accent,fontSize:10}}>{e.institution}{e.cgpa?` | ${e.cgpa}`:""}</div></div>)}</>}
        {achs.length>0&&<><div style={ST}>Achievements</div>{achs.map((a,i)=><div key={i} style={{marginBottom:5}}>▸ <b>{a.title}</b>{a.description&&<span style={{fontSize:10,color:"#4b5563"}}> — {a.description}</span>}</div>)}</>}
      </div>
    </div>
  );
}
