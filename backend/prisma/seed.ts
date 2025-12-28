import { PrismaClient, QuestionCategory, QuestionType, Gender, RelationshipIntent, SafetySignalType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean database
  await prisma.$transaction([
    prisma.scheduledDate.deleteMany(),
    prisma.block.deleteMany(),
    prisma.intentHistory.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.safetySignal.deleteMany(),
    prisma.report.deleteMany(),
    prisma.riskAssessment.deleteMany(),
    prisma.trustScore.deleteMany(),
    prisma.behaviorLog.deleteMany(),
    prisma.message.deleteMany(),
    prisma.match.deleteMany(),
    prisma.like.deleteMany(),
    prisma.onboardingAnswer.deleteMany(),
    prisma.photo.deleteMany(),
    prisma.profilePrompt.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
    prisma.onboardingQuestion.deleteMany(),
  ]);

  // Create onboarding questions
  console.log('📝 Creating onboarding questions...');
  const questions = await seedOnboardingQuestions();
  console.log(`   Created ${questions.length} questions`);

  // Create test users
  console.log('👥 Creating test users...');
  const users = await seedUsers();
  console.log(`   Created ${users.length} users`);

  // Create matches and messages
  console.log('💕 Creating matches and messages...');
  await seedMatchesAndMessages(users);

  console.log('✅ Seed completed!');
}

