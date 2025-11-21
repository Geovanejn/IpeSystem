# API Documentation - Sistema Integrado IPE

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints (except `/login`) require a valid session ID stored in localStorage as `sessionId`.

### Login
```
POST /api/login
Content-Type: application/json

{
  "email": "usuario@ipe.com",
  "password": "senha123"
}

Response 200:
{
  "user": {
    "id": "1",
    "email": "usuario@ipe.com",
    "role": "pastor",
    "memberId": "m1",
    "userName": "Pastor João"
  },
  "sessionId": "session_xxxxx"
}
```

### Logout
```
POST /api/logout
Authorization: sessionId

Response 200:
{ "message": "Logged out successfully" }
```

---

## Members Management

### List Members
```
GET /api/members
Authorization: sessionId

Response 200:
[
  {
    "id": "m1",
    "fullName": "João Silva",
    "email": "joao@ipe.com",
    "phone": "+55 11 99999-9999",
    "birthDate": "1980-05-15",
    "ecclesiasticalRole": "diácono",
    "communionStatus": "comungante",
    "status": "ativo",
    "lgpdConsentUrl": "/consents/m1.pdf"
  }
]
```

### Create Member
```
POST /api/members
Authorization: sessionId
Content-Type: application/json

{
  "fullName": "Maria Santos",
  "email": "maria@ipe.com",
  "phone": "+55 11 88888-8888",
  "birthDate": "1990-03-20",
  "cpf": "12345678901",
  "address": "Rua Principal, 123",
  "ecclesiasticalRole": "membro",
  "communionStatus": "comungante",
  "status": "ativo",
  "lgpdConsentUrl": "/consents/m2.pdf",
  "observations": "Visitante convertido"
}

Response 201:
{ id: "m2", ... }
```

### Update Member
```
PATCH /api/members/:id
Authorization: sessionId
Content-Type: application/json

{ ... (same fields as create) ... }

Response 200:
{ ... updated member ... }
```

### Delete Member
```
DELETE /api/members/:id
Authorization: sessionId

Response 200:
{ "message": "Member deleted successfully" }
```

---

## Seminarians Management

### List Seminarians
```
GET /api/seminarians
Authorization: sessionId

Response 200:
[
  {
    "id": "s1",
    "fullName": "Pedro Oliveira",
    "email": "pedro@seminary.com",
    "phone": "+55 11 77777-7777",
    "assignmentStatus": "ativo",
    "ordination": "presbítero",
    "assignment": "Seminário Concórdia",
    "status": "ativo"
  }
]
```

### Create Seminarian
```
POST /api/seminarians
Authorization: sessionId
Content-Type: application/json

{
  "fullName": "Lucas Costa",
  "email": "lucas@seminary.com",
  "phone": "+55 11 66666-6666",
  "assignmentStatus": "ativo",
  "ordination": "presbítero",
  "assignment": "Seminário Mackenzie",
  "status": "ativo"
}

Response 201:
{ id: "s2", ... }
```

### Update Seminarian
```
PATCH /api/seminarians/:id
Authorization: sessionId

Response 200:
{ ... updated seminarian ... }
```

### Delete Seminarian
```
DELETE /api/seminarians/:id
Authorization: sessionId

Response 200:
{ "message": "Seminarian deleted successfully" }
```

---

## Catechumens Management

### List Catechumens
```
GET /api/catechumens
Authorization: sessionId

Response 200:
[
  {
    "id": "c1",
    "fullName": "Ana Paulo",
    "email": "ana@ipe.com",
    "phone": "+55 11 55555-5555",
    "status": "frequentador",
    "conversionDate": "2024-01-15",
    "parentName": "Not set"
  }
]
```

### Create Catechumen
```
POST /api/catechumens
Authorization: sessionId
Content-Type: application/json

{
  "fullName": "Beatriz Silva",
  "email": "beatriz@ipe.com",
  "phone": "+55 11 44444-4444",
  "status": "frequentador",
  "conversionDate": "2024-06-10",
  "parentName": "Carlos Silva"
}

Response 201:
{ id: "c2", ... }
```

