import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// 🔒 Enum de papéis de usuário
export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "MASTER",
  "USER",
]);
export const exametipoEnum = pgEnum("exame_tipo", [
  "ADMISSIONAL",
  "PERIODICO",
  "MUDANCA FUNCAO",
  "RE. AO TRABALHO",
  "DEMISSIONAL",
  "OUTROS",
  "PCMSO",
  "PPRA",
  "LCAT",
  "PCMAT",
  "ART",
  "PCA",
  "SESMET",
  "CONSULTA MEDICA",
  "ATESTADO SAN",
  "HOMOL. ATESTADO",
]);
export const pedidoEnum = pgEnum("pedido", ["Sim", "Não"]);
export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);

// 👤 Tabela de Usuários
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  role: userRoleEnum("role").notNull().default("USER"), // 🆕 controle de acesso
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  usersToClinics: many(usersToClinicsTable),
}));

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// 🏥 Clínicas
export const clinicsTable = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  subscriptionPlan: text("subscription_plan").notNull().default("free"),
  subscriptionStatus: text("subscription_status").notNull().default("active"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});


export const usersToClinicsTable = pgTable("users_to_clinics", {
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  permissions: text("permissions").array().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTableRelations = relations(
  usersToClinicsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [usersToClinicsTable.userId],
      references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [usersToClinicsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

// 👨‍⚕️ Médicos
export const doctorsTable = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatarImageUrl: text("avatar_image_url"),
  availableFromWeekDay: integer("available_from_week_day").notNull(),
  availableToWeekDay: integer("available_to_week_day").notNull(),
  availableFromTime: time("available_from_time").notNull(),
  availableToTime: time("available_to_time").notNull(),
  specialty: text("specialty").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const doctorsTableRelations = relations(
  doctorsTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [doctorsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
  }),
);

// 🧪 Exames
export const examesTable = pgTable("exames", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  descricao: text("descricao").notNull(),
  validade: integer("validade").notNull(),
  validade1: integer("validade1").notNull(),
  valor: numeric("valor", { precision: 15, scale: 2 }).notNull(),
  pedido: pedidoEnum("pedido").notNull(),
  codigo_anterior: text("codigo_anterior"),
  tipo: exametipoEnum("tipo").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const examesTableRelations = relations(examesTable, ({ one, many }) => ({
  clinic: one(clinicsTable, {
    fields: [examesTable.clinicId],
    references: [clinicsTable.id],
  }),
  appointments: many(appointmentsTable),
}));

// 🧍 Pacientes
export const patientsTable = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  endereco: text("endereco"),
  numero: text("numero"),
  complemento: text("complemento"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  uf: text("uf"),
  cep: text("cep"),
  telefone: text("telefone"),
  celular: text("celular"),
  cpf: text("cpf"),
  rg: text("rg"),
  ctps: text("ctps"),
  data_admissao: timestamp("data_admissao"),
  data_demissao: timestamp("data_demissao"),
  situacao: text("situacao"),
  obs1: text("obs1"),
  data_nascimento: timestamp("data_nascimento"),
  setor: text("setor"),
  cargahoraria: text("cargahoraria"),
  prontuario: text("prontuario"),
  observacao: text("observacao"),
  pcd: text("pcd"),
  cod_anterior: text("cod_anterior"),
  phoneNumber: text("phone_number").notNull(),
  sex: patientSexEnum("sex").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patientsTableRelations = relations(
  patientsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [patientsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
  }),
);

// 🧑‍💼 Clientes
export const clientsTable = pgTable("clients", {
  id: serial("id").primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  razaoSocial: text("razao_social"),
  fantasia: text("fantasia"),
  endereco: text("endereco"),
  numero: text("numero"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  uf: text("uf"),
  cep: text("cep"),
  complemento: text("complemento"),
  moradia: integer("moradia"),
  tipo: integer("tipo"),
  situacao: integer("situacao"),
  telefone1: text("telefone1"),
  telefone2: text("telefone2"),
  telefone3: text("telefone3"),
  celular: text("celular"),
  email: text("email"),
  rg: text("rg"),
  cpf: text("cpf"),
  estadoCivil: text("estado_civil"),
  empresa: text("empresa"),
  dataCadastro: timestamp("data_cadastro"),
  dataUltimaCompra: timestamp("data_ultima_compra"),
  previsao: timestamp("previsao"),
  cnae: text("cnae"),
  codMunicipioIbge: text("cod_municipio_ibge"),
  ibge: text("ibge"),
  correspEndereco: text("corresp_endereco"),
  correspBairro: text("corresp_bairro"),
  correspCidade: text("corresp_cidade"),
  correspUf: text("corresp_uf"),
  correspCep: text("corresp_cep"),
  correspComplemento: text("corresp_complemento"),
  foto: text("foto"),
  tipoCadastro: text("tipo_cadastro"),
  ie: text("ie"),
  mdia: text("mdia"),
  tDocumento: text("t_documento"),
  tVencimento: text("t_vencimento"),
  tCobranca: text("t_cobranca"),
  retencoes: text("retencoes"),
  simples: text("simples"),
  correios: text("correios"),
  email1: text("email1"),
  email2: text("email2"),
  email3: text("email3"),
  email4: text("email4"),
  email5: text("email5"),
  contribuinte: text("contribuinte"),
  vlrMens: numeric("vlr_mens", { precision: 15, scale: 2 }),
  observacao: text("observacao"),
  usaFor: integer("usa_for"),
  crt: text("crt"),
  melhorDia: text("melhor_dia"),
  vendedor: text("vendedor"),
  travado: boolean("travado").default(false),
  ativo: boolean("ativo").default(false),
  inadimplente: boolean("inadimplente").default(false),
  especial: boolean("especial").default(false),
  bloqueado: boolean("bloqueado").default(false),
  pessoa: text("pessoa").default("J"),
  documentosPdf: text("documentos_pdf"),
  codigoAnterior: text("codigo_anterior"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const clientsTableRelations = relations(clientsTable, ({ one }) => ({
  clinic: one(clinicsTable, {
    fields: [clientsTable.clinicId],
    references: [clinicsTable.id],
  }),
}));

// 🔗 Relações de Clínica
export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
  doctors: many(doctorsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(usersToClinicsTable),
  exames: many(examesTable),
  clients: many(clientsTable),
}));

// 📅 Agendamentos
export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  examesId: uuid("exames_id")
    .notNull()
    .references(() => examesTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const appointmentsTableRelations = relations(
  appointmentsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [appointmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [appointmentsTable.patientId],
      references: [patientsTable.id],
    }),
    exames: one(examesTable, {
      fields: [appointmentsTable.examesId],
      references: [examesTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [appointmentsTable.doctorId],
      references: [doctorsTable.id],
    }),
  }),
);

export const permissionsTable = pgTable("permissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // exemplo: "view_clients", "edit_exams"
  description: text("description"),
});

export const userPermissionsTable = pgTable("user_permissions", {
  userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  permissionId: text("permission_id").references(() => permissionsTable.id, { onDelete: "cascade" }).notNull(),
  clinicId: uuid("clinic_id").references(() => clinicsTable.id, { onDelete: "cascade" }).notNull(), // 👈 opcional por clínica
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
