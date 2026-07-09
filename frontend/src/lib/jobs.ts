export type JobPosting = {
  id: number;
  title: string;
  company: string;
  domain: string;
  location: string;
  type: "Remote" | "Hybrid" | "On-site";
};

export const MOCK_JOBS: JobPosting[] = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "Stripe",
    domain: "stripe.com",
    location: "Remote",
    type: "Remote",
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "Notion",
    domain: "notion.so",
    location: "San Francisco, CA",
    type: "Hybrid",
  },
  {
    id: 3,
    title: "Staff Engineer",
    company: "Vercel",
    domain: "vercel.com",
    location: "Remote",
    type: "Remote",
  },
  {
    id: 4,
    title: "Frontend Engineer",
    company: "Linear",
    domain: "linear.app",
    location: "Remote",
    type: "Remote",
  },
  {
    id: 5,
    title: "Software Engineer",
    company: "Google",
    domain: "google.com",
    location: "London, UK",
    type: "Hybrid",
  },
  {
    id: 6,
    title: "React Developer",
    company: "Airbnb",
    domain: "airbnb.com",
    location: "Remote",
    type: "Remote",
  },
  {
    id: 7,
    title: "Lead Engineer",
    company: "Shopify",
    domain: "shopify.com",
    location: "Toronto, CA",
    type: "Hybrid",
  },
  {
    id: 8,
    title: "Platform Engineer",
    company: "Datadog",
    domain: "datadoghq.com",
    location: "New York, NY",
    type: "On-site",
  },
];
