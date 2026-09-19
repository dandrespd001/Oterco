/**
 * OT-02 — Datos transcritos del perfil OTERCO (ÚNICO archivo editable de contenido).
 *
 * Fuentes: O-D01 (DOCX, cuatro páginas) y O-D02 (HTML). Textos tal cual;
 * nada inventado, nada reconciliado. Todo campo conflictivo nace `pendiente`
 * y `aprobaciones` nace vacío: solo el operador añade revisiones expresas.
 * Un cambio de texto se limita a este archivo y lo valida `validarPerfil`.
 */
import type { Perfil } from "./perfil";

export const perfilBase: Perfil = {
  schemaVersion: 1,
  identidad: {
    razonSocial: "OTERCO LTDA",
    perfil: "Ganadería de cría y ceba en la Costa Norte de Colombia",
    region: "Departamentos de Sucre y Bolívar · Colombia",
    enfoque: "mercado nacional",
    nit: {
      fuente: "O-D01",
      localizador: "DOCX p.1 §1, p.2 §1 y p.4 §7 (tres menciones idénticas)",
      valorTranscrito: "830.128.652",
      valorCompletoPropuesto: "830.128.652-4",
      procedenciaDigito: "O-D03 Cámara de Comercio 28-04-2025 (agrega dígito 4); pendiente de confirmar antes de publicar",
      estado: "pendiente",
    },
  },
  fincas: [
    {
      id: "beraka",
      nombre: "Hacienda Beraka",
      municipio: "San Onofre",
      departamento: "Sucre",
      funcion: "cría",
      texto:
        "Finca de cría ubicada en la subregión de los Montes de María, sobre terreno plano y de pastos abundantes, " +
        "con potreros divididos para pastoreo rotacional y acceso a fuentes de agua permanentes. Enfocada en el " +
        "levante de hembras de reemplazo y el mantenimiento del núcleo genético cebuino de la empresa.",
      etiquetas: ["Cría", "Pastoreo rotacional", "Núcleo genético", "Planta solar 11.6 MW"],
      anexoSolarLiteral:
        "Dentro de sus instalaciones opera además una planta solar de 11.6 MW sobre 21 hectáreas, que convierte " +
        "a Beraka en una hacienda con infraestructura ecológica y una fuente de ingreso complementaria a la actividad ganadera.",
      fuente: { fuente: "O-D01", localizador: "DOCX pp.2–3 §2; O-D02 #fincas" },
    },
    {
      id: "puerta-roja",
      nombre: "Hacienda Puerta Roja",
      municipio: "Turbaco",
      departamento: "Bolívar",
      funcion: "ceba y levante",
      texto:
        "Finca de ceba y levante localizada a corta distancia de Cartagena, lo que facilita la logística hacia " +
        "plantas de beneficio y centros de comercialización del mercado nacional. Concentra la etapa de engorde " +
        "y terminación de los animales antes de su salida al mercado local.",
      etiquetas: ["Ceba y terminación", "Logística regional", "Manejo sanitario"],
      anexoSolarLiteral: "",
      fuente: { fuente: "O-D01", localizador: "DOCX pp.2–3 §2; O-D02 #fincas" },
    },
  ],
  oferta: [
    {
      id: "ganado-en-pie",
      categoria: "Ganado en pie",
      titulo: "Animales de ceba terminados",
      descripcion:
        "Novillos y hembras de descarte con el peso y la cobertura de grasa que requieren las plantas de " +
        "beneficio de la región, con historial sanitario documentado.",
      fuente: { fuente: "O-D01", localizador: "DOCX pp.3–4 §5; O-D02 #portafolio" },
    },
    {
      id: "cria",
      categoria: "Cría",
      titulo: "Hembras de reemplazo",
      descripcion:
        "Vientres seleccionados por fertilidad y adaptación al trópico, provenientes del núcleo genético " +
        "que se mantiene en la Hacienda Beraka.",
      fuente: { fuente: "O-D01", localizador: "DOCX pp.3–4 §5; O-D02 #portafolio" },
    },
    {
      id: "servicio",
      categoria: "Servicio",
      titulo: "Pastaje y levante por contrato",
      descripcion:
        "Alternativa para terceros que buscan potreros manejados técnicamente para el levante o engorde " +
        "de sus propios animales, bajo los mismos protocolos de Oterco.",
      fuente: { fuente: "O-D01", localizador: "DOCX pp.3–4 §5; O-D02 #portafolio" },
    },
  ],
  contacto: {
    email: "contacto@oterco.com.co",
    verificado: false,
    estado: "pendiente",
    fuente: { fuente: "O-D01", localizador: "DOCX p.4 §7; O-D02 footer" },
    nota:
      "Buzón y dominio sin comprobar; pendiente de prueba humana del buzón. " +
      "No comprar el dominio ni afirmar el canal por inferencia.",
  },
  solar: {
    potencia: "11.6 MW",
    area: "21 hectáreas",
    estado: "pendiente",
    fuente: { fuente: "O-D01", localizador: "DOCX p.2; O-D02 #fincas y .solar" },
    conflicto:
      "O-D04 (video anterior) menciona 11,65 MWp, 10,39+1,26 y 16.700×700 W sin reconciliar. " +
      "No equivaler MW y MWp, no escoger cifra por redondeo, no añadir “instalado por OTERCO”. " +
      "Pendiente: potencia/unidad, relación con el proyecto y estado real.",
  },
  fotos: {
    afirmacion: "Fotografias tomadas en las fincas de Oterco LTDA.",
    estado: "pendiente",
    fuente: { fuente: "O-D02", localizador: "O-D02 #ganado (texto bajo galería)" },
    nota:
      "Afirmación de origen conservada como fuente, no como validación independiente. " +
      "Sin licencias ni consentimientos registrados; pendiente del operador.",
  },
  /* Registro vacío: nada aprobado. Cada entrada futura indica responsable,
     fecha, alcance, documento y observaciones (ver tipo Aprobacion). */
  aprobaciones: [],
};
