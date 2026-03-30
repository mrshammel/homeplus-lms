// ============================================
// Parent Skills Data — Hybrid Skill Tree
// ============================================
// These are reporting-level skills (GLO/strand level).
// They power dashboards, unit summaries, and family-friendly reporting.
// Child skills (in skill-data-children.ts) are the assessable targets.

export interface SkillDef {
  id: string;
  code: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: number;
  strand: string;
  curriculumOutcomeCode: string;
  isCorePrerequisite: boolean;
  parentSkillId?: string;
}

export const parentSkills: SkillDef[] = [
  // ══════════════════════════════════════════
  // Grade 7 Science — Unit A: Interactions & Ecosystems
  // ══════════════════════════════════════════
  { id: 'skill-sci7-a1', code: 'SCI.7.A.1', title: 'Ecosystems & Interactions', description: 'Investigate and describe relationships between humans and their environments, and identify related issues and scientific questions', subject: 'Science', gradeLevel: 7, strand: 'Interactions & Ecosystems', curriculumOutcomeCode: 'SCI.7.A.1', isCorePrerequisite: true },
  { id: 'skill-sci7-a2', code: 'SCI.7.A.2', title: 'Energy & Material Flow', description: 'Trace and interpret the flow of energy and materials within an ecosystem', subject: 'Science', gradeLevel: 7, strand: 'Interactions & Ecosystems', curriculumOutcomeCode: 'SCI.7.A.2', isCorePrerequisite: false },
  { id: 'skill-sci7-a3', code: 'SCI.7.A.3', title: 'Environmental Monitoring', description: 'Monitor a local environment, and assess the impacts of environmental factors on growth, health and reproduction of organisms', subject: 'Science', gradeLevel: 7, strand: 'Interactions & Ecosystems', curriculumOutcomeCode: 'SCI.7.A.3', isCorePrerequisite: false },
  { id: 'skill-sci7-a4', code: 'SCI.7.A.4', title: 'Stewardship & Decision Making', description: 'Describe the relationships among knowledge, decisions and actions in maintaining life-supporting environments', subject: 'Science', gradeLevel: 7, strand: 'Interactions & Ecosystems', curriculumOutcomeCode: 'SCI.7.A.4', isCorePrerequisite: false },

  // ══════════════════════════════════════════
  // Grade 7 Science — Unit B: Plants for Food & Fibre
  // ══════════════════════════════════════════
  { id: 'skill-sci7-b1', code: 'SCI.7.B.1', title: 'Plant Uses & Technology', description: 'Investigate plant uses; and identify links among needs, technologies, products and impacts', subject: 'Science', gradeLevel: 7, strand: 'Plants for Food & Fibre', curriculumOutcomeCode: 'SCI.7.B.1', isCorePrerequisite: true },
  { id: 'skill-sci7-b2', code: 'SCI.7.B.2', title: 'Plant Biology', description: 'Investigate life processes and structures of plants, and interpret related characteristics and needs', subject: 'Science', gradeLevel: 7, strand: 'Plants for Food & Fibre', curriculumOutcomeCode: 'SCI.7.B.2', isCorePrerequisite: false },
  { id: 'skill-sci7-b3', code: 'SCI.7.B.3', title: 'Environmental Factors', description: 'Analyze plant environments, and identify impacts of specific factors and controls', subject: 'Science', gradeLevel: 7, strand: 'Plants for Food & Fibre', curriculumOutcomeCode: 'SCI.7.B.3', isCorePrerequisite: false },
  { id: 'skill-sci7-b4', code: 'SCI.7.B.4', title: 'Technology & Sustainability', description: 'Identify and interpret relationships among human needs, technologies, environments, and the culture and use of living things as sources of food and fibre', subject: 'Science', gradeLevel: 7, strand: 'Plants for Food & Fibre', curriculumOutcomeCode: 'SCI.7.B.4', isCorePrerequisite: false },

  // ══════════════════════════════════════════
  // Grade 7 Science — Unit C: Heat & Temperature
  // ══════════════════════════════════════════
  { id: 'skill-sci7-c1', code: 'SCI.7.C.1', title: 'Thermal Technology', description: 'Illustrate and explain how human needs have led to technologies for obtaining and controlling thermal energy', subject: 'Science', gradeLevel: 7, strand: 'Heat & Temperature', curriculumOutcomeCode: 'SCI.7.C.1', isCorePrerequisite: true },
  { id: 'skill-sci7-c2', code: 'SCI.7.C.2', title: 'Nature of Heat', description: 'Describe the nature of thermal energy and its effects on different forms of matter, using observations, evidence and models', subject: 'Science', gradeLevel: 7, strand: 'Heat & Temperature', curriculumOutcomeCode: 'SCI.7.C.2', isCorePrerequisite: false },
  { id: 'skill-sci7-c3', code: 'SCI.7.C.3', title: 'Heat Applications', description: 'Apply understanding of heat and temperature in interpreting natural phenomena and technological devices', subject: 'Science', gradeLevel: 7, strand: 'Heat & Temperature', curriculumOutcomeCode: 'SCI.7.C.3', isCorePrerequisite: false },
  { id: 'skill-sci7-c4', code: 'SCI.7.C.4', title: 'Sustainability Issues', description: 'Analyze issues related to the selection and use of thermal technologies, and explain decisions in terms of sustainability', subject: 'Science', gradeLevel: 7, strand: 'Heat & Temperature', curriculumOutcomeCode: 'SCI.7.C.4', isCorePrerequisite: false },

  // ══════════════════════════════════════════
  // Grade 7 Science — Unit D: Structures and Forces
  // ══════════════════════════════════════════
  { id: 'skill-sci7-d1', code: 'SCI.7.D.1', title: 'Structure Types', description: 'Describe and interpret different types of structures encountered in everyday objects, buildings, plants and animals; identify materials used', subject: 'Science', gradeLevel: 7, strand: 'Structures & Forces', curriculumOutcomeCode: 'SCI.7.D.1', isCorePrerequisite: true },
  { id: 'skill-sci7-d2', code: 'SCI.7.D.2', title: 'Forces in Structures', description: 'Investigate and analyze forces within structures, and forces applied to them', subject: 'Science', gradeLevel: 7, strand: 'Structures & Forces', curriculumOutcomeCode: 'SCI.7.D.2', isCorePrerequisite: false },
  { id: 'skill-sci7-d3', code: 'SCI.7.D.3', title: 'Material Testing', description: 'Investigate and analyze the properties of materials used in structures', subject: 'Science', gradeLevel: 7, strand: 'Structures & Forces', curriculumOutcomeCode: 'SCI.7.D.3', isCorePrerequisite: false },
  { id: 'skill-sci7-d4', code: 'SCI.7.D.4', title: 'Design & Safety', description: 'Demonstrate and describe processes for developing structures with a margin of safety', subject: 'Science', gradeLevel: 7, strand: 'Structures & Forces', curriculumOutcomeCode: 'SCI.7.D.4', isCorePrerequisite: false },

  // ══════════════════════════════════════════
  // Grade 7 Science — Unit E: Planet Earth
  // ══════════════════════════════════════════
  { id: 'skill-sci7-e1', code: 'SCI.7.E.1', title: 'Studying Earth', description: 'Describe and demonstrate methods used in the scientific study of Earth and in observing and interpreting its component materials', subject: 'Science', gradeLevel: 7, strand: 'Planet Earth', curriculumOutcomeCode: 'SCI.7.E.1', isCorePrerequisite: true },
  { id: 'skill-sci7-e2', code: 'SCI.7.E.2', title: 'Rock Cycle', description: 'Identify evidence for the rock cycle, and use the rock cycle concept to interpret and explain characteristics of rocks', subject: 'Science', gradeLevel: 7, strand: 'Planet Earth', curriculumOutcomeCode: 'SCI.7.E.2', isCorePrerequisite: false },
  { id: 'skill-sci7-e3', code: 'SCI.7.E.3', title: 'Landform Changes', description: 'Investigate and interpret evidence of major changes in landforms and rock layers', subject: 'Science', gradeLevel: 7, strand: 'Planet Earth', curriculumOutcomeCode: 'SCI.7.E.3', isCorePrerequisite: false },
  { id: 'skill-sci7-e4', code: 'SCI.7.E.4', title: 'Fossils', description: 'Describe, interpret and evaluate evidence from the fossil record', subject: 'Science', gradeLevel: 7, strand: 'Planet Earth', curriculumOutcomeCode: 'SCI.7.E.4', isCorePrerequisite: false },

  // ══════════════════════════════════════════
  // Grade 6 Science — Life Science (Retrieval Prerequisite)
  // ══════════════════════════════════════════
  { id: 'skill-sci6-ls', code: 'SCI.6.LS', title: 'Life Science: Ecosystems', description: 'Grade 6 Life Science — basic ecosystem concepts (food chains, ecosystem components, habitats)', subject: 'Science', gradeLevel: 6, strand: 'Life Science', curriculumOutcomeCode: 'SCI.6.LS', isCorePrerequisite: false },

  // ══════════════════════════════════════════
  // Grade 6 ELA — Legacy Parent Skills (preserved)
  // ══════════════════════════════════════════
  { id: 'skill-ela6-1', code: 'ELA.6.1', title: 'Reading Comprehension & Inference', description: 'Make inferences, distinguish explicit from implicit information, and make text connections', subject: 'ELA', gradeLevel: 6, strand: 'Reading & Comprehension', curriculumOutcomeCode: 'ELA.6.1', isCorePrerequisite: true },
  { id: 'skill-ela6-2', code: 'ELA.6.2', title: 'Vocabulary & Word Analysis', description: 'Understand and use context clues, figurative language, and vocabulary strategies', subject: 'ELA', gradeLevel: 6, strand: 'Vocabulary & Language', curriculumOutcomeCode: 'ELA.6.2', isCorePrerequisite: true },
  { id: 'skill-ela6-3', code: 'ELA.6.3', title: 'Literary Analysis & Theme', description: 'Identify theme, plot structure, and analyze literary elements in narrative texts', subject: 'ELA', gradeLevel: 6, strand: 'Literary Analysis', curriculumOutcomeCode: 'ELA.6.3', isCorePrerequisite: false },
  { id: 'skill-ela6-4', code: 'ELA.6.4', title: 'Writing Craft & Conventions', description: 'Apply grammar, punctuation, figurative language, and narrative writing techniques', subject: 'ELA', gradeLevel: 6, strand: 'Writing & Conventions', curriculumOutcomeCode: 'ELA.6.4', isCorePrerequisite: false },
  { id: 'skill-ela6-5', code: 'ELA.6.5', title: 'Communication & Collaboration', description: 'Practice active listening, constructive feedback, and collaborative discussion skills', subject: 'ELA', gradeLevel: 6, strand: 'Oral Communication', curriculumOutcomeCode: 'ELA.6.5', isCorePrerequisite: false },
];
