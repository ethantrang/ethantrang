import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const randomItems = [
  {
    company: "Building",
    logoType: "gradient",
    gradientColors: "from-emerald-400 to-yellow-400",
    description:
      "Making things is really fun. Starting with a fresh repository and setting up everything from a clean slate is one of the most satisfying things.<br><br>Building out something that before existed only in your mind into something that's interactive, useful, and shareable.<br><br>While I don't mean building in the physical sense, like models or robotics (honestly I'm pretty bad at it), I've loved building super easy-to-understand useful things. Like a database where you can keyword search, filter, and sort, built with Google Sheets and AppScript.<br><br>Building software products is my main high-value skillset that I both enjoy doing and that sustains me financially.",
  },
  {
    company: "Exploring",
    logoType: "gradient",
    gradientColors: "from-orange-400 to-yellow-400",
    description:
      "My main goal out of exploring is finding something I'm excited about working on.<br><br>I'm skilled in AI and building a personal brand (mainly LinkedIn). Many niches interest me: content creators, developers, recruitment. And many spaces as well: software, digital products, apps.<br><br>Though I've learned it's important to put myself in a position where I can deliver lots of real value. Role models have showed me it is possible to have it all: work you love, makes you money, grants you freedom.",
  },
  {
    company: "Side quests",
    logoType: "gradient",
    gradientColors: "from-green-400 to-purple-400",
    description:
      "I began quite a few side quests in 2024.<br><br>I made lifestyle content on Instagram and TikTok for my personal brand. I've been adamant on becoming more fit - finally could do pull-ups and push-ups consistently. And made weekly tech content on LinkedIn for a while. Cooking and journalling are also calming activities I do.<br><br>Prior to that, I've done things like going on a solo working holiday in Taiwan to improve my Mandarin and working in sales and marketing for a cloud GPU business.<br><br>I want to try out standup comedy and busking (guitar) in Australia. Also getting back into making content for myself now.",
  },
];

export function RandomSection() {
  return (
    <section className="flex min-h-0 flex-col max-w-custom">
      <h2 className="mb-2 text-sm font-semibold">Random</h2>
      {randomItems.map((item) => (
        <div
          key={item.company}
          className="rounded-lg bg-card text-card-foreground"
        >
          <Accordion
            type="single"
            collapsible
            className="border-b border-t border-dashed py-2"
          >
            <AccordionItem value={item.company}>
              <AccordionTrigger>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2">
                    <div
                      className={`h-6 w-6 rounded-md bg-gradient-to-br ${item.gradientColors}`}
                    />
                    <span className="font-helvatica text-sm">
                      {item.company}
                    </span>
                    <span className="flex gap-x-1"></span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="text-pretty text-muted-foreground mt-2 font-helvatica text-sm"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </section>
  );
}
