import ResultItem from "./result";

const dummyResults = [
  {
    heading: 'Convert Imperial to Metric',
    description: 'Evaluate models on their ability to convert imperial units to metric units.',
  },
  {
    heading: 'Summarize News Articles',
    description: 'Test how well models can summarize key points from news articles.',
  },
  {
    heading: 'Translate English to Spanish',
    description: 'Assess the Spanish translation capabilities of different models.',
  },
  {
    heading: 'LinkedIn Search',
    description: 'Scrape LinkedIn for tl;dr summaries of users and useful connections. APIs: LinkedIn',
  },
  {
    heading: 'Executive Assistant Tasks',
    description: 'Manage tasks and schedule for a busy executive. Sub-tasks: Calendar management, email triage',
  },
  {
    heading: 'Industry Research', 
    description: 'Research and summarize key information about a specific industry. API: Google Search',
  },
  {
    heading: 'Research Paper Q&A',
    description: 'Answer questions about scientific research papers. Has access to all Arxiv papers. Sub-tasks: Semantic Scholar search',
  },
  {
    heading: 'Semantic Scholar Search',
    description: 'Search for and summarize scientific papers. API: Semantic Scholar',
  },
  {
    heading: 'Pay SFMTA Parking Tickets',
    description: 'Pay parking tickets in San Francisco on approval to avoid late fees. Sub-tasks: Paypal payment; API: Google Search',
  },
  {
    heading: 'Pay Bay Area Bridge Tolls',
    description: 'Pay bridge tolls via Fastrak on approval to avoid late fees. Can also set up a new toll tag or automatic payments. Sub-tasks: Paypal payment; API: Google Search',
  },
  {
    heading: 'Online Payment Processing',
    description: 'Process online payments for various tasks. API: Paypal',
  },
];

export default function Results() {
  return (
    <>
      {dummyResults.map((result, index) => (
        <ResultItem
          key={index}
          heading={result.heading}
          description={result.description}
        />
      ))}
    </>
  )
}