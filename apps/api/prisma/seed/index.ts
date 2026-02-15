import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Plans
  await seedPlans();
  console.log('✅ Plans seeded');

  // 2. Badges
  await seedBadges();
  console.log('✅ Badges seeded');

  // 3. Users
  const users = await seedUsers();
  console.log('✅ Users seeded');

  // 4. Content
  const contents = await seedContent();
  console.log('✅ Content seeded');

  // 5. Courses
  const courses = await seedCourses(contents);
  console.log('✅ Courses seeded');

  // 6. Program
  await seedProgram(courses);
  console.log('✅ Programs seeded');

  // 7. Challenge
  await seedChallenge(contents);
  console.log('✅ Challenges seeded');

  // 8. Sample progress
  await seedUserProgress(users, contents);
  console.log('✅ User progress seeded');

  console.log('\n🎉 Seed completed!\n');
  console.log('Demo accounts:');
  console.log('  Admin:  admin@jambaar.com   / Admin123!');
  console.log('  Coach:  coach@jambaar.com   / Coach123!');
  console.log('  User 1: moussa@example.com  / User123!');
  console.log('  User 2: fatou@example.com   / User123!');
}

async function seedPlans() {
  const plans = [
    {
      name: 'Hebdomadaire',
      billingPeriod: 'WEEKLY' as const,
      priceXof: 2000,
      features: ['Accès complet 7 jours', 'Challenges 7 jours', 'Feed illimité'],
    },
    {
      name: 'Mensuel',
      billingPeriod: 'MONTHLY' as const,
      priceXof: 5000,
      features: ['Accès complet 30 jours', 'Challenges 7 jours', 'Assistant IA', 'Programmes complets'],
    },
    {
      name: 'Trimestriel',
      billingPeriod: 'QUARTERLY' as const,
      priceXof: 12000,
      features: ['Accès complet 90 jours', 'Challenges 7 jours', 'Assistant IA', 'Programmes complets', 'Support prioritaire'],
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }
}

async function seedBadges() {
  const badges = [
    { name: 'Premier Pas', description: 'Bienvenue dans Jambaar Education !', ruleType: 'XP_MILESTONE', ruleValue: { xp: 0 } },
    { name: 'Learner', description: 'Tu as gagné 100 XP !', ruleType: 'XP_MILESTONE', ruleValue: { xp: 100 } },
    { name: 'Streak 7 Jours', description: 'Tu as maintenu ton streak pendant 7 jours !', ruleType: 'STREAK', ruleValue: { days: 7 } },
    { name: 'Challenge Complété', description: 'Tu as terminé ton premier challenge 7 jours !', ruleType: 'CHALLENGE_COMPLETE', ruleValue: {} },
    { name: 'Pitch Master', description: 'Tu maîtrises l\'art du pitch !', ruleType: 'MANUAL', ruleValue: {} },
    { name: 'Communicateur', description: 'Expert en communication !', ruleType: 'MANUAL', ruleValue: {} },
    { name: 'Leader', description: 'Un vrai leader est né !', ruleType: 'MANUAL', ruleValue: {} },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: { ...badge, ruleValue: badge.ruleValue as object },
    });
  }
}

