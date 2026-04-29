export type CropSlug = "cafe" | "cacao" | "cannabis" | "canamo";

export interface Crop {
  slug: CropSlug;
  name: string;
  image: string;
  productiveUnits: number;
  description: string;
}

export type RegionSlug =
  | "eje-cafetero"
  | "centro-oriente"
  | "los-llanos"
  | "centro-sur-amazonia"
  | "pacifico"
  | "caribe";

export type TerritoryFlag = "PDET" | "ZOMAC";

export interface Municipality {
  name: string;
  flags: TerritoryFlag[];
}

export interface Territory {
  slug: string;
  /** Código DANE del departamento (2 dígitos, p.ej. "05" = Antioquia) */
  daneCode: string;
  department: string;
  region: string;
  regionSlug: RegionSlug;
  municipalities: Municipality[];
}

export type PartnerRole =
  | "proponente"
  | "aliado"
  | "beneficiario";

export type PartnerAxis = "academia" | "empresa" | "sociedad";

export interface Partner {
  slug: string;
  name: string;
  shortName?: string;
  role: PartnerRole;
  axis: PartnerAxis;
  order: number;
  logo?: string;
  country?: string;
}

export interface Stat {
  key: string;
  value: string;
  label: string;
  description?: string;
}

export interface ProjectIdentity {
  shortName: string;
  fullName: string;
  sigpCode: string;
  durationMonths: number;
  durationPeriods: number;
  call: string;
  proponent: string;
  problemStatement: string;
  generalObjective: string;
}

export type AxisStatus = "active" | "upcoming";
export type AxisCode = "OE1" | "OE2" | "OE3";

export interface Axis {
  code: AxisCode;
  iconName: "Microscope" | "Recycle" | "FlaskConical";
  title: string;
  tagline: string;
  description: string;
  status: AxisStatus;
  activities: string[];
}

export interface SubIndicator {
  key: string;
  name: string;
  unit?: string;
  baseline: number;
  target: number;
  description?: string;
}

export interface ExpectedProduct {
  mgaCode: string;
  product: string;
  target: string;
}

export type GroupCategory = "A1" | "A" | "B" | "C" | "Reconocido";

export interface ResearchGroup {
  slug: string;
  name: string;
  shortName?: string;
  gruplacCode: string;
  category: GroupCategory;
  line: string;
  description: string;
  /** URL externa a la ficha del grupo (opcional, pendiente de verificación) */
  url?: string;
}

export type NewsTag = "Evento" | "Publicación" | "Convocatoria" | "Hito";

export interface NewsEntry {
  id: string;
  /** Fecha en formato ISO (YYYY-MM-DD) */
  date: string;
  tag: NewsTag;
  title: string;
  summary: string;
  url?: string;
}
