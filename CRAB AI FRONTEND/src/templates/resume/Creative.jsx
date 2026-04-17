// Creative Template - Teal accent, modern card layout  
export default function CreativeTemplate({ formData, experiences=[], education=[], projects=[], profileLinks=[], achievements=[], certifications=[], internships=[], userType }) {
  const skills = (formData.skills||"").split(",").map(s=>s.trim()).filter(Boolean);
  const links = profileLinks.filter(l=>l.platform&&l.url);
  const exps = experiences.filter(e=>e.title||e.company);
  const edus = education.filter(e=>e.degree||e.institution);
  const projs = projects.filter(p=>p.name);
  const achs = achievements.filter(a=>a.title);
  const certs = certifications.filter(c=>c.name);
  const ints = internships.filter(i=>i.title||i.company);
  const teal="#0d9488"; const dark="#134e4a";
  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#fff",minHeight:"297mm",fontSize:11}}>
      <div style={{background:`linear-gradient(135deg, ${dark} 0%, ${teal} 100%)`,padding:"32px 40px",color:"#fff"}}>
        <h1 style={{fontSize:26,fontWeight:700,margin:0,letterSpacing:1}}>{formData.fullName||"Your Name"}</h1>
        <div style={{display:"flex",flexWrap:"wrap",gap:14,marginTop:8,fontSize:10,opacity:0.85}}>
          {formData.email&&<span>✉ {formData.email}</span>}
          {formData.phone&&<span>📞 {formData.phone}</span>}
          {links.map((l,i)=><span key={i}>{l.platform}: {l.url}</span>)}
        </div>
        {formData.summary&&<p style={{margin:"12px 0 0",fontSize:11,opacity:0.9,maxWidth:600,lineHeight:1.6}}>{formData.summary}</p>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:0}}>
        <div style={{padding:"24px 28px",borderRight:"1px solid #e5e7eb"}}>
          {exps.length>0&&<><h3 style={{fontSize:11,fontWeight:700,color:teal,textTransform:"uppercase",letterSpacing:2,margin:"0 0 10px",borderLeft:`3px solid ${teal}`,paddingLeft:8}}>Experience</h3>{exps.map((e,i)=><div key={i} style={{marginBottom:12,paddingLeft:8}}><div style={{display:"flex",justifyContent:"space-between"}}><b style={{color:dark}}>{e.title}</b><span style={{fontSize:10,color:"#6b7280"}}>{e.duration}</span></div><div style={{color:teal,fontSize:10,marginBottom:2}}>{e.company}</div>{e.description&&<p style={{margin:0,fontSize:10,color:"#374151"}}>{e.description}</p>}</div>)}</>}
          {ints.length>0&&<><h3 style={{fontSize:11,fontWeight:700,color:teal,textTransform:"uppercase",letterSpacing:2,margin:"14px 0 10px",borderLeft:`3px solid ${teal}`,paddingLeft:8}}>Internships</h3>{ints.map((e,i)=><div key={i} style={{marginBottom:12,paddingLeft:8}}><div style={{display:"flex",justifyContent:"space-between"}}><b style={{color:dark}}>{e.title}</b><span style={{fontSize:10,color:"#6b7280"}}>{e.duration}</span></div><div style={{color:teal,fontSize:10}}>{e.company}</div>{e.description&&<p style={{margin:"2px 0",fontSize:10}}>{e.description}</p>}</div>)}</>}
          {projs.length>0&&<><h3 style={{fontSize:11,fontWeight:700,color:teal,textTransform:"uppercase",letterSpacing:2,margin:"14px 0 10px",borderLeft:`3px solid ${teal}`,paddingLeft:8}}>Projects</h3>{projs.map((p,i)=><div key={i} style={{marginBottom:12,paddingLeft:8,borderBottom:"1px solid #f3f4f6",paddingBottom:8}}><div style={{display:"flex",justifyContent:"space-between"}}><b style={{color:dark}}>{p.name}</b></div>{p.description&&<p style={{margin:"2px 0",fontSize:10,color:"#374151"}}>{p.description}</p>}{p.technologies&&<div style={{marginTop:3}}>{p.technologies.split(",").map((t,j)=><span key={j} style={{display:"inline-block",background:"#ccfbf1",color:dark,borderRadius:3,padding:"1px 6px",fontSize:9,margin:"1px 2px"}}>{t.trim()}</span>)}</div>}{p.githubLink&&<span style={{fontSize:9,color:teal}}>{p.githubLink}</span>}</div>)}</>}
        </div>
        <div style={{padding:"24px 20px",background:"#f9fafb"}}>
          {skills.length>0&&<><h3 style={{fontSize:10,fontWeight:700,color:teal,textTransform:"uppercase",letterSpacing:2,margin:"0 0 8px"}}>Skills</h3><div style={{marginBottom:14}}>{skills.map((s,i)=><div key={i} style={{background:"#fff",border:`1px solid ${teal}30`,borderRadius:4,padding:"3px 8px",fontSize:10,marginBottom:3,color:dark}}>{s}</div>)}</div></>}
          {edus.length>0&&<><h3 style={{fontSize:10,fontWeight:700,color:teal,textTransform:"uppercase",letterSpacing:2,margin:"0 0 8px"}}>Education</h3>{edus.map((e,i)=><div key={i} style={{marginBottom:10}}><b style={{fontSize:11,color:dark,display:"block"}}>{e.degree}</b><div style={{fontSize:10,color:"#555"}}>{e.institution}</div>{e.cgpa&&<div style={{fontSize:9,color:teal}}>{e.cgpa}</div>}<div style={{fontSize:9,color:"#777"}}>{e.year}</div></div>)}</>}
          {certs.length>0&&<><h3 style={{fontSize:10,fontWeight:700,color:teal,textTransform:"uppercase",letterSpacing:2,margin:"14px 0 8px"}}>Certifications</h3>{certs.map((c,i)=><div key={i} style={{marginBottom:6}}><b style={{fontSize:10,color:dark}}>{c.name}</b><div style={{fontSize:9,color:"#555"}}>{c.issuer}</div></div>)}</>}
          {achs.length>0&&<><h3 style={{fontSize:10,fontWeight:700,color:teal,textTransform:"uppercase",letterSpacing:2,margin:"14px 0 8px"}}>Achievements</h3>{achs.map((a,i)=><div key={i} style={{marginBottom:5,fontSize:10}}><span style={{color:teal}}>★</span> <b>{a.title}</b></div>)}</>}
        </div>
      </div>
    </div>
  );
}
