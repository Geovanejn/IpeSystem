import { db } from "./db";
import {
  users,
  members,
  visitors,
  seminarians,
  catechumens,
  tithes,
  offerings,
  bookstoreSales,
  loans,
  expenses,
  diaconalHelp,
  bulletins,
  lgpdConsents,
  lgpdRequests,
  auditLogs,
} from "@shared/schema";
import { hashPassword } from "./auth";

async function seed() {
  console.log("🌱 Iniciando seed completo do banco de dados...");

  try {
    // ============================================
    // 1. MEMBROS
    // ============================================
    console.log("\n📝 Criando membros...");
    
    const membersList = await db.insert(members).values([
      // Pastor
      {
        fullName: "Rev. João Silva",
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
        lgpdConsentUrl: "https://storage.example.com/consent-pastor.pdf",
        pastoralNotes: "Pastor titular desde 2010",
      },
      // Tesoureira
      {
        fullName: "Maria Santos",
        gender: "feminino",
        birthDate: "1980-08-22",
        maritalStatus: "casado",
        primaryPhone: "(11) 98765-1234",
        email: "maria.santos@example.com",
        address: "Avenida Brasil",
        addressNumber: "456",
        neighborhood: "Jardim São Paulo",
        zipCode: "02345-678",
        communionStatus: "comungante",
        ecclesiasticalRole: "membro",
        memberStatus: "ativo",
        admissionDate: "2015-03-10",
        marriageDate: "2005-06-18",
        lgpdConsentUrl: "https://storage.example.com/consent-maria.pdf",
      },
      // Diácono
      {
        fullName: "Pedro Oliveira",
        gender: "masculino",
        birthDate: "1985-11-30",
        maritalStatus: "casado",
        primaryPhone: "(11) 98765-5678",
        email: "pedro.oliveira@example.com",
        address: "Rua da Paz",
        addressNumber: "789",
        neighborhood: "Vila Nova",
        zipCode: "03456-789",
        communionStatus: "comungante",
        ecclesiasticalRole: "diacono",
        memberStatus: "ativo",
        admissionDate: "2018-07-20",
        marriageDate: "2010-03-15",
        lgpdConsentUrl: "https://storage.example.com/consent-pedro.pdf",
      },
      // Presbítero
      {
        fullName: "Carlos Eduardo Costa",
        gender: "masculino",
        birthDate: "1978-03-10",
        maritalStatus: "casado",
        primaryPhone: "(11) 98765-9999",
        email: "carlos.costa@example.com",
        address: "Rua das Acácias",
        addressNumber: "321",
        neighborhood: "Jardim das Flores",
        zipCode: "04567-890",
        communionStatus: "comungante",
        ecclesiasticalRole: "presbitero",
        memberStatus: "ativo",
        admissionDate: "2012-02-15",
        marriageDate: "2002-11-25",
        lgpdConsentUrl: "https://storage.example.com/consent-carlos.pdf",
      },
      // Membro regular para LGPD Portal
      {
        fullName: "Ana Silva Ferreira",
        gender: "feminino",
        birthDate: "1992-07-18",
        maritalStatus: "solteiro",
        primaryPhone: "(11) 98765-8888",
        email: "ana.silva@example.com",
        address: "Avenida Paulista",
        addressNumber: "1000",
        neighborhood: "Bela Vista",
        zipCode: "01310-100",
        communionStatus: "comungante",
        ecclesiasticalRole: "membro",
        memberStatus: "ativo",
        admissionDate: "2021-05-20",
        lgpdConsentUrl: "https://storage.example.com/consent-ana.pdf",
      },
      // Outros membros
      {
        fullName: "José Roberto Almeida",
        gender: "masculino",
        birthDate: "1965-12-05",
        maritalStatus: "casado",
        primaryPhone: "(11) 98765-7777",
        email: "jose.almeida@example.com",
        address: "Rua do Comércio",
        addressNumber: "555",
        neighborhood: "Centro",
        zipCode: "01111-222",
        communionStatus: "comungante",
        ecclesiasticalRole: "membro",
        memberStatus: "ativo",
        admissionDate: "2005-08-15",
        marriageDate: "1990-06-10",
        lgpdConsentUrl: "https://storage.example.com/consent-jose.pdf",
      },
      {
        fullName: "Mariana Souza Lima",
        gender: "feminino",
        birthDate: "1988-04-25",
        maritalStatus: "casado",
        primaryPhone: "(11) 98765-6666",
        email: "mariana.lima@example.com",
        address: "Rua das Palmeiras",
        addressNumber: "88",
        neighborhood: "Jardim Europa",
        zipCode: "05555-444",
        communionStatus: "comungante",
        ecclesiasticalRole: "membro",
        memberStatus: "ativo",
        admissionDate: "2016-11-12",
        marriageDate: "2012-02-14",
        lgpdConsentUrl: "https://storage.example.com/consent-mariana.pdf",
      },
      {
        fullName: "Paulo Henrique Rocha",
        gender: "masculino",
        birthDate: "1995-09-08",
        maritalStatus: "solteiro",
        primaryPhone: "(11) 98765-5555",
        email: "paulo.rocha@example.com",
        address: "Alameda dos Anjos",
        addressNumber: "200",
        neighborhood: "Morumbi",
        zipCode: "06666-777",
        communionStatus: "comungante",
        ecclesiasticalRole: "membro",
        memberStatus: "ativo",
        admissionDate: "2020-01-20",
        lgpdConsentUrl: "https://storage.example.com/consent-paulo.pdf",
      },
      {
        fullName: "Fernanda Cristina Mendes",
        gender: "feminino",
        birthDate: "1990-02-14",
        maritalStatus: "viuvo",
        primaryPhone: "(11) 98765-4444",
        email: "fernanda.mendes@example.com",
        address: "Rua dos Lírios",
        addressNumber: "77",
        neighborhood: "Vila Mariana",
        zipCode: "07777-888",
        communionStatus: "comungante",
        ecclesiasticalRole: "membro",
        memberStatus: "ativo",
        admissionDate: "2017-06-30",
        lgpdConsentUrl: "https://storage.example.com/consent-fernanda.pdf",
      },
      {
        fullName: "Ricardo Santos Barbosa",
        gender: "masculino",
        birthDate: "1982-11-20",
        maritalStatus: "divorciado",
        primaryPhone: "(11) 98765-3333",
        email: "ricardo.barbosa@example.com",
        address: "Rua Aurora",
        addressNumber: "333",
        neighborhood: "Consolação",
        zipCode: "08888-999",
        communionStatus: "nao_comungante",
        ecclesiasticalRole: "membro",
        memberStatus: "ativo",
        admissionDate: "2022-09-15",
        lgpdConsentUrl: "https://storage.example.com/consent-ricardo.pdf",
      },
    ]).returning();

    const [pastor, tesoureira, diacono, presbitero, membroAna, ...outrosMembros] = membersList;
    console.log(`✅ ${membersList.length} membros criados!`);

    // ============================================
    // 2. VISITANTES
    // ============================================
    console.log("\n👤 Criando visitantes...");
    
    const visitantesList = await db.insert(visitors).values([
      {
        fullName: "João Visitante Silva",
        phone: "(11) 98765-7777",
        email: "joao.visitante@example.com",
        address: "Rua dos Visitantes, 100 - Perdizes",
        firstVisitDate: "2024-11-10",
        hasChurch: false,
        invitedByMemberId: diacono.id,
        notes: "Convidado pelo diácono Pedro. Primeira visita em culto dominical.",
        lgpdConsentUrl: "https://storage.example.com/consent-joao-visitante.pdf",
      },
      {
        fullName: "Claudia Pereira",
        phone: "(11) 98765-2222",
        email: "claudia.pereira@example.com",
        address: "Avenida Rebouças, 2500 - Pinheiros",
        firstVisitDate: "2024-10-20",
        hasChurch: true,
        churchOrigin: "Igreja Batista Central",
        invitedByMemberId: membroAna.id,
        notes: "Mudou de cidade recentemente. Interessada em transferência.",
        lgpdConsentUrl: "https://storage.example.com/consent-claudia.pdf",
      },
      {
        fullName: "Roberto Carlos Nunes",
        phone: "(11) 98765-1111",
        email: "roberto.nunes@example.com",
        firstVisitDate: "2024-11-15",
        hasChurch: false,
        notes: "Chegou sozinho. Muito interessado na mensagem.",
        lgpdConsentUrl: "https://storage.example.com/consent-roberto.pdf",
      },
      {
        fullName: "Juliana Andrade",
        phone: "(11) 98765-9090",
        email: "juliana.andrade@example.com",
        address: "Rua Cardeal Arcoverde, 150 - Pinheiros",
        firstVisitDate: "2024-09-05",
        hasChurch: false,
        invitedByMemberId: tesoureira.id,
        notes: "Vizinha da tesoureira. Já visitou 4 vezes.",
        lgpdConsentUrl: "https://storage.example.com/consent-juliana.pdf",
      },
      {
        fullName: "Marcos Vinicius Santos",
        phone: "(11) 98765-8080",
        email: "marcos.santos@example.com",
        firstVisitDate: "2024-11-17",
        hasChurch: true,
        churchOrigin: "Igreja Presbiteriana Independente",
        notes: "Visitante regular, vem aos domingos.",
        lgpdConsentUrl: "https://storage.example.com/consent-marcos.pdf",
      },
    ]).returning();

    const [visitante1, ...outrosVisitantes] = visitantesList;
    console.log(`✅ ${visitantesList.length} visitantes criados!`);

    // ============================================
    // 3. SEMINARISTAS
    // ============================================
    console.log("\n🎓 Criando seminaristas...");
    
    await db.insert(seminarians).values([
      {
        fullName: "Lucas Ferreira Dias",
        email: "lucas.dias@cpaj.edu.br",
        phone: "(11) 97777-1111",
        institution: "CPAJ - Centro Presbiteriano de Pós-Graduação Andrew Jumper",
        enrollmentYear: 2022,
        status: "ativo",
        notes: "Cursando bacharelado em Teologia. Previsão de formatura: 2026.",
      },
      {
        fullName: "Gabriel Henrique Moreira",
        email: "gabriel.moreira@ftsa.edu.br",
        phone: "(11) 97777-2222",
        institution: "FTSA - Faculdade de Teologia de São Paulo",
        enrollmentYear: 2021,
        status: "em_estagio",
        notes: "No último ano. Fazendo estágio pastoral na IPE aos sábados.",
      },
      {
        fullName: "Daniel Costa Ribeiro",
        email: "daniel.ribeiro@mackenzie.br",
        phone: "(11) 97777-3333",
        institution: "Universidade Presbiteriana Mackenzie",
        enrollmentYear: 2020,
        status: "concluido",
        notes: "Formado em 2024. Aguardando chamado ministerial.",
      },
    ]);

    console.log("✅ 3 seminaristas criados!");

    // ============================================
    // 4. CATECÚMENOS
    // ============================================
    console.log("\n📚 Criando catecúmenos...");
    
    await db.insert(catechumens).values([
      {
        fullName: "Beatriz Almeida Santos",
        startDate: "2024-08-01",
        expectedProfessionDate: "2025-01-15",
        stage: "em_andamento",
        professorId: pastor.id,
        notes: "Aulas todas as quartas-feiras. Progresso excelente.",
      },
      {
        fullName: "André Luiz Carvalho",
        startDate: "2024-09-15",
        expectedProfessionDate: "2025-02-20",
        stage: "em_andamento",
        professorId: pastor.id,
        notes: "Novo convertido. Muito dedicado aos estudos.",
      },
      {
        fullName: "Camila Rodrigues",
        startDate: "2024-06-01",
        expectedProfessionDate: "2024-12-20",
        stage: "apto",
        professorId: pastor.id,
        notes: "Concluiu todas as aulas. Pronta para profissão de fé.",
      },
    ]);

    console.log("✅ 3 catecúmenos criados!");

    // ============================================
    // 5. DÍZIMOS
    // ============================================
    console.log("\n💰 Criando dízimos...");
    
    const tithesList = [];
    const meses = [
      "2024-09-05", "2024-09-12", "2024-09-19", "2024-09-26",
      "2024-10-06", "2024-10-13", "2024-10-20", "2024-10-27",
      "2024-11-03", "2024-11-10", "2024-11-17",
    ];

    // Dízimos de diferentes membros ao longo dos meses
    for (const data of meses) {
      tithesList.push(
        {
          memberId: pastor.id,
          amount: "1200.00",
          date: data,
          paymentMethod: "pix",
        },
        {
          memberId: tesoureira.id,
          amount: "850.00",
          date: data,
          paymentMethod: "transferencia",
        },
        {
          memberId: diacono.id,
          amount: "650.00",
          date: data,
          paymentMethod: "pix",
        },
        {
          memberId: presbitero.id,
          amount: "920.00",
          date: data,
          paymentMethod: "transferencia",
        }
      );
    }

    // Dízimos esporádicos de outros membros
    tithesList.push(
      {
        memberId: membroAna.id,
        amount: "450.00",
        date: "2024-11-10",
        paymentMethod: "pix",
      },
      {
        memberId: outrosMembros[0].id,
        amount: "600.00",
        date: "2024-11-03",
        paymentMethod: "dinheiro",
      },
      {
        memberId: outrosMembros[1].id,
        amount: "380.00",
        date: "2024-11-17",
        paymentMethod: "pix",
      }
    );

    await db.insert(tithes).values(tithesList);
    console.log(`✅ ${tithesList.length} dízimos criados!`);

    // ============================================
    // 6. OFERTAS
    // ============================================
    console.log("\n🎁 Criando ofertas...");
    
    const ofertasList = [];
    for (const data of meses) {
      ofertasList.push(
        {
          type: "geral",
          amount: "850.50",
          date: data,
          notes: "Oferta do culto dominical",
        },
        {
          type: "missoes",
          amount: "420.00",
          date: data,
          notes: "Oferta para missões",
        }
      );
    }

    ofertasList.push(
      {
        type: "obra",
        amount: "5000.00",
        date: "2024-10-15",
        notes: "Oferta especial para reforma do telhado",
      },
      {
        type: "social",
        amount: "1200.00",
        date: "2024-11-01",
        notes: "Oferta para ação social de Natal",
      }
    );

    await db.insert(offerings).values(ofertasList);
    console.log(`✅ ${ofertasList.length} ofertas criadas!`);

    // ============================================
    // 7. VENDAS DA LIVRARIA
    // ============================================
    console.log("\n📚 Criando vendas da livraria...");
    
    await db.insert(bookstoreSales).values([
      {
        productName: "Bíblia de Estudo NVI",
        quantity: 2,
        totalAmount: "280.00",
        paymentMethod: "pix",
        buyerMemberId: membroAna.id,
        date: "2024-11-10",
        receiptUrl: "https://storage.example.com/receipt-001.pdf",
      },
      {
        productName: "Livro: Institutas da Religião Cristã",
        quantity: 1,
        totalAmount: "95.00",
        paymentMethod: "dinheiro",
        buyerMemberId: outrosMembros[0].id,
        date: "2024-11-03",
        receiptUrl: "https://storage.example.com/receipt-002.pdf",
      },
      {
        productName: "Hinário Presbiteriano",
        quantity: 3,
        totalAmount: "105.00",
        paymentMethod: "pix",
        buyerMemberId: tesoureira.id,
        date: "2024-10-20",
        receiptUrl: "https://storage.example.com/receipt-003.pdf",
      },
      {
        productName: "Livro: Confissão de Fé de Westminster",
        quantity: 1,
        totalAmount: "42.00",
        paymentMethod: "dinheiro",
        buyerVisitorId: visitante1.id,
        date: "2024-11-15",
        receiptUrl: "https://storage.example.com/receipt-004.pdf",
      },
      {
        productName: "Devocional: Pão Diário",
        quantity: 5,
        totalAmount: "75.00",
        paymentMethod: "pix",
        buyerMemberId: presbitero.id,
        date: "2024-11-01",
        receiptUrl: "https://storage.example.com/receipt-005.pdf",
      },
    ]);

    console.log("✅ 5 vendas da livraria criadas!");

    // ============================================
    // 8. EMPRÉSTIMOS
    // ============================================
    console.log("\n🏦 Criando empréstimos...");
    
    const loansList = await db.insert(loans).values([
      {
        creditorName: "Banco Santander",
        totalAmount: "50000.00",
        installments: 36,
        installmentAmount: "1666.67",
        firstInstallmentDate: "2024-01-10",
        receiptUrl: "https://storage.example.com/loan-contract-001.pdf",
      },
      {
        creditorName: "Caixa Econômica Federal",
        totalAmount: "30000.00",
        installments: 24,
        installmentAmount: "1450.00",
        firstInstallmentDate: "2023-06-15",
        receiptUrl: "https://storage.example.com/loan-contract-002.pdf",
      },
    ]).returning();

    const [loan1, loan2] = loansList;
    console.log("✅ 2 empréstimos criados!");

    // ============================================
    // 9. DESPESAS
    // ============================================
    console.log("\n💸 Criando despesas...");
    
    const expensesList = [];

    // Despesas recorrentes mensais
    for (let i = 9; i <= 11; i++) {
      const mes = i.toString().padStart(2, '0');
      expensesList.push(
        {
          category: "agua",
          description: "Conta de água",
          amount: "185.50",
          date: `2024-${mes}-05`,
          receiptUrl: `https://storage.example.com/agua-2024-${mes}.pdf`,
        },
        {
          category: "luz",
          description: "Conta de energia elétrica",
          amount: "420.80",
          date: `2024-${mes}-08`,
          receiptUrl: `https://storage.example.com/luz-2024-${mes}.pdf`,
        },
        {
          category: "internet",
          description: "Internet fibra óptica",
          amount: "150.00",
          date: `2024-${mes}-10`,
          receiptUrl: `https://storage.example.com/internet-2024-${mes}.pdf`,
        },
        {
          category: "sistema_alarme",
          description: "Monitoramento alarme",
          amount: "89.90",
          date: `2024-${mes}-15`,
          receiptUrl: `https://storage.example.com/alarme-2024-${mes}.pdf`,
        },
        {
          category: "zeladoria",
          description: "Salário zelador",
          amount: "1800.00",
          date: `2024-${mes}-25`,
          receiptUrl: `https://storage.example.com/zeladoria-2024-${mes}.pdf`,
        },
        {
          category: "salario_pastor",
          description: "Salário pastoral",
          amount: "6500.00",
          date: `2024-${mes}-30`,
          receiptUrl: `https://storage.example.com/salario-pastor-2024-${mes}.pdf`,
        }
      );
    }

    // Parcelas de empréstimos
    for (let i = 9; i <= 11; i++) {
      const mes = i.toString().padStart(2, '0');
      const parcela = i - 8; // Parcela do empréstimo
      expensesList.push(
        {
          category: "parcela_emprestimo",
          description: `Parcela ${parcela}/36 - Empréstimo Santander`,
          amount: "1666.67",
          date: `2024-${mes}-10`,
          receiptUrl: `https://storage.example.com/loan1-parcela-${parcela}.pdf`,
          loanId: loan1.id,
          installmentNumber: parcela,
        },
        {
          category: "parcela_emprestimo",
          description: `Parcela ${parcela + 16}/24 - Empréstimo Caixa`,
          amount: "1450.00",
          date: `2024-${mes}-15`,
          receiptUrl: `https://storage.example.com/loan2-parcela-${parcela + 16}.pdf`,
          loanId: loan2.id,
          installmentNumber: parcela + 16,
        }
      );
    }

    // Despesas eventuais
    expensesList.push(
      {
        category: "manutencao",
        description: "Conserto do ar condicionado",
        amount: "850.00",
        date: "2024-10-12",
        receiptUrl: "https://storage.example.com/manutencao-ar-001.pdf",
      },
      {
        category: "insumos",
        description: "Material de limpeza e higiene",
        amount: "320.00",
        date: "2024-11-05",
        receiptUrl: "https://storage.example.com/insumos-001.pdf",
      },
      {
        category: "oferta_missionarios",
        description: "Oferta para missionários na África",
        amount: "2000.00",
        date: "2024-10-20",
        receiptUrl: "https://storage.example.com/missoes-001.pdf",
      }
    );

    const expensesListResult = await db.insert(expenses).values(expensesList).returning();
    console.log(`✅ ${expensesList.length} despesas criadas!`);

    // ============================================
    // 10. AJUDA DIACONAL
    // ============================================
    console.log("\n🤝 Criando ajudas diaconais...");
    
    // Encontrar despesas de ajuda_diaconal para vincular
    const ajudaDiaconalExpenses = expensesListResult.filter(e => e.category === "ajuda_diaconal");

    await db.insert(diaconalHelp).values([
      {
        memberId: outrosMembros[3].id, // Fernanda (viúva)
        type: "cesta_basica",
        amount: "180.00",
        date: "2024-10-15",
        description: "Cesta básica mensal - família em situação vulnerável",
        receiptUrl: "https://storage.example.com/diaconal-cesta-001.pdf",
      },
      {
        memberId: outrosMembros[4].id, // Ricardo
        type: "remedio",
        amount: "420.00",
        date: "2024-11-02",
        description: "Medicamento para tratamento diabetes - Sr. Ricardo",
        receiptUrl: "https://storage.example.com/diaconal-remedio-001.pdf",
      },
      {
        memberId: outrosMembros[3].id, // Fernanda
        type: "aluguel",
        amount: "800.00",
        date: "2024-11-08",
        description: "Auxílio aluguel - situação temporária de desemprego",
        receiptUrl: "https://storage.example.com/diaconal-aluguel-001.pdf",
      },
      {
        memberId: outrosMembros[0].id,
        type: "consulta",
        amount: "250.00",
        date: "2024-10-28",
        description: "Consulta médica especialista",
        receiptUrl: "https://storage.example.com/diaconal-consulta-001.pdf",
      },
      {
        memberId: outrosMembros[1].id,
        type: "transporte",
        amount: "120.00",
        date: "2024-11-12",
        description: "Vale transporte mensal",
        receiptUrl: "https://storage.example.com/diaconal-transporte-001.pdf",
      },
    ]);

    console.log("✅ 5 ajudas diaconais criadas!");

    // ============================================
    // 11. BOLETINS
    // ============================================
    console.log("\n📰 Criando boletins...");
    
    await db.insert(bulletins).values([
      {
        editionNumber: 48,
        date: "2024-11-17",
        liturgicalYear: "Ano Eclesiástico 2024",
        devotionalTitle: "A Graça que Transforma",
        devotionalBibleText: "Efésios 2:8-9",
        devotionalMessage: "Porque pela graça sois salvos, mediante a fé; e isto não vem de vós; é dom de Deus; não de obras, para que ninguém se glorie.",
        liturgy: JSON.stringify({
          preludio: "Órgão - J.S. Bach",
          saudacao: "Rev. João Silva",
          canto: ["HC 1 - Santo, Santo, Santo", "HC 215 - A Deus demos glória"],
          leitura: "Salmo 23",
          sermao: "A provisão do Bom Pastor",
          ofertas: "Obra",
          comunhao: "Celebração da Santa Ceia",
          bencao: "Rev. João Silva",
        }),
        ebdReport: JSON.stringify({
          mes: "Novembro 2024",
          tema: "Os Profetas Maiores",
          classes: [
            { nome: "Adultos", professor: "Rev. João Silva", alunos: 42 },
            { nome: "Jovens", professor: "Carlos Costa", alunos: 28 },
            { nome: "Adolescentes", professor: "Maria Santos", alunos: 15 },
            { nome: "Crianças", professor: "Ana Silva", alunos: 20 },
          ],
        }),
        departmentNotices: JSON.stringify([
          {
            departamento: "Secretaria",
            aviso: "Reunião de Conselho na quarta-feira às 19h30",
          },
          {
            departamento: "Diáconia",
            aviso: "Campanha de arrecadação de alimentos até dia 30/11",
          },
          {
            departamento: "UMP",
            aviso: "Acampamento de homens de 06 a 08/12. Inscrições abertas!",
          },
        ]),
        offeringType: "obra",
        birthdayMemberIds: JSON.stringify([membroAna.id, outrosMembros[1].id]),
        anniversaryMemberIds: JSON.stringify([tesoureira.id]),
        prayerRequests: JSON.stringify([
          {
            categoria: "saude",
            pedido: "Pela recuperação da Irmã Fernanda",
          },
          {
            categoria: "conversao",
            pedido: "Pelos familiares não convertidos",
          },
          {
            categoria: "ipe",
            pedido: "Pela obra de reforma do telhado",
          },
        ]),
        prayerLeaderId: presbitero.id,
        leadershipData: JSON.stringify({
          pastor: "Rev. João Silva",
          presbiteros: ["Carlos Eduardo Costa"],
          diaconos: ["Pedro Oliveira"],
        }),
        published: true,
      },
      {
        editionNumber: 47,
        date: "2024-11-10",
        liturgicalYear: "Ano Eclesiástico 2024",
        devotionalTitle: "Fé que Move Montanhas",
        devotionalBibleText: "Mateus 17:20",
        devotionalMessage: "Porque em verdade vos digo que, se tiverdes fé como um grão de mostarda, direis a este monte: Passa daqui para acolá, e ele passará.",
        liturgy: JSON.stringify({
          preludio: "Piano - Hino 289",
          saudacao: "Rev. João Silva",
          canto: ["HC 5 - Ao Deus de Abraão louvai", "HC 320 - Castelo Forte"],
          leitura: "Hebreus 11:1-6",
          sermao: "Os heróis da fé",
          ofertas: "Missões",
          bencao: "Rev. João Silva",
        }),
        ebdReport: JSON.stringify({
          mes: "Novembro 2024",
          tema: "Os Profetas Maiores",
          classes: [
            { nome: "Adultos", professor: "Rev. João Silva", alunos: 38 },
            { nome: "Jovens", professor: "Carlos Costa", alunos: 25 },
            { nome: "Adolescentes", professor: "Maria Santos", alunos: 18 },
            { nome: "Crianças", professor: "Ana Silva", alunos: 22 },
          ],
        }),
        departmentNotices: JSON.stringify([
          {
            departamento: "SAF",
            aviso: "Chá de bebê da Irmã Mariana no sábado às 15h",
          },
          {
            departamento: "Mocidade",
            aviso: "Encontro de jovens sexta-feira às 20h - tema: Namoro cristão",
          },
        ]),
        offeringType: "missoes",
        birthdayMemberIds: JSON.stringify([pastor.id, outrosMembros[0].id]),
        anniversaryMemberIds: JSON.stringify([diacono.id]),
        prayerRequests: JSON.stringify([
          {
            categoria: "emprego",
            pedido: "Pelo Irmão Paulo que está desempregado",
          },
          {
            categoria: "direcao_divina",
            pedido: "Pelos seminaristas em processo de discernimento",
          },
        ]),
        prayerLeaderId: pastor.id,
        leadershipData: JSON.stringify({
          pastor: "Rev. João Silva",
          presbiteros: ["Carlos Eduardo Costa"],
          diaconos: ["Pedro Oliveira"],
        }),
        published: true,
      },
    ]);

    console.log("✅ 2 boletins criados!");

    // ============================================
    // 12. USUÁRIOS
    // ============================================
    console.log("\n👥 Criando usuários...");
    
    const hashedPassword = await hashPassword("senha123");
    
    const usersList = await db.insert(users).values([
      {
        username: "pastor",
        password: hashedPassword,
        role: "pastor",
        memberId: pastor.id,
      },
      {
        username: "tesoureiro",
        password: hashedPassword,
        role: "treasurer",
        memberId: tesoureira.id,
      },
      {
        username: "diacono",
        password: hashedPassword,
        role: "deacon",
        memberId: diacono.id,
      },
      {
        username: "membro",
        password: hashedPassword,
        role: "member",
        memberId: membroAna.id,
      },
      {
        username: "visitante",
        password: hashedPassword,
        role: "visitor",
        visitorId: visitante1.id,
      },
    ]).returning();

    const [userPastor, userTesoureiro, userDiacono, userMembro, userVisitante] = usersList;
    console.log("✅ 5 usuários criados!");

    // ============================================
    // 13. CONSENTIMENTOS LGPD
    // ============================================
    console.log("\n🔒 Criando consentimentos LGPD...");
    
    const consentsList = [];
    
    // Consentimentos para todos os membros
    for (const member of membersList) {
      consentsList.push({
        memberId: member.id,
        consentGiven: true,
        consentDate: new Date(member.createdAt!),
        documentUrl: member.lgpdConsentUrl,
      });
    }

    // Consentimentos para todos os visitantes
    for (const visitor of visitantesList) {
      consentsList.push({
        visitorId: visitor.id,
        consentGiven: true,
        consentDate: new Date(visitor.createdAt!),
        documentUrl: visitor.lgpdConsentUrl,
      });
    }

    await db.insert(lgpdConsents).values(consentsList);
    console.log(`✅ ${consentsList.length} consentimentos LGPD criados!`);

    // ============================================
    // 14. SOLICITAÇÕES LGPD
    // ============================================
    console.log("\n📋 Criando solicitações LGPD...");
    
    await db.insert(lgpdRequests).values([
      {
        memberId: membroAna.id,
        action: "correction_request",
        description: "Solicito atualização do meu endereço. Mudei para: Rua Nova Esperança, 500 - Jardim Paulista",
        status: "pending",
      },
      {
        memberId: outrosMembros[2].id, // Paulo
        action: "export",
        description: "Solicito exportação de todos os meus dados pessoais",
        status: "approved",
        resolvedBy: userPastor.id,
        resolvedAt: new Date("2024-11-15T10:30:00"),
        notes: "Dados exportados e enviados por email em 15/11/2024",
      },
      {
        visitorId: visitante1.id,
        action: "view",
        description: "Visualização dos dados através do portal LGPD",
        status: "approved",
        resolvedBy: userPastor.id,
        resolvedAt: new Date("2024-11-10T14:20:00"),
      },
      {
        memberId: outrosMembros[4].id, // Ricardo
        action: "correction_request",
        description: "Meu telefone está desatualizado. Novo número: (11) 98888-9999",
        status: "approved",
        resolvedBy: userPastor.id,
        resolvedAt: new Date("2024-11-08T16:45:00"),
        notes: "Telefone atualizado no cadastro",
      },
    ]);

    console.log("✅ 4 solicitações LGPD criadas!");

    // ============================================
    // 15. LOGS DE AUDITORIA
    // ============================================
    console.log("\n📊 Criando logs de auditoria...");
    
    await db.insert(auditLogs).values([
      {
        userId: userPastor.id,
        action: "CREATE",
        tableName: "members",
        recordId: membroAna.id,
        changesAfter: JSON.stringify({ fullName: "Ana Silva Ferreira" }),
        ipAddress: "192.168.1.100",
        createdAt: new Date("2024-11-01T09:00:00"),
      },
      {
        userId: userTesoureiro.id,
        action: "CREATE",
        tableName: "tithes",
        recordId: "some-tithe-id",
        changesAfter: JSON.stringify({ amount: 850, memberId: tesoureira.id }),
        ipAddress: "192.168.1.101",
        createdAt: new Date("2024-11-03T14:30:00"),
      },
      {
        userId: userDiacono.id,
        action: "CREATE",
        tableName: "visitors",
        recordId: visitante1.id,
        changesAfter: JSON.stringify({ fullName: "João Visitante Silva" }),
        ipAddress: "192.168.1.102",
        createdAt: new Date("2024-11-10T11:15:00"),
      },
      {
        userId: userMembro.id,
        action: "VIEW",
        tableName: "lgpd_my_data",
        recordId: membroAna.id,
        ipAddress: "192.168.1.103",
        createdAt: new Date("2024-11-15T10:00:00"),
      },
      {
        userId: userPastor.id,
        action: "UPDATE",
        tableName: "members",
        recordId: outrosMembros[4].id,
        changesBefore: JSON.stringify({ primaryPhone: "(11) 98765-3333" }),
        changesAfter: JSON.stringify({ primaryPhone: "(11) 98888-9999" }),
        ipAddress: "192.168.1.100",
        createdAt: new Date("2024-11-08T16:45:00"),
      },
      {
        userId: userTesoureiro.id,
        action: "CREATE",
        tableName: "expenses",
        recordId: "some-expense-id",
        changesAfter: JSON.stringify({ category: "luz", amount: 420.80 }),
        ipAddress: "192.168.1.101",
        createdAt: new Date("2024-11-08T09:20:00"),
      },
    ]);

    console.log("✅ 6 logs de auditoria criados!");

    // ============================================
    // RESUMO FINAL
    // ============================================
    console.log("\n" + "=".repeat(60));
    console.log("✨ SEED COMPLETO COM SUCESSO!");
    console.log("=".repeat(60));
    
    console.log("\n📊 RESUMO DOS DADOS CRIADOS:");
    console.log(`  👥 ${membersList.length} membros`);
    console.log(`  👤 ${visitantesList.length} visitantes`);
    console.log(`  🎓 3 seminaristas`);
    console.log(`  📚 3 catecúmenos`);
    console.log(`  💰 ${tithesList.length} dízimos`);
    console.log(`  🎁 ${ofertasList.length} ofertas`);
    console.log(`  📚 5 vendas de livraria`);
    console.log(`  🏦 2 empréstimos`);
    console.log(`  💸 ${expensesList.length} despesas`);
    console.log(`  🤝 5 ajudas diaconais`);
    console.log(`  📰 2 boletins`);
    console.log(`  🔐 5 usuários`);
    console.log(`  🔒 ${consentsList.length} consentimentos LGPD`);
    console.log(`  📋 4 solicitações LGPD`);
    console.log(`  📊 6 logs de auditoria`);

    console.log("\n📋 CREDENCIAIS DE ACESSO:");
    console.log("━".repeat(60));
    console.log("🔵 PASTOR:");
    console.log("   Username: pastor");
    console.log("   Password: senha123");
    console.log("   Acesso: /pastor");
    console.log("\n🟣 TESOUREIRO:");
    console.log("   Username: tesoureiro");
    console.log("   Password: senha123");
    console.log("   Acesso: /treasurer");
    console.log("\n🟢 DIÁCONO:");
    console.log("   Username: diacono");
    console.log("   Password: senha123");
    console.log("   Acesso: /deacon");
    console.log("\n🟠 MEMBRO (Portal LGPD):");
    console.log("   Username: membro");
    console.log("   Password: senha123");
    console.log("   Acesso: /lgpd");
    console.log("\n🔴 VISITANTE (Portal LGPD):");
    console.log("   Username: visitante");
    console.log("   Password: senha123");
    console.log("   Acesso: /lgpd");
    console.log("━".repeat(60));
    
    console.log("\n💡 DICA: Use estes usuários para testar todos os recursos!");
    console.log("   - Pastor: Gestão completa de membros, seminaristas, catecúmenos");
    console.log("   - Tesoureiro: Gestão financeira (dízimos, ofertas, despesas)");
    console.log("   - Diácono: Visitantes, ajuda diaconal, boletins");
    console.log("   - Membro/Visitante: Portal LGPD com dados pessoais");
    
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    throw error;
  }
}

// Executar seed
seed()
  .then(() => {
    console.log("\n👋 Seed finalizado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Falha crítica no seed:", error);
    process.exit(1);
  });
