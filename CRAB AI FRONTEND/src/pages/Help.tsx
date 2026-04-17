import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HelpCircle, Shield, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

const faqs = [
  {
    question: "What is CRAB AI?",
    answer: "CRAB AI (Career Resume Assistant Bot using AI) is an AI-powered platform that helps you optimize your job search. It includes tools for ATS scoring, resume matching, resume building, portfolio generation, and interview preparation.",
  },
  {
    question: "How does ATS Scoring work?",
    answer: "Our ATS Scoring tool analyzes your resume against common Applicant Tracking System criteria. It checks for keyword optimization, formatting issues, and overall compatibility to help you improve your chances of passing automated screening.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take data security seriously. Your uploaded documents are encrypted and processed securely. We do not share your personal information or resume data with third parties. Files are automatically deleted after 30 days of inactivity.",
  },
  {
    question: "What file formats are supported?",
    answer: "We support PDF and DOC/DOCX formats for resume uploads. Generated portfolios are in HTML format, and resumes can be exported as PDF or DOCX.",
  },
  {
    question: "Can I use CRAB AI for free?",
    answer: "CRAB AI offers a free tier with limited features. Premium features like unlimited ATS scoring, advanced interview prep, and priority support are available with a subscription.",
  },
  {
    question: "How accurate are the interview questions?",
    answer: "Our interview questions are generated based on your resume content and target role. While they cover common interview topics and role-specific technical questions, we recommend also researching company-specific questions.",
  },
];

const Help = () => {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 rounded-2xl ocean-gradient flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Help & <span className="gradient-text">Support</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions and learn how to make the most of CRAB AI.
            </p>
          </div>

          {/* Data Privacy Section */}
          <div className="glass-card p-8 mb-12 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">How We Use Your Data</h2>
                <p className="text-muted-foreground mb-4">
                  Your privacy is our priority. Here's how we handle your information:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    Resume data is only used to provide our AI services and is never sold to third parties.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    Files are encrypted during transfer and storage using industry-standard protocols.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    You can delete your data at any time from your profile settings.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    We do not use your resume data to train AI models without explicit consent.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Collapsible 
                  key={index}
                  open={openItems[index]}
                  onOpenChange={() => toggleItem(index)}
                >
                  <div className="glass-card overflow-hidden">
                    <CollapsibleTrigger className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
                      <span className="font-semibold pr-4">{faq.question}</span>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${openItems[index] ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-5 pb-5 pt-0">
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
