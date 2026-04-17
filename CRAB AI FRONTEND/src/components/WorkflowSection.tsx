import { Upload, Cpu, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload",
    description: "Upload your resume or enter your details. Support for PDF and DOC formats.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "Analyze",
    description: "Our AI analyzes your content against industry standards and job requirements.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Improve",
    description: "Get actionable insights and improvements to boost your chances.",
  },
];

const WorkflowSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your job search.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((item, index) => (
            <div 
              key={item.title}
              className="relative text-center animate-fade-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              <div className="relative z-10 mb-6">
                <div className="w-32 h-32 mx-auto rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                  <item.icon className="w-12 h-12 text-primary-foreground" />
                </div>
                <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm">
                  {item.step}
                </span>
              </div>

              <h3 className="text-2xl font-semibold mb-3 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
