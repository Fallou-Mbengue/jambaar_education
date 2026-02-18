import { PrismaClient, Role, ContentStatus, PlanInterval, PaymentProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Users ──
  const adminPassword = await bcrypt.hash('admin123', 10);
  const coachPassword = await bcrypt.hash('coach123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@jambaar.sn' },
    update: {},
    create: {
      email: 'admin@jambaar.sn',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Jambaar',
      role: Role.ADMIN,
      isPremium: true,
      premiumUntil: new Date('2030-12-31'),
    },
  });

  const coach = await prisma.user.upsert({
    where: { email: 'coach@jambaar.sn' },
    update: {},
    create: {
      email: 'coach@jambaar.sn',
      passwordHash: coachPassword,
      firstName: 'Coach',
      lastName: 'Moussa',
      role: Role.COACH,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'fatou@example.com' },
    update: {},
    create: {
      email: 'fatou@example.com',
      passwordHash: userPassword,
      firstName: 'Fatou',
      lastName: 'Diallo',
      role: Role.USER,
      isPremium: true,
      premiumUntil: new Date('2026-06-01'),
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'amadou@example.com' },
    update: {},
    create: {
      email: 'amadou@example.com',
      passwordHash: userPassword,
      firstName: 'Amadou',
      lastName: 'Ba',
      role: Role.USER,
    },
  });

  // ── User Profiles ──
  for (const u of [admin, coach, user1, user2]) {
    await prisma.userProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        goal: 'Apprendre le développement web',
        levelEstimate: 'BEGINNER',
        interests: ['JavaScript', 'React', 'Node.js'],
        onboardingCompleted: true,
      },
    });
  }

  // ── Gamification Profiles ──
  for (const u of [user1, user2]) {
    await prisma.gamificationProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        xp: u.id === user1.id ? 1500 : 300,
        level: u.id === user1.id ? 5 : 2,
        streak: u.id === user1.id ? 12 : 3,
        longestStreak: u.id === user1.id ? 15 : 5,
        lastActiveDate: new Date(),
      },
    });
  }

  // ── Badges ──
  const badge1 = await prisma.badge.upsert({
    where: { name: 'Premier Pas' },
    update: {},
    create: {
      name: 'Premier Pas',
      description: 'Compléter son premier cours',
      criteria: 'complete_first_course',
      xpReward: 50,
    },
  });

  const badge2 = await prisma.badge.upsert({
    where: { name: 'Streak 7' },
    update: {},
    create: {
      name: 'Streak 7',
      description: '7 jours consécutifs',
      criteria: 'streak_7',
      xpReward: 100,
    },
  });

  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId: user1.id, badgeId: badge1.id } },
    update: {},
    create: { userId: user1.id, badgeId: badge1.id },
  });

  // ── Content ──
  const content1 = await prisma.content.upsert({
    where: { id: 'content-intro-js' },
    update: {},
    create: {
      id: 'content-intro-js',
      title: 'Introduction à JavaScript',
      description: 'Les bases de JavaScript pour débutants.',
      tags: ['javascript', 'web', 'débutant'],
      skills: ['javascript-basics'],
      level: 'BEGINNER',
      duration: 15,
      status: ContentStatus.PUBLISHED,
      isPremium: false,
      publishedAt: new Date(),
      publishedBy: admin.id,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  const content2 = await prisma.content.upsert({
    where: { id: 'content-react-hooks' },
    update: {},
    create: {
      id: 'content-react-hooks',
      title: 'React Hooks en profondeur',
      description: 'Maîtriser useState, useEffect et custom hooks.',
      tags: ['react', 'hooks', 'intermédiaire'],
      skills: ['react-hooks'],
      level: 'INTERMEDIATE',
      duration: 25,
      status: ContentStatus.PUBLISHED,
      isPremium: true,
      publishedAt: new Date(),
      publishedBy: admin.id,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  const content3 = await prisma.content.upsert({
    where: { id: 'content-draft-api' },
    update: {},
    create: {
      id: 'content-draft-api',
      title: 'Construire une API REST (brouillon)',
      description: 'Guide complet pour construire une API REST avec NestJS.',
      tags: ['nestjs', 'api', 'backend'],
      skills: ['nestjs-api'],
      level: 'INTERMEDIATE',
      duration: 30,
      status: ContentStatus.DRAFT,
      isPremium: true,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  // ── Programs & Modules ──
  const mod1 = await prisma.module.upsert({
    where: { id: 'mod-js-basics' },
    update: {},
    create: {
      id: 'mod-js-basics',
      title: 'Les fondamentaux JS',
      description: 'Variables, fonctions, boucles',
      duration: 60,
      status: ContentStatus.PUBLISHED,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  const mod2 = await prisma.module.upsert({
    where: { id: 'mod-dom' },
    update: {},
    create: {
      id: 'mod-dom',
      title: 'Manipulation du DOM',
      description: 'querySelector, events, manipulation',
      duration: 45,
      status: ContentStatus.PUBLISHED,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  const program = await prisma.program.upsert({
    where: { id: 'prog-web-dev' },
    update: {},
    create: {
      id: 'prog-web-dev',
      title: 'Parcours Développeur Web',
      description: 'De zéro à développeur web full-stack.',
      status: ContentStatus.PUBLISHED,
      isPremium: false,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  await prisma.programModule.upsert({
    where: { programId_moduleId: { programId: program.id, moduleId: mod1.id } },
    update: {},
    create: { programId: program.id, moduleId: mod1.id, order: 0 },
  });

  await prisma.programModule.upsert({
    where: { programId_moduleId: { programId: program.id, moduleId: mod2.id } },
    update: {},
    create: { programId: program.id, moduleId: mod2.id, order: 1 },
  });

  // ── Challenge ──
  const challenge = await prisma.challenge.upsert({
    where: { id: 'challenge-js-7days' },
    update: {},
    create: {
      id: 'challenge-js-7days',
      title: 'Challenge JavaScript 7 jours',
      description: 'Maîtrisez JavaScript en 7 jours avec des exercices quotidiens.',
      status: ContentStatus.PUBLISHED,
      isPremium: false,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  for (let i = 1; i <= 7; i++) {
    await prisma.challengeDay.upsert({
      where: { challengeId_dayNumber: { challengeId: challenge.id, dayNumber: i } },
      update: {},
      create: {
        challengeId: challenge.id,
        dayNumber: i,
        title: `Jour ${i} : ${['Variables', 'Fonctions', 'Tableaux', 'Objets', 'DOM', 'Événements', 'Projet'][i - 1]}`,
        content: `Contenu du jour ${i} du challenge JavaScript.`,
        exercise: `Exercice pratique du jour ${i}.`,
        validationRule: `Soumettre le code de l'exercice ${i}`,
      },
    });
  }

  await prisma.challengeProgress.upsert({
    where: { userId_challengeId: { userId: user1.id, challengeId: challenge.id } },
    update: {},
    create: {
      userId: user1.id,
      challengeId: challenge.id,
      currentDay: 4,
      completedDays: [1, 2, 3],
    },
  });

  // ── Quiz ──
  const quiz = await prisma.quiz.upsert({
    where: { id: 'quiz-js-basics' },
    update: {},
    create: {
      id: 'quiz-js-basics',
      title: 'Quiz JavaScript Bases',
      contentId: content1.id,
      status: ContentStatus.PUBLISHED,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  await prisma.quizQuestion.upsert({
    where: { id: 'qq-1' },
    update: {},
    create: {
      id: 'qq-1',
      quizId: quiz.id,
      question: 'Quel mot-clé déclare une variable constante ?',
      choices: ['var', 'let', 'const', 'define'],
      correctAnswer: 2,
      explanation: 'const déclare une variable dont la valeur ne peut pas être réassignée.',
      order: 0,
    },
  });

  await prisma.quizQuestion.upsert({
    where: { id: 'qq-2' },
    update: {},
    create: {
      id: 'qq-2',
      quizId: quiz.id,
      question: 'typeof null retourne quoi ?',
      choices: ['null', 'undefined', 'object', 'string'],
      correctAnswer: 2,
      explanation: 'C\'est un bug historique de JavaScript: typeof null === "object".',
      order: 1,
    },
  });

  await prisma.quizAttempt.create({
    data: {
      userId: user1.id,
      quizId: quiz.id,
      score: 2,
      total: 2,
      answers: [{ questionId: 'qq-1', answer: 2 }, { questionId: 'qq-2', answer: 2 }],
    },
  });

  // ── Subscription Plans ──
  const weeklyPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'plan-weekly' },
    update: {},
    create: {
      id: 'plan-weekly',
      name: 'Hebdomadaire',
      interval: PlanInterval.WEEKLY,
      price: 1000,
      currency: 'XOF',
      durationDays: 7,
      features: ['Accès contenu premium', 'Quiz illimités'],
    },
  });

  const monthlyPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'plan-monthly' },
    update: {},
    create: {
      id: 'plan-monthly',
      name: 'Mensuel',
      interval: PlanInterval.MONTHLY,
      price: 3000,
      currency: 'XOF',
      durationDays: 30,
      features: ['Accès contenu premium', 'Quiz illimités', 'Challenges exclusifs'],
    },
  });

  const quarterlyPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'plan-quarterly' },
    update: {},
    create: {
      id: 'plan-quarterly',
      name: 'Trimestriel',
      interval: PlanInterval.QUARTERLY,
      price: 7500,
      currency: 'XOF',
      durationDays: 90,
      features: ['Accès contenu premium', 'Quiz illimités', 'Challenges exclusifs', 'Support prioritaire'],
    },
  });

  // ── Subscription & Payment ──
  const sub = await prisma.subscription.create({
    data: {
      userId: user1.id,
      planId: monthlyPlan.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.payment.create({
    data: {
      userId: user1.id,
      subscriptionId: sub.id,
      amount: 3000,
      currency: 'XOF',
      status: 'SUCCESS',
      provider: PaymentProvider.WAVE,
      providerReference: 'WAVE-REF-001',
    },
  });

  await prisma.payment.create({
    data: {
      userId: user2.id,
      amount: 1000,
      currency: 'XOF',
      status: 'PENDING',
      provider: PaymentProvider.ORANGE_MONEY,
      providerReference: 'OM-REF-001',
    },
  });

  // ── Social interactions ──
  await prisma.like.upsert({
    where: { userId_contentId: { userId: user1.id, contentId: content1.id } },
    update: {},
    create: { userId: user1.id, contentId: content1.id },
  });

  await prisma.save.upsert({
    where: { userId_contentId: { userId: user1.id, contentId: content2.id } },
    update: {},
    create: { userId: user1.id, contentId: content2.id },
  });

  // ── Analytics events ──
  await prisma.analyticsEvent.createMany({
    data: [
      { event: 'page_view', userId: user1.id, metadata: { page: '/home' } },
      { event: 'content_view', userId: user1.id, metadata: { contentId: content1.id } },
      { event: 'quiz_complete', userId: user1.id, metadata: { quizId: quiz.id, score: 2 } },
      { event: 'page_view', userId: user2.id, metadata: { page: '/home' } },
    ],
  });

  console.log('Seed completed!');
  console.log('');
  console.log('Accounts:');
  console.log('  Admin: admin@jambaar.sn / admin123');
  console.log('  Coach: coach@jambaar.sn / coach123');
  console.log('  User1: fatou@example.com / user123');
  console.log('  User2: amadou@example.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
