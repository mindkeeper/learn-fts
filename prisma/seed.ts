import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// Realistic news data templates
const categories = [
  { name: 'Technology', slug: 'technology' },
  { name: 'Business', slug: 'business' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Health', slug: 'health' },
  { name: 'Science', slug: 'science' },
  { name: 'Entertainment', slug: 'entertainment' },
  { name: 'Politics', slug: 'politics' },
  { name: 'Environment', slug: 'environment' },
];

const newsTemplates: Record<string, { titles: string[]; topics: string[] }> = {
  technology: {
    titles: [
      'Artificial Intelligence Breakthrough in Medical Diagnosis',
      'New Quantum Computer Achieves Record Performance',
      'Blockchain Technology Revolutionizes Supply Chain Management',
      'Machine Learning Algorithm Predicts Climate Patterns',
      'Cybersecurity Experts Warn About New Ransomware Threat',
      'Tech Giants Announce Major Cloud Computing Expansion',
      'Revolutionary Battery Technology Extends Electric Vehicle Range',
      'Virtual Reality Transforms Remote Work Experience',
      'Open Source Software Gains Enterprise Adoption',
      '5G Network Rollout Accelerates Globally',
    ],
    topics: [
      'AI',
      'cloud computing',
      'cybersecurity',
      'blockchain',
      'quantum computing',
      'machine learning',
      'IoT',
      'automation',
    ],
  },
  business: {
    titles: [
      'Stock Market Reaches All-Time High Amid Economic Recovery',
      'Major Merger Announced Between Industry Leaders',
      'Startup Raises Record Funding in Latest Venture Round',
      'Global Trade Agreement Reshapes International Commerce',
      'Consumer Spending Trends Show Shift to Digital Services',
      'Retail Industry Adapts to Changing Shopping Habits',
      'Real Estate Market Experiences Unprecedented Growth',
      'Cryptocurrency Market Volatility Continues',
      'Small Businesses Benefit from New Government Initiative',
      'Corporate Sustainability Goals Drive Investment Decisions',
    ],
    topics: [
      'economy',
      'investment',
      'startups',
      'market trends',
      'finance',
      'trade',
      'retail',
      'real estate',
    ],
  },
  sports: {
    titles: [
      'Championship Final Delivers Thrilling Last-Minute Victory',
      'Record-Breaking Performance at International Tournament',
      'Athletes Prepare for Upcoming Olympic Games',
      'New Training Technology Enhances Performance',
      'Team Announces Blockbuster Trade Deal',
      'Rising Star Athlete Signs Lucrative Sponsorship Contract',
      'Legendary Coach Announces Retirement Plans',
      'Stadium Renovation Project Nears Completion',
      'Sports Medicine Advances Reduce Injury Recovery Time',
      'Youth Development Program Shows Promising Results',
    ],
    topics: [
      'football',
      'basketball',
      'tennis',
      'athletics',
      'Olympics',
      'training',
      'championships',
    ],
  },
  health: {
    titles: [
      'New Medical Study Reveals Promising Treatment Results',
      'Mental Health Awareness Campaign Launches Nationwide',
      'Breakthrough in Cancer Research Offers Hope',
      'Nutrition Experts Share Latest Dietary Guidelines',
      'Telemedicine Services Expand Access to Healthcare',
      'Vaccine Development Shows Positive Clinical Trial Results',
      'Fitness Trends Focus on Holistic Wellness Approach',
      'Healthcare Technology Improves Patient Outcomes',
      'Public Health Initiative Targets Chronic Disease Prevention',
      'Medical Innovation Enhances Surgical Precision',
    ],
    topics: [
      'medicine',
      'wellness',
      'nutrition',
      'mental health',
      'healthcare',
      'fitness',
      'research',
    ],
  },
  science: {
    titles: [
      'Space Exploration Mission Discovers New Planetary System',
      'Researchers Identify New Species in Deep Ocean Expedition',
      'Physics Breakthrough Challenges Existing Theories',
      'Climate Scientists Present Urgent Environmental Findings',
      'Genetic Research Opens New Possibilities in Medicine',
      'Archaeological Discovery Rewrites Historical Timeline',
      'Renewable Energy Technology Achieves Efficiency Milestone',
      'Nanotechnology Applications Expand in Manufacturing',
      'Astronomical Observatory Captures Stunning Cosmic Images',
      'Biodiversity Study Highlights Conservation Priorities',
    ],
    topics: [
      'astronomy',
      'biology',
      'physics',
      'chemistry',
      'geology',
      'ecology',
      'research',
    ],
  },
  entertainment: {
    titles: [
      'Award-Winning Film Breaks Box Office Records',
      'Music Festival Announces Star-Studded Lineup',
      'Popular Series Renewed for Multiple Seasons',
      'Gaming Industry Unveils Next-Generation Consoles',
      'Theater Production Receives Critical Acclaim',
      'Streaming Platform Announces Original Content Expansion',
      'Celebrity Collaboration Creates Cultural Phenomenon',
      'Animation Studio Reveals Ambitious New Project',
      'Music Artist Tops Charts with Latest Album Release',
      'Film Festival Celebrates Independent Cinema',
    ],
    topics: [
      'movies',
      'music',
      'gaming',
      'television',
      'theater',
      'streaming',
      'culture',
    ],
  },
  politics: {
    titles: [
      'New Legislation Addresses Critical Infrastructure Needs',
      'International Summit Focuses on Global Cooperation',
      'Policy Reform Aims to Improve Public Services',
      'Election Results Indicate Shifting Political Landscape',
      'Diplomatic Efforts Advance Peace Negotiations',
      'Government Initiative Promotes Renewable Energy Adoption',
      'Bipartisan Agreement Reached on Budget Proposal',
      'Political Leaders Discuss Economic Recovery Strategies',
      'Regulatory Changes Impact Business Operations',
      'Public Opinion Polls Show Evolving Voter Priorities',
    ],
    topics: [
      'legislation',
      'policy',
      'elections',
      'diplomacy',
      'governance',
      'reform',
    ],
  },
  environment: {
    titles: [
      'Conservation Efforts Show Positive Impact on Endangered Species',
      'Renewable Energy Projects Reduce Carbon Emissions',
      'Ocean Cleanup Initiative Removes Tons of Plastic Waste',
      'Climate Action Plan Sets Ambitious Sustainability Goals',
      'Wildlife Sanctuary Expansion Protects Natural Habitats',
      'Green Technology Innovation Addresses Environmental Challenges',
      'Reforestation Program Plants Millions of Trees',
      'Water Conservation Strategies Combat Drought Conditions',
      'Recycling Program Achieves Record Participation Rates',
      'Environmental Study Monitors Ecosystem Health',
    ],
    topics: [
      'conservation',
      'sustainability',
      'climate change',
      'wildlife',
      'pollution',
      'ecology',
    ],
  },
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateDescription(topic: string): string {
  const descriptors = [
    'groundbreaking',
    'significant',
    'important',
    'notable',
    'remarkable',
    'unprecedented',
    'innovative',
    'transformative',
    'influential',
    'critical',
  ];
  const actions = [
    'reveals new insights into',
    'demonstrates the importance of',
    'highlights key developments in',
    'examines the future of',
    'explores the impact of',
    'analyzes trends in',
    'investigates the role of',
    'discusses implications for',
    'unveils strategies for',
  ];

  return `This ${getRandomElement(descriptors)} story ${getRandomElement(actions)} ${topic} and its broader implications for society, industry, and future developments.`;
}

function generateContent(topics: string[]): any {
  const paragraphs: string[] = [];
  const numParagraphs = Math.floor(Math.random() * 3) + 3; // 3-5 paragraphs

  for (let i = 0; i < numParagraphs; i++) {
    const topic = getRandomElement(topics);
    const sentences: string[] = [];
    const numSentences = Math.floor(Math.random() * 3) + 3; // 3-5 sentences

    for (let j = 0; j < numSentences; j++) {
      sentences.push(
        `Experts in ${topic} have been closely monitoring developments that could reshape the landscape of the industry. ` +
          `Recent analysis suggests that these changes may have far-reaching implications for stakeholders across multiple sectors. ` +
          `Industry leaders are adapting their strategies to remain competitive in this evolving environment.`,
      );
    }

    paragraphs.push(sentences.join(' '));
  }

  return {
    blocks: paragraphs.map((text) => ({
      type: 'paragraph',
      data: { text },
    })),
  };
}

function getRandomDate(): Date {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1); // Past year
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function calculateReadDuration(content: any): string {
  const wordsPerMinute = 200;
  const wordCount = JSON.stringify(content).split(' ').length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.newsCategoryMap.deleteMany();
  await prisma.news.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  console.log('📂 Creating categories...');
  const createdCategories = await Promise.all(
    categories.map((cat) =>
      prisma.category.create({
        data: cat,
      }),
    ),
  );
  console.log(`✅ Created ${createdCategories.length} categories`);

  // Generate 3000 news articles
  console.log('📰 Generating 3000 news articles...');
  const batchSize = 100;
  const totalArticles = 3000;
  let created = 0;

  for (let batch = 0; batch < totalArticles / batchSize; batch++) {
    const newsData: any[] = [];

    for (let i = 0; i < batchSize; i++) {
      // Pick a random category
      const categoryKey = getRandomElement(Object.keys(newsTemplates));
      const template = newsTemplates[categoryKey];
      const title = getRandomElement(template.titles);
      const topic = getRandomElement(template.topics);
      const description = generateDescription(topic);
      const content = generateContent(template.topics);
      const readDuration = calculateReadDuration(content);
      const createdAt = getRandomDate();

      // Pick 1-3 random categories for this article
      const numCategories = Math.floor(Math.random() * 3) + 1;
      const articleCategories: string[] = [];
      const shuffledCategories = [...createdCategories].sort(
        () => Math.random() - 0.5,
      );

      for (let j = 0; j < numCategories; j++) {
        articleCategories.push(shuffledCategories[j].id);
      }

      newsData.push({
        title: `${title} ${batch * batchSize + i + 1}`, // Add number to make titles unique
        description,
        readDuration,
        content,
        createdAt,
        updatedAt: createdAt,
        categories: {
          create: articleCategories.map((catId) => ({
            categoryId: catId,
          })),
        },
      });
    }

    // Batch insert
    await Promise.all(
      newsData.map((data) =>
        prisma.news.create({
          data,
        }),
      ),
    );

    created += batchSize;
    console.log(`  ✅ Created ${created}/${totalArticles} articles...`);
  }

  console.log(`\n🎉 Seed completed successfully!`);
  console.log(`   📰 ${totalArticles} news articles created`);
  console.log(`   📂 ${createdCategories.length} categories created`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