async function seedOnboardingQuestions() {
  const questions = [
    // VALUES
    {
      category: QuestionCategory.VALUES,
      questionText: 'What role does honesty play in your relationships?',
      questionType: QuestionType.FREE_TEXT,
      order: 1,
      followUpLogic: { minWords: 10 },
    },
    {
      category: QuestionCategory.VALUES,
      questionText: 'How important is it that your partner shares your core values?',
      questionType: QuestionType.SCALE,
      options: { min: 1, max: 10, labels: { 1: 'Not important', 10: 'Essential' } },
      order: 2,
    },
    {
      category: QuestionCategory.VALUES,
      questionText: 'Which values matter most to you in a partner? (Rank top 5)',
      questionType: QuestionType.RANKING,
      options: {
        items: ['Honesty', 'Loyalty', 'Ambition', 'Kindness', 'Intelligence',
                'Humor', 'Family-oriented', 'Independence', 'Spirituality', 'Adventure'],
        selectCount: 5,
      },
      order: 3,
    },
    // LIFESTYLE
    {
      category: QuestionCategory.LIFESTYLE,
      questionText: 'How do you typically spend your weekends?',
      questionType: QuestionType.FREE_TEXT,
      order: 1,
    },
    {
      category: QuestionCategory.LIFESTYLE,
      questionText: 'How important is physical fitness in your life?',
      questionType: QuestionType.SCALE,
      options: { min: 1, max: 10 },
      order: 2,
    },
    {
      category: QuestionCategory.LIFESTYLE,
      questionText: "What's your ideal living situation?",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: { choices: ['Urban apartment', 'Suburban house', 'Rural/countryside', 'Flexible/nomadic'] },
      order: 3,
    },
    // RELATIONSHIP_GOALS
    {
      category: QuestionCategory.RELATIONSHIP_GOALS,
      questionText: 'What are you looking for in a relationship right now?',
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: {
        choices: [
          'Casual dating',
          'Something short-term but meaningful',
          'A long-term relationship',
          'Marriage and family',
          "I'm open to seeing where things go",
        ],
      },
      order: 1,
    },
    {
      category: QuestionCategory.RELATIONSHIP_GOALS,
      questionText: 'Do you want children?',
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: {
        choices: ['Yes, definitely', 'Yes, someday', 'Open to it', 'Probably not', 'No', 'I already have children'],
      },
      order: 2,
    },
    // COMMUNICATION
    {
      category: QuestionCategory.COMMUNICATION,
      questionText: 'How do you prefer to communicate in a relationship?',
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: {
        choices: [
          'Frequent texting throughout the day',
          'A few meaningful messages daily',
          'Phone/video calls',
          'In-person quality time',
          'A mix of everything',
        ],
      },
      order: 1,
    },
    {
      category: QuestionCategory.COMMUNICATION,
      questionText: 'How do you handle conflict in relationships?',
      questionType: QuestionType.FREE_TEXT,
      order: 2,
    },
    // BEHAVIOR_SCENARIO
    {
      category: QuestionCategory.BEHAVIOR_SCENARIO,
      questionText: "Your partner shares something they're insecure about. What do you do?",
      questionType: QuestionType.SCENARIO,
      options: { scenario: 'Your partner tells you they feel insecure about their career progress.' },
      order: 1,
    },
    {
      category: QuestionCategory.BEHAVIOR_SCENARIO,
      questionText: "You realize you've made a mistake that affects your partner. How do you handle it?",
      questionType: QuestionType.SCENARIO,
      order: 2,
    },
    // BOUNDARIES
    {
      category: QuestionCategory.BOUNDARIES,
      questionText: 'What are your non-negotiable boundaries in a relationship?',
      questionType: QuestionType.FREE_TEXT,
      order: 1,
    },
    // COMMITMENT
    {
      category: QuestionCategory.COMMITMENT,
      questionText: 'How long do you typically date before becoming exclusive?',
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: {
        choices: ['A few dates', '1-2 months', '3-6 months', 'I prefer to take things slow', 'When it feels right, no timeline'],
      },
      order: 1,
    },
  ];

  const created = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const question = await prisma.onboardingQuestion.create({
      data: {
        ...q,
        id: `q-${i + 1}`,
      },
    });
    created.push(question);
  }
  return created;
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const userData = [
    {
      email: 'alex@example.com',
      profile: {
        firstName: 'Alex',
        displayName: 'Alex',
        birthDate: new Date('1995-06-15'),
        gender: Gender.MALE,
        genderPreferences: [Gender.FEMALE],
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        latitude: 37.7749,
        longitude: -122.4194,
        bio: "Software engineer who loves hiking and coffee. Looking for someone to explore the city with and have deep conversations over good food. I value authenticity and humor.",
        relationshipIntent: RelationshipIntent.LONG_TERM,
        values: { top: ['Honesty', 'Kindness', 'Intelligence', 'Humor', 'Adventure'] },
        lifestyle: { fitness: 7, social: 6 },
      },
      photos: [
        { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex1', isMain: true, isVerified: true },
        { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex2', isMain: false, isVerified: false },
      ],
      prompts: [
        { question: 'A perfect day for me looks like...', answer: 'Morning hike, brunch with friends, afternoon coding session, and dinner at a new restaurant.' },
        { question: "I'm looking for someone who...", answer: 'Values deep conversations, has their own passions, and can make me laugh.' },
      ],
    },
    {
      email: 'sarah@example.com',
      profile: {
        firstName: 'Sarah',
        displayName: 'Sarah',
        birthDate: new Date('1993-03-22'),
        gender: Gender.FEMALE,
        genderPreferences: [Gender.MALE],
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        latitude: 37.7849,
        longitude: -122.4094,
        bio: "Product designer with a passion for travel and good books. I believe in meaningful connections and building something real together.",
        relationshipIntent: RelationshipIntent.LONG_TERM,
        values: { top: ['Honesty', 'Loyalty', 'Kindness', 'Family-oriented', 'Ambition'] },
        lifestyle: { fitness: 5, social: 8 },
      },
      photos: [
        { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah1', isMain: true, isVerified: true },
        { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah2', isMain: false, isVerified: false },
      ],
      prompts: [
        { question: 'My most irrational fear is...', answer: "Getting trapped in an elevator. I always take the stairs when possible!" },
        { question: 'The way to win me over is...', answer: 'Be genuinely curious, remember the small things, and have opinions about pizza toppings.' },
      ],
    },
    {
      email: 'emma@example.com',
      profile: {
        firstName: 'Emma',
        displayName: 'Emma',
        birthDate: new Date('1996-01-14'),
        gender: Gender.FEMALE,
        genderPreferences: [Gender.MALE, Gender.NON_BINARY],
        city: 'Berkeley',
        state: 'CA',
        country: 'USA',
        latitude: 37.8716,
        longitude: -122.2727,
        bio: "PhD student studying environmental science. When not in the lab, you'll find me rock climbing or at a farmers market. Looking for intellectual chemistry.",
        relationshipIntent: RelationshipIntent.LONG_TERM,
        values: { top: ['Intelligence', 'Adventure', 'Independence', 'Honesty', 'Ambition'] },
        lifestyle: { fitness: 9, social: 5 },
      },
      photos: [
        { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma1', isMain: true, isVerified: true },
        { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma2', isMain: false, isVerified: false },
      ],
      prompts: [
        { question: "I geek out on...", answer: 'Climate models, good sci-fi, and perfecting my sourdough starter.' },
        { question: 'Together we could...', answer: 'Save the world one sustainable choice at a time (and have fun doing it).' },
      ],
    },
  ];

  const users = [];

  for (const data of userData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        status: 'ACTIVE',
        onboardingCompleted: true,
        emailVerified: true,
      },
    });

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        ...data.profile,
        profileStrengthScore: 75 + Math.floor(Math.random() * 20),
        completenessScore: 80,
        specificityScore: 70,
        consistencyScore: 85,
        stabilityScore: 90,
      },
    });

    // Create photos
    for (let i = 0; i < data.photos.length; i++) {
      await prisma.photo.create({
        data: {
          profileId: profile.id,
          url: data.photos[i].url,
          isMain: data.photos[i].isMain,
          isVerified: data.photos[i].isVerified || false,
          order: i,
        },
      });
    }

    // Create prompts
    for (let i = 0; i < data.prompts.length; i++) {
      await prisma.profilePrompt.create({
        data: {
          profileId: profile.id,
          question: data.prompts[i].question,
          answer: data.prompts[i].answer,
          order: i,
        },
      });
    }

    // Create trust score
    await prisma.trustScore.create({
      data: {
        userId: user.id,
        overallScore: 60 + Math.floor(Math.random() * 30),
        replyPatternScore: 65 + Math.floor(Math.random() * 25),
        commitmentScore: 70 + Math.floor(Math.random() * 20),
        respectScore: 75 + Math.floor(Math.random() * 20),
        toneConsistencyScore: 70 + Math.floor(Math.random() * 20),
      },
    });

    // Create safety signals
    const signals: SafetySignalType[] = [SafetySignalType.VERIFIED_PHOTO, SafetySignalType.VERIFIED_EMAIL];
    if (Math.random() > 0.5) {
      signals.push(SafetySignalType.RESPONSIVE_COMMUNICATOR);
    }

    for (const signal of signals) {
      await prisma.safetySignal.create({
        data: {
          userId: user.id,
          signalType: signal,
        },
      });
    }

    // Create intent history
    await prisma.intentHistory.create({
      data: {
        userId: user.id,
        statedIntent: data.profile.relationshipIntent,
        confidence: 0.9 + Math.random() * 0.1,
      },
    });

    users.push(user);
  }

  return users;
}

