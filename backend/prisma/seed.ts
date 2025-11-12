import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories (without icons - admins can upload icons later)
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Cosecha' },
      update: {},
      create: {
        name: 'Cosecha',
        description: 'Servicios de cosecha de cultivos',
        iconUrl: null,
        isActive: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Siembra' },
      update: {},
      create: {
        name: 'Siembra',
        description: 'Servicios de siembra y plantación',
        iconUrl: null,
        isActive: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Fumigación' },
      update: {},
      create: {
        name: 'Fumigación',
        description: 'Servicios de fumigación y control de plagas',
        iconUrl: null,
        isActive: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Fertilización' },
      update: {},
      create: {
        name: 'Fertilización',
        description: 'Servicios de fertilización y nutrición de cultivos',
        iconUrl: null,
        isActive: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Riego' },
      update: {},
      create: {
        name: 'Riego',
        description: 'Servicios de riego y manejo del agua',
        iconUrl: null,
        isActive: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Poda' },
      update: {},
      create: {
        name: 'Poda',
        description: 'Servicios de poda y mantenimiento',
        iconUrl: null,
        isActive: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Labranza' },
      update: {},
      create: {
        name: 'Labranza',
        description: 'Servicios de labranza y preparación de suelo',
        iconUrl: null,
        isActive: true
      }
    }),
    prisma.category.upsert({
      where: { name: 'Carga y transporte' },
      update: {},
      create: {
        name: 'Carga y transporte',
        description: 'Servicios de carga y transporte de productos',
        iconUrl: null,
        isActive: true
      }
    })
  ]);

  console.log('✅ Categories created:', categories.length);

  // Create superadmin user
  // You can customize these values or use environment variables
  const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'admin@agrored.uy';
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'admin123';
  const superAdminFirstName = process.env.SUPERADMIN_FIRST_NAME || 'Super';
  const superAdminLastName = process.env.SUPERADMIN_LAST_NAME || 'Admin';
  const superAdminPhone = process.env.SUPERADMIN_PHONE || '+59899123456';

  const superAdminPasswordHash = await bcrypt.hash(superAdminPassword, 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      // Update password if it's different (useful for password changes)
      passwordHash: superAdminPasswordHash,
      firstName: superAdminFirstName,
      lastName: superAdminLastName,
      phone: superAdminPhone,
      role: 'SUPERADMIN',
      isActive: true,
      emailVerified: true
    },
    create: {
      email: superAdminEmail,
      passwordHash: superAdminPasswordHash,
      firstName: superAdminFirstName,
      lastName: superAdminLastName,
      phone: superAdminPhone,
      role: 'SUPERADMIN',
      isActive: true,
      emailVerified: true
    }
  });

  console.log('✅ SuperAdmin user created/updated:', superAdmin.email);
  console.log(`   Email: ${superAdminEmail}`);
  console.log(`   Password: ${superAdminPassword} (change this after first login!)`);
  console.log(`   Role: ${superAdmin.role}`);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@agrored.uy' },
    update: {},
    create: {
      email: 'test@agrored.uy',
      passwordHash: userPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+59899123456',
      role: 'USER',
      isActive: true,
      emailVerified: true
    }
  });

  console.log('✅ Test user created:', testUser.email);

  // Create units
  const hourUnit = await prisma.units.upsert({
    where: { name: 'Hora' },
    update: {},
    create: {
      id: 'unit-hour',
      name: 'Hora',
      symbol: 'hr',
      description: 'Precio por hora',
      is_active: true,
      updated_at: new Date()
    }
  });

  const dayUnit = await prisma.units.upsert({
    where: { name: 'Día' },
    update: {},
    create: {
      id: 'unit-day',
      name: 'Día',
      symbol: 'día',
      description: 'Precio por día',
      is_active: true,
      updated_at: new Date()
    }
  });

  const hectareaUnit = await prisma.units.upsert({
    where: { name: 'Hectárea' },
    update: {},
    create: {
      id: 'unit-hectare',
      name: 'Hectárea',
      symbol: 'ha',
      description: 'Precio por hectárea',
      is_active: true,
      updated_at: new Date()
    }
  });

  console.log('✅ Units created');

  // Create sample services
  const sampleServices = [
    {
      title: 'Cosecha de Soja',
      description: 'Servicio profesional de cosecha de soja con maquinaria moderna y personal especializado.',
      price: 50,
      priceMin: 40,
      priceMax: 60,
      latitude: -34.9,
      longitude: -56.2,
      address: 'Ruta 5, km 45',
      city: 'Montevideo',
      department: 'Montevideo',
      categoryId: categories[0].id,
      unit_id: hourUnit.id
    },
    {
      title: 'Siembra de Maíz',
      description: 'Servicio de siembra de maíz con semillas certificadas y fertilización adecuada.',
      price: 45,
      priceMin: 35,
      priceMax: 55,
      latitude: -34.8,
      longitude: -56.1,
      address: 'Ruta 8, km 120',
      city: 'Canelones',
      department: 'Canelones',
      categoryId: categories[1].id,
      unit_id: dayUnit.id
    },
    {
      title: 'Fumigación Aérea',
      description: 'Servicio de fumigación aérea para control de plagas y enfermedades.',
      price: 80,
      priceMin: 70,
      priceMax: 90,
      latitude: -34.7,
      longitude: -56.0,
      address: 'Ruta 1, km 200',
      city: 'Colonia',
      department: 'Colonia',
      categoryId: categories[2].id,
      unit_id: hectareaUnit.id
    }
  ];

  for (const serviceData of sampleServices) {
    const service = await prisma.service.create({
      data: {
        ...serviceData,
        userId: testUser.id
      }
    });

    // Create sample availability
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      await prisma.availability.create({
        data: {
          serviceId: service.id,
          date: date,
          startTime: '08:00',
          endTime: '17:00',
          isAvailable: true
        }
      });
    }

    console.log('✅ Service created:', service.title);
  }

  // Create FAQ content
  const faqData = [
    {
      question: '¿Cómo funciona AgroRedUy?',
      answer: 'AgroRedUy es una plataforma que conecta productores agrícolas con contratistas de servicios. Los usuarios pueden publicar servicios agrícolas o buscar servicios disponibles en su zona.',
      sortOrder: 1
    },
    {
      question: '¿Cómo puedo registrarme?',
      answer: 'Puedes registrarte completando el formulario de registro con tu información personal. Una vez registrado, podrás publicar servicios o buscar servicios disponibles.',
      sortOrder: 2
    },
    {
      question: '¿Cómo contacto a un proveedor de servicios?',
      answer: 'Una vez que encuentres un servicio que te interese, puedes contactar directamente al proveedor a través de la plataforma. El contacto se realiza de forma segura y privada.',
      sortOrder: 3
    },
    {
      question: '¿Qué tipos de servicios están disponibles?',
      answer: 'En AgroRedUy puedes encontrar servicios de cosecha, siembra, fumigación, fertilización, riego, poda, labranza y transporte, entre otros.',
      sortOrder: 4
    },
    {
      question: '¿Cómo se garantiza la calidad de los servicios?',
      answer: 'Todos los proveedores de servicios son verificados y pueden recibir calificaciones y reseñas de otros usuarios, lo que ayuda a mantener la calidad de los servicios.',
      sortOrder: 5
    }
  ];

  for (const faq of faqData) {
    await prisma.faqContent.upsert({
      where: { id: `faq-${faq.sortOrder}` },
      update: {},
      create: {
        id: `faq-${faq.sortOrder}`,
        ...faq,
        isActive: true
      }
    });
  }

  console.log('✅ FAQ content created:', faqData.length);

  // Create terms and conditions
  await prisma.termsContent.upsert({
    where: { id: 'terms-v1.0' },
    update: {},
    create: {
      id: 'terms-v1.0',
      title: 'Términos y Condiciones',
      content: 'Términos y condiciones de uso de AgroRedUy...',
      version: '1.0',
      isActive: true
    }
  });

  // Create privacy policy
  await prisma.privacyContent.upsert({
    where: { id: 'privacy-v1.0' },
    update: {},
    create: {
      id: 'privacy-v1.0',
      title: 'Política de Privacidad',
      content: 'Política de privacidad de AgroRedUy...',
      version: '1.0',
      isActive: true
    }
  });

  // Create contact info
  await prisma.contactInfo.upsert({
    where: { id: 'contact-main' },
    update: {},
    create: {
      id: 'contact-main',
      title: 'Información de Contacto',
      content: 'AgroRedUy - Plataforma de Servicios Agrícolas\nEmail: info@agrored.uy\nTeléfono: +598 99 123 456\nDirección: Montevideo, Uruguay',
      contactType: 'general',
      isActive: true
    }
  });

  console.log('✅ Content management data created');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
