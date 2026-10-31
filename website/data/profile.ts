export const profile = {
  name: "Giovanni Pizzighini",
  role: "Data Engineer",
  location: "São Paulo, Brazil",
  email: "gbpizzighini@gmail.com",
  linkedin: "https://www.linkedin.com/in/giopizzighinidata",
  linkedinLabel: "linkedin.com/in/giopizzighinidata",
  summary:
    "Cloud data engineer working across Spark, SQL, Python, and AWS, Azure, and GCP. Pipelines, governance, and model evaluation. Based in São Paulo. EU citizen, open to relocation.",
};

export const metrics = [
  { value: "2022", label: "In data since", detail: "Promoted within six months" },
  { value: "15%", label: "Cost reduction", detail: "Itaú cost-evaluation platform" },
  { value: "99.9%", label: "Reliability", detail: "Analytics DataApps infrastructure" },
  { value: "4", label: "Languages", detail: "English and Portuguese native" },
];

export const dossier = [
  { label: "Base", value: "São Paulo, Brazil" },
  { label: "Now", value: "Ria Money Transfer" },
  { label: "Also", value: "AI training, micro1" },
  { label: "Cloud", value: "AWS, Azure, GCP" },
  { label: "Languages", value: "EN · PT · ES · IT" },
  { label: "Work rights", value: "EU citizen" },
];

export const marquee = [
  "Spark",
  "SQL",
  "Python",
  "AWS",
  "Azure",
  "GCP",
  "Airflow",
  "Databricks",
  "Hadoop",
  "Teradata",
  "DataOps",
  "Governance",
  "React",
  "TypeScript",
  "Bash",
];

export const languages = [
  { name: "English", level: "Native or bilingual" },
  { name: "Portuguese", level: "Native or bilingual" },
  { name: "Spanish", level: "Professional working" },
  { name: "Italian", level: "Professional working" },
];

export const certifications = [
  "Professional Data Engineering",
  "Insights from Data with BigQuery",
  "Google Cloud Fundamentals: Core Infrastructure",
  "AWS Cloud Quest: Cloud Practitioner",
  "Claude Academy: Claude Code 101",
];

export const education = [
  {
    school: "FATEC",
    program: "Systems Analysis and Development",
    original: "Análise e Desenvolvimento de Sistemas",
    years: "2021 — 2024",
  },
  {
    school: "UNESP",
    program: "Bachelor's, International Relations",
    original: "Universidade Estadual Paulista",
    years: "2009 — 2012",
  },
  {
    school: "Kangwon National University",
    program: "International Trade and Business",
    original: "Undergraduate coursework",
    years: "2012",
  },
  {
    school: "Fayetteville High School",
    program: "United States",
    original: "Academic year",
    years: "2006 — 2007",
  },
];

export type Role = {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  location: string;
  era: "engineering" | "foundation";
  chapter: "now" | "itau" | "earlier";
  summary: string;
  impacts?: string[];
  tags?: string[];
  current?: boolean;
};

