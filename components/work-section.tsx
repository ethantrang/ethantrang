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
    company: "Exploring",
    logoType: "gradient",
    gradientColors: "from-orange-400 to-yellow-400",
    description:
      "My main goal out of this is finding something I'm excited about working on.<br><br>I'm skilled in AI and building a personal brand (mainly LinkedIn). Many niches interest me: content creators, developers, recruitment. And many spaces as well: software, digital products, apps.<br><br>Though I've learned it's important to put myself in a position where I can deliver lots of real value. Role models have showed me it is possible to have it all: work you love, makes you money, grants you freedom.<br><br>Agency and consulting and engineering roles really taught me lots but ultimately it burnt me out - the enjoyment wasn't there and I couldn't see the massive outsized gains from continuing it.",
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
    company: "Side quests",
    logoType: "gradient",
    gradientColors: "from-green-400 to-purple-400",
    description:
      "I began quite a few side quests in 2024.<br><br>I made lifestyle content on Instagram and TikTok for my personal brand. I've been adamant on becoming more fit - finally could do pull-ups and push-ups consistently. And made weekly tech content on LinkedIn for a while. Cooking and journalling are also calming activities I do.<br><br>Prior to that, I've done things like going on a solo working holiday in Taiwan to improve my Mandarin and working in sales and marketing for a cloud GPU business.<br><br>I want to try out standup comedy and busking (guitar) in Australia. Also getting back into making content for myself now.",
  },
  {
    company: "Dory AI",
    role: "Co-Founder, CTO",
    logo: "/doryai.jpeg",
    description:
      "My first stab at entrepreneurship was joining a new friend's project.<br><br>We built an entirely new MVP together where I learned lots of technical skills. Did lots of outreach, but ultimately felt like we either working on the right things or sticking to them long enough.<br><br>We got accepted into and became finalists for an AI accelerator, called Build Club. And flew to SF in July 2024, to meet founders and experience the tech scene.",
  },
  {
    company: "VNG Corporation",
    role: "AI Intern",
    logo: "/vngcorp.jpeg",
    description:
      "My first tech role having never taken a formal computer science class.<br><br>I spend a lot of weeks understanding the codebase and picked up on standard skills to contribute to the team.<br><br>By the end of my internship, I had successfully solo shipped a new feature for the product.<br><br>Became a friend to the CTO of the company.",
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
                    {work.logoType === "gradient" ? (
                      <div
                        className={`h-6 w-6 rounded-md bg-gradient-to-br ${work.gradientColors}`}
                      />
                    ) : (
                      <Image
                        src={work.logo as string}
                        alt={`${work.company} logo`}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-md"
                      />
                    )}
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