async function seedMatchesAndMessages(users: any[]) {
  // Create a match between Alex and Sarah
  const alex = users.find(u => u.email === 'alex@example.com');
  const sarah = users.find(u => u.email === 'sarah@example.com');

  if (alex && sarah) {
    // Create mutual likes
    await prisma.like.create({
      data: { fromUserId: alex.id, toUserId: sarah.id },
    });
    await prisma.like.create({
      data: { fromUserId: sarah.id, toUserId: alex.id },
    });

    // Create match
    const match = await prisma.match.create({
      data: {
        userAId: alex.id,
        userBId: sarah.id,
        overallScore: 85,
        valuesScore: 88,
        lifestyleScore: 75,
        intentScore: 95,
        communicationScore: 80,
        logisticsScore: 90,
        topReasons: [
          'Strong alignment on core values',
          'Looking for the same type of relationship',
          'Compatible lifestyles',
        ],
        frictionPoint: null,
        confidenceLevel: 0.85,
      },
    });

    // Create messages
    const messages = [
      { senderId: alex.id, receiverId: sarah.id, content: "Hey Sarah! I noticed we both love hiking. What's your favorite trail?" },
      { senderId: sarah.id, receiverId: alex.id, content: "Hi Alex! I love Muir Woods, have you been?" },
      { senderId: alex.id, receiverId: sarah.id, content: "Yes! It's beautiful there. We should check it out sometime." },
      { senderId: sarah.id, receiverId: alex.id, content: "That sounds fun! I'm free this weekend if you are." },
    ];

    for (let i = 0; i < messages.length; i++) {
      await prisma.message.create({
        data: {
          matchId: match.id,
          senderId: messages[i].senderId,
          receiverId: messages[i].receiverId,
          content: messages[i].content,
          status: 'DELIVERED',
          createdAt: new Date(Date.now() - (messages.length - i) * 3600000),
        },
      });
    }
  }

  // Create a pending like from Emma to Alex
  const emma = users.find(u => u.email === 'emma@example.com');
  if (alex && emma) {
    await prisma.like.create({
      data: { fromUserId: emma.id, toUserId: alex.id },
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