export const roles: Role[] = [
  {
    id: "ria",
    company: "Ria Money Transfer",
    role: "Data System Engineer",
    start: "May 2026",
    end: "Present",
    location: "Newmarket, ON",
    era: "engineering",
    chapter: "now",
    current: true,
    summary:
      "On the Data Science, Infrastructure & Governance team, supporting the event-based systems behind global marketing technology and customer data for Ria and XE.",
    impacts: [
      "Build and maintain scalable pipelines across event-driven infrastructure and data lakes",
      "Govern privacy, lifecycle, and quality for platforms serving millions of users",
      "Tune martech systems for performance, security, and cost",
      "Turn business requirements into reliable data solutions with stakeholders, vendors, and engineering",
    ],
    tags: ["Event streams", "Data lakes", "Governance", "Martech", "Privacy"],
  },
  {
    id: "micro1",
    company: "micro1",
    role: "AI Tutor",
    start: "Apr 2026",
    end: "Present",
    location: "Remote",
    era: "engineering",
    chapter: "now",
    current: true,
    summary:
      "Contract AI training expert reviewing model output for accuracy, reasoning, and practical use, focused on data engineering, cloud, SQL, Python, and software systems.",
    impacts: [
      "Evaluate responses for xAI, Claude, and Gemini",
      "Fact-check hallucinations, weak reasoning, and incomplete instruction-following",
      "Work where model behavior meets production data practice",
    ],
    tags: ["LLM evaluation", "SQL", "Python", "Cloud"],
  },
  {
    id: "itau-associate",
    company: "Banco Itaú",
    role: "Associate Data Engineer",
    start: "Jul 2024",
    end: "May 2026",
    location: "São Paulo",
    era: "engineering",
    chapter: "itau",
    summary:
      "Led cloud modernization for enterprise cost-evaluation systems, designing AWS architectures around Spark, SQL, and Teradata.",
    impacts: [
      "Reduced operational cost by 15% through tighter pipelines and leaner processing",
      "Automated ETL with Spark, SQL, and Git so stakeholders could decide on fresher data",
      "Improved deployment efficiency by 25% by putting governance on DevOps rails",
      "Architected backends for Analytics DataApps at 99.9% infrastructure reliability",
    ],
    tags: ["AWS", "Spark", "SQL", "Teradata", "DevOps"],
  },
  {
    id: "itau-de",
    company: "Banco Itaú",
    role: "Data Engineer",
    start: "Jun 2022",
    end: "Jul 2024",
    location: "São Paulo",
    era: "engineering",
    chapter: "itau",
    summary:
      "Designed the cloud backbone for an internal data platform and the release machinery around it.",
    impacts: [
      "Shipped storage and delivery on S3 and CloudFront, including static application hosting",
      "Contributed product interface work in React and TypeScript",
      "Cut API latency by 20% with CloudFront caching",
      "Shortened release cycles by 30% with automated test and deploy pipelines",
      "Wrote the DevOps documentation and governance for cloud workflows",
    ],
    tags: ["S3", "CloudFront", "React", "TypeScript", "DevOps"],
  },
  {
    id: "itau-analyst",
    company: "Banco Itaú",
    role: "Data Analyst",
    start: "Jan 2022",
    end: "Jun 2022",
    location: "São Paulo",
    era: "engineering",
    chapter: "itau",
    summary:
      "Insurance-service analytics for operations and sales. Promoted to data engineer within six months.",
    impacts: [
      "Power BI reporting that improved response times by 35%",
      "Python and Alteryx workflows that returned more than 20 hours a month",
      "Hadoop and SAS analysis of claims data tied to a 15% gain in departmental efficiency",
      "Python access scripts that cut query resolution time by 40%",
    ],
    tags: ["Power BI", "Python", "Alteryx", "Hadoop", "SAS"],
  },
  {
    id: "capita",
    company: "Capita (Morgan Stanley operation)",
    role: "HR Administrator",
    start: "Sep 2018",
    end: "Jun 2020",
    location: "Edinburgh, UK",
    era: "foundation",
    chapter: "earlier",
    summary:
      "Analyst on Morgan Stanley’s UK human-resources operation. Benefits, pensions, qualifications, and the systems behind them: Workday, SharePoint, PeopleSoft, and Salesforce. Trained new joiners, built compliance lists, and joined business-support projects in direct contact with bank directors.",
  },
  {
    id: "renuka",
    company: "Renuka do Brasil",
    role: "Executive Assistant",
    start: "Jul 2016",
    end: "Oct 2017",
    location: "Promissão, São Paulo",
    era: "foundation",
    chapter: "earlier",
    summary:
      "Advisor to the president during judicial recovery, then support to finance, contracts, agriculture, and cost. Daily reporting for the local board and the international board in India, and mediation between the president and partners.",
  },
  {
    id: "kpmg",
    company: "KPMG",
    role: "International Tax Consultant",
    start: "Dec 2014",
    end: "Jul 2016",
    location: "São Paulo",
    era: "foundation",
    chapter: "earlier",
    summary:
      "International tax consulting. Legal research, client memos, and strategies aimed at tax efficiency, alongside the client management that keeps a practice moving.",
  },
  {
    id: "ems",
    company: "EMS Pharmaceutical",
    role: "Product Manager Trainee",
    start: "Apr 2013",
    end: "May 2014",
    location: "Campinas",
    era: "foundation",
    chapter: "earlier",
    summary:
      "Trainee on a women’s health launch. Owned the path from input purchasing and the marketing plan through to the sales team’s action plan, inside a major pharmaceutical company.",
  },
  {
    id: "pf",
    company: "Federal Police Bureau Office",
    role: "Foreign Relations Agent",
    start: "May 2011",
    end: "Feb 2012",
    location: "Marília",
    era: "foundation",
    chapter: "earlier",
    summary:
      "Visa control and issuance of the National Register of Foreigners, in direct contact with applicants.",
  },
  {
    id: "disney",
    company: "The Walt Disney Company",
    role: "Stage Usher",
    start: "Nov 2010",
    end: "Feb 2011",
    location: "Orlando, FL",
    era: "foundation",
    chapter: "earlier",
    summary:
      "Show operations at Walt Disney World. Guest flow, pre-show presence, and security procedure during performances.",
  },
  {
    id: "sage",
    company: "Sage Empresa Jr.",
    role: "Marketing Manager",
    start: "Aug 2009",
    end: "Nov 2010",
    location: "Marília",
    era: "foundation",
    chapter: "earlier",
    summary:
      "Export consulting and marketing for a junior enterprise in international relations. Market research, new-client prospecting, and government liaison for small and medium companies.",
  },
];