### Conclude Catechumen (Promote to Member)
```
PATCH /api/catechumens/:id/conclude
Authorization: sessionId

Response 200:
{
  "message": "Catechumen concluded and promoted to member",
  "catechumen": { ... },
  "newMember": { ... }
}
```

### Delete Catechumen
```
DELETE /api/catechumens/:id
Authorization: sessionId

Response 200:
{ "message": "Catechumen deleted successfully" }
```

---

## Visitors Management

### List Visitors
```
GET /api/visitors
Authorization: sessionId

Response 200:
[
  {
    "id": "v1",
    "fullName": "Roberto Lima",
    "email": "roberto@email.com",
    "phone": "+55 11 33333-3333",
    "visitDate": "2024-11-20",
    "visitReason": "Visita casual"
  }
]
```

### Create Visitor
```
POST /api/visitors
Authorization: sessionId
Content-Type: application/json

{
  "fullName": "Fernanda Costa",
  "email": "fernanda@email.com",
  "phone": "+55 11 22222-2222",
  "visitDate": "2024-11-21",
  "visitReason": "Indicação de membro"
}

Response 201:
{ id: "v2", ... }
```

### Update Visitor
```
PATCH /api/visitors/:id
Authorization: sessionId

Response 200:
{ ... updated visitor ... }
```

### Delete Visitor
```
DELETE /api/visitors/:id
Authorization: sessionId

Response 200:
{ "message": "Visitor deleted successfully" }
```

---

## Financial - Tithes

### List Tithes
```
GET /api/tithes
Authorization: sessionId

Response 200:
[
  {
    "id": "t1",
    "memberId": "m1",
    "memberName": "João Silva",
    "amount": 500.00,
    "paymentMethod": "dinheiro",
    "date": "2024-11-20",
    "receipt": "/receipts/t1.jpg"
  }
]
```

### Create Tithe
```
POST /api/tithes
Authorization: sessionId
Content-Type: application/json

{
  "memberId": "m1",
  "amount": 600.00,
  "paymentMethod": "transferência",
  "date": "2024-11-21"
}

Response 201:
{ id: "t2", ... }
```

### Update Tithe
```
PATCH /api/tithes/:id
Authorization: sessionId

Response 200:
{ ... updated tithe ... }
```

### Delete Tithe
```
DELETE /api/tithes/:id
Authorization: sessionId

Response 200:
{ "message": "Tithe deleted successfully" }
```

---

## Financial - Offerings

### List Offerings
```
GET /api/offerings
Authorization: sessionId

Response 200:
[
  {
    "id": "o1",
    "visitorId": "v1",
    "visitorName": "Roberto Lima",
    "type": "social",
    "amount": 50.00,
    "date": "2024-11-20"
  }
]
```

### Create Offering
```
POST /api/offerings
Authorization: sessionId
Content-Type: application/json

{
  "visitorId": "v1",
  "type": "missions",
  "amount": 100.00,
  "date": "2024-11-21"
}

Response 201:
{ id: "o2", ... }
```

### Update Offering
```
PATCH /api/offerings/:id
Authorization: sessionId

Response 200:
{ ... updated offering ... }
```

### Delete Offering
```
DELETE /api/offerings/:id
Authorization: sessionId

Response 200:
{ "message": "Offering deleted successfully" }
```

---

## Financial - Bookstore Sales

### List Bookstore Sales
```
GET /api/bookstore-sales
Authorization: sessionId

Response 200:
[
  {
    "id": "bs1",
    "visitorId": "v1",
    "visitorName": "Roberto Lima",
    "product": "Bíblia de Estudo",
    "amount": 120.00,
    "quantity": 1,
    "date": "2024-11-20"
  }
]
```

