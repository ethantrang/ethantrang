import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

// <br><br>
const workExperience = [
  {
    company: "Inflect Labs",
    logoType: "image",
    logo: "/inflectlabs.jpeg",
    role: "Founder",
    description:
      "Inflect Labs is my personal holding company which I set up after leaving my job.<br><br>As of now, I'm building my own products, mostly within AI and edtech, and also run a software development agency, helping other founders build and launch their products. As of May, we've generated $20k+ in revenue. See full list of products on my website <u><a href='https://inflectlabs.co' target='_blank' rel='noopener noreferrer'>inflectlabs.co</a></u>.<br><br>I imagine this becoming my dream company one day. A small, talented, and obsessed team building our own products to improve everyday life for consumers. I look up to teams like SLAM or Oleve who are building a similar thing themselves.<br><br>While I'm not there yet, the only next step that I must continue taking over and over again, is 'becoming'. To become the person that is skilled and capable of solving such problems, attracting such talent, and chasing such a dream.",
  },
  {
    company: "Relevance AI",
    logoType: "image",
    logo: "/relevanceai.jpeg",
    role: "AI Engineer",
    description:
      "I reached out to the cofounders for this job and got the role as a junior AI engineer.<br><br>I worked on client projects building AI BDR agents on our platform, including SafetyCulture, TikTok, and Airwallex.<br><br>I also built the Python SDK out of my own need which grew organically from ~120 to 180+ stars and is now being used by the AI engineering team and developer users.<br><br>I left Relevance in January 2024 to focus on school and personal pursuits. But remain an open-source contributor and advocate.",
  },
  {
    company: "Dory AI",
    role: "Co-Founder, CTO",
    logo: "/doryai.jpeg",
    description:
      "My first stab at entrepreneurship was joining a new friend's project.<br><br>We built an entirely new MVP together where I learned lots of technical skills. Did lots of outreach, but ultimately felt like we either working on the right things or sticking to them long enough.<br><br>We got accepted into and became finalists for an AI accelerator, called Build Club. And flew to SF in July 2024, to meet founders and experience the tech scene.<br><br>In the end, however, we didn't feel like we were making the right progress and decided to work on new projects.",
  },
  {
    company: "VNG Corporation",
    role: "AI Intern",
    logo: "/vngcorp.jpeg",
    description:
      "My first tech role having never taken a formal computer science class.<br><br>I spend a lot of weeks understanding the codebase and picked up on standard skills to contribute to the team. By the end of my internship, I had successfully solo shipped a new feature for the product.<br><br>Became a friend to the CTO of the company. My colleagues continue to be big supporters of my journey.",
  },
];

export function WorkSection() {
  return (
    <section className="flex min-h-0 flex-col max-w-custom">
      <h2 className="mb-2 text-sm font-semibold">Work</h2>
      {workExperience.map((work) => (
        <div
          key={work.company}
          className="rounded-lg bg-card text-card-foreground"
        >
          <Accordion
            type="single"
            collapsible
            className="border-b border-t border-dashed py-2"
          >
            <AccordionItem value={work.company}>
              <AccordionTrigger>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2">
                    <Image
                      src={work.logo as string}
                      alt={`${work.company} logo`}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-md"
                    />
                    <span className="font-helvatica text-sm">
                      {work.company}
                    </span>
                    <span className="flex gap-x-1"></span>
                  </div>
                  <h4 className="font-helvatica text-xs text-muted-foreground">
                    {work.role}
                  </h4>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="text-pretty text-muted-foreground mt-2 font-helvatica text-sm"
                  dangerouslySetInnerHTML={{ __html: work.description }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </section>
  );
}