export const capabilities = [
  {
    index: "01",
    title: "Cloud data engineering",
    text: "Pipelines and platforms on AWS, Azure, and GCP. Storage, delivery, cost, and latency treated as product decisions, not afterthoughts.",
    tools: ["AWS", "Azure", "GCP", "S3", "CloudFront", "BigQuery"],
  },
  {
    index: "02",
    title: "Big data processing",
    text: "Spark, SQL, Hadoop, Teradata, and Databricks for integration work that finance and insurance teams can actually trust.",
    tools: ["Spark", "SQL", "Hadoop", "Teradata", "Databricks", "Airflow"],
  },
  {
    index: "03",
    title: "DataOps and governance",
    text: "Security, privacy, lifecycle, and the DevOps around them. The layer that makes a platform shippable and still compliant.",
    tools: ["DataOps", "Git", "Pipelines", "Privacy", "Lifecycle", "Bash"],
  },
  {
    index: "04",
    title: "AI and pipelines",
    text: "Hands-on evaluation of frontier models, plus a working focus on AI agents for pipelines. Judgment about when a model is wrong.",
    tools: ["LLM review", "Python", "Claude", "xAI", "Gemini", "SQL"],
  },
];

export type CaseStudy = {
  slug: string;
  code: string;
  title: string;
  lede: string;
  summary: string;
  covers: string[];
  tags: string[];
  status: "forthcoming";
};

export const cases: CaseStudy[] = [
  {
    slug: "event-systems",
    code: "01",
    title: "Event systems and data lakes",
    lede: "Governed, event-based infrastructure for global payments and customer data.",
    summary:
      "This study will follow how marketing technology and customer data are organized when the audience is measured in millions: pipelines, lakes, privacy, lifecycle, and quality across Ria and XE.",
    covers: [
      "Event-based infrastructure and data lakes",
      "Privacy, governance, and lifecycle management",
      "Quality monitoring, performance, security, and cost",
      "Turning business requirements into scalable data solutions",
    ],
    tags: ["Ria Money Transfer", "Martech", "Governance"],
    status: "forthcoming",
  },
  {
    slug: "cost-platforms",
    code: "02",
    title: "Enterprise cost platforms",
    lede: "Cloud modernization for cost evaluation at a major bank.",
    summary:
      "This study will cover the move of enterprise cost-evaluation systems onto AWS, the Spark and SQL pipelines underneath them, and the governance that made the platform cheaper to run and faster to ship.",
    covers: [
      "AWS architecture with Spark, SQL, and Teradata",
      "A 15% reduction in operational cost",
      "DevOps practices that improved deployment efficiency by 25%",
      "Analytics DataApps held at 99.9% infrastructure reliability",
    ],
    tags: ["Banco Itaú", "AWS", "Spark"],
    status: "forthcoming",
  },
  {
    slug: "analytics-platforms",
    code: "03",
    title: "Analytics platforms and release",
    lede: "From storage and delivery to the release pipeline behind a bank data product.",
    summary:
      "This study will document an internal analytics platform: static delivery on AWS, interface work in React and TypeScript, and the DevOps loop that made releases faster without dropping governance.",
    covers: [
      "S3 and CloudFront, including a 20% latency reduction",
      "Product contributions in React and TypeScript",
      "Automated testing and deployment, with 30% faster release cycles",
      "DevOps documentation and cloud data governance",
    ],
    tags: ["Banco Itaú", "CloudFront", "DevOps"],
    status: "forthcoming",
  },
];

export function getCase(slug: string) {
  return cases.find((item) => item.slug === slug);
}