### Create Bookstore Sale
```
POST /api/bookstore-sales
Authorization: sessionId
Content-Type: application/json

{
  "visitorId": "v2",
  "product": "Hinário",
  "amount": 45.00,
  "quantity": 2,
  "date": "2024-11-21"
}

Response 201:
{ id: "bs2", ... }
```

### Update Bookstore Sale
```
PATCH /api/bookstore-sales/:id
Authorization: sessionId

Response 200:
{ ... updated sale ... }
```

### Delete Bookstore Sale
```
DELETE /api/bookstore-sales/:id
Authorization: sessionId

Response 200:
{ "message": "Bookstore sale deleted successfully" }
```

---

## Financial - Loans

### List Loans
```
GET /api/loans
Authorization: sessionId

Response 200:
[
  {
    "id": "l1",
    "memberId": "m1",
    "memberName": "João Silva",
    "amount": 2000.00,
    "installments": 10,
    "startDate": "2024-11-20",
    "observations": "Empréstimo para reforma"
  }
]
```

### Create Loan (Auto-generates Installment Expenses)
```
POST /api/loans
Authorization: sessionId
Content-Type: application/json

{
  "memberId": "m1",
  "amount": 3000.00,
  "installments": 12,
  "startDate": "2024-11-21",
  "observations": "Empréstimo para educação"
}

Response 201:
{
  "loan": { id: "l2", ... },
  "expenses": [ 
    { id: "e1", category: "parcela_emprestimo", amount: 250.00, ... },
    { id: "e2", category: "parcela_emprestimo", amount: 250.00, ... },
    ...
  ]
}
```

### Update Loan (Regenerates Expenses)
```
PATCH /api/loans/:id
Authorization: sessionId
Content-Type: application/json

{
  "amount": 3500.00,
  "installments": 12,
  ...
}

Response 200:
{ ... updated loan with regenerated expenses ... }
```

### Delete Loan (Cascades to Expenses)
```
DELETE /api/loans/:id
Authorization: sessionId

Response 200:
{ "message": "Loan deleted successfully" }
```

---

## Financial - Expenses

### List Expenses
```
GET /api/expenses
Authorization: sessionId

Response 200:
[
  {
    "id": "e1",
    "category": "aluguel",
    "description": "Aluguel imóvel",
    "amount": 2000.00,
    "date": "2024-11-01",
    "isAutoGenerated": false
  }
]
```

### Create Expense (Manual Only)
```
POST /api/expenses
Authorization: sessionId
Content-Type: application/json

{
  "category": "luz",
  "description": "Conta de luz - Novembro",
  "amount": 350.50,
  "date": "2024-11-20"
}

Response 201:
{ id: "e2", ... }
```

### Update Expense (Manual Only)
```
PATCH /api/expenses/:id
Authorization: sessionId

Response 200:
{ ... updated expense ... }

Note: Auto-generated expenses (from loans/diaconal help) cannot be edited
```

### Delete Expense (Manual Only)
```
DELETE /api/expenses/:id
Authorization: sessionId

Response 200:
{ "message": "Expense deleted successfully" }

Note: Auto-generated expenses cannot be deleted
```

---

## Ministry - Diaconal Help

### List Diaconal Help
```
GET /api/diaconal-help
Authorization: sessionId

Response 200:
[
  {
    "id": "dh1",
    "visitorId": "v1",
    "visitorName": "Roberto Lima",
    "helpType": "alimentação",
    "amount": 50.00,
    "description": "Cesta básica",
    "date": "2024-11-20"
  }
]
```

### Create Diaconal Help (Auto-generates Expense)
```
POST /api/diaconal-help
Authorization: sessionId
Content-Type: application/json

{
  "visitorId": "v2",
  "helpType": "medicamentos",
  "amount": 80.00,
  "description": "Medicamentos para diabetes",
  "date": "2024-11-21"
}

Response 201:
{
  "help": { id: "dh2", ... },
  "expense": { id: "e3", category: "ajuda_diaconal", amount: 80.00, ... }
}
```

