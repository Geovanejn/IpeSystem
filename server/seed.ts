import { db } from "./db";
import { users, members } from "@shared/schema";

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // Criar membros primeiro (para vincular aos usuários)
    console.log("📝 Criando membros de exemplo...");
    
    const [pastor, tesoureiro, diacono] = await db.insert(members).values([
      {
        fullName: "Pastor João Silva",
        gender: "masculino",
        birthDate: "1975-05-15",
        maritalStatus: "casado",
        primaryPhone: "(11) 98765-4321",
        email: "pastor@ipe.com",
        address: "Rua das Flores",
        addressNumber: "123",
        neighborhood: "Centro",
        zipCode: "01234-567",
        communionStatus: "comungante",
        ecclesiasticalRole: "pastor",
        memberStatus: "ativo",
        admissionDate: "2010-01-15",
        marriageDate: "1998-12-20",
        lgpdConsentUrl: "https://example.com/consent-pastor.pdf",
      },
      {
        fullName: "Maria Santos",
        gender: "feminino",
        birthDate: "1980-08-22",
        maritalStatus: "casado",
        primaryPhone: "(11) 98765-1234",
        email: "tesoureiro@ipe.com",
        address: "Avenida Brasil",
        addressNumber: "456",
        neighborhood: "Jardim São Paulo",
        zipCode: "02345-678",
        communionStatus: "comungante",
        ecclesiasticalRole: "membro",
        memberStatus: "ativo",
        admissionDate: "2015-03-10",
        marriageDate: "2005-06-18",
        lgpdConsentUrl: "https://example.com/consent-tesoureiro.pdf",
      },
      {
        fullName: "Pedro Oliveira",
        gender: "masculino",
        birthDate: "1985-11-30",
        maritalStatus: "solteiro",
        primaryPhone: "(11) 98765-5678",
        email: "diacono@ipe.com",
        address: "Rua da Paz",
        addressNumber: "789",
        neighborhood: "Vila Nova",
        zipCode: "03456-789",
        communionStatus: "comungante",
        ecclesiasticalRole: "diacono",
        memberStatus: "ativo",
        admissionDate: "2018-07-20",
        lgpdConsentUrl: "https://example.com/consent-diacono.pdf",
      },
    ]).returning();

    console.log("✅ Membros criados com sucesso!");

    // Criar usuários vinculados aos membros
    console.log("👥 Criando usuários de teste...");
    
    await db.insert(users).values([
      {
        username: "pastor",
        password: "senha123", // TODO: Implementar bcrypt
        role: "pastor",
        memberId: pastor.id,
      },
      {
        username: "tesoureiro",
        password: "senha123", // TODO: Implementar bcrypt
        role: "treasurer",
        memberId: tesoureiro.id,
      },
      {
        username: "diacono",
        password: "senha123", // TODO: Implementar bcrypt
        role: "deacon",
        memberId: diacono.id,
      },
    ]);

    console.log("✅ Usuários criados com sucesso!");
    console.log("\n📋 CREDENCIAIS DE ACESSO:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔵 PASTOR:");
    console.log("   Username: pastor");
    console.log("   Password: senha123");
    console.log("   URL: /pastor");
    console.log("\n🟣 TESOUREIRO:");
    console.log("   Username: tesoureiro");
    console.log("   Password: senha123");
    console.log("   URL: /treasurer");
    console.log("\n🟢 DIÁCONO:");
    console.log("   Username: diacono");
    console.log("   Password: senha123");
    console.log("   URL: /deacon");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("✨ Seed concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    throw error;
  }
}

// Executar seed
seed()
  .then(() => {
    console.log("👋 Finalizando...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Falha no seed:", error);
    process.exit(1);
  });