async function seedUsers() {
  const hashPassword = (p: string) => bcrypt.hash(p, 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@jambaar.com' },
    update: {},
    create: {
      email: 'admin@jambaar.com',
      passwordHash: await hashPassword('Admin123!'),
      role: 'ADMIN',
      isActive: true,
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'Jambaar',
          jobTitle: 'Platform Administrator',
          onboardingDone: true,
          objectives: ['career_growth'],
          interests: ['leadership'],
          level: 'advanced',
        },
      },
      gamification: { create: { totalXp: 9999, currentLevel: 'GOAT', currentStreak: 30 } },
    },
  });

  const coach = await prisma.user.upsert({
    where: { email: 'coach@jambaar.com' },
    update: {},
    create: {
      email: 'coach@jambaar.com',
      passwordHash: await hashPassword('Coach123!'),
      role: 'COACH',
      isActive: true,
      profile: {
        create: {
          firstName: 'Aminata',
          lastName: 'Diallo',
          jobTitle: 'Leadership Coach',
          company: 'Jambaar Education',
          country: 'Sénégal',
          onboardingDone: true,
          objectives: ['career_growth'],
          interests: ['leadership', 'communication', 'public_speaking'],
          level: 'advanced',
        },
      },
      gamification: { create: { totalXp: 2800, currentLevel: 'Lion', currentStreak: 12 } },
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'moussa@example.com' },
    update: {},
    create: {
      email: 'moussa@example.com',
      passwordHash: await hashPassword('User123!'),
      role: 'USER',
      isActive: true,
      profile: {
        create: {
          firstName: 'Moussa',
          lastName: 'Traoré',
          country: 'Côte d\'Ivoire',
          onboardingDone: true,
          objectives: ['job_search', 'career_growth'],
          interests: ['leadership', 'communication', 'public_speaking'],
          level: 'beginner',
        },
      },
      gamification: { create: { totalXp: 340, currentLevel: 'Starter', currentStreak: 3 } },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'fatou@example.com' },
    update: {},
    create: {
      email: 'fatou@example.com',
      passwordHash: await hashPassword('User123!'),
      role: 'USER',
      isActive: true,
      profile: {
        create: {
          firstName: 'Fatou',
          lastName: 'Ndiaye',
          country: 'Sénégal',
          onboardingDone: true,
          objectives: ['entrepreneurship'],
          interests: ['productivity', 'time_management', 'sales'],
          level: 'intermediate',
        },
      },
      gamification: { create: { totalXp: 780, currentLevel: 'Warrior', currentStreak: 7, longestStreak: 7 } },
    },
  });

  return { admin, coach, user1, user2 };
}

async function seedContent() {
  const contentData = [
    {
      title: 'Les 3 secrets d\'un leader efficace en Afrique',
      description: 'Découvrez comment les meilleurs leaders africains inspirent leurs équipes et obtiennent des résultats exceptionnels.',
      type: 'VIDEO' as const,
      tags: ['leadership', 'teamwork'],
      durationSeconds: 90,
      isPremium: false,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Maîtriser la prise de parole en public',
      description: 'Techniques pratiques pour s\'exprimer avec confiance et impact devant un groupe.',
      type: 'VIDEO' as const,
      tags: ['public_speaking', 'communication'],
      durationSeconds: 120,
      isPremium: false,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Gérer le stress : la technique des 4-4-4',
      description: 'Une méthode de respiration simple et efficace pour calmer le stress en toute situation.',
      type: 'MICRO_LEARNING' as const,
      tags: ['stress_management'],
      durationSeconds: 45,
      isPremium: false,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'L\'art du pitch : convaincre en 2 minutes',
      description: 'Structure ton pitch parfait : problème, solution, impact, appel à l\'action.',
      type: 'VIDEO' as const,
      tags: ['public_speaking', 'sales', 'entrepreneurship'],
      durationSeconds: 110,
      isPremium: false,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Communication non-violente au travail',
      description: 'Apprends à exprimer tes besoins et à résoudre les conflits sans agressivité.',
      type: 'VIDEO' as const,
      tags: ['communication', 'teamwork'],
      durationSeconds: 95,
      isPremium: true,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'La méthode GTD pour la productivité',
      description: 'Getting Things Done : organise ton travail pour ne jamais être dépassé.',
      type: 'VIDEO' as const,
      tags: ['productivity', 'time_management'],
      durationSeconds: 130,
      isPremium: false,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Négocier son salaire avec confiance',
      description: 'Stratégies prouvées pour obtenir la rémunération que tu mérites.',
      type: 'VIDEO' as const,
      tags: ['negotiation', 'communication'],
      durationSeconds: 105,
      isPremium: true,
      status: 'PUBLISHED' as const,
    },
    {
      title: '5 questions à poser en entretien d\'embauche',
      description: 'Distingue-toi des autres candidats avec des questions qui montrent ta maturité professionnelle.',
      type: 'MICRO_LEARNING' as const,
      tags: ['communication', 'job_search'],
      durationSeconds: 60,
      isPremium: false,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Travailler en équipe multiculturelle',
      description: 'Adapter sa communication dans un environnement diversifié pour maximiser la collaboration.',
      type: 'VIDEO' as const,
      tags: ['teamwork', 'communication'],
      durationSeconds: 85,
      isPremium: false,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Construire son personal branding',
      description: 'Développe ta marque personnelle sur LinkedIn et dans ton réseau professionnel.',
      type: 'VIDEO' as const,
      tags: ['entrepreneurship', 'communication'],
      durationSeconds: 115,
      isPremium: true,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'La règle des 2 minutes : agir maintenant',
      description: 'Si ça prend moins de 2 minutes, fais-le maintenant. Découvre comment cette règle transforme ta productivité.',
      type: 'MICRO_LEARNING' as const,
      tags: ['productivity', 'time_management'],
      durationSeconds: 50,
      isPremium: false,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Leadership féminin en Afrique : briser les barrières',
      description: 'Témoignages et stratégies de femmes leaders africaines qui ont transformé leurs organisations.',
      type: 'VIDEO' as const,
      tags: ['leadership', 'public_speaking'],
      durationSeconds: 140,
      isPremium: true,
      status: 'PUBLISHED' as const,
    },
  ];

  const contents = [];
  for (const data of contentData) {
    const content = await prisma.content.upsert({
      where: { id: (await prisma.content.findFirst({ where: { title: data.title } }))?.id ?? '' },
      update: {},
      create: { ...data, publishedAt: new Date() },
    }).catch(() =>
      prisma.content.create({ data: { ...data, publishedAt: new Date() } }),
    );
    contents.push(content);
  }

  return contents;
}

async function seedCourses(contents: { id: string; title: string }[]) {
  const course1 = await prisma.course.upsert({
    where: { id: (await prisma.course.findFirst({ where: { title: 'Leadership Fondamentaux' } }))?.id ?? '' },
    update: {},
    create: {
      title: 'Leadership Fondamentaux',
      description: 'Maîtrisez les bases du leadership africain moderne.',
      tags: ['leadership', 'teamwork'],
      isPremium: false,
      isPublished: true,
      modules: {
        create: [
          { contentId: contents[0].id, order: 1, title: 'Introduction au leadership' },
          { contentId: contents[8].id, order: 2, title: 'Leadership en équipe multiculturelle' },
          { contentId: contents[11].id, order: 3, title: 'Leadership féminin' },
        ],
      },
    },
  }).catch(() =>
    prisma.course.create({
      data: {
        title: 'Leadership Fondamentaux',
        description: 'Maîtrisez les bases du leadership africain moderne.',
        tags: ['leadership', 'teamwork'],
        isPremium: false,
        isPublished: true,
        modules: {
          create: [
            { contentId: contents[0].id, order: 1, title: 'Introduction au leadership' },
          ],
        },
      },
    }),
  );

  const course2 = await prisma.course.create({
    data: {
      title: 'Communication Professionnelle',
      description: 'Développez vos compétences en communication pour exceller dans votre carrière.',
      tags: ['communication', 'public_speaking'],
      isPremium: false,
      isPublished: true,
      modules: {
        create: [
          { contentId: contents[1].id, order: 1, title: 'Prise de parole en public' },
          { contentId: contents[4].id, order: 2, title: 'Communication non-violente' },
          { contentId: contents[7].id, order: 3, title: 'Questions d\'entretien' },
        ],
      },
    },
  });

  return { course1, course2 };
}

async function seedProgram(courses: { course1: { id: string }; course2: { id: string } }) {
  return prisma.program.create({
    data: {
      title: 'Leadership Essentials',
      description: 'Le programme complet pour développer votre leadership et votre communication professionnelle en Afrique.',
      status: 'ACTIVE',
      isPremium: false,
      durationDays: 14,
      tags: ['leadership', 'communication', 'career_growth'],
      modules: {
        create: [
          { courseId: courses.course1.id, order: 1, title: 'Leadership Fondamentaux' },
          { courseId: courses.course2.id, order: 2, title: 'Communication Professionnelle' },
        ],
      },
    },
  });
}

async function seedChallenge(contents: { id: string }[]) {
  const badge = await prisma.badge.findFirst({ where: { name: 'Challenge Complété' } });

  return prisma.challenge.create({
    data: {
      title: 'Challenge Communication 7 Jours',
      description: 'En 7 jours, transformez votre communication professionnelle avec des exercices pratiques quotidiens.',
      status: 'ACTIVE',
      durationDays: 7,
      isPremium: false,
      tags: ['communication', 'public_speaking'],
      badgeId: badge?.id,
      days: {
        create: [
          {
            dayNumber: 1,
            title: 'Écoute active',
            description: 'Aujourd\'hui, lors de chaque conversation, répétez ce que l\'autre a dit avant de répondre.',
            contentId: contents[1].id,
            exerciseText: 'Lors de 3 conversations aujourd\'hui, pratiquez l\'écoute active en reformulant.',
            xpReward: 30,
          },
          {
            dayNumber: 2,
            title: 'La voix et le corps',
            description: 'Votre langage corporel représente 55% de votre message. Maîtrisez-le.',
            contentId: contents[7].id,
            exerciseText: 'Enregistrez-vous en vidéo pendant 2 minutes en parlant d\'un sujet que vous aimez.',
            xpReward: 30,
          },
          {
            dayNumber: 3,
            title: 'Structurer ses idées',
            description: 'Apprenez la structure Situation-Tâche-Action-Résultat pour vos récits professionnels.',
            contentId: contents[4].id,
            exerciseText: 'Racontez une réussite professionnelle en utilisant la structure STAR.',
            xpReward: 30,
          },
          {
            dayNumber: 4,
            title: 'Communiquer sous pression',
            description: 'Rester calme et efficace quand l\'enjeu est élevé.',
            contentId: contents[2].id,
            exerciseText: 'Pratiquez la technique 4-4-4 avant une conversation difficile aujourd\'hui.',
            xpReward: 30,
          },
          {
            dayNumber: 5,
            title: 'L\'art de la question',
            description: 'Poser les bonnes questions est une compétence de leadership essentielle.',
            contentId: contents[7].id,
            exerciseText: 'Dans une réunion ou conversation, posez au moins 3 questions ouvertes.',
            xpReward: 30,
          },
          {
            dayNumber: 6,
            title: 'Pitcher son idée',
            description: 'Présenter une idée en 2 minutes de façon convaincante.',
            contentId: contents[3].id,
            exerciseText: 'Préparez et présentez un pitch de 2 minutes sur un projet ou une idée.',
            xpReward: 30,
          },
          {
            dayNumber: 7,
            title: 'Bilan et célébration',
            description: 'Tu as complété le challenge ! Réfléchis à ton évolution sur 7 jours.',
            exerciseText: 'Écrivez 3 situations où votre communication a été améliorée cette semaine.',
            xpReward: 50,
          },
        ],
      },
    },
  });
}

async function seedUserProgress(
  users: { user1: { id: string }; user2: { id: string } },
  contents: { id: string }[],
) {
  // Moussa: completed first 2 contents
  for (const content of contents.slice(0, 2)) {
    await prisma.userProgress.upsert({
      where: { userId_contentId: { userId: users.user1.id, contentId: content.id } },
      update: {},
      create: {
        userId: users.user1.id,
        contentId: content.id,
        progressPercent: 100,
        isCompleted: true,
        watchedSeconds: 90,
        completedAt: new Date(),
      },
    });
  }

  // Fatou: completed 4 contents and has streak badge
  for (const content of contents.slice(0, 4)) {
    await prisma.userProgress.upsert({
      where: { userId_contentId: { userId: users.user2.id, contentId: content.id } },
      update: {},
      create: {
        userId: users.user2.id,
        contentId: content.id,
        progressPercent: 100,
        isCompleted: true,
        watchedSeconds: 100,
        completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Give Fatou streak badge
  const streakBadge = await prisma.badge.findFirst({ where: { name: 'Streak 7 Jours' } });
  const fatouGamProfile = await prisma.gamificationProfile.findUnique({
    where: { userId: users.user2.id },
  });
  if (streakBadge && fatouGamProfile) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: users.user2.id, badgeId: streakBadge.id } },
      update: {},
      create: {
        userId: users.user2.id,
        gamificationProfileId: fatouGamProfile.id,
        badgeId: streakBadge.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