### Update Diaconal Help
```
PATCH /api/diaconal-help/:id
Authorization: sessionId

Response 200:
{ ... updated diaconal help ... }
```

### Delete Diaconal Help (Cascades to Expense)
```
DELETE /api/diaconal-help/:id
Authorization: sessionId

Response 200:
{ "message": "Diaconal help deleted successfully" }
```

---

## Ministry - Bulletins

### List Bulletins
```
GET /api/bulletins
Authorization: sessionId

Response 200:
[
  {
    "id": "b1",
    "date": "2024-11-24",
    "liturgy": "Salmo 100...",
    "education": "Lição sobre fé...",
    "announcements": "Reunião...",
    "birthdays": "João Silva - 24 Nov",
    "prayerRequests": "Pela saúde de Maria...",
    "leadership": "Pastor João Silva"
  }
]
```

### Create Bulletin
```
POST /api/bulletins
Authorization: sessionId
Content-Type: application/json

{
  "date": "2024-11-24",
  "liturgy": "Abertura com cântico",
  "education": "EBD sobre Romanos 3",
  "announcements": "Reunião de diáconos terça",
  "birthdays": "Ana Paulo - 24 Nov",
  "prayerRequests": "Pela obra missionária",
  "leadership": "Pastor João Silva"
}

Response 201:
{ id: "b2", ... }
```

### Update Bulletin
```
PATCH /api/bulletins/:id
Authorization: sessionId

Response 200:
{ ... updated bulletin ... }
```

### Delete Bulletin
```
DELETE /api/bulletins/:id
Authorization: sessionId

Response 200:
{ "message": "Bulletin deleted successfully" }
```

---

## LGPD - Consents

### List Consents
```
GET /api/lgpd-consents
Authorization: sessionId

Response 200:
[
  {
    "id": "lc1",
    "memberId": "m1",
    "consentGiven": true,
    "consentDate": "2024-01-15"
  }
]
```

### Create Consent
```
POST /api/lgpd-consents
Authorization: sessionId
Content-Type: application/json

{
  "memberId": "m2",
  "consentGiven": true
}

Response 201:
{ id: "lc2", ... }
```

### Update Consent
```
PATCH /api/lgpd-consents
Authorization: sessionId
Content-Type: application/json

{
  "memberId": "m1",
  "consentGiven": false
}

Response 200:
{ ... updated consent ... }
```

---

## LGPD - Data Requests

### List Requests
```
GET /api/lgpd-requests
Authorization: sessionId

Response 200:
[
  {
    "id": "lr1",
    "memberId": "m1",
    "action": "export",
    "status": "pendente",
    "createdAt": "2024-11-20"
  }
]
```

### Create Request
```
POST /api/lgpd-requests
Authorization: sessionId
Content-Type: application/json

{
  "memberId": "m1",
  "action": "deletion_request",
  "description": "Solicitação de exclusão de dados"
}

Response 201:
{ id: "lr2", ... }
```

### Update Request Status
```
PUT /api/lgpd-requests/:id
Authorization: sessionId
Content-Type: application/json

{
  "status": "processado"
}

Response 200:
{ ... updated request ... }
```

---

## LGPD - Data Export

### Export Data
```
POST /api/lgpd/export
Authorization: sessionId
Content-Type: application/json

{
  "memberId": "m1",
  "format": "json"  // or "csv", "pdf"
}

Response 200:
Content-Type: application/json
Content-Disposition: attachment; filename=dados_ipe.json

{
  "format": "json",
  "exportDate": "2024-11-21T14:30:00Z",
  "dataCategories": {
    "personal": { ... },
    "financial": { ... },
    "spiritual": { ... }
  }
}
```

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Description of the error"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid session)
- `404` - Not found
- `500` - Server error

---

## Notes

- All timestamps are in ISO 8601 format
- All monetary amounts are in Brazilian Reais (BRL) as decimal numbers
- File paths are relative to the server root
- Sessions expire on server restart (in-memory storage)
- All operations are logged in audit_logs table for compliance
