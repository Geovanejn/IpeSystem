import { db } from "./db";
import { members, users, catechumens } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seedTestData() {
  try {
    console.log("🌱 Iniciando população do banco de dados com dados de teste...\n");

    // 1. Criar Pastor
    console.log("👨‍⚕️ Criando pastor...");
    const [pastor] = await db.insert(members).values({
      fullName: "Pr. João da Silva",
      birthDate: "1975-05-15",
      gender: "masculino",
      maritalStatus: "casado",
      marriageDate: "1998-12-20",
      primaryPhone: "(11) 98765-4321",
      email: "pastor.joao@ipe.org.br",
      address: "Rua das Igrejas",
      addressNumber: "100",
      neighborhood: "Centro",
      zipCode: "01000-000",
      communionStatus: "comungante",
      ecclesiasticalRole: "pastor",
      memberStatus: "ativo",
      admissionDate: "2000-01-01",
      lgpdConsentUrl: "https://ipe.org.br/lgpd/pastor.pdf",
      pastoralNotes: "Pastor titular da igreja",
    }).returning();
    console.log(`✅ Pastor criado: ${pastor.fullName} (ID: ${pastor.id})\n`);

    // 2. Criar membros de teste
    console.log("👥 Criando membros de teste...");
    const membersData = [
      {
        fullName: "Maria Santos",
        birthDate: "1990-03-20",
        gender: "feminino",
        maritalStatus: "solteiro" as const,
        primaryPhone: "(11) 91111-2222",
        email: "maria.santos@email.com",
        address: "Rua A",
        addressNumber: "10",
        neighborhood: "Jardim",
        zipCode: "02000-000",
        communionStatus: "comungante" as const,
        ecclesiasticalRole: "membro" as const,
        memberStatus: "ativo" as const,
        admissionDate: "2015-06-10",
        lgpdConsentUrl: "https://ipe.org.br/lgpd/maria.pdf",
      },
      {
        fullName: "José Oliveira",
        birthDate: "1985-11-08",
        gender: "masculino",
        maritalStatus: "casado",
        marriageDate: "2010-02-14",
        primaryPhone: "(11) 92222-3333",
        email: "jose.oliveira@email.com",
        address: "Rua B",
        addressNumber: "20",
        neighborhood: "Vila",
        zipCode: "03000-000",
        communionStatus: "comungante",
        ecclesiasticalRole: "presbitero",
        memberStatus: "ativo",
        admissionDate: "2010-01-15",
        lgpdConsentUrl: "https://ipe.org.br/lgpd/jose.pdf",
      },
      {
        fullName: "Ana Paula Costa",
        birthDate: "1992-07-25",
        gender: "feminino",
        maritalStatus: "solteiro" as const,
        primaryPhone: "(11) 93333-4444",
        email: "ana.costa@email.com",
        address: "Rua C",
        addressNumber: "30",
        neighborhood: "Parque",
        zipCode: "04000-000",
        communionStatus: "nao_comungante" as const,
        ecclesiasticalRole: "membro" as const,
        memberStatus: "ativo" as const,
        admissionDate: "2020-08-20",
        lgpdConsentUrl: "https://ipe.org.br/lgpd/ana.pdf",
      },
      {
        fullName: "Pedro Henrique Lima",
        birthDate: "1988-12-30",
        gender: "masculino",
        maritalStatus: "casado",
        marriageDate: "2012-05-18",
        primaryPhone: "(11) 94444-5555",
        email: "pedro.lima@email.com",
        address: "Rua D",
        addressNumber: "40",
        neighborhood: "Jardins",
        zipCode: "05000-000",
        communionStatus: "comungante",
        ecclesiasticalRole: "diacono",
        memberStatus: "ativo",
        admissionDate: "2012-03-10",
        lgpdConsentUrl: "https://ipe.org.br/lgpd/pedro.pdf",
      },
    ];

    const createdMembers = await db.insert(members).values(membersData).returning();
    createdMembers.forEach((member) => {
      console.log(`✅ Membro criado: ${member.fullName} (ID: ${member.id})`);
    });
    console.log("");

    // 3. Criar usuário para o pastor
    console.log("🔐 Criando usuário para o pastor...");
    const hashedPassword = await bcrypt.hash("senha123", 10);
    const [pastorUser] = await db.insert(users).values({
      username: "pastor",
      password: hashedPassword,
      memberId: pastor.id,
      role: "pastor" as const,
    }).returning();
    console.log(`✅ Usuário criado: ${pastorUser.username} (Role: ${pastorUser.role})\n`);

    // 4. Criar catecúmenos de teste
    console.log("📖 Criando catecúmenos de teste...");
    const catechumensData = [
      {
        fullName: "Camila Rodrigues",
        startDate: "2024-01-15",
        expectedProfessionDate: "2025-06-15",
        stage: "em_andamento" as const,
        professorId: pastor.id,
        notes: "Participando ativamente das aulas",
      },
      {
        fullName: "Lucas Ferreira",
        startDate: "2024-03-10",
        expectedProfessionDate: "2025-08-20",
        stage: "em_andamento" as const,
        professorId: pastor.id,
        notes: "Está progredindo bem nos estudos",
      },
      {
        fullName: "Beatriz Alves",
        startDate: "2023-10-05",
        expectedProfessionDate: "2025-03-30",
        stage: "apto" as const,
        professorId: pastor.id,
        notes: "Pronta para profissão de fé",
      },
    ];

    const createdCatechumens = await db.insert(catechumens).values(catechumensData).returning();
    createdCatechumens.forEach((catechumen) => {
      console.log(`✅ Catecúmeno criado: ${catechumen.fullName} - Etapa: ${catechumen.stage}`);
    });
    console.log("");

    console.log("✅ População do banco de dados concluída com sucesso!");
    console.log("\n📊 Resumo:");
    console.log(`   - ${createdMembers.length + 1} membros criados (incluindo pastor)`);
    console.log(`   - 1 usuário criado (pastor)`);
    console.log(`   - ${createdCatechumens.length} catecúmenos criados`);
    console.log("\n🔑 Credenciais de acesso:");
    console.log("   Usuário: pastor");
    console.log("   Senha: senha123");
    
  } catch (error) {
    console.error("❌ Erro ao popular banco de dados:", error);
    throw error;
  }
}

seedTestData()
  .then(() => {
    console.log("\n🎉 Seed concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });
