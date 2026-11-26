// The Brazilian Portuguese text of the UI: the same shape as `en.ts` (a missing or extra key fails the build). It is a
// copy of the English for now and is being translated in pieces; the comments in `en.ts` say what each string is for.
//
// Football words follow FM27 where the game's Portuguese (the European one, in `languages.fmf`) agrees with how a
// Brazilian player says it, and change only what differs (goleiro, zagueiro, time, torcedores).

import type {
  CheckKey,
  Concern,
  EditEntity,
  Entity,
  ExportEntity,
  ExportFormat,
  GraphicsCounts,
  MassOperationKind,
  MassPreview,
  OpportunityKind,
  PlayerSort,
  SessionChoice,
  SquadSort,
  StaffSort,
  Storefront,
} from "../types";
import { fieldName } from "./fieldNames";
import { reasonText } from "./reasons";
import type { ErrorTexts, Strings } from "./en";
import { REASONS_PT_BR } from "./reasons/pt-BR";

const numbers = new Intl.NumberFormat("pt-BR");
const percents = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** A count or an amount with the thousands separators of the language: "12.345". */
const format = (value: number) => numbers.format(value);

/** "Nenhuma alteração", "1 alteração", "3 alterações", "12.345 alterações". */
const changeCount = (count: number) =>
  count === 0 ? "Nenhuma alteração" : count === 1 ? "1 alteração" : `${format(count)} alterações`;

/** "1 jogador", "12 jogadores". */
const playerCount = (count: number) => (count === 1 ? "1 jogador" : `${format(count)} jogadores`);

/** "1 valor mantido", "12 valores mantidos". */
const valuesLeftAlone = (count: number) =>
  count === 1 ? "1 valor mantido" : `${format(count)} valores mantidos`;

/** "237 jogadores", "1 jogador", "237 funcionários", "1 funcionário", "12 clubes", "1 clube". */
const entityCount: Record<Entity, (count: number) => string> = {
  player: (count) => (count === 1 ? "1 jogador" : `${format(count)} jogadores`),
  staff: (count) => (count === 1 ? "1 funcionário" : `${format(count)} funcionários`),
  club: (count) => (count === 1 ? "1 clube" : `${format(count)} clubes`),
};

/** What each list holds, in the plural. */
const entityNouns: Record<Entity, string> = { player: "jogadores", staff: "funcionários", club: "clubes" };

/**
 * Squad statuses, by the codes contracts hold them as; named as the game's contract screen names them. 15, 16,
 * 17, 20 and 21 are goalkeepers' (21 is the game's "Emergency Backup" too).
 */
const SQUAD_STATUSES: Partial<Record<number, string>> = {
  1: "Craque do time",
  2: "Jogador importante",
  3: "Titular absoluto",
  4: "Jogador do elenco",
  5: "Reserva decisivo",
  7: "Jogador marginal",
  9: "Reserva de emergência",
  10: "Promessa em ascensão",
  11: "Promessa para o futuro",
  13: "Jovem",
  14: "Titular do time B",
  15: "Goleiro titular",
  16: "Goleiro das copas",
  17: "Goleiro da copa nacional",
  20: "Reserva",
  21: "Reserva de emergência (goleiro)",
  22: "Fora dos planos",
};

/** The kinds of contract, by the codes contracts hold them as; 8, 10 and 11 are the MLS's, and the game
 * shows 8 and 11 under one name. */
const CONTRACT_TYPES: Partial<Record<number, string>> = {
  0: "Contrato de meio período",
  1: "Contrato de tempo integral",
  2: "Contrato de amador",
  3: "Contrato de base",
  4: "Sem contrato",
  8: "Contrato profissional",
  10: "Contrato profissional com salário mínimo",
  11: "Contrato profissional",
};

/**
 * Sentences for the failures of the Rust commands, by code (see `describeError` in format.ts). Each gets the values
 * the failure names, its amounts and dates already written out; fields come as keys, which `fieldName` names. A code
 * a dictionary leaves out shows the English message the command sent.
 */

/** The name of the field a failure names. */
const field = (key: string | undefined) => fieldName(ptBR, key ?? "");

/** A day the commands name as "20280131", written out: "31 de janeiro de 2028". */
const dayText = (value: string | undefined) => {
  const [y, m, d] = [Number(value?.slice(0, 4)), Number(value?.slice(4, 6)), Number(value?.slice(6, 8))];
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
};

/** What a check is about, from the key a failure gives, with a capital: "Contratos". */
const checkName = (key: string | undefined) => {
  const name = (ptBR.checks as Partial<Record<string, string>>)[key ?? ""] ?? key ?? "";
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/** Messages for the commands' failures, in Portuguese. */
const errors: ErrorTexts = {
  "team.nobodyInjured": () => "Ninguém neste time está lesionado.",
  "team.noCohesion": () =>
    "O editor não consegue ler o entrosamento deste time: esta versão do jogo ainda não foi verificada para isso, ou nenhum jogador tem registro no clube.",
  "team.noTactics": () =>
    "O editor não consegue ler o quanto este time conhece a tática: esta versão do jogo ainda não foi verificada para isso, ou o time não joga com uma tática que você escolhe.",
  "edit.unknownField": (p) => `Não existe um campo editável “${p.field}” aqui.`,
  "edit.outOfRange": (p) => `${p.value} não é um valor válido para ${field(p.field)}: aceita de ${p.min} a ${p.max}.`,
  "edit.notADate": (p) => `${p.value} não é uma data válida para ${field(p.field)}.`,
  "edit.notAChoice": (p) => `${p.value} não é um dos valores que ${field(p.field)} aceita.`,
  "edit.taken": (p) => `O número ${p.value} já está em uso: ${p.name ?? `o jogador com UID ${p.uid}`} usa essa camisa.`,
  "edit.unsupported": (p) => `${field(p.field)} não pode ser alterado dessa forma: ${p.reason}.`,
  "edit.noRecord": (p) => `${field(p.field)} não pode ser alterado aqui: o registro está ausente ou não confere.`,
  "edit.unset": (p) => `${field(p.field)} não está definido no jogo, então foi mantido como está.`,
  "edit.implausible": (p) => `${field(p.field)} mostra ${p.value}, valor que ele não pode ter; foi mantido como está por segurança.`,
  "edit.notApplied": (p) => `${field(p.field)}: foi gravado ${p.wrote}, mas a leitura devolveu ${p.read}.`,
  "edit.conflict": (p) => `${field(p.field)} agora é ${p.found}, não ${p.expected}: o jogo o alterou depois.`,
  "move.outOfRange": (p) => `${p.value} não é um valor válido para ${field(p.field)}: aceita de ${p.min} a ${p.max}.`,
  "loan.end": (p) => `O empréstimo deve terminar depois da chegada dele e, no máximo, junto com o contrato: de ${dayText(p.earliest)} a ${dayText(p.latest)}.`,
  "loan.noModel": () =>
    "O jogo não tem nenhum empréstimo em andamento para servir de modelo a este. Tente de novo depois que um dia passar no jogo.",
  "names.unknown": () =>
    "O editor não encontra onde o jogo guarda os nomes das pessoas nesta versão, então não consegue alterá-los.",
  "names.noRoom": (p) =>
    `O jogo não tem espaço para ${({ first: "mais um nome", last: "mais um sobrenome", common: "mais um nome popular" } as Record<string, string>)[p.table] ?? "mais um nome"} novo neste momento. ` +
    "Ele abre espaço sozinho conforme novos jogadores e funcionários chegam; ou salve o jogo, carregue o save de novo e tente outra vez.",
  "names.same": () => "Esse já é o nome.",
  "names.bad": (p) =>
    `O nome ou o sobrenome não pode ficar vazio, e nenhum nome pode começar ou terminar com espaço, ter caracteres de controle ou passar de ${p.max} bytes.`,
  "export.failed": (p) => `Não foi possível gravar o arquivo: ${p.reason}`,
  "export.notAllowed": (p) =>
    `O FMLibreEditor não pode gravar em ${p.folder}. Se o macOS perguntou se ele pode usar a pasta Documentos, permita ` +
    "em Ajustes do Sistema › Privacidade e Segurança › Arquivos e Pastas e exporte de novo.",
  "export.openFailed": (p) => `Não foi possível abrir: ${p.reason}`,
  "guard.unknownBuild": () =>
    "O FMLibreEditor não foi verificado com esta versão do jogo, então não grava nela. “Editar mesmo assim”, no " +
    "aviso no topo, liga a edição.",
  "guard.failed": (p) =>
    `${checkName(p.check)} não conferiu nesta versão do jogo, então o FMLibreEditor deixa esses dados como estão.`,
  "guard.saveChanged": () =>
    "O jogo carregou um save ou voltou ao menu principal depois que o FMLibreEditor o leu, então nada é alterado " +
    "até você recarregar os dados.",
  "memory.noBridge": () =>
    "O macOS não deixa o FMLibreEditor entrar no jogo: o jogo foi iniciado sem a ponte do FMLibreEditor. Configure " +
    "a ponte e inicie o jogo de novo pela Steam.",
  "staff.directorTaken": (p) =>
    `${p.name ?? "Outra pessoa"} já é o diretor de futebol do clube. Dê a este funcionário outra função ` +
    `lá, ou mova ${p.name ?? "essa pessoa"} primeiro.`,
  "staff.managerTaken": (p) =>
    `${p.name ?? "Outra pessoa"} já é o treinador do clube. Dê a este funcionário outra função lá, ou ` +
    `mova ${p.name ?? "essa pessoa"} primeiro.`,
  "staff.yourClub": () =>
    "Você treina este clube. Dê a este funcionário outra função lá: o FMLibreEditor nunca toma o seu lugar.",
  "staff.noJob": () => "Escolha a função que a pessoa assume no clube.",
  "staff.noModel": (p) =>
    p.staff === "0"
      ? "Este clube não tem funcionários: o jogo não mantém nenhum em clubes de ligas que não são jogáveis neste save."
      : "Nenhum funcionário deste clube tem um contrato integral próprio para servir de modelo a um novo.",
  "scout.noClub": () => "Você não treina nenhum clube neste save, então não há para quem observar jogadores.",
  "scout.noTactic": (p) => `Não foi possível ler a tática de ${p.club} no jogo.`,
  "scout.notPlaced": () => "O jogador não está em uma posição da tática.",
  "scout.unknownRole": (p) => `O editor não conhece a função ${p.role}.`,
  "setup.steamRunning": () =>
    "A Steam está aberta, então as opções de inicialização do FM27 foram mantidas; a ponte em si está instalada. Feche a Steam e " +
    "tente de novo, ou digite você mesmo a opção de inicialização na Steam.",
};

/**
 * The kinds of contract clauses and bonuses, by the codes contracts hold them as; named as the game's contract
 * screen names them (6, which only the German one was seen in, after what it does). The game shows no 54, 58 or 63.
 */
const CLAUSE_NAMES_EN: Partial<Record<number, string>> = {
  0: "Cláusula de rescisão por valor mínimo",
  1: "Cláusula de rescisão por rebaixamento",
  2: "Cláusula de rescisão por não acesso",
  3: "Aumento salarial anual",
  4: "Aumento salarial por acesso",
  5: "Redução salarial por rebaixamento",
  6: "Cláusula de rescisão para uma função na comissão",
  8: "Percentual da venda futura",
  9: "Percentual do lucro da venda futura",
  10: "Bônus por marca de gols na temporada",
  11: "Renovação de um ano após jogos no campeonato (última temporada)",
  12: "Cláusula de maior salário do elenco",
  13: "Salário após atingir jogos pelo clube no campeonato",
  14: "Aumento salarial por acesso à primeira divisão",
  15: "Redução salarial por rebaixamento da primeira divisão",
  16: "Cláusula de rescisão por valor mínimo (clubes estrangeiros)",
  17: "Cláusula de rescisão por valor mínimo (clubes nacionais de divisão superior)",
  18: "Cláusula de rescisão por valor mínimo (clubes nacionais)",
  19: "Salário após atingir jogos pela seleção",
  20: "Percentual do salário pago pelo patrocinador",
  21: "Percentual da renda dos jogos pago ao jogador",
  22: "Renovação opcional do contrato pelo clube",
  23: "Dispensa de indenização ao clube por função de treinador",
  25: "Renovação de um ano após jogos no campeonato (acesso na última temporada)",
  26: "Renovação de um ano após jogos no campeonato (permanência na última temporada)",
  27: "Cláusula de rescisão por valor mínimo (clubes na Liga dos Campeões da UEFA)",
  28: "Cláusula de contrato garantido da MLS",
  29: "Renovação do contrato após o acesso",
  30: "Cláusula de rescisão por lesão",
  31: "Cláusula de rescisão por valor mínimo (clubes em competição continental)",
  32: "Bônus por jogo disputado",
  33: "Bônus por gol",
  34: "Bônus por jogo sem sofrer gols",
  37: "Bônus por jogo pela seleção",
  38: "Valor por reserva não utilizado",
  39: "Bônus por assistência",
  40: "Bônus por marca de assistências na temporada",
  41: "Bônus por marca combinada de gols e assistências na temporada",
  54: "Não exibido no jogo (54)",
  55: "Cláusula de rescisão ativa por rebaixamento",
  56: "Cláusula de rescisão ativa por não acesso",
  58: "Não exibido no jogo (58)",
  63: "Não exibido no jogo (63)",
};

/** Players' traits (preferred moves), by their bit in the game's mask; named as FMRTE names them. */
const TRAIT_NAMES_EN: readonly string[] = [
  "Corre com a bola pela esquerda",
  "Corre com a bola pela direita",
  "Corre com a bola pelo meio",
  "Entra na área adversária",
  "Infiltra-se pelos corredores",
  "Avança sempre que possível",
  "Faz passes curtos e simples",
  "Tenta passes decisivos com frequência",
  "Chuta de longe",
  "Chuta com força",
  "Chuta colocado",
  "Chuta colocando efeito na bola",
  "Gosta de driblar o goleiro",
  "Gosta de tentar quebrar a linha de impedimento",
  "Usa o lado de fora do pé",
  "Marca o adversário de perto",
  "Provoca os adversários",
  "Discute com a arbitragem",
  "Joga de costas para o gol",
  "Recua para buscar a bola",
  "Joga tabelinhas",
  "Gosta de tentar encobrir o goleiro",
  "Dita o ritmo do jogo",
  "Tenta bicicletas",
  "Procura o passe em vez de tentar finalizar",
  "Não tenta passes em profundidade",
  "Quebra o ritmo do jogo",
  "Toca a bola para além do adversário",
  "Passa a bola para o pé direito antes de driblar",
  "Passa a bola para o pé esquerdo antes de driblar",
  "Segura a bola",
  "Chega atrasado à área adversária",
  "Tenta sair de situações difíceis jogando",
  "Fica sempre na defesa",
  "Evita usar o pé mais fraco",
  "Tenta firulas",
  "Tenta faltas de longa distância",
  "Entra forte nas divididas",
  "Não entra forte nas divididas",
  "Corta para dentro",
  "Fica colado à linha lateral",
  "Anima a torcida",
  "Tenta finalizações de primeira",
  "Tenta passes longos",
  "Gosta de receber a bola no pé",
  "Bate faltas com força",
  "Gosta de driblar o mesmo adversário repetidamente",
  "Gosta de inverter o jogo para o outro lado",
  "Vai se aposentar no auge",
  "Vai jogar futebol pelo maior tempo possível",
  "Tem lateral longo e rasteiro",
  "Corre com a bola com frequência",
  "Raramente corre com a bola",
  "Tenta desenvolver o pé mais fraco",
  "Pivô fixo",
  "Usa lateral longo para iniciar contra-ataques",
  "Evita chutes de longe",
  "Corta para dentro pela ponta esquerda",
  "Corta para dentro pela ponta direita",
  "Cruza cedo",
  "Sai jogando com a bola da defesa",
  "Joga com os pés"
];

export const ptBR: Strings = {
  attributes: {
    // Technical
    corners: "Escanteios",
    crossing: "Cruzamentos",
    dribbling: "Drible",
    finishing: "Finalização",
    first_touch: "Domínio de Bola",
    free_kicks: "Cobrança de Falta",
    heading: "Cabeceio",
    long_shots: "Chutes de Fora da Área",
    long_throws: "Laterais Longos",
    marking: "Marcação",
    passing: "Passe",
    penalty_taking: "Cobrança de Pênalti",
    tackling: "Desarme",
    technique: "Técnica",
    // Mental
    aggression: "Agressividade",
    anticipation: "Antecipação",
    bravery: "Coragem",
    composure: "Compostura",
    concentration: "Concentração",
    decisions: "Tomada de Decisão",
    determination: "Determinação",
    flair: "Criatividade",
    leadership: "Liderança",
    off_the_ball: "Movimentação sem a Bola",
    positioning: "Posicionamento",
    teamwork: "Trabalho em Equipe",
    vision: "Visão de Jogo",
    work_rate: "Dedicação",
    // Physical
    acceleration: "Aceleração",
    agility: "Agilidade",
    balance: "Equilíbrio",
    jumping_reach: "Impulsão",
    natural_fitness: "Condição Física Natural",
    pace: "Velocidade",
    stamina: "Resistência",
    strength: "Força",
    // Goalkeeping (first touch and passing are shared with Technical)
    aerial_reach: "Alcance Aéreo",
    command_of_area: "Domínio da Área",
    communication: "Comunicação",
    eccentricity: "Excentricidade",
    handling: "Trabalho com as Mãos",
    kicking: "Chute",
    one_on_ones: "Um contra Um",
    punching: "Socos (Tendência)",
    reflexes: "Reflexos",
    rushing_out: "Saídas do Gol (Tendência)",
    throwing: "Reposição com as Mãos",
    // Hidden
    consistency: "Regularidade",
    dirtiness: "Jogo Sujo",
    important_matches: "Jogos Importantes",
    injury_proneness: "Propensão a Lesões",
    versatility: "Versatilidade",
    // Feet
    left_foot: "Pé Esquerdo",
    right_foot: "Pé Direito",
  },

  staffAttributes: {
    // Coaching
    attacking: "Ataque",
    defending: "Defesa",
    fitness: "Preparo Físico",
    goalkeeping: "Goleiros",
    possession: "Posse de Bola",
    set_pieces: "Bolas Paradas",
    tactical: "Tática",
    technical: "Técnica",
    working_with_youngsters: "Trabalho com Jovens",
    // Mental
    authority: "Autoridade",
    determination: "Determinação",
    motivating: "Motivação",
    people_management: "Gestão de Pessoas",
    // Knowledge
    data_analysis: "Análise de Dados",
    judging_ability: "Avaliação da Habilidade do Jogador",
    judging_potential: "Avaliação do Potencial do Jogador",
    judging_staff: "Avaliação da Habilidade de Funcionários",
    negotiating: "Negociação",
    tactical_knowledge: "Conhecimento Tático",
    // Medical
    physiotherapy: "Fisioterapia",
    sports_science: "Ciência do Esporte",
  },

  personality: {
    adaptability: "Adaptabilidade",
    ambition: "Ambição",
    loyalty: "Lealdade",
    pressure: "Pressão",
    professionalism: "Profissionalismo",
    sportsmanship: "Espírito Esportivo",
    temperament: "Temperamento",
    controversy: "Polêmica",
  },

  /** The abbreviations of the positions, as Brazilian players know them. */
  positions: {
    gk: "GOL",
    sw: "LIB",
    dl: "LE",
    dc: "ZC",
    dr: "LD",
    dm: "VOL",
    ml: "ME",
    mc: "MC",
    mr: "MD",
    aml: "PE",
    amc: "MEI",
    amr: "PD",
    st: "ATA",
    wbl: "ALE",
    wbr: "ALD",
  },

  clubFacilities: {
    training: "Treinamento",
    youth_facilities: "Instalações da Base",
    youth_coaching: "Treinadores da Base",
    youth_recruitment: "Captação da Base",
    /** Only a club with finances has it. */
    corporate: "Corporativo",
  },

  supporterTraits: {
    loyalty: "Lealdade",
    passion: "Paixão",
    patience: "Paciência",
    affluence: "Poder Aquisitivo",
    temperament: "Temperamento",
    expectations: "Expectativas",
  },

  /** The kinds of supporters, in the order of the supporter-mix bar. */
  supporterMix: {
    hardcore: "Fanáticos",
    core: "Fiéis",
    family: "Família",
    fair_weather: "Só nas Vitórias",
    corporate: "Corporativos",
    casual: "Ocasionais",
  },

  /** FM's job codes as stored in contracts. */
  jobs: {
    1: "Jogador",
    2: "Treinador",
    4: "Presidente do Conselho",
    6: "Diretor",
    10: "Diretor de Futebol",
    12: "Fisioterapeuta",
    14: "Olheiro",
    16: "Técnico",
    20: "Auxiliar Técnico",
    22: "Treinador de Bolas Paradas",
    26: "Preparador Físico",
    34: "Treinador de Goleiros",
    38: "Médico-Chefe",
    40: "Chefe de Ciência do Esporte",
    44: "Olheiro-Chefe",
    46: "Médico",
    48: "Cientista do Esporte",
    50: "Fisioterapeuta-Chefe",
    58: "Analista de Recrutamento",
    60: "Analista de Desempenho",
    62: "Analista de Desempenho-Chefe",
    64: "Chefe de Desenvolvimento da Base",
    66: "Dono",
    70: "Presidente",
    86: "Gerente de Empréstimos",
    88: "Diretor Técnico",
  },

  /** The names of the fields that are not attributes, personality or positions, by key. */
  fields: {
    current_ability: "Habilidade atual",
    potential_ability: "Habilidade potencial",
    height: "Altura (cm)",
    date_of_birth: "Data de nascimento",
    asking_price: "Preço pedido",
    nation: "Nacionalidade",
    city_of_birth: "Cidade de nascimento",
    "reputation.home": "Reputação nacional",
    "reputation.current": "Reputação atual",
    "reputation.world": "Reputação mundial",
    "international.caps": "Jogos pela seleção",
    "international.goals": "Gols pela seleção",
    "international.u21_caps": "Jogos pela seleção sub-21",
    "international.u21_goals": "Gols pela seleção sub-21",
    // What the game changes every day.
    condition: "Energia",
    match_sharpness: "Ritmo de jogo",
    jadedness: "Cansaço acumulado",
    morale: "Moral",
    "contract.wage": "Salário por semana",
    wageShare: "parcela do salário",
    monthlyFee: "taxa mensal",
    optionFee: "opção de compra",
    "contract.loyalty_bonus": "Bônus de lealdade por semana",
    "contract.happiness": "Felicidade",
    "contract.playing_time_happiness": "Felicidade com o tempo de jogo",
    "contract.unhappiness": "Motivos de insatisfação",
    "contract.expires": "Fim do contrato",
    "contract.squad_number": "Número da camisa",
    "contract.squad_status": "Status no elenco",
    "contract.transfer_listed": "Na lista de transferências",
    "contract.loan_listed": "Na lista de empréstimos",
    "loan.expires": "Fim do empréstimo",
    "loan.option_fee": "Opção de compra",
    // A member of staff's job, which the change log keeps as a change of its code.
    "contract.job": "Função",
    // A player's ties, which the change log keeps as changes of the nation or club (see `ties`).
    "tie.nationality": "Segunda nacionalidade",
    "tie.trainedInNation": "Formado no país",
    "tie.trainedAtClub": "Formado no clube",
    "tie.workPermit": "Sem necessidade de permissão de trabalho em",
    // A move to another club, which the change log keeps as a change of the player's club.
    club: "Clube",
    // Healing a player, which the change log keeps as a change of his injuries.
    injuries: "Lesões",
    // Setting a player's cohesion with his club, which the change log keeps as a change of it.
    cohesion: "Entrosamento",
    tactics: "Familiaridade tática",
    // Lifting a player's bans, which the change log keeps as a change of his bans.
    bans: "Suspensões",
    // Keeping a player from retiring, which the change log keeps as a change of the date he was to retire on.
    retirement: "Aposentadoria",
    // A change to a player's contract clauses, which the change log keeps as a change of the clause's amount.
    clause: "Cláusula do contrato",
    "clause.amount": "Valor da cláusula",
    "clause.condition": "Condição da cláusula",
    // Making a player the captain or vice-captain of one of a club's teams, which the change log keeps as a change of
    // the club's captain or vice-captain.
    captain: "Capitão",
    vice_captain: "Vice-capitão",
    // A club's own reputation, which has no home, current or world.
    reputation: "Reputação",
    "facilities.training": "Instalações de treinamento",
    "facilities.youth_facilities": "Instalações da base",
    "facilities.youth_coaching": "Treinadores da base",
    "facilities.youth_recruitment": "Captação da base",
    "facilities.corporate": "Instalações corporativas",
    "finance.balance": "Saldo",
    "finance.transfer_budget": "Orçamento de transferências",
    "finance.wage_budget": "Orçamento salarial",
    "finance.total_wage_budget": "Orçamento salarial total",
    "stadium.capacity": "Capacidade do estádio",
    "stadium.name": "Nome do estádio",
    "name.first": "Nome",
    "name.last": "Sobrenome",
    "name.common": "Nome popular",
    "name.full": "Nome completo",
    "stadium.seating": "Capacidade sentada",
    "stadium.used": "Capacidade em uso",
    "stadium.expansion": "Capacidade de ampliação",
    // Prize money a club's league pays, which the change log keeps as a change of the club (see `leaguePrizes`).
    "prize.win": "Premiação da liga por vitória",
    "prize.draw": "Premiação da liga por empate",
    "prize.loss": "Premiação da liga por derrota",
  },

  profile: {
    close: "Fechar perfil",
    loading: "Carregando perfil…",
    /** The handle on the left edge of the panel. */
    resize: "Redimensionar o painel do perfil",
    resizeHint: "Arraste para deixar o painel mais largo ou mais estreito; clique duas vezes para restaurar",
    /** Shown where a value is missing. */
    none: "—",

    // Header
    freeAgent: "Sem clube",
    born: "Nascimento",
    height: (cm: number) => `${cm} cm`,
    /** After the input of the height, while the player is edited. */
    heightUnit: "cm",
    uid: "UID",
    currentAbility: "Habilidade atual",
    currentAbilityShort: "HA",
    potentialAbility: "Habilidade potencial",
    potentialAbilityShort: "POT",
    /** Hover text of a potential ability that is set as a range (the game stores it as a negative number). */
    potentialRange: "Potencial definido como faixa",

    // Attributes
    technical: "Técnicos",
    goalkeeping: "Goleiro",
    mental: "Mentais",
    physical: "Físicos",
    hidden: "Ocultos",
    feet: "Pés",
    personality: "Personalidade",
    /** Hover text of an attribute: the value as stored, 0–100 unless the game stores it on another scale. */
    raw: (raw: number, scale = 100) => `bruto ${raw} / ${scale}`,
    lowerIsBetter: "quanto menor, melhor",
    age: (age: number) => `${age} anos`,

    // Positions
    positions: "Posições",
    positionsSummary: (best: string) => `Avaliação das posições: ${best}`,
    /** The group of every position's rating, under the pitch. */
    positionRatings: "Avaliação das posições",
    positionTiers: {
      natural: "Natural",
      accomplished: "Experiente",
      competent: "Competente",
      unconvincing: "Pouco convincente",
      ineffective: "Ineficaz",
    },
    positionTooltip: (position: string, rating: number, tier: string) => `${position} · ${rating} · ${tier}`,

    // Contract
    contract: "Contrato",
    wage: "Salário por semana",
    /** Under the wage: the game keeps money in pounds; `converted` when the app shows another currency. */
    wageNote: (converted: boolean): string =>
      converted
        ? "o jogo guarda libras; exibido pela taxa de câmbio do próprio FM"
        : "o jogo guarda libras; outra moeda pode ser escolhida nas configurações",
    signed: "Assinado em",
    expires: "Vence em",
    joined: "Chegou em",
    /** Under a contract's dates: the button that makes it run `years` longer, while it does, and its hover text. */
    extendContract: (years: number) => `Estender por ${years} anos`,
    extendingContract: "Estendendo…",
    /** `until` is the day the contract would end then. */
    extendContractTitle: (years: number, until: string) => `Faz o contrato durar ${years} anos a mais, até ${until}`,
    squadStatus: "Status no elenco",
    squadStatusName: (status: number) => SQUAD_STATUSES[status] ?? `Status ${status}`,
    contractType: "Tipo de contrato",
    contractTypeName: (code: number) => CONTRACT_TYPES[code] ?? `Tipo ${code}`,
    squadNumber: "Número da camisa",
    transferListed: "Na lista de transferências",
    loanListed: "Na lista de empréstimos",

    // Career
    career: "Carreira",
    internationalCaps: "Jogos pela seleção",
    internationalGoals: "Gols pela seleção",
    u21Caps: "Jogos pela seleção sub-21",
    u21Goals: "Gols pela seleção sub-21",
    askingPrice: "Preço pedido",
    notSet: "Não definido",
    reputation: "Reputação",
    reputationHome: "Nacional",
    reputationCurrent: "Atual",
    reputationWorld: "Mundial",
    /** The retirement the game has planned for a player, and the button that keeps him playing. */
    retirement: "Aposentadoria",
    retires: "Pretende se aposentar",
    noRetirement: "O jogo não planejou a aposentadoria dele",
    keepPlaying: "Impedir aposentadoria",
    keepingPlaying: "Impedindo…",
    keepPlayingTitle: "Cancela a aposentadoria planejada e dá a ele o traço “Vai jogar futebol pelo maior tempo possível”",

    // Medical (the group's heading is `medical`, below; the names of its values are in `fields`)
    /** A player's morale, 1–20. */
    morale: (value: number) => `${value} / 20`,
    /** Hover text of his morale: the game shows it as his overall happiness. */
    /** A player's traits (preferred moves): the heading, none, and each one's name by its bit. */
    traits: "Traços",
    noTraits: "Sem traços",
    traitName: (bit: number) => TRAIT_NAMES_EN[bit] ?? `Traço ${bit}`,
    /** A player's reasons to be unhappy, as FMRTE lists them, and the button that removes them all. */
    unhappiness: "Insatisfação",
    noUnhappiness: "Nada o deixa insatisfeito",
    removeUnhappiness: "Remover todos",
    removingUnhappiness: "Removendo…",
    removeUnhappinessTitle: "Tira todos os motivos de insatisfação da lista dele",
    /** The second line of Remove all's hover text: what the game then does about his teammates. */
    removeUnhappinessFollows: "Os motivos dos companheiros sobre ele terminam quando o jogo avança: clique em Continuar no jogo",
    concernSince: (date: string) => `desde ${date}`,
    /** After a reason held about a teammate whose sentence does not name him: who he is. */
    concernAbout: (name: string) => `sobre ${name}`,
    concernKind: (kind: number) => (kind === 1 ? "Preocupado" : kind === 2 ? "Interno" : `Tipo ${kind}`),
    /** A reason by the game's sentence for it (see `reasons.ts`); a motive without one by its number. */
    concernMotive: (concern: Concern) => reasonText(REASONS_PT_BR, concern) ?? `Motivo ${concern.motive}`,
    /** A contract's clauses and bonuses: the heading, and what each kind the game has is called. */
    clauses: "Bônus e cláusulas",
    noClauses: "Sem bônus ou cláusulas",
    loyaltyBonus: "Bônus de lealdade",
    happiness: "Felicidade",
    playingTimeHappiness: "Felicidade com o tempo de jogo",
    moodTitle: "Como o FMRTE mostra, de -100 a 100; o jogo mostra em palavras",
    /** The name of a clause or bonus by its kind; a kind the app does not know yet by its number. */
    clauseName: (kind: number) => CLAUSE_NAMES_EN[kind] ?? `Cláusula ${kind}`,
    /** A player's loan: where he is on loan, and the button that brings him back. */
    loan: "Empréstimo",
    loanAt: "Emprestado a",
    loanParent: "Pertence a",
    loanFrom: "De",
    loanUntil: "Até",
    loanNumber: "Número lá",
    recall: "Chamar de volta",
    recallTitle: "Traz ele de volta ao clube hoje; pede confirmação antes",
    recallAgain: "Chamar de volta de novo",
    makePermanent: "Tornar definitivo",
    makePermanentTitle: "Mantém ele no clube que o recebeu por empréstimo, com contrato; pede confirmação antes",
    /** Where the Recall button was, once the loan ends today: recalled by the editor, or ending today anyway. */
    recalledWaiting: "Chamado de volta · retorno pendente",
    endsTodayWaiting: "Termina hoje · retorno pendente",
    pendingTitle: (parent: string) => `O empréstimo termina hoje: avance um dia no jogo e ele volta para ${parent}`,
    endPassed: (date: string) =>
      `O empréstimo deveria terminar em ${date}, mas o jogo não o trouxe de volta. Chame-o de volta de novo e avance um dia.`,
    /** The loan's terms, as the game's Loan Club tab shows them. */
    loanCanRecall: "Pode ser chamado de volta",
    loanCanRecallTitle: "Se o clube dele pode chamá-lo de volta no jogo. “Chamar de volta” aqui funciona de qualquer jeito",
    loanCanTerminate: "Pode ser encerrado antes",
    loanCupMatches: "Joga em jogos de copa",
    loanAgainstClub: "Joga contra o próprio clube",
    loanOptionFee: "Opção de compra",
    loanOptionFeeTitle: "O valor pelo qual o clube que o recebeu por empréstimo pode contratá-lo em definitivo",
    loanMonthlyFee: "Taxa mensal",
    loanMonthlyFeeTitle: "O que o clube que o recebeu paga ao clube dele por cada mês em que ele joga",
    loanUnusedFee: "Taxa mensal se não utilizado",
    loanUnusedFeeTitle: "O que o clube que o recebeu paga ao clube dele por cada mês em que ele não é utilizado",
    /** What a clause depends on, by kind: goals, assists, league games, matches, years or a percentage. */
    clauseCondition: (kind: number, value: number) => {
      switch (kind) {
        case 10:
          return value === 1 ? "1 gol" : `${value} gols`;
        case 40:
          return value === 1 ? "1 assistência" : `${value} assistências`;
        case 41:
          return `${value} gols e assistências`;
        case 19:
          return value === 1 ? "1 jogo pela seleção" : `${value} jogos pela seleção`;
        case 11:
        case 13:
        case 25:
        case 26:
          return value === 1 ? "1 jogo no campeonato" : `${value} jogos no campeonato`;
        case 22:
        case 29:
          return value === 1 ? "1 ano" : `${value} anos`;
        case 3:
        case 4:
        case 5:
        case 8:
        case 9:
        case 14:
        case 15:
        case 20:
        case 21:
          return `${value}%`;
        default:
          return String(value);
      }
    },
    /** When a release clause expires: on `date`, or, with the contract's start not known, `days` after it. */
    clauseExpires: (date: string) => `vence em ${date}`,
    clauseExpiresAfter: (days: number) =>
      days === 1 ? "vence 1 dia após a assinatura" : `vence ${format(days)} dias após a assinatura`,
    /** A sell-on clause on the profit: its percentage of what the selling club makes over the amount. */
    clauseProfitShare: (percent: string, amount: string) => `${percent} do lucro acima de ${amount}`,
    /** The wage a clause gives from then on. */
    clauseWage: (amount: string) => `${amount} por semana`,
    moraleTitle: "Felicidade geral no jogo: satisfeito com 10, um pouco feliz com 11, extremamente feliz com 15 e 20",
    /** Hover text of jadedness, which the profile shows as stored. */
    jadednessTitle:
      "O quanto ele está desgastado por jogar: -500 é totalmente descansado e, quanto maior, mais ele precisa de descanso",
    noInjuries: "Sem lesões",
    /** The name of an injury the game gave none for. */
    unknownInjury: "Lesão desconhecida",
    /** Under the name of an injury: when it began, and when he is expected back (`dates`: one date, or a range). */
    injuryStarted: (date: string) => `Início em ${date}`,
    injuryBack: (dates: string) => `Volta prevista: ${dates}`,
    /** Heals every injury of the player at once. */
    heal: "Curar",
    healTitle: "Cura todas as lesões deste jogador no jogo",
    noBans: "Sem suspensões",
    /** A ban: how many matches the player still has to miss, and under it when it began. */
    banMatches: (matches: number) => (matches === 1 ? "1 jogo" : `${format(matches)} jogos`),
    banStarted: (date: string) => `A partir de ${date}`,
    /** Lifts every ban of the player at once. */
    liftBans: "Cancelar",
    liftBansTitle: "Cancela todas as suspensões deste jogador no jogo",

    // Above the attributes, while the profile is read
    /** Sets every attribute of the player to its best at once. */
    maxAttributes: "Maximizar atributos",
    maxAttributesTitle: "Coloca todos os atributos no máximo: 20, e 1 para propensão a lesões e jogo sujo",
    /** What Max attributes wrote, beside the button that takes it back; then what that undid. */
    maxAttributesDone: (count: number) =>
      count === 0 ? "Todos os atributos já estão no máximo" : `Gravado: ${changeCount(count)}`,
    maxAttributesUndone: (count: number) => (count === 0 ? "Nada foi desfeito" : `Desfeito: ${changeCount(count)}`),
    undoMax: "Desfazer",
    undoMaxTitle: "Grava de volta no jogo os atributos antigos dele",
    /** Freezing his attributes, while the game can be written to, and what that does. */
    freezeAttributes: "Congelar atributos",
    freezeAttributesNote:
      "Os atributos dele não pioram enquanto o app está aberto e conectado; as melhoras continuam valendo",
    /** The same for a member of staff, who has no injury proneness or dirtiness. */
    maxStaffAttributesTitle: "Coloca todos os atributos deste funcionário no máximo: 20",
    undoMaxStaffTitle: "Grava de volta no jogo os atributos antigos",
    freezeStaffAttributesNote:
      "Os atributos deles não pioram enquanto o app está aberto e conectado; as melhoras continuam valendo",
    /** Freezing his energy and match sharpness, under them in the Medical group, and what that does. */
    freezeFitness: "Congelar energia e ritmo de jogo",
    freezeFitnessNote:
      "A energia e o ritmo de jogo dele não caem enquanto o app está aberto e conectado; os ganhos continuam valendo",
    /** Freezing his position ratings: the box under the pitch, and the (i) after it, which says what that does. */
    freezePositions: "Congelar",
    freezePositionsInfo: "O que faz congelar as posições?",
    freezePositionsNote:
      "Enquanto o app está aberto e conectado, as avaliações de posição dele ficam como estão: ele não aprende uma posição nova, " +
      "e as avaliações não sobem nem caem. O app lembra disso para este save.",

    // Staff
    /** Badge on the manager the user controls. */
    you: "Você",
    youTitle: "O técnico que você controla neste save",
    id: "ID",
    job: "Função",
    /** Giving a member of staff another job at their club, under the job in the contract. */
    changeJob: "Mudar função",
    changeJobTitle: "Dá a este funcionário outra função no clube dele, no jogo",
    newJob: "Nova função",
    applyJob: "Aplicar",
    cancelJob: "Cancelar",
    unemployed: "Desempregado",
    coaching: "Treinamento",
    knowledge: "Conhecimento",
    medical: "Médico",
    /** A coaching job held by someone who still plays. */
    playerCoach: (job: string) => `${job} (jogador-treinador)`,
    unknownJob: (code: number) => `Função ${code}`,
  },

  /** The player list: search, filter bar and columns. */
  playerList: {
    /** The entry in the sidebar. */
    nav: "Jogadores",
    /** In the status line, once connected. */
    count: (total: number) => `${format(total)} jogadores`,
    search: "Buscar jogadores por nome ou UID",
    /**
     * The line beside the search box. `sorted` is the order a column header was clicked for, or null while the
     * list is in its default order (best current ability first); its `by` is a name from `sortNames`.
     */
    summary: (total: number, shown: number, sorted: { by: string; ascending: boolean } | null) => {
      const count = `${format(total)} jogadores`;
      if (total <= shown) {
        return count;
      }
      return sorted === null
        ? `${count} · mostrando os ${shown} primeiros por habilidade atual`
        : `${count} · mostrando os ${shown} primeiros por ${sorted.by}, ordem ${sorted.ascending ? "crescente" : "decrescente"}`;
    },
    /** The message under an empty table; `filtered` is whether any filter is in effect. */
    empty: (query: string, filtered: boolean) => {
      if (query === "") {
        return filtered ? "Nenhum jogador corresponde a esses filtros." : "Nenhum jogador encontrado.";
      }
      return filtered ? `Nenhum jogador corresponde a “${query}” com esses filtros.` : `Nenhum jogador corresponde a “${query}”.`;
    },
    columns: {
      name: "Nome",
      age: "Idade",
      positions: "Posições",
      nation: "País",
      club: "Clube",
      contractExpires: "Contrato",
      born: "Nascimento",
      currentAbility: "HA",
      potentialAbility: "POT",
      uid: "UID",
    } satisfies Record<PlayerSort | "positions" | "born" | "uid", string>,
    /** Hover text of a column header that sorts the list; `by` is a name from `sortNames`. */
    sortBy: (by: string) => `Ordenar por ${by}`,
    /** The name of each sortable column, as the summary line and the hover text of a header say it. */
    sortNames: {
      currentAbility: "habilidade atual",
      potentialAbility: "habilidade potencial",
      age: "idade",
      name: "nome",
      nation: "país",
      club: "clube",
      contractExpires: "fim do contrato",
    } satisfies Record<PlayerSort, string>,
    /** The filters; the staff list has those that are not about players too (see FilterBar.tsx). */
    filters: {
      /** The button that shows or hides the filters. */
      toggle: "Filtros",
      /** Its name for assistive technology while `count` of the filters are in effect. */
      toggleActive: (count: number) => `Filtros ativos: ${count}`,
      clear: "Limpar",
      /** The entry of the position select that is no filter. */
      any: "Qualquer",
      position: "Posição",
      /** Whom the list shows: the select's name, and its choices after `any`. */
      gender: "Gênero",
      men: "Homens",
      women: "Mulheres",
      age: "Idade",
      minAge: "Idade mínima",
      maxAge: "Idade máxima",
      /** The hint in an empty age input. */
      minPlaceholder: "Mín",
      maxPlaceholder: "Máx",
      minCurrentAbility: "HA mín.",
      minCurrentAbilityTitle: "Habilidade atual mínima",
      minPotentialAbility: "POT mín.",
      minPotentialAbilityTitle: "Habilidade potencial mínima",
      /** The hint in an empty ability input: what it accepts. */
      abilityPlaceholder: "1–200",
      nation: "País",
      club: "Clube",
      freeAgentsOnly: "Só sem clube",
      contractEndsBy: "Contrato termina até",
      transferListedOnly: "Só na lista de transferências",
      loanListedOnly: "Só na lista de empréstimos",
      /** Bounds on attributes, a row each, under the other filters; the staff list has them too. */
      attributes: {
        heading: "Atributos",
        /** The select of a row, for assistive technology, and its entry before an attribute is picked. */
        attribute: "Atributo",
        pick: "Escolha um atributo",
        /** The two inputs of a row, for assistive technology; `name` is the attribute, "" before one is picked. */
        min: (name: string) => (name ? `Mínimo de ${name}` : "Mínimo"),
        max: (name: string) => (name ? `Máximo de ${name}` : "Máximo"),
        add: "Adicionar atributo",
        /** The button that takes a row away, for assistive technology and as its hover text. */
        remove: (name: string) => (name ? `Remover ${name}` : "Remover esta linha"),
      },
      /** Saving the filters in effect, and the sort, under a name of the user's own; the names stay as typed. */
      saved: {
        /** The button that starts saving, and its hover text. */
        save: "Salvar",
        saveTitle: "Salva os filtros e a ordenação atuais com um nome",
        /** The name input, for assistive technology, and the hint in it while it is empty. */
        name: "Nome do filtro salvo",
        namePlaceholder: "Nome do filtro",
        ok: "OK",
        cancel: "Cancelar",
        /** The select of the saved filters: its name, and what it shows while none is the one in effect. */
        select: "Filtros salvos",
        delete: "Excluir",
        /** The name and hover text of Delete; `name` is the saved filter's. */
        deleteTitle: (name: string) => `Excluir o filtro salvo: ${name}`,
        /** The question when the name is taken; `name` is the one typed. */
        replaceQuestion: (name: string) => `Já existe um filtro salvo chamado “${name}”. Substituir?`,
        replace: "Substituir",
        /** When the name is a new one and `max` filters are saved already. */
        full: (max: number) =>
          `Dá para salvar até ${max} filtros. Exclua um antes, ou use o nome de um filtro salvo para substituí-lo.`,
      },
    },
  },

  /** The staff list. */
  staffList: {
    /** The entry in the sidebar. */
    nav: "Funcionários",
    /** In the status line, once connected. */
    count: (total: number) => `${format(total)} funcionários`,
    search: "Buscar funcionários por nome ou ID",
    /**
     * The line beside the search box. `sorted` is the order a column header was clicked for, or null while the
     * list is in its default order (the human manager first, then the best current ability); its `by` is a name from
     * `sortNames`.
     */
    summary: (total: number, shown: number, sorted: { by: string; ascending: boolean } | null) => {
      const count = `${format(total)} funcionários`;
      if (total <= shown) {
        return count;
      }
      return sorted === null
        ? `${count} · mostrando os ${shown} primeiros por habilidade atual`
        : `${count} · mostrando os ${shown} primeiros por ${sorted.by}, ordem ${sorted.ascending ? "crescente" : "decrescente"}`;
    },
    /** The message under an empty table; `filtered` is whether any filter is in effect. */
    empty: (query: string, filtered: boolean) => {
      if (query === "") {
        return filtered ? "Nenhum funcionário corresponde a esses filtros." : "Nenhum funcionário encontrado.";
      }
      return filtered ? `Nenhum funcionário corresponde a “${query}” com esses filtros.` : `Nenhum funcionário corresponde a “${query}”.`;
    },
    columns: {
      name: "Nome",
      age: "Idade",
      job: "Função",
      club: "Clube",
      nation: "País",
      born: "Nascimento",
      currentAbility: "HA",
      potentialAbility: "POT",
      id: "ID",
    } satisfies Record<StaffSort | "job" | "born" | "id", string>,
    /** Hover text of a column header that sorts the list; `by` is a name from `sortNames`. */
    sortBy: (by: string) => `Ordenar por ${by}`,
    /** The name of each sortable column, as the summary line and the hover text of a header say it. */
    sortNames: {
      currentAbility: "habilidade atual",
      potentialAbility: "habilidade potencial",
      age: "idade",
      name: "nome",
      nation: "país",
      club: "clube",
    } satisfies Record<StaffSort, string>,
    /** The filters only the staff list has; the others are the player list's (`playerList.filters`). */
    filters: {
      job: "Função",
      /** The entry of the job select that is no filter. */
      anyJob: "Qualquer",
      unemployedOnly: "Só desempregados",
    },
  },

  /** The club profile: what the player and staff panels do not have. */
  clubProfile: {
    // Header
    womensClub: "Clube feminino",
    /** "Founded 1882", in the line under the name. */
    founded: (year: number) => `Fundado em ${year}`,
    reputationShort: "REP",
    reputationTitle: "Reputação",

    // The tabs under the header: what the club has, and its squad (see `squad`).
    /** The name of the tabs for assistive technology. */
    tabsLabel: "Seções do clube",
    tabs: { overview: "Visão geral", squad: "Elenco", staff: "Funcionários", stadium: "Estádio" },
    /** Hover text of the Squad tab while the club is edited: its values are on the Overview. */
    squadLocked: "Termine a edição para abrir o elenco",
    /** The same for the Staff tab (see `clubStaff`). */
    staffLocked: "Termine a edição para abrir os funcionários",

    facilities: "Instalações",

    // Supporters
    supporters: "Torcedores",
    supporterMix: "Perfil da torcida",
    /** A share of the supporters; `value` is already a percentage (35 for 35%). */
    percent: (value: number) => `${percents.format(value)}%`,
    /** Hover text of a segment of the supporter-mix bar. */
    mixTooltip: (kind: string, percent: string) => `${kind} · ${percent}`,

    // Finances
    finances: "Finanças",
    balance: "Saldo",
    transferBudget: "Orçamento de transferências",
    wageBudget: "Orçamento salarial (gasto)",
    totalWageBudget: "Orçamento salarial total",
    ticketPrice: "Preço médio do ingresso",
    /** Under the labels of the two wage budgets, which are amounts per week. */
    perWeek: "por semana",
    /** Clubs outside the leagues being played have no finance record in memory. */
    noFinances: "O FM guarda finanças apenas dos clubes das ligas que estão sendo jogadas.",
    /** Freezing the club's money, while the game can be written to, and what that does. */
    freeze: "Congelar dinheiro",
    freezeNote: "O saldo não diminui enquanto o app está aberto e conectado; as receitas continuam valendo",

    // Stadium
    stadium: "Estádio",
    capacity: "Capacidade",
    seating: "Sentados",
    used: "Em uso",
    /** The capacity in use when the game does not limit it (stored as 0). */
    usedAll: "Toda",
    usedTitle: "A parte da capacidade que o jogo permite usar enquanto a limita; 0 significa toda",
    expansion: "Pode crescer até",
    /** When the layout of this build does not know where the stadium is, or the club's stadium did not check out. */
    noStadium: "Não foi possível ler o estádio deste clube.",
    /** Its name, which can be changed in place: in the block the game gave the old one. */
    stadiumName: "Nome",
    rename: "Renomear",
    renameTitle: "Dá outro nome ao estádio; é gravado na hora",
    /** The (i) beside the name: how a new name lasts, and that the app has to stay open for it. */
    renameInfoLabel: "Como funciona a renomeação?",
    renameInfo:
      "O jogo não guarda nomes de estádios nos saves: ele os pega do banco de dados toda vez que carrega um save. Por isso " +
      "o FMLibreEditor lembra o novo nome para este save e o devolve em poucos segundos toda vez que o jogo o carrega, " +
      "desde que o app esteja aberto e conectado. Se o jogo carregar o save com o app fechado, ele mostra o próprio " +
      "nome até o app conectar de novo. Para voltar ao nome antigo, desfaça a renomeação em Alterações ou renomeie o " +
      "estádio de volta.",
    saveName: "Salvar",
    renaming: "Salvando…",
    cancelRename: "Cancelar",
    /** How long the name being typed is, in bytes of UTF-8, and how long it may be. */
    nameLength: (bytes: number, min: number, max: number) =>
      min <= 1
        ? `${bytes} de no máximo ${max} caracteres (uma letra acentuada conta como dois)`
        : `${bytes} caracteres: de ${min} a ${max}, para caber onde o jogo guarda o nome (uma letra acentuada conta como dois)`,
    /** Instead of Rename, when other things in the game hold the same name. */
    nameShared: (holders: number) =>
      `${holders} itens no jogo têm este nome, então ele não pode ser mudado só para o estádio`,

    // Club info
    info: "Informações do clube",
    seasonTickets: "Sócios-torcedores",
    socialMedia: "Seguidores nas redes sociais",
  },

  /**
   * The Staff tab of a club's profile: the club's staff, and Release all staff, which releases every one of them the
   * editor can (not you, not the board) after a dialog that asks first.
   */
  clubStaff: {
    loading: "Lendo os funcionários…",
    /** When the game keeps no staff for the club. */
    empty: "O jogo não guarda funcionários para este clube: clubes de ligas que não são jogadas neste save não têm.",
    /**
     * Above the table: how many staff the club has, and how many of them stay when the rest are released (0 when there
     * is nobody to release).
     */
    count: (total: number, staying: number) => {
      const all = total === 1 ? "1 funcionário" : `${format(total)} funcionários`;
      return staying === 0 ? all : `${all} · ${format(staying)} permanecem se os demais forem dispensados`;
    },

    // The action on the whole staff
    /** The name of the group of buttons for assistive technology. */
    actionsLabel: "Ações sobre todos os funcionários",
    /** `count` is how many of the club's staff it releases. */
    releaseAll: (count: number) => (count === 0 ? "Dispensar todos os funcionários" : `Dispensar todos os funcionários (${format(count)})`),
    releaseAllTitle: "Dispensa todos os funcionários do clube, menos você e a diretoria; pede confirmação antes",
    /** Hover text of Release all staff while none of the club's staff can be released. */
    releaseNone: "Nenhum funcionário deste clube pode ser dispensado",
    /** Beside the button: whom it leaves, and where undoing is. */
    hint: "Todos, menos você e a diretoria, saem do clube na hora. Também dá para desfazer na tela Alterações.",
    /** What Release all did, under the button; `count` is how many were released. */
    released: (count: number) =>
      count === 1 ? "1 funcionário dispensado" : `${format(count)} funcionários dispensados`,
    /** A release the game refused: `name` is the member of staff's, `reason` the game's answer. */
    refused: (name: string, reason: string) => `${name}: ${reason}`,
    undo: "Desfazer",
    undoTitle: "Traz de volta ao clube os funcionários dispensados, com os mesmos contratos",

    // The table
    /** The table's name for assistive technology. */
    tableLabel: "Funcionários do clube",
    /** The last column: why a member of staff stays when the rest are released (empty for one who leaves). */
    staysColumn: "Permanece",
    /** The reasons, short; the hover text has the game's answer in full. */
    stays: {
      you: "Você",
      board: "A diretoria",
      player: "Também é jogador",
      held: "Retido pelo clube",
      other: "Não pode ser dispensado",
    },

    // The dialog that asks first
    title: "Dispensar todos os funcionários",
    /** The club the staff leave. */
    from: "Clube",
    /** The headings over those who leave and over those who stay; `count` is how many. */
    leaving: (count: number) => (count === 1 ? "1 sai do clube" : `${format(count)} saem do clube`),
    staying: (count: number) => (count === 1 ? "1 permanece" : `${format(count)} permanecem`),
    /** After the names shown: how many more there are. */
    more: (count: number) => `e mais ${format(count)}`,
    doesHeading: "O que isso faz",
    /** What the release does to each one, one line each. */
    does: [
      "Cada um sai do quadro de funcionários na hora e o contrato termina: desempregados, como os funcionários sem clube do próprio jogo",
      "Ninguém recebe nenhum pagamento",
      "A vaga de técnico ou de diretor de futebol fica vazia, para o clube preencher",
      "Você, a diretoria e quem o editor não pode dispensar permanecem",
      "Listado em Alterações, onde um único desfazer traz todos de volta com os mesmos contratos",
    ],
    /** In the dialog's foot: nothing changes in the game until Release all. */
    dialogHint: "Nada muda no jogo até você clicar em Dispensar todos.",
    release: "Dispensar todos",
    releasing: "Dispensando…",
    cancel: "Cancelar",

    // Moving the whole staff to another club: a button beside Release all staff, and a dialog that asks for the club
    moveAll: "Mover todos os funcionários",
    moveAllTitle: "Move todos os funcionários do clube, menos você e a diretoria, para outro clube; pede confirmação antes",
    /** Hover text of Move all staff while none of the club's staff can be moved. */
    moveNone: "Nenhum funcionário deste clube pode ser movido",
    /** What Move all did, under the button; `count` is how many moved, `club` the club they joined. */
    moved: (count: number, club: string) =>
      count === 1 ? `1 funcionário movido para ${club}` : `${format(count)} funcionários movidos para ${club}`,
    undoMoveTitle: "Traz de volta a este clube os funcionários movidos, com os mesmos contratos",
    moveTitle: "Mover todos os funcionários",
    /** The name of the search box for the club the staff move to, for assistive technology. */
    moveSearch: "Buscar o clube para onde os funcionários vão",
    /** The line under the club in the dialog: before a club is picked, while the move is worked out, and then. */
    movePick: "Escolha o clube para onde os funcionários vão.",
    movePlanning: "Calculando quem pode ser movido…",
    movePlan: (count: number, club: string) =>
      count === 1 ? `1 funcionário vai para ${club}` : `${format(count)} funcionários vão para ${club}`,
    moveNobody: (club: string) => `Nenhum funcionário deste clube pode ir para ${club}.`,
    /**
     * Why one stays when the rest move, short, beyond the reasons a release has (see `stays`); `club` is the club they
     * move to. The hover text has the game's answer in full.
     */
    moveStays: {
      managerTaken: (club: string) => `${club} já tem técnico`,
      directorTaken: (club: string) => `${club} já tem diretor de futebol`,
      yourClub: (club: string) => `Você treina ${club}`,
      other: "Não pode ser movido",
    },
    /** What the move does to each one, one line each. */
    moveDoes: [
      "Cada um entra no novo clube onde fica a função: no departamento médico, de treinamento ou de observação",
      "Mesma função, salário e fim de contrato; cada contrato começa na data do jogo",
      "Um técnico ou diretor de futebol só entra se a vaga no novo clube estiver livre; a vaga deixada aqui fica " +
        "vazia, para o clube preencher",
      "Você, a diretoria e quem o editor não pode mover permanecem",
      "Listado em Alterações, onde um único desfazer traz todos de volta a este clube",
    ],
    /** In the dialog's foot: nothing changes in the game until Move all. */
    moveHint: "Nada muda no jogo até você clicar em Mover todos.",
    move: "Mover todos",
    moving: "Movendo…",
  },

  /** The club list, with the sidebar entry and the status-line count that go with it. */
  clubList: {
    /** The entry in the sidebar. */
    nav: "Clubes",
    /** In the status line, once connected. */
    count: (total: number) => `${format(total)} clubes`,
    search: "Buscar clubes por nome ou UID",
    summary: (total: number, shown: number) =>
      total > shown
        ? `${format(total)} clubes · mostrando os ${shown} primeiros por reputação`
        : `${format(total)} clubes`,
    /** The message under an empty table; `filtered` is whether a filter is in effect. */
    empty: (query: string, filtered: boolean) => {
      if (query === "") {
        return filtered ? "Nenhum clube corresponde a este filtro." : "Nenhum clube encontrado.";
      }
      return filtered ? `Nenhum clube corresponde a “${query}” com este filtro.` : `Nenhum clube corresponde a “${query}”.`;
    },
    /** The small tag on a women's club. */
    women: "Mulheres",
    columns: {
      name: "Nome",
      nation: "País",
      league: "Liga",
      reputation: "Reputação",
      founded: "Fundação",
      uid: "UID",
    },
    filters: {
      /** The label of the select of which clubs to show. */
      kind: "Clubes a mostrar",
      all: "Todos os clubes",
      men: "Clubes masculinos",
      women: "Clubes femininos",
      nation: "País",
      league: "Liga",
      /** The first entry of the league select. */
      anyLeague: "Qualquer liga",
      /** The hover text of the league select. */
      leagueTitle: "A liga em que o time principal joga nesta temporada",
      reputation: "Reputação",
      /** The hover text of the reputation range. */
      reputationTitle: "De 0 a 10.000, como o jogo guarda",
      /** The names of the two ends of the range, which have no labels of their own. */
      minReputation: "Reputação mínima",
      maxReputation: "Reputação máxima",
    },
  },
  /** The Clubs tab's national teams: each nation's men's and women's team, its senior team's squad and reputation. */
  national: {
    /** The button of the Clubs tab's switch that lists them, and the palette's command to go there. */
    nav: "Seleções",
    /** The name of the Clubs tab's switch between the clubs and the national teams, for assistive technology. */
    switchLabel: "Clubes ou seleções",
    search: "Buscar países por nome, código ou UID",
    summary: (total: number, shown: number) =>
      total > shown ? `${format(total)} seleções · mostrando as ${shown} primeiras por reputação` : `${format(total)} seleções`,
    /** The message under an empty table; `filtered` is whether a filter is in effect. */
    empty: (query: string, filtered: boolean) => {
      if (query === "") {
        return filtered ? "Nenhuma seleção corresponde a este filtro." : "Nenhuma seleção encontrada.";
      }
      return filtered ? `Nenhuma seleção corresponde a “${query}” com este filtro.` : `Nenhuma seleção corresponde a “${query}”.`;
    },
    /** The small tag on a women's team. */
    women: "Mulheres",
    columns: {
      name: "País",
      code: "Código",
      reputation: "Reputação",
      players: "Jogadores",
      uid: "UID",
    },
    filters: {
      /** The label of the select of which teams to show. */
      kind: "Seleções a mostrar",
      all: "Todas as seleções",
      men: "Seleções masculinas",
      women: "Seleções femininas",
    },
    /** In the header of a profile, by the name. */
    womensTeam: "Seleção feminina",
    mensTeam: "Seleção masculina",
    reputationShort: "REP",
    reputationTitle: "Reputação da seleção principal, de 0 a 10.000",
    /**
     * The game's names of a nation's teams by the code of their kind, as its national team screens name them; a kind
     * missing here is named by `teamType`. Kind 0 is the senior team.
     */
    teamKinds: { 0: "Seleção principal", 9: "Sub-23", 10: "Sub-21", 18: "Sub-20", 11: "Sub-19", 12: "Sub-18" } as Partial<Record<number, string>>,
    /** A team of a kind the editor has no name for: the game's code for it. */
    teamType: (kind: number) => `Tipo ${kind}`,
    /** The name of the group of buttons that picks one of the nation's teams, for assistive technology. */
    teamsLabel: "Seleções deste país",
    /** The name of the reputation of a team other than the senior one, in the Changes view; `team` is its name. */
    teamReputation: (team: string) => `Reputação (${team})`,
    /** Hover text of the reputation of the team picked, other than the senior one. */
    teamReputationTitle: "Reputação desta seleção, de 0 a 10.000",
    /** Over the squad; `team` is the name of the team picked and `count` how many players it lists. */
    squadHeading: (team: string, count: number) => `${team}: ${format(count)} ${count === 1 ? "jogador" : "jogadores"}`,
    /** The name of the squad table for assistive technology; `team` is the name of the team picked. */
    squadLabel: (team: string) => `Jogadores da seleção: ${team}`,
    squadNote: "Os jogadores que o jogo lista para esta seleção, na ordem dele. Convocações, capitães e o contrato do técnico não são editados aqui.",
    /** What the profile shows of the nation and its federation, read from the game; the staff's heading has how many there are. */
    details: {
      nation: "País",
      founded: "Federação fundada em",
      continent: "Continente",
      staff: (count: number) => `Funcionários da federação (${format(count)})`,
      noStaff: "Nenhum funcionário da federação encontrado.",
      job: "Função na seleção",
      team: "Seleção",
      staffNote: "Lido do jogo; não é editado aqui. A função é a que cada um tem na federação, não em um clube.",
    },
    /** Beside Heal all, Inspire all and Refresh all, which the senior team has: whom they cover, and where undoing is. */
    actionsHint: "As ações valem para todos os jogadores que a seleção principal lista. Também dá para desfazer na tela Alterações.",
    /** For a nation the game keeps no team for. */
    noTeams: "O jogo não guarda seleções para este país, então não há elenco nem reputação para mostrar.",
    reading: "Lendo o elenco…",
    noPlayers: "O jogo não lista jogadores para esta seleção.",
    /** Where the tab cannot show national teams: why, for a version of the game the editor has not been checked with. */
    unavailableTitle: "As seleções não estão disponíveis nesta versão do jogo",
    unavailableBuild: "Ninguém descobriu ainda onde esta versão do jogo guarda as seleções, então o editor não mostra nenhuma para não ler a memória errada.",
    unavailableUnreadable: "O editor procurou as seleções onde espera encontrá-las nesta versão do jogo, mas o que achou não parece ser do jogo, então não mostra nenhuma.",
  },

  /**
   * The Prize money tab: the competitions whose stages pay prize money, what each pays by final position and per match.
   * It only reads; the amounts are kept in pounds and shown in the chosen currency.
   */
  leaguePrizes: {
    /** The heading of the group in a club's Overview, under its finances. */
    title: "Premiação da liga",
    /** Under the heading: the league and its nation. */
    league: (league: string) => `O que ${league} paga nesta temporada`,
    /** While the amounts are read: the editor reads all of the game's memory once. */
    reading: "Lendo a premiação da liga no jogo… Na primeira vez isso pode levar meio minuto ou mais.",
    readAgain: "Ler de novo",
    readAgainTitle: "Lê os valores do jogo de novo: uma fase que começou depois também pode pagar",
    /** When the club's league pays nothing the editor reads. */
    paysNothing: "A liga do clube não paga premiação por posição final nem por jogo nesta temporada.",
    /** The heading of one stage of the league. */
    stageStarted: "Fase em andamento",
    stageFuture: "Fase ainda não iniciada",
    /** Under a stage's heading, when several of its groups (or stages) pay the same. */
    alike: (count: number) => `Os mesmos valores em ${format(count)} grupos ou fases`,
    byPosition: "Por posição final",
    /** A row of the list by position. */
    place: (place: number) => `${format(place)}.`,
    perMatch: "Por jogo",
    win: "Por vitória",
    draw: "Por empate",
    loss: "Por derrota",
    noList: "Nada por posição final.",
    noPerMatch: "Nada por jogo.",
    /** Under the amounts. */
    note: "O que as fases eliminatórias pagam, como o campeão e o vice de uma final, e a taxa de participação de uma competição ainda não são lidos.",
    /** Where the app cannot show prize money: why. */
    unavailableBuild: "Ninguém verificou ainda onde esta versão do jogo guarda a premiação, então o editor não mostra nenhuma para não ler a memória errada.",
    unavailableUnreadable: "O editor procurou a premiação onde espera encontrá-la nesta versão do jogo, mas o que achou não parece ser do jogo, então não mostra nenhuma.",
    /** The button that turns a stage's amounts into inputs. */
    edit: "Alterar valores",
    editTitle: "Altera o que esta fase da liga paga, para todos os clubes dela",
    save: "Salvar valores",
    saving: "Salvando…",
    cancel: "Cancelar",
    /** Under the inputs, and in the (i) beside the button. */
    everyClub: (league: string) =>
      `Isto muda o que ${league} paga a todos os clubes dela, e não só a este. O jogo guarda isso no save, mas só nesta temporada: na próxima, ele define os valores dele de novo. Desfazer em Alterações devolve os valores antigos.`,
    infoLabel: "Por quanto tempo uma mudança na premiação dura",
    /** Under an input that does not hold an amount the editor writes. */
    invalid: (most: string) => `Digite um valor inteiro de 0 a ${most}.`,
    /** Under the inputs, when every amount of the stage would be nothing. */
    allNothing: "Uma fase que não paga nada deixa de ser listada: mantenha pelo menos um valor acima de zero.",
    /** What the Changes view calls a change of the amount for a final position. */
    placeField: (place: number) => `Premiação da liga para a ${format(place)}ª posição`,
    /** In the Changes view, under a change of the prize money: the league, and how many of its groups it changed. */
    changedIn: (league: string, groups: number) =>
      groups > 1 ? `Para todos os clubes de ${league}, em ${format(groups)} grupos` : `Para todos os clubes de ${league}`,
  },

  /**
   * A club's sponsorship deals, in its finances: each deal by the name the game's Sponsorship screen gives its kind, what
   * it pays per season and in all, its term and the change a relegation (or a promotion) brings. It only reads; the
   * amounts are kept in pounds and shown in the chosen currency.
   */
  sponsorships: {
    /** The heading of the group in a club's Overview, under its finances. */
    title: "Contratos de patrocínio",
    reading: "Lendo os contratos de patrocínio do clube…",
    /** When the club holds no deal. */
    none: "O clube não tem contratos de patrocínio.",
    perSeason: "Por temporada",
    total: "Valor total",
    term: "Duração",
    /** The length of a deal, as the game's screen counts it. */
    years: (count: number) => (count === 1 ? "1 ano" : `${format(count)} anos`),
    /** The name of a kind the game's screen is not known to name here. */
    unnamed: (kind: number) => `Tipo ${format(kind)}`,
    unnamedTitle: "Este tipo de contrato ainda não foi associado a um nome na tela do jogo",
    /** A badge on a deal that ended before the game's date. */
    ended: "Encerrado",
    endedTitle: "Encerrado antes da data do jogo: a tela de Patrocínio do jogo não o lista mais",
    /** What a deal's percentage does: on relegation, and for a kit manufacturer on promotion. */
    falls: (percent: number) => `Cai ${format(percent)}% em caso de rebaixamento`,
    rises: (percent: number) => `Sobe ${format(percent)}% em caso de acesso à primeira divisão`,
    /** Under the deals. */
    note: "Somente leitura. Estes são os valores que o jogo guarda para cada contrato. A tela de Patrocínio dele lista os contratos que não terminaram.",
    /** Where the app cannot show the deals: why. */
    unavailableBuild: "Ninguém verificou ainda onde esta versão do jogo guarda os contratos de patrocínio, então o editor não mostra nenhum para não ler a memória errada.",
    unavailableUnreadable: "O editor procurou os contratos de patrocínio onde espera encontrá-los nesta versão do jogo, mas o que achou não parece ser do jogo, então não mostra nenhum.",
  },

  /**
   * The Competitions tab: the competitions that have squad rules, and beside the list the rules of the one picked, this
   * season's and next season's in an area each: how many players of a kind a squad may register or a team may pick.
   * While the game can be written to, the counts can be changed.
   */
  competitions: {
    /** The tab in the masthead, and the palette's command to go there. */
    nav: "Competições",
    search: "Buscar competições por nome, país ou UID",
    summary: (total: number, shown: number) =>
      total > shown ? `${format(shown)} de ${format(total)} competições` : `${format(total)} competições`,
    /** The message under an empty table; `filtered` is whether a nation is picked. */
    empty: (query: string, filtered: boolean) => {
      if (query === "") {
        return filtered ? "Nenhuma competição deste país tem regras de elenco." : "Nenhuma competição com regras de elenco encontrada.";
      }
      return filtered ? `Nenhuma competição corresponde a “${query}” neste país.` : `Nenhuma competição corresponde a “${query}”.`;
    },
    /** While the rules are read: the editor reads all of the game's memory once. */
    reading: "Lendo as regras de elenco das competições no jogo… Isso leva alguns segundos.",
    readAgain: "Ler de novo",
    readAgainTitle: "Lê as regras do jogo de novo",
    /** Under the list. */
    listNote: "Competições sem regras de elenco não são listadas.",
    /** Where the app cannot show the rules: the heading, and why. */
    unavailableTitle: "Sem regras de elenco para mostrar",
    unavailableBuild: "Ninguém verificou ainda onde esta versão do jogo guarda as regras de elenco das competições, então o editor não mostra nenhuma para não ler a memória errada.",
    unavailableUnreadable: "O editor procurou as regras de elenco onde espera encontrá-las nesta versão do jogo, mas o que achou não parece ser do jogo, então não mostra nenhuma.",
    columns: {
      name: "Competição",
      nation: "País",
      level: "Nível",
      rules: "Regras",
      uid: "UID",
    },
    /** In the Level column: the top division is level 1. */
    level: (level: number) => format(level),
    /** In the Rules column: how many rules this season, and next season when its list differs in length. */
    rulesCount: (current: number, next: number | null) =>
      next === null || next === current ? format(current) : `${format(current)} · ${format(next)}`,
    rulesCountTitle: "Regras de elenco desta temporada e, onde há outra quantidade, da próxima",
    /** In the place of a nation, for a continent's competition, and in the filter. */
    international: "Internacional",
    filters: {
      nation: "País",
      allNations: "Todos os países",
    },
    /** The heading of the panel's body, and the line under it. */
    title: "Regras de elenco",
    intro: "Quantos jogadores de um tipo um elenco pode inscrever, ou um time pode escalar numa partida, nesta competição. Quem conta como estrangeiro ou formado no clube é definido pelo próprio jogo.",
    /** The headings of the two areas, and beside each the year the season begins in. */
    seasons: { current: "Esta temporada", next: "Próxima temporada" },
    began: (year: number) => `começou em ${year}`,
    begins: (year: number) => `começa em ${year}`,
    /** In an area with no rules, and in next season's when the game holds no list for it. */
    noRules: "Sem regras de elenco.",
    noNext: "O jogo não tem regras para a próxima temporada.",
    ruleColumns: {
      rule: "Regra",
      where: "Contado em",
      limit: "Limite",
      value: "Jogadores",
    },
    atMost: "No máximo",
    atLeast: "No mínimo",
    /** Where a rule counts players. */
    scopes: {
      squad: "Elenco",
      matchSquad: "Relacionados",
      eleven: "Onze",
      startingEleven: "Time titular",
      bench: "Banco",
    },
    /** Whom a rule counts, by the game's key for its kind; the ages a kind names are given. */
    who: {
      squadSize: "Jogadores no elenco",
      foreign: "Jogadores estrangeiros",
      foreignExceptAsian: "Jogadores estrangeiros, exceto asiáticos",
      foreignGoalkeepers: "Goleiros estrangeiros",
      nonEu: "Jogadores de fora da UE",
      domestic: "Jogadores nacionais",
      domesticGoalkeepers: "Goleiros nacionais",
      goalkeepers: "Goleiros",
      outfield: "Jogadores de linha",
      nonHomegrown: "Jogadores que não são formados no clube",
      youthContract: "Jogadores com contrato de base",
      fullTime: "Jogadores com contrato de tempo integral",
      amateur: "Jogadores amadores",
      youthOrAmateur: "Jogadores da base ou amadores",
      trialists: "Jogadores em teste",
      loans: "Jogadores emprestados",
      internationals: "Jogadores de seleção",
      otherTeam: "Jogadores inscritos em outro time",
      firstTeam: "Jogadores inscritos no time principal",
      over: (age: number) => `Jogadores com mais de ${format(age)} anos`,
      under: (age: number) => `Jogadores com menos de ${format(age)} anos`,
      domesticUnder: (age: number) => `Jogadores nacionais com menos de ${format(age)} anos`,
      foreignOver: (age: number) => `Jogadores estrangeiros com mais de ${format(age)} anos`,
      goalkeepersOver: (age: number) => `Goleiros com mais de ${format(age)} anos`,
      outfieldOver: (age: number) => `Jogadores de linha com mais de ${format(age)} anos`,
      /** Trained at the club, in the nation, or at either, between two ages. */
      homegrown: (from: "club" | "nation" | "clubOrNation", fromAge: number, toAge: number) => {
        const ages = `formados entre ${format(fromAge)} e ${format(toAge)} anos`;
        if (from === "club") {
          return `Formado no clube (${ages})`;
        }
        return from === "nation" ? `Formado no país (${ages})` : `Formado no clube ou no país (${ages})`;
      },
      /** The same in the nation, for players under an age. */
      homegrownUnder: (age: number, fromAge: number, toAge: number) =>
        `Sub-${format(age)} formados no país (formados entre ${format(fromAge)} e ${format(toAge)} anos)`,
    },
    /** A rule of a kind the game gives no name. */
    unnamedKind: (kind: number) => `Regra do tipo ${format(kind)}`,
    /** The hover text of a rule's name: the game's own key for the kind. */
    gameKey: (key: string) => `Nome desta regra no jogo: ${key}`,
    /** The small tag under a rule that holds for some teams, or under a condition of the game's. */
    teamsFrom: (competition: string) => `Times de ${competition}`,
    teamsFromUnknown: "Times de outra divisão",
    condition: (code: string) => `Condicional (${code})`,
    conditionTitle: "O jogo aplica esta regra sob uma condição própria, que o editor ainda não explica.",
    /** The years the nation's rules give a rule, where they give any. */
    years: (from: number | null, to: number | null) => {
      if (from !== null && to !== null) {
        return from === to ? `${from}` : `${from}–${to}`;
      }
      return from !== null ? `a partir de ${from}` : `até ${to}`;
    },
    yearsTitle: "As temporadas para as quais as regras do país dão esta regra, pelo ano em que a temporada começa",
    /** In the place of an input, for a rule the editor leaves alone, and why. */
    leftAlone: "Mantido",
    notSavedTitle:
      "O save não guarda essa regra, então uma mudança sumiria ao carregá-lo: o editor a mantém como está",
    notACountTitle: "Um valor em dinheiro, não uma contagem de jogadores: o editor o mantém como está.",
    /** Over the areas, when the editor changes none of the competition's rules: why, and that no date changes it. */
    noneChangeable: "Estas regras ainda não podem ser alteradas, em nenhuma data: o editor só muda uma regra onde a encontra nas regras que o save guarda, para que a mudança continue lá quando o save for carregado, e ele não achou as desta competição. Por enquanto isso vale para as ligas femininas, a Major League Soccer e algumas copas.",
    /**
     * In the place of `lasts`, for a competition whose rules the game keeps in no record (UEFA's Champions League): the
     * editor holds a change of them. The small tag under a rule it holds, and the tag's hover text with the game's own
     * count.
     */
    unsavedNote: "O jogo não guarda as regras desta competição em nenhum save: ele as monta sozinho a cada vez que carrega um e de novo a cada nova temporada. Por isso o editor retém a mudança aqui: grava no jogo em execução, lembra dela nesta carreira e grava de novo sempre que conecta ou lê os dados outra vez. Depois de carregar um save, conecte o editor (ou clique em Recarregar dados) uma vez para a mudança voltar. Desfazer em Alterações a solta.",
    heldTag: "Retido",
    heldTitle: (original: number) =>
      `O editor retém esta contagem e a grava de novo quando lê o jogo; a do próprio jogo é ${format(original)}`,
    /** Under a rule whose count in the save's rules is another than the list's. */
    savedDiffers: (value: number) => `As regras do save indicam ${format(value)}`,
    savedDiffersTitle:
      "O jogo joga pela lista e a monta a partir das regras do save ao carregar; uma mudança aqui altera as duas",
    /** The button that turns the counts into inputs, and the ones under them. */
    edit: "Alterar regras",
    editTitle: "Altera as contagens das regras de elenco desta competição",
    save: "Salvar regras",
    saving: "Salvando…",
    cancel: "Cancelar",
    /** Under an input that does not hold a count the editor writes. */
    invalid: (most: number) => `Digite um número inteiro de 0 a ${format(most)}.`,
    /** Over the areas, when other competitions are played under the same lists: their names. */
    shared: (names: string) => `Estas regras também são as de ${names}: uma mudança vale para elas também.`,
    /**
     * Under each area: how long a change of it holds, and when the game shows it. `turn` is the day the nation's seasons
     * turn on ("20 June") where its rules give one. Seen over a turn of the season: this season's change is gone with
     * it, next season's becomes this season's and stays, unless the nation has another rule (the Süper Lig's on
     * foreign players over 24 from 2028) or another file of rules (England's from 2028) for a later season.
     */
    currentNote: (turn: string | null) =>
      `Uma mudança aqui vale pelo resto desta temporada${turn === null ? "" : `, que vira em ${turn}`}. O jogo passa a contar os elencos por ela na hora; as telas dele a mostram depois que um dia passar.`,
    nextNote: (turn: string | null) =>
      `Uma mudança aqui vira a regra desta temporada quando a temporada vira${turn === null ? "" : ` em ${turn}`}, e vale para as seguintes, a menos que o jogo tenha regras próprias para uma posterior. A página Próxima Temporada do jogo a mostra na hora.`,
    /** Under the areas, and in the (i) beside the button. */
    lasts: "Uma mudança é gravada na lista pela qual o jogo joga e nas regras do país que o save guarda, então volta quando o save é carregado. Uma mudança na regra desta temporada termina quando a temporada vira: as regras da próxima ocupam o lugar. Desfazer em Alterações devolve a contagem antiga.",
    infoLabel: "Por quanto tempo uma mudança em uma regra de elenco dura",
    /** What the Changes view calls a change of a rule: the season, and the rule. */
    ruleField: (season: string, rule: string) => `Regra de elenco, ${season.toLowerCase()}: ${rule}`,
    /** In the Changes view, under a change of a rule: how many other competitions it is for too. */
    alsoFor: (count: number) =>
      count === 1 ? "Vale também para outra competição com as mesmas regras" : `Vale também para outras ${format(count)} competições com as mesmas regras`,
  },

  /** The app around the lists: the sidebar, the status line and the connect panel. */
  app: {
    /** The small line under the name in the sidebar. */
    stage: "beta",
    /** The settings menu at the right of the masthead: its name, and the headings of its two lists. */
    settingsLabel: "Configurações",
    languageLabel: "Idioma",
    currencyLabel: "Moeda",

    // The note at the foot of the sidebar; which one shows depends on the connection (see `ConnectionInfo.editable`).
    /** Connected, and the game was opened for writing. */
    noteEditable: "As edições só chegam ao jogo quando você as aplica. Faça backup do seu save antes.",
    /** Connected, but Windows did not allow writing. */
    noteReadOnly: "Somente leitura: o Windows não permitiu que o FMLibreEditor gravasse no jogo.",
    /** Read-only because the game is a version FMLibreEditor was not checked with (see `compatibility`). */
    noteUnknownBuild: "Somente leitura: esta versão do jogo é nova para o FMLibreEditor.",
    noteNotConnected: "Nada muda no jogo até você editar e aplicar.",

    // The status line and the busy texts beside it
    notConnected: "Desconectado",
    /** Beside the status line in a plain browser, where fixtures stand in for the game. */
    previewTag: "prévia no navegador · dados de exemplo",
    /** In place of the game's date when it could not be read, and the note it shows on hover. */
    noDate: "Sem data no jogo",
    noDateTitle:
      "Não foi possível ler a data do jogo: as idades não são mostradas e os filtros de idade não encontram ninguém. Verifique se há atualizações.",
    /** The button that reads the game again, once connected. */
    reload: "Recarregar dados",
    /** The button that looks for the game again, while not connected. */
    refresh: "Atualizar",
    detecting: "Procurando o Football Manager…",
    connecting: "Lendo jogadores, funcionários e clubes…",
    reloading: "Recarregando jogadores, funcionários e clubes…",

    /**
     * The notice under the masthead once the game has loaded a save, or gone back to its main menu, since the data was
     * read (`SaveChangedNotice`), beside a Reload data button.
     */
    saveChanged: {
      title: "O save do jogo mudou",
      text:
        "O jogo carregou um save, ou voltou ao menu principal, desde que o FMLibreEditor o leu. Até você recarregar os " +
        "dados, ele não altera nada no jogo e não mantém nada congelado: o que ele mostra pode ser de outro save.",
    },

    /** The notice after connecting to a save in which something was frozen before (`FrozenNotice`). */
    refrozen: {
      title: "Congelado de novo, como da última vez",
      /** When nothing could be frozen again. */
      waitingTitle: "O que estava congelado fica em espera por ora",
      /** `names` are the players' names, set apart by commas. */
      players: (names: string) => `Atributos: ${names}`,
      staff: (names: string) => `Atributos de funcionários: ${names}`,
      clubs: (names: string) => `Dinheiro: ${names}`,
      fitness: (names: string) => `Energia e ritmo de jogo: ${names}`,
      positions: (names: string) => `Posições: ${names}`,
      /** `names` are the stadiums' new names, given again. */
      stadiums: (names: string) => `Nomes de estádios: ${names}`,
      /** After the first few names. */
      more: (count: number) => `e mais ${format(count)}`,
      /** What was left for later: an update of the game, say. */
      waiting: (count: number) =>
        `${count === 1 ? "1 está lembrado" : `${format(count)} estão lembrados`}, mas não congelado(s) agora: o FMLibreEditor ainda não consegue gravar ` +
        "nesta versão do jogo.",
      dismiss: "Fechar",
    },

    /** The (i) beside every box that freezes something: how freezing works, and that the app has to stay open. */
    freezeInfo: {
      label: "Como funciona o congelamento?",
      note:
        "Congelar não muda o jogo para sempre: a cada 2 segundos, o FMLibreEditor recoloca o que o jogo tirou. Por isso " +
        "só funciona enquanto o app está aberto e conectado; feche-o e o jogo volta a alterar esses valores. O app lembra " +
        "o que está congelado neste save e congela de novo na próxima vez que se conectar a ele.",
    },

    /** The panel shown while not connected. */
    connect: {
      title: "Conectar ao Football Manager 27",
      intro: "O FMLibreEditor lê a memória do jogo enquanto ele roda. Abra o jogo e carregue um save; depois conecte.",
      notRunning: "O Football Manager 27 não está em execução.",
      /** `error` is the answer of the Rust side, which stays in English. */
      openFailed: (error: string) => `Não foi possível abrir o jogo: ${error}`,
      game: "Jogo",
      gameData: "Dados do jogo",
      loaded: "Carregados",
      stillLoading: "Ainda carregando; espere o menu principal",
      process: "Processo",
      pid: (pid: number) => `pid ${pid}`,
      several: "Há várias cópias do jogo em execução; a primeira é usada.",
      button: "Conectar e ler jogadores, funcionários e clubes",

      /** macOS: the bridge FM27 has to load before the app can reach it, and setting it up. */
      bridge: {
        title: "A ponte (macOS)",
        intro:
          "O macOS não deixa nenhum app entrar na memória de outro, então o FM27 precisa entregar a própria memória. Ele faz isso quando " +
          "carrega a ponte do FMLibreEditor: uma pequena biblioteca que não intercepta nem altera nada no jogo e entrega a memória " +
          "somente a este app. Uma opção de inicialização na Steam faz o FM27 carregá-la.",
        library: "Ponte",
        installed: "Instalada",
        missing: "Não instalada",
        launchOption: "Opção de inicialização",
        set: "Definida na Steam",
        notSet: "Não definida",
        ready: "Configurada. Inicie o FM27 pela Steam (feche e abra de novo se estiver em execução), carregue um save e conecte.",
        steamRunning:
          "A Steam está aberta e mantém as opções de inicialização enquanto isso. Feche a Steam para que a opção seja definida " +
          "para você, ou digite-a você mesmo na Steam.",
        setUp: "Configurar a ponte",
        remove: "Remover a ponte",
        manual: "Ou, na Steam, clique com o botão direito em Football Manager 27 › Propriedades › Geral › Opções de Inicialização e digite:",
        copy: "Copiar",
        copied: "Copiado",
      },
    },
  },

  /** The graphics packs the pictures (club logos, faces, flags) come from: their status at the foot of the sidebar. */
  graphics: {
    /** While the app is still reading the packs, which takes a moment after it starts. */
    reading: "Lendo pacotes gráficos…",
    /** What the packs hold: "Graphics: 68,131 club logos · 250 flags · 0 faces". */
    summary: ({ clubLogos, flags, faces }: Pick<GraphicsCounts, "clubLogos" | "flags" | "faces">) =>
      `Gráficos: ${format(clubLogos)} ${clubLogos === 1 ? "escudo" : "escudos"} · ` +
      `${format(flags)} ${flags === 1 ? "bandeira" : "bandeiras"} · ${format(faces)} ${faces === 1 ? "rosto" : "rostos"}`,
    /** When the app found no pack, and under it where packs go. The folder itself is the hover text of both lines. */
    none: "Nenhum pacote gráfico encontrado",
    noneHint: "Pacotes de escudos e rostos vão na pasta de gráficos do FM27.",
  },

  /**
   * The notice under the masthead when the game is a version FMLibreEditor has no profile for, or some of the checks
   * it makes before writing did not pass (`CompatibilityNotice`).
   */
  compatibility: {
    /** The headline for a version without a profile; `game` as the status line names it. */
    unknownBuild: (game: string) => `O FMLibreEditor ainda não foi verificado com ${game}`,
    unknownBuildText:
      "O jogo provavelmente foi atualizado. O FMLibreEditor encontrou os dados do jogo e os conferiu, mas não " +
      "grava em uma versão com a qual não foi testado até você permitir. Uma nova versão do FMLibreEditor costuma sair em poucos dias.",
    /** The headline when checks did not pass on a version the editor knows or may edit, and what may help. */
    failedTitle: "Alguns dados do jogo não conferiram",
    reloadHint: "Se um save ainda estava carregando, Recarregar dados confere de novo.",
    /** The in-game date did not check out: shown apart, as it leaves nothing read-only. */
    noDate: "A data do jogo não conferiu, então nenhuma idade é mostrada.",
    /** The other checks that did not pass, joined (see `join`), each as `failedCheck` words it. */
    failed: (names: string) => `Mantido somente leitura: ${names}.`,
    /** A check that did not pass: its name (see `checks`), and how many of the people or clubs it sampled fit. */
    failedCheck: (name: string, fit: number, sampled: number) => `${name} (${format(fit)} de ${format(sampled)} conferem)`,
    /** Joins the names of the checks that did not pass. */
    join: (names: string[]) =>
      names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`,
    allow: "Editar mesmo assim",
    allowTitle: "Liga a edição até o app ser fechado ou conectar de novo. Faça backup do seu save antes.",
  },

  /**
   * Copy diagnostics, at the foot of the window and in the notice under the masthead: copies a report of what the app
   * found in the game, in English whatever the language, to paste into a bug report (`CopyDiagnostics`).
   */
  diagnostics: {
    copy: "Copiar diagnóstico",
    copyTitle: "Copia o que o app encontrou no jogo, para um relato de erro; não contém nomes nem caminhos",
    /** Said by the button for a moment once the report is on the clipboard. */
    copied: "Copiado",
    failed: (reason: string) => `Não foi possível copiar o diagnóstico: ${reason}`,
  },

  /** What each check is about (`CheckKey`), as the notice lists the ones that did not pass and the errors name them. */
  checks: {
    gameDate: "a data do jogo",
    players: "dados dos jogadores",
    positions: "posições",
    attributes: "atributos",
    personality: "personalidade",
    liveValues: "energia, ritmo de jogo, cansaço acumulado e moral",
    contracts: "contratos",
    teams: "times",
    staff: "funcionários",
    clubs: "clubes",
    cohesion: "entrosamento com os clubes",
    tactics: "familiaridade tática",
  } satisfies Record<CheckKey, string>,

  /** New versions: the notice under the masthead, and the version and Check for updates at the foot of the window. */
  update: {
    /** The notice's headline, and what a check by hand found. */
    available: (version: string) => `O FMLibreEditor ${version} está disponível`,
    youHave: (version: string) => `Você está com a ${version}.`,
    /** Opens the release's page in the browser. */
    download: "Baixar",
    /** Downloads the new version's installer and runs it, where the app can update itself (see `can_self_update`). */
    install: "Atualizar",
    installTitle: "Baixa e instala a nova versão; o app fecha e abre de novo com ela",
    preparing: "Preparando…",
    /** `percent` is null while the size of the download is not known. */
    downloading: (percent: number | null) => (percent === null ? "Baixando…" : `Baixando… ${percent}%`),
    installing: "Instalando: o FMLibreEditor fecha e abre de novo com a nova versão.",
    installFailed: (reason: string) => `Não foi possível atualizar: ${reason}. Baixe-a na página dela.`,
    notInstallable: "Esta versão não pode ser instalada daqui. Baixe-a na página dela.",
    /** Hides the notice until the app starts again. */
    later: "Depois",
    check: "Verificar atualizações",
    checking: "Verificando atualizações…",
    upToDate: "Você está com a versão mais recente.",
    failed: "Não foi possível verificar atualizações.",
  },

  /** Once, after a few starts: the note in the top right corner that asks for a star on GitHub (see `StarRequest`). */
  star: {
    title: "Gostando do FMLibreEditor?",
    text: "Uma estrela no GitHub ajuda o projeto a chegar a mais jogadores e crescer mais rápido.",
    /** Opens the project's page on GitHub, where the star is; the note does not come back. */
    star: "Dar estrela no GitHub",
    /** Puts the note away for good. */
    dismiss: "Não, obrigado",
  },

  /** Editing a person or a club: the Edit button, the inputs, and the footer under the profile. */
  edit: {
    /** A nation field's value whose name the app has not read: one no one in the lists belongs to. */
    unknownNation: "País desconhecido",
    unknownCity: "Cidade desconhecida",
    /** The button in the header of a profile that can be edited. */
    edit: "Editar",
    editTitle: "Altera os valores deste perfil no jogo",
    /** Why editing did not start: the field table or the values could not be read. */
    startFailed: (reason: string) => `Não foi possível iniciar a edição: ${reason}`,
    /** The name of a position's field, e.g. "ST rating"; `position` is its entry in `positions`. */
    positionRating: (position: string) => `Avaliação de ${position}`,
    /** Hover text of a changed input: the value it started from, as shown. */
    was: (value: string) => `era ${value}`,
    /** Hover text of an input that cannot be applied; `min` and `max` are the values it takes, as shown. */
    invalid: (min: number, max: number) => `Digite um número inteiro de ${min} a ${max}`,
    /** The same for a date input; `from` and `to` are the earliest and the latest date it takes, as dates are shown. */
    invalidDate: (from: string, to: string) => `Digite uma data de ${from} a ${to}`,
    /**
     * The same for an amount of money, in whole units of the chosen currency; `from` and `to` are the least and the
     * most it takes, as amounts are shown.
     */
    invalidMoney: (from: string, to: string) => `Digite um valor inteiro de ${from} a ${to}`,
    /** The same for a percentage, in whole percent; `from` and `to` are the least and the most it takes, as shown. */
    invalidPercentage: (from: string, to: string) => `Digite uma porcentagem inteira de ${from} a ${to}`,
    /** After the input of a percentage: the game shows energy and match sharpness as 0–100%. */
    percent: "%",
    /** The two values of a yes-or-no field, as the lists of changes and the hover text of its checkbox say them. */
    yes: "Sim",
    no: "Não",
    /**
     * What an input that may be left empty reads as then, in its hint, the hover text and the lists of changes:
     * "Squad number 20 → none". The profile itself shows a dash for it (`profile.none`).
     */
    none: "nenhum",

    // The footer
    footer: "Editando",
    changes: changeCount,
    /** After the number of changes, while some inputs hold values that cannot be applied. */
    invalidCount: (count: number) => `${count} inválido(s)`,
    /** Opens the list of the changes Apply would write. */
    review: "Revisar",
    reviewList: "Alterações a aplicar",
    /** Puts the inputs back to the values the game has. */
    discard: "Descartar",
    apply: "Aplicar",
    applying: "Aplicando…",
    /** Hover text of Apply while an input holds a value that cannot be written. */
    applyBlocked: "Corrija antes os valores inválidos",
    /** Leaves edit mode. */
    done: "Concluir",
    /** Takes the place of the buttons when leaving (Done, close, another row) would lose `count` changes. */
    confirmDiscard: (count: number) => `Descartar ${changeCount(count)}?`,
    keepEditing: "Continuar editando",

    // After Apply
    applied: (count: number) => `Aplicado: ${changeCount(count)}`,
    /** Every value asked for was the game's already. */
    nothingToChange: "Nada a alterar: o jogo já tem esses valores.",
    /** A change the game refused; `label` is the field's name (see `fieldLabel`) and `reason` the game's answer. */
    refused: (label: string, reason: string) => `${label}: ${reason}`,
    rereadFailed: (reason: string) => `Não foi possível reler os valores: ${reason}`,
    dismiss: "Fechar",
  },

  /** The Changes view: what was written to the game this session. */
  changes: {
    /** The entry in the sidebar. */
    nav: "Alterações",
    title: "Alterações",
    hint: "Mais recentes primeiro. O app guarda as alterações de cada carreira, então elas aparecem de novo após reiniciar. Uma alteração só pode ser desfeita enquanto o jogo ainda mantém o valor que ela gravou.",
    /** Under the hint, when the list holds changes from earlier sessions: how many, and how many of them the game did not hold. */
    earlierNote: (count: number, missing: number) =>
      `${changeCount(count)} de sessões anteriores` +
      (missing > 0 ? `, ${format(missing)} delas fora do jogo quando os dados foram lidos` : "") +
      ". Transferências, curas, vínculos, cláusulas e nomes entre elas ficam como histórico, sem Desfazer.",
    /** The small tag after the name of an earlier change, and its hover text. */
    earlierTag: "Anterior",
    earlierTitle: "Gravada antes da última conexão do app e mantida no histórico desta carreira",
    /** Under the status of an earlier change: whether the game held its value when the data was last read. */
    inGame: "No jogo",
    inGameTitle: "O jogo tinha este valor quando os dados foram lidos pela última vez",
    notInGame: "Fora do jogo",
    notInGameTitle:
      "Fora do jogo na última leitura dos dados: não foi salva após a alteração ou foi mudada pelo jogo depois",
    /** In the place of Undo for an earlier change that cannot be undone from here, and its hover text. */
    historyOnly: "Histórico",
    historyOnlyTitle: "Feita antes da última conexão do app: desfazê-la exigiria a memória do jogo como estava naquele momento",
    /** Under a mass edit: how many of its earlier changes the game did not hold. */
    batchNotInGame: (count: number) => `${format(count)} fora do jogo`,
    /** Empties the list and the history of the career; the question that asks first, and its two answers. */
    clearHistory: "Limpar histórico",
    clearHistoryTitle: "Esvazia esta lista e esquece o histórico desta carreira; as alterações continuam no jogo",
    confirmClear: "Limpar o histórico desta carreira? As alterações continuam no jogo, mas não poderão mais ser desfeitas por aqui.",
    keepHistory: "Manter",
    clearConfirm: "Limpar",
    /** Under the hint: a change shows in the game only after it has moved on once. */
    continueHint: "O jogo mostra uma alteração depois que avança: clique em Continuar no jogo.",
    /** Under a move to another club that was a swap: the player who went the other way. */
    swappedWith: (name: string) => `Trocado com ${name}`,
    /** Under a move that released a player of the new club to make room: that player. */
    released: (name: string) => `${name} dispensado`,
    /** Under a transfer that had a fee: the amount, written out. */
    fee: (amount: string) => `Valor: ${amount}`,
    /** Under a transfer arranged for the game to make: the day it moves him (and pays the fee). */
    arranged: (date: string) => `O jogo faz a transferência em ${date}`,
    /** Under a loan arranged for the game to make: the day it sends him there, and the loan's last day. */
    arrangedLoan: (day: string, until: string) => `O jogo faz o empréstimo em ${day}, até ${until}`,
    /** Under a recall from loan that took the loan's option to buy away, which its undo writes back. */
    optionRemoved: (amount: string) => `Opção de compra (${amount}) removida`,
    /** What a heal changed, in the place of its values: `count` is how many injuries the player had. */
    healed: (count: number) => (count === 1 ? "1 lesão curada" : `${format(count)} lesões curadas`),
    /** The same for lifting bans: `count` is how many bans the player had. */
    lifted: (count: number) => (count === 1 ? "1 suspensão cancelada" : `${format(count)} suspensões canceladas`),
    /** What keeping a player from retiring changed: the date he was to retire on, or none when only his traits changed. */
    keptPlaying: (date: string | null) => (date === null ? "Continuará jogando" : `Aposentadoria em ${date} impedida`),
    /** The line beside the title; `undone` of the `total` changes were undone. */
    count: (total: number, undone: number) => {
      const count = changeCount(total);
      return undone === 0 ? count : `${count} · ${undone} desfeita(s)`;
    },
    empty: "Nenhuma alteração ainda. Abra um jogador, um funcionário ou um clube e escolha Editar, ou use Edição em massa em uma lista.",
    columns: {
      time: "Hora",
      /** The player, member of staff or club the change was made to. */
      name: "Nome",
      field: "Campo",
      change: "Alteração",
      status: "Status",
    },
    /** The small tag after a name. */
    kinds: {
      player: "Jogador",
      staff: "Funcionário",
      club: "Clube",
      nationalTeam: "Seleção",
      competition: "Competição",
    } satisfies Record<EditEntity, string>,
    /** Hover text of a change of an attribute: the values as stored; `change` is from `valueChange`. */
    stored: (change: string) => `armazenado ${change}`,
    undone: (time: string) => `Desfeita às ${time}`,
    undo: "Desfazer",
    /** Hover text of Undo; `label` is the field's name. */
    undoTitle: (label: string) => `Grava de volta no jogo o valor antigo de ${label}`,
    /** The small tag after the fields a mass edit changed: a mass edit is one row of the list. */
    batch: "Edição em massa",
    /** Under those fields: how many changes the mass edit made, and how many of them are not undone. */
    batchCount: (total: number, remaining: number) =>
      remaining === 0
        ? `${changeCount(total)} · todas desfeitas`
        : `${changeCount(total)} · ${format(remaining)} não desfeitas`,
    /** Opens the list of the changes of a mass edit under its row, and closes it again. */
    showChanges: "Mostrar alterações",
    hideChanges: "Ocultar alterações",
    /** Undoes the whole mass edit. */
    undoBatch: "Desfazer edição em massa",
    /** Hover text of Undo mass edit; `remaining` is how many of its changes are not undone yet. */
    undoBatchTitle: (remaining: number) =>
      `Grava de volta no jogo os valores antigos desta edição em massa (${format(remaining)} ainda em vigor)`,

    // Pages: the list, and the changes of a mass edit that is open, are shown a page at a time.
    /** The names of the two groups of buttons for assistive technology. */
    pages: "Páginas da lista",
    batchPages: "Páginas das alterações desta edição em massa",
    previous: "Anterior",
    next: "Próxima",
    /** Between the buttons: the rows on show and how many there are, e.g. "101–200 of 450". */
    range: (first: number, last: number, total: number) => `${format(first)}–${format(last)} de ${format(total)}`,

    // Search and filters
    /** The search box: what it looks through. Its name for assistive technology is the same. */
    searchPlaceholder: "Buscar alterações por nome, UID, campo ou clube",
    /** The name of the three buttons that choose which sessions' changes are listed, for assistive technology. */
    sessionGroup: "Sessão",
    sessions: { all: "Todas", this: "Esta sessão", earlier: "Sessões anteriores" } satisfies Record<SessionChoice, string>,
    /** The check boxes: only changes still in place, and only earlier ones the game did not hold; their hover text. */
    notUndone: "Não desfeitas",
    notUndoneTitle: "Só as alterações que ainda estão em vigor",
    notInGameFilterTitle: "Só as alterações anteriores que o jogo não tinha na última leitura dos dados",
    /** Takes the search text and every choice away. */
    clearFilter: "Limpar filtro",
    /** The line beside the title while a search or a filter is on: `matching` of the `total` changes, `undone` of those undone. */
    filteredCount: (matching: number, total: number, undone: number) => {
      const count = `${format(matching)} de ${changeCount(total)}`;
      return undone === 0 ? count : `${count} · ${format(undone)} desfeita(s)`;
    },
    /** Under a mass edit while a search or a filter is on: how many of its changes they leave. */
    batchMatching: (matching: number, total: number) => `${format(matching)} de ${format(total)} correspondem`,
    /** In the place of the list when the search and the filters leave no change. */
    noMatches: "Nenhuma alteração corresponde à busca e aos filtros.",
  },

  /** Exporting players or clubs to a file: the button in the toolbar of the player and club lists and its dialog. */
  export: {
    button: "Exportar",
    buttonTitle: {
      player: "Grava os jogadores exibidos na lista em um arquivo CSV ou JSON",
      staff: "Grava os funcionários exibidos na lista em um arquivo CSV ou JSON",
      club: "Grava os clubes exibidos na lista em um arquivo CSV ou JSON",
    } satisfies Record<ExportEntity, string>,
    title: { player: "Exportar jogadores", staff: "Exportar funcionários", club: "Exportar clubes" } satisfies Record<
      ExportEntity,
      string
    >,
    /** What the export covers: everything the list's search and filters select, in its order. */
    scope: (entity: ExportEntity, count: number) =>
      count === 0
        ? `Nenhum ${({ player: "jogador", staff: "funcionário", club: "clube" } as const)[entity]} corresponde à busca e aos filtros.`
        : `${entityCount[entity](count)}: o que a busca e os filtros da lista selecionam, na ordem dela.`,
    formatLabel: "Formato",
    formats: {
      csv: "CSV, separado por vírgulas",
      csvSemicolon: "CSV, separado por ponto e vírgula",
      json: "JSON",
    } satisfies Record<ExportFormat, string>,
    formatHints: {
      csv: "Para a maioria das planilhas e scripts",
      csvSemicolon: "Para o Excel em que os decimais são escritos com vírgula, como em português, espanhol ou alemão",
      json: {
        player: "Para scripts: posições, atributos e personalidade como objetos próprios",
        staff: "Para scripts: atributos, personalidade e contrato como objetos próprios",
        club: "Para scripts: torcida, instalações, estádio e finanças como objetos próprios",
      } satisfies Record<ExportEntity, string>,
    },
    contents: {
      player:
        "Habilidades, posições e avaliações de posição de cada jogador, atributos na escala de 1 a 20 (inclusive os ocultos), " +
        "personalidade, reputação, jogos pela seleção e contrato com as cláusulas, com a data do jogo. O dinheiro está em " +
        "libras, como o jogo guarda. Nada muda no jogo.",
      staff:
        "Função e empregador de cada funcionário, habilidades, atributos na escala de 1 a 20, personalidade, reputação " +
        "e contrato (salário e datas), com a data do jogo. O dinheiro está em libras, como o jogo guarda. Nada " +
        "muda no jogo.",
      club:
        "País, liga, reputação, ano de fundação, sócios-torcedores, seguidores nas redes sociais, perfil e traços da " +
        "torcida, " +
        "instalações, estádio e finanças de cada clube: saldo, orçamento de transferências, gasto semanal com salários e orçamento salarial, e preço " +
        "do ingresso, com a data do jogo. O FM guarda finanças apenas dos clubes das ligas que estão sendo jogadas. O dinheiro está em " +
        "libras, como o jogo guarda. Nada muda no jogo.",
    } satisfies Record<ExportEntity, string>,
    export: "Exportar",
    exporting: "Exportando…",
    /** After the export: what was written, and where. */
    done: (entity: ExportEntity, count: number, file: string) => `Exportado: ${entityCount[entity](count)} em ${file}`,
    folder: (folder: string) => `em ${folder}`,
    skipped: (entity: ExportEntity, count: number) => {
      const changedWord = count === 1 ? "mudou" : "mudaram";
      return (
        `${entityCount[entity](count)} ${changedWord} no jogo durante a leitura e ` +
        `${count === 1 ? "was" : "were"} left out.`
      );
    },
    open: "Abrir",
    openTitle: "Abre o arquivo no app com que o sistema o abre",
    show: "Mostrar na pasta",
    showTitle: "Mostra o arquivo na pasta dele",
    close: "Fechar",

    /** The export of the Changes view: a CSV file of the changes its search and filters show. */
    changes: {
      buttonTitle: "Grava as alterações exibidas na lista em um arquivo CSV",
      title: "Exportar alterações",
      /** What the export covers: everything the list's search and filters select, or, with none on, the whole history. */
      scope: (count: number, filtering: boolean) =>
        count === 0
          ? "Nenhuma alteração corresponde à busca e aos filtros."
          : filtering
            ? `${changeCount(count)}: o que a busca e os filtros selecionam, mais recentes primeiro.`
            : `${changeCount(count)}: todo o histórico desta carreira, mais recentes primeiro.`,
      contents:
        "Hora de cada alteração (local, com o desvio em relação ao UTC), nome e UID, o campo, os valores antigo e novo como " +
        "o jogo os guarda e como aparecem aqui, o que a lista diz sob eles, a edição em massa de que fez parte, quando " +
        "foi desfeita e se é de uma sessão anterior e está no jogo. Nada muda no jogo.",
      done: (count: number, file: string) => `Exportado: ${changeCount(count)} em ${file}`,
    },
  },

  /** Mass editing: the button in the toolbar of a list and the dialog it opens. */
  massEdit: {
    /** The button in the toolbar of the player, staff and club lists. */
    button: "Edição em massa",
    buttonTitle: "Altera valores de tudo o que a lista mostra, com uma prévia antes",
    title: {
      player: "Edição em massa de jogadores",
      staff: "Edição em massa de funcionários",
      club: "Edição em massa de clubes",
    } satisfies Record<Entity, string>,

    // What it applies to
    /** `total` is the list's: the search and the filters of the list select them. */
    scope: (entity: Entity, total: number) =>
      `${entityCount[entity](total)} exibidos agora na lista (busca e filtros)`,
    /** After the scope, when the list shows only the first `shown` rows of its `total`. */
    scopeAll: (shown: number) => `São todas as correspondências, não só as ${format(shown)} primeiras linhas na tela.`,
    scopeNone: (entity: Entity) =>
      `Não há ${entityNouns[entity]} que correspondam à busca e aos filtros, então não há nada a alterar.`,
    /** `limit` is the most one mass edit takes. */
    scopeTooMany: (entity: Entity, total: number, limit: number) =>
      `${entityCount[entity](total)} exibidos na lista são mais do que uma edição em massa aceita (${format(limit)}). ` +
      "Restrinja antes a busca ou os filtros.",
    loadingFields: "Lendo os campos…",
    fieldsFailed: (reason: string) => `Não foi possível ler os campos: ${reason}`,

    // The fields to change
    /** The groups of the field select, in the order the dialog lists them. */
    groups: {
      ability: "Habilidade",
      technical: "Atributos técnicos",
      mental: "Atributos mentais",
      physical: "Atributos físicos",
      goalkeeping: "Atributos de goleiro",
      hidden: "Atributos ocultos",
      feet: "Pés",
      coaching: "Atributos de treinamento",
      knowledge: "Atributos de conhecimento",
      medical: "Atributos médicos",
      positions: "Posições",
      personality: "Personalidade",
      reputation: "Reputação",
      international: "Seleção",
      contract: "Contrato",
      facilities: "Instalações",
      finances: "Finanças",
      stadium: "Estádio",
      traits: "Traços",
      /** A player's energy, match sharpness and morale: the Medical group of his profile. */
      health: "Médico",
      /** Whatever the other groups do not have, e.g. a player's height. */
      other: "Outros",
    },
    fieldsLabel: "Campos a alterar",
    /** The name of a row of the dialog for assistive technology; `position` counts from 1. */
    row: (position: number) => `Alteração ${position}`,
    field: "Campo",
    operation: "Operação",
    operations: { set: "Definir como", add: "Somar", scale: "Escalar para %", addYears: "Somar anos" } satisfies Record<
      MassOperationKind["op"],
      string
    >,
    /** The name of the value input, by operation. */
    values: { set: "Valor", add: "Quantia", scale: "Porcentagem", addYears: "Anos" } satisfies Record<
      MassOperationKind["op"],
      string
    >,
    /** Hover text of the amount of an Add. */
    addTitle: "Somada a cada valor como mostrado; um número negativo subtrai",
    /** The same for a percentage: the amount is in percentage points, not a percent of the value (that is Scale). */
    addPointsTitle: "Pontos percentuais somados a cada valor (70% mais 10 dá 80%); um número negativo subtrai",
    /** The hint in an empty value input: what it takes. */
    rangeHint: (min: number, max: number) => `${format(min)}–${format(max)}`,
    /** The same for an amount, which may be negative: up to `max` either way. */
    amountHint: (max: number) => `±${format(max)}`,
    /** After the input of a Scale: the number is a percent of the value the game has now. */
    ofCurrent: "% do atual",
    percentTitle: "Uma porcentagem do valor atual: 100 mantém, 110 aumenta em um décimo, 50 reduz pela metade",
    /** Hover text of the years of an Add years, and the word after its input. */
    addYearsTitle: "Anos somados a cada data; um número negativo volta a data, e 29 de fevereiro pode virar 28",
    years: "anos",
    /** Hover text of an amount that cannot be applied; `min` and `max` are what it takes. */
    invalidAdd: (min: number, max: number) => `Digite um número inteiro de ${format(min)} a ${format(max)}`,
    invalidPercent: (min: number, max: number) => `Digite uma porcentagem inteira de ${min} a ${max}`,
    invalidYears: (min: number, max: number) => `Digite um número inteiro de anos de ${format(min)} a ${format(max)}`,
    /** A date cannot be added to or scaled, only set or moved by years; and nothing else is moved by years. */
    dateSetOnly: "Uma data só pode ser definida ou movida em anos",
    yearsDateOnly: "Só uma data pode ser movida em anos",
    addField: "Adicionar um campo",
    /** Hover text of Add a field when the rows are full; `max` is how many fields one mass edit changes. */
    addFieldFull: (max: number) => `Uma edição em massa altera até ${max} campos`,
    remove: "Remover este campo",
    /** Hover text of Remove on the only row. */
    removeLast: "Uma edição em massa precisa de pelo menos um campo",

    // The preview
    preview: "Prévia",
    previewing: "Gerando prévia…",
    /** Beside Preview while it cannot be pressed. */
    previewBlocked: "Preencha todos os campos com um valor válido para ver a prévia",
    /** "312 changes for 140 of 237 players · 97 already have these values · 12 values left alone". */
    summary: (entity: Entity, preview: MassPreview) =>
      [
        preview.changes === 0
          ? "Nenhuma alteração"
          : `${changeCount(preview.changes)} para ${format(preview.targets - preview.unchanged)} de ` +
            entityCount[entity](preview.targets),
        preview.unchanged > 0 &&
          (preview.unchanged === 1
            ? "1 já tem estes valores"
            : `${format(preview.unchanged)} já têm estes valores`),
        preview.skippedCount > 0 && valuesLeftAlone(preview.skippedCount),
      ]
        .filter(Boolean)
        .join(" · "),
    tableLabel: "Alterações que a edição em massa faria",
    columns: { name: "Nome", field: "Campo", change: "Alteração", reason: "Motivo" },
    /** Under a table or a list that shows only the first rows; `count` is how many more there are. */
    more: (count: number) => `e mais ${format(count)}`,
    /** The line that opens the list of the values left alone. */
    skippedHeading: valuesLeftAlone,
    skippedLabel: "Valores que a edição em massa mantém",

    // Apply and undo
    apply: "Aplicar",
    applying: "Aplicando…",
    /** Hover text of Apply; `changes` is how many values it writes. */
    applyTitle: (changes: number) => `Grava no jogo: ${changeCount(changes)}`,
    applyFirst: "Veja antes a prévia da edição em massa",
    applyNothing: "A prévia não tem alterações a gravar",
    /** Nothing changes in the game until Apply. */
    hint: "Nada muda no jogo até você aplicar.",
    applied: (count: number) => (count === 0 ? "Nenhuma alteração foi gravada" : `Aplicado: ${changeCount(count)}`),
    /** A change the game refused: who, which field (see `fieldLabel`) and the game's answer. */
    failure: (name: string, label: string, reason: string) => `${name} · ${label}: ${reason}`,
    undo: "Desfazer esta edição em massa",
    undoing: "Desfazendo…",
    undoTitle: "Grava de volta no jogo os valores antigos desta edição em massa",
    undone: (count: number) => (count === 0 ? "Nada foi desfeito" : `Desfeito: ${changeCount(count)}`),
    /** A change an undo could not take back: `who` names the person and the field, or the change by its number. */
    undoFailure: (who: string, reason: string) => `${who}: ${reason}`,
    changeNumber: (id: number) => `Alteração ${id}`,
    close: "Fechar",
  },

  /** Comparing players: the button in a player's profile, the tray under the player list and the dialog. */
  comparison: {
    /** The button in the header of a player's profile. */
    compare: "Compare",
    /** Hover text of that button while the player is not in the comparison, and while they are. */
    add: "Add to comparison",
    remove: "Remove from comparison",
    /** Hover text of the button while the comparison is full and cannot take this player; `max` is its size. */
    full: (max: number) => `A comparison holds up to ${max} players. Remove one to add this player.`,

    // The tray under the player list
    trayLabel: "Players to compare",
    /** The name and hover text of the × on a player's chip. */
    removePlayer: (name: string) => `Remove from comparison: ${name}`,
    clear: "Clear",
    /** The button that opens the dialog; `count` is how many players are picked. */
    open: (count: number) => `Compare (${count})`,

    // The dialog
    title: "Comparison",
    /** Under the title: what the highlight in the table means. */
    hint: "The best value in each row is highlighted: the highest, or the lowest where lower is better.",
    /** What the dialog says when fewer than two players are picked. */
    tooFew: "Add at least two players to compare them.",
    loading: "Loading the players…",
    tableLabel: "Values of the compared players",
    /** Said after the highlighted value of a row, for assistive technology. */
    highest: "highest",
    lowest: "lowest",
    /** The heading of the rows with the positions, height, reputation and contract. */
    profile: "Profile",
    close: "Close",
  },

  /**
   * Moving a player to another club, or swapping him with a player of another club: the button in his profile and the
   * dialog it opens.
   */
  move: {
    /** The button in the header of a player's profile. */
    button: "Transfer",
    buttonTitle: "Transfer this player to another club in the game, for a fee if you like",

    // The dialog
    title: "Transfer",
    /** The club the player is at, and the club he moves to (or, in a swap, goes to). */
    from: "From",
    to: "To",

    // The switch at the top of the dialog: a transfer the game makes the next day, a move to a club now, or a swap with
    // one of its players.
    /** Its name for assistive technology. */
    modeLabel: "Transfer, loan, move now or swap",
    modeArrange: "Transfer",
    modeMove: "Move now",
    modeSwap: "Swap with a player",
    /** Under the switch: what each of the first two does, and why Transfer is missing where it is. */
    arrangeNote:
      "The game makes the transfer on its next day, as it makes its own: his history keeps this season's matches " +
      "with his old club, lists the new club with the fee, and the game pays the fee.",
    moveNote:
      "The editor moves him at once. The game's history does not list it: this season shows under the new club, " +
      "with no fee.",
    arrangeUnavailable:
      "This version of the game, or this system, does not let the editor arrange a transfer for the game to make: " +
      "Move now moves him at once.",

    // A transfer the game makes the next day
    /** While the plan is worked out: the first time, finding the game's transfers takes a few seconds. */
    arrangeChecking: "Checking the transfer… the first time, finding the game's transfers takes a few seconds.",
    /** The day the game makes the move, in the plan. */
    movesOn: (date: string) => `The game makes the move on ${date}`,
    /** The fee in the plan: the game pays it on the day. */
    arrangeFee: (amount: string) => `Fee ${amount}, paid by the game on the day`,
    /** The contract in the plan: the wage per week and the end date, written out. */
    arrangeContract: (wage: string, expires: string) => `Contract: ${wage} a week, until ${expires}`,
    /** What arranging the transfer does, one line each, in the place of `does`. */
    arrangeDoes: [
      "Agreed now: the game makes the move when it reaches its next day",
      "His history keeps this season's matches with his old club, and lists the new club with the fee",
      "The game pays the fee on the day, as it pays for its own transfers",
      "Contract with the new club from that day; wage and contract end change only if you set new ones",
      "Listed under Changes, where one undo takes it back until the day",
    ],
    /** The button of the foot. */
    arrangeButton: "Arrange transfer",

    // A loan the game makes the next day
    /** The choice of the switch. */
    modeLoan: "Loan",
    /** Under the switch in loan mode. */
    loanNote: "The game makes the loan on its next day, as it makes its own; he is back at his club after it.",
    /** While the loan's plan is worked out. */
    loanChecking: "Checking the loan…",
    /** The plan's lines: the day the game makes the loan, its last day, what the club pays, the monthly fee, the option. */
    loanOn: (date: string) => `The game makes the loan on ${date}`,
    loanUntil: (date: string) => `The loan lasts until ${date}`,
    loanWage: (money: string, share: number) => `The club pays ${money} a week (${format(share)}% of his wage)`,
    loanMonthlyFee: (money: string) => `Monthly fee ${money}`,
    loanOption: (money: string) => `Option to buy for ${money}`,
    /** What arranging the loan does, one line each, in the place of `does`. */
    loanDoes: [
      "Agreed now: the game makes the loan when it reaches its next day",
      "His history lists the loan, and he returns to his own club the day after the last day",
      "The club pays its share of his wage, and the monthly fee if you set one",
      "With an option, the club he joins may sign him for its fee when the loan ends",
    ],
    /** The heading of `loanDoes`. */
    loanDoesHeading: "What the loan does",
    /** The foot's hint and button in loan mode. */
    loanHint: "Nothing changes in the game until you press Arrange loan.",
    loanButton: "Arrange loan",
    /** The loan's inputs: label, and the short hint under it. */
    loanLastDay: "Last day of the loan",
    loanLastDayHint: "He is back at his own club the next day",
    loanShare: "Share of his wage paid",
    loanShareHint: "What the club he joins pays; his own club pays the rest",
    loanShareInvalid: "Enter a whole number from 0 to 100",
    loanMonthly: "Monthly fee",
    loanOptionFee: "Option to buy",
    loanOptionFeeHint: "The club he joins may sign him for this fee when the loan ends; empty for none",

    // Choosing the club
    /** The name of the search box, and of the list of clubs under it, for assistive technology. */
    searchLabel: "Search for the club to transfer to",
    resultsLabel: "Clubs found",
    searching: "Searching clubs…",
    searchFailed: (reason: string) => `Could not search the clubs: ${reason}`,
    /** Under the list when the search found more clubs than it lists; `count` is how many more. */
    more: (count: number) => `and ${format(count)} more; type to narrow the search`,
    /** Takes the place of the search once a club is picked: the button that brings it back. */
    change: "Choose another club",

    // The fee
    feeHeading: "Fee",
    fee: "Transfer fee",
    /** Under the fee input while it can be sent, and while it cannot. */
    feeHint: "Leave it empty for a free transfer",
    /** `max` is the most a fee can be, as amounts are shown. */
    feeInvalid: (max: string) => `Enter a whole amount, from 0 to ${max}`,
    /**
     * What the fee does to the clubs' money, a line each in the plan. `fee` is the amount, `balance` and `budget` a
     * change written out ("£9,492,232 → £10,726,799"); `budget` is null when the club has no transfer budget set.
     */
    pays: (club: string, fee: string, balance: string, budget: string | null) =>
      `${club} pays ${fee}: balance ${balance}${budget === null ? "" : `, transfer budget ${budget}`}`,
    receives: (club: string, fee: string, balance: string) => `${club} receives ${fee}: balance ${balance}`,
    /** For a club outside the leagues being played, which the game keeps no finances for. */
    noFinances: (club: string) => `${club} has no finances in the game: its money stays as it is`,

    // The contract
    /** Under an input that cannot be sent. */
    wageInvalid: "Enter a whole amount, 0 or more",
    expiresInvalid: "Enter a date",

    // What the dialog says about the move itself
    chooseClub: "Choose the club to transfer the player to.",
    fixTerms: "Fix the fee or the contract values first.",
    checking: "Checking the transfer…",
    /** The move can be made; `from` and `to` are the names of the clubs. */
    route: (from: string, to: string) => `${from} → ${to}`,
    doesHeading: "What the transfer does",
    /** What the game does to the player, one line each. */
    does: [
      "Joins the senior team of the new club",
      "Contract dated from the game's date; squad number cleared",
      "Comes off the transfer and loan lists",
      "Wage and contract end change only if you set new ones",
      "The fee comes out of the buying club's balance and transfer budget, and goes into the selling club's balance",
      "Any captaincy at the old club is left empty",
      "The game's transfer history does not list it yet",
      "Listed under Changes, where one undo takes back the transfer and the fee",
    ],

    // A club whose squad list is full: the box that takes the place of the refusal and offers to make room, by
    // releasing one of its players in the same transfer, or by making it a swap with that player.
    /** The first line; `club` is the club picked. */
    noRoom: (club: string) => `${club} has no room in its squad.`,
    /** The name of the (i) button after the first line, for assistive technology, and the note it shows. */
    noRoomInfoLabel: "Why?",
    noRoomInfo:
      "The editor makes a full squad list bigger where it can, but it cannot make this one bigger: a player has to " +
      "leave to make room.",
    /** The second line, which also names the choices under it; `player` is the player transferred. */
    noRoomNeed: (player: string, club: string) => `For ${player} to join, a player has to leave ${club}.`,
    /** The first choice: a player of the club picked from a list, who becomes a free agent. */
    releaseChoice: "Release:",
    releasePickLabel: "Player to release",
    releaseOutcome: "→ becomes a free agent",
    /** After a player's name in that list: what makes him a worse choice. */
    injuredTag: "injured",
    captainTag: "captain",
    /** The second choice, which turns the dialog into a swap with the player picked; `club` is the player's club. */
    swapChoice: "Make it a swap:",
    swapChoiceOutcome: (club: string) => `this player goes to ${club}`,
    /** The button of the foot while a player is released; `name` is that player. */
    moveAndRelease: (name: string) => `Transfer and release ${name}`,
    /** What a transfer that makes room does, one line each, in the place of `does`. */
    makeRoomDoes: [
      "Joins the senior team of the new club, in the place of the player released",
      "The player released leaves every team of that club, and their contract ends: a free agent",
      "Contract dated from the game's date; squad number cleared",
      "Comes off the transfer and loan lists",
      "Wage and contract end change only if you set new ones",
      "The fee comes out of the buying club's balance and transfer budget, and goes into the selling club's balance",
      "Any captaincy either of them held at the club they leave is left empty",
      "The game's transfer history does not list it yet",
      "Listed under Changes as one change, where one undo takes back the transfer, the release and the fee",
    ],

    // Swapping with a player of the club instead: the title, and the section that picks the player (the club is
    // chosen as for a move).
    swapTitle: "Swap with a player",
    /** The player who goes the other way. */
    swapWith: "Swap with",
    /** The name of the search box of the club's players, its hint, and the name of the list under it. */
    playerSearchLabel: "Search for the player to swap with",
    playerSearch: "Search this club's players by name",
    playersLabel: "Players found",
    playersSearching: "Searching players…",
    playersSearchFailed: (reason: string) => `Could not search the players: ${reason}`,
    /** Under the list when it is empty: `query` is what was typed. */
    playersEmpty: (query: string) =>
      query === "" ? "This club has no players." : `No player of this club matches “${query}”.`,
    /** Takes the place of the list once a player is picked: the button that brings it back. */
    changePlayer: "Choose another player",

    // What the dialog says about the swap
    /** A swap has no contract terms to set. */
    swapContract: "Each player keeps their own contract; wages and contract ends do not change.",
    // Moving a member of staff, who has neither a fee nor terms to set, and no swap.
    staffButtonTitle: "Move this member of staff to another club in the game",
    staffChooseClub: "Choose the club to move this member of staff to.",
    staffContract: "Keeps the job, the wage and the contract end; the contract is dated from the game's date.",
    /** The select of the job they take at the club, and its first choice for one who has no job yet. */
    staffJob: "Job",
    staffJobChoose: "Choose a job…",
    /** After the name of their own job in that select. */
    staffJobKept: (job: string) => `${job} (keeps it)`,
    /** In the place of `staffContract` when another job is chosen. */
    staffNewJob: "Takes the new job, and keeps the wage and the contract end; the contract is dated from the game's date.",
    staffDoes: [
      "Joins the new club where the job is: its medical, coaching or scouting department, or as its director of " +
        "football or manager, which a club with one already does not take",
      "Same wage and contract end; the contract is dated from the game's date",
      "A manager who leaves a team leaves its place empty, for the club to fill; the board is left to the game",
      "Listed under Changes, where it can be undone",
    ],
    // Signing a member of staff who has no club: the same dialog with a job to choose and a contract the editor makes.
    staffSignButtonTitle: "Sign this member of staff, who has no club, for a club in the game",
    staffSignTitle: "Sign a member of staff",
    staffSignChooseClub: "Choose the club to sign them for.",
    staffSignChooseJob: "Choose the job they take at the club.",
    /** Under the contract's inputs. */
    staffSignTerms:
      "Leave them empty for the wage of the club's member of staff whose job is most like theirs, and a contract to " +
      "the end of next season.",
    /** The signing can be made: `to` is the club. */
    staffSignRoute: (to: string) => `No club → ${to}`,
    /** The contract the editor makes: `wage` and `expires` written out. */
    staffSignContract: (wage: string, expires: string) => `New contract: ${wage} a week until ${expires}`,
    staffSignDoes: [
      "Joins the club where the job is: its department, made bigger when full, or as its director of football or " +
        "manager, when it has none",
      "A new contract from the game's date, in one of the game's own free contract slots, as the game makes one",
      "Modelled on the contract of the club's member of staff with the same job (else in the same department, else " +
        "any) nearest their ability",
      "Your wage and contract end, or that contract's wage and the end of next season; no clauses or bonuses",
      "Listed under Changes, where one undo takes it all back",
    ],
    swapChooseClub: "Choose the club of the player to swap with.",
    swapChoosePlayer: "Choose the player to swap with.",
    swapChecking: "Checking the swap…",
    /** The swap can be made: who goes where, a line each. `from` is the club of the player, `to` that of the other. */
    swapRoute: (player: string, from: string, to: string, other: string) =>
      `${player}: ${from} → ${to}\n${other}: ${to} → ${from}`,
    swapDoesHeading: "What the swap does",
    swapDoes: [
      "Each joins the senior team of the other's club",
      "Contracts dated from the game's date; squad numbers cleared",
      "Both come off the transfer and loan lists",
      "Any captaincy at their old clubs is left empty",
      "No fees are paid; career history is not updated",
      "Listed under Changes as one change, which undoes both moves",
    ],

    // Signing a free agent, who has no club: the same dialog with no fee and no swap, and a contract the editor makes.
    signButtonTitle: "Sign this free agent for a club in the game",
    signTitle: "Sign a free agent",
    signChooseClub: "Choose the club to sign the player for.",
    signChecking: "Checking the signing…",
    /** Under the contract's inputs. */
    signTerms:
      "Leave them empty for the wage of the club's player nearest his ability, and a contract to the end of next " +
      "season.",
    /** The signing can be made: `to` is the club. */
    signRoute: (to: string) => `Free agent → ${to}`,
    /** The contract the editor makes: `wage` and `expires` written out, `status` the squad status's name. */
    signContract: (wage: string, expires: string, status: string) =>
      `New contract: ${wage} a week until ${expires}, ${status}`,
    signDoesHeading: "What the signing does",
    signDoes: [
      "Joins the senior team of the club; a full squad list is made bigger",
      "A new contract from the game's date, in one of the game's own free contract slots, as the game makes one",
      "Modelled on the contract of the club's player nearest his ability: the same kind of contract and squad status",
      "Your wage and contract end, or that player's wage and the end of next season",
      "No squad number, loyalty bonus, clauses or bonuses",
      "The game's transfer history does not list it yet",
      "Listed under Changes, where one undo takes it all back",
    ],
    signHint: "Nothing changes in the game until you press Sign.",
    sign: "Sign",
    signing: "Signing…",

    // The foot
    /** Nothing changes in the game until Transfer, or Swap. */
    hint: "Nothing changes in the game until you press Transfer.",
    /** The same for a transfer arranged for the game, and for a player moved now. */
    arrangeHint: "Nothing changes in the game until you press Arrange transfer.",
    moveNowHint: "Nothing changes in the game until you press Move now.",
    move: "Transfer",
    moving: "Transferring…",
    cancel: "Cancel",
    swapHint: "Nothing changes in the game until you press Swap.",
    swap: "Swap",
    swapping: "Swapping…",
  },

  /**
   * A player's ties to nations and clubs: their secondary nationalities, and the nations and clubs they were trained
   * in, which decide whether they count as homegrown under a competition's rules. The group in the profile and its
   * dialog.
   */
  ties: {
    heading: "Nationality and homegrown",
    nationalities: "Secondary nationalities",
    trainedInNation: "Trained in nation",
    trainedAtClub: "Trained at club",
    /** A nation he needs no work permit in, as the game lets players of the EU who were in the UK before Brexit. */
    workPermit: "No work permit needed in",
    none: "None",
    /** The game's names of its homegrown rules, by code; `rule` names one it has no name for here. */
    rules: {
      1: "Homegrown 15-21",
      2: "Homegrown 0-21",
      5: "Homegrown 15-21 (excluding loans)",
      10: "Homegrown 0-19 (1 year)",
    } as Readonly<Record<number, string>>,
    rule: (code: number) => `Homegrown rule ${format(code)}`,

    // The button under the group, and the dialog it opens
    change: "Change",
    changeTitle: "Change this player's secondary nationalities and homegrown status in the game",
    title: "Nationality and homegrown",
    hint: "Each change is written to the game at once, and listed under Changes, where it can be undone.",
    /** When the player's list has no room for another tie. */
    full:
      "The game made this player's list just big enough for what it holds: a nationality or a training can be " +
      "changed or removed, but not added.",
    /** The control of a row, for assistive technology: `name` is the nation's or club's. */
    nationOf: (name: string) => `Nation instead of ${name}`,
    ruleOf: (name: string) => `Homegrown rule for ${name}`,
    remove: "Remove",
    removeTitle: (name: string) => `Remove ${name}`,
    /** The rows that add a tie, where the list has room. */
    addNationality: "Add a nationality…",
    addNation: "Add a nation…",
    addPermit: "Add a country with no permit needed…",
    /** After a nation he needs no work permit in. */
    daysLeft: (days: number) => `${format(days)} days left`,
    permitInfoLabel: "What does this do?",
    permitInfo:
      "The game lets players of the European Union who were in England or Scotland before Brexit play there without " +
      "a work permit, for a number of days. A player given this needs no work permit to play in that country either, " +
      "for as many days as theirs have left (ten years where no one in the save has it).",
    newRule: "Homegrown rule of the new nation",
    add: "Add",
    /** A club he was trained at: the button that points it at another club, and the search it opens. */
    changeClub: "Change club",
    changeClubTitle: (name: string) => `Make him trained at another club instead of ${name}`,
    clubInsteadOf: (name: string) => `Club instead of ${name}`,
    /** The button that adds a club he was trained at, and what it opens. */
    addClub: "Add a club…",
    addClubTitle: "Make him trained at one more club",
    newClub: "New club",
    pickAnother: "Pick another",
    newClubRule: "Homegrown rule of the new club",
    cancel: "Cancel",
    working: "Writing to the game…",
    close: "Close",
  },

  /** Changing a contract's bonuses and clauses: the button under them in the profile, and the dialog it opens. */
  clauses: {
    change: "Change",
    changeTitle: "Change this player's bonuses and clauses in the game",
    title: "Bonuses and clauses",
    hint: "Each change is written to the game at once, and listed under Changes, where it can be undone.",
    /** When the contract has no release clause and its list has no room for one. */
    full:
      "The game made this contract's list just big enough for what it holds: a bonus or clause can be changed or " +
      "removed, but a release clause cannot be added.",
    /** The inputs of a row, for assistive technology: `name` is the clause's. */
    amountOf: (name: string) => `Amount of ${name}`,
    conditionOf: (name: string) => `Condition of ${name}`,
    save: "Save",
    remove: "Remove",
    removeTitle: (name: string) => `Remove ${name}`,
    /** The row that adds a release clause, where the list has room and the contract has none. */
    addRelease: "Add a release clause",
    releaseAmount: "Amount of the new release clause",
    add: "Add",
    /** When an amount or condition typed is not a whole number in range: `max` is the most it may be. */
    /** `max` is written out already: an amount as amounts are shown, or a number. */
    outOfRange: (max: string) => `Enter a whole number from 0 to ${max}.`,
    working: "Writing to the game…",
    close: "Close",
  },

  /** Releasing a player from their club, which leaves them a free agent: the button beside Transfer and its dialog. */
  release: {
    /** The button in the header of a player's profile, beside Transfer. */
    button: "Release",
    buttonTitle: "Release this player from their club in the game: they become a free agent",

    /** The same button in a member of staff's profile: its hover text. */
    staffButtonTitle: "Release this member of staff from their club in the game: they are left without a club",

    // The dialog
    title: "Release",
    /** The club the player leaves. */
    from: "Leaves",
    checking: "Checking the release…",
    /** The player can be released; `club` is the name of their club. */
    ready: (club: string) => `${club} → free agent`,
    /** A member of staff can be released; `club` is the name of their club. */
    staffReady: (club: string) => `${club} → unemployed`,
    doesHeading: "What the release does",
    /** What the game does to the player, one line each. */
    does: [
      "Leaves every team of the club, and the contract ends: a free agent any club can sign",
      "No one is paid anything",
      "Any captaincy at the club is left empty",
      "The game's transfer history does not list it",
      "Listed under Changes, where one undo brings the player back on the same contract",
    ],
    /** What the release does to a member of staff, one line each. */
    staffDoes: [
      "Leaves the club's staff at once, and the contract ends: unemployed, as the game's own staff without a club are",
      "No one is paid anything",
      "A place as manager or director of football is left empty, for the club to fill",
      "Listed under Changes, where one undo brings them back on the same contract",
    ],

    // The foot
    /** Nothing changes in the game until Release. */
    hint: "Nothing changes in the game until you press Release.",
    release: "Release",
    releasing: "Releasing…",
    cancel: "Cancel",
  },

  /** Changing a player's names: the button beside Release and its dialog. */
  rename: {
    /** The button in the header of a player's profile, beside Release. */
    button: "Rename",
    buttonTitle: "Change this player's names in the game",

    // The dialog
    title: "Rename",
    loading: "Reading the names…",
    first: "First name",
    last: "Last name",
    common: "Common name",
    commonHint:
      "The name the game shows instead of the first and last name, as with Pedri or Vinícius Júnior. Leave it empty for none",
    full: "Full name",
    fullHint: "The name in full, as the profile gives it. Leave it empty for none",
    /** The placeholder of a name that can be left empty. */
    none: "None",
    required: "Cannot be empty",
    tooLong: (max: number) => `Too long: at most ${max} bytes`,
    noRoom:
      "The game has no room for another new name of this kind just now: save the game, load the save again, and try again",
    unavailable: "The editor cannot change names in this version of the game",
    doesHeading: "What it does",
    does: [
      "The game shows the new name once you press Continue in it",
      "The name stays when you save the game",
      "A new first, last or common name goes into the game's tables of names, where the game uses it for this player only",
      "Listed under Changes, one line per name, where Undo puts the old name back",
    ],

    // The foot
    hint: "Nothing changes in the game until you press Rename.",
    rename: "Rename",
    renaming: "Renaming…",
    cancel: "Cancel",
  },

  /** Making a player's loan permanent: the dialog the Make permanent button of the Loan part of his profile opens. */
  permanent: {
    title: "Make the loan permanent",
    /** The club he stays at, and his own club, which he leaves. */
    stays: "Stays at",
    leaves: "Leaves",
    checking: "Checking…",
    doesHeading: "What it does",
    /** One line each. */
    does: [
      "He stays where he plays, now under contract with that club from today, on the terms above",
      "He keeps the squad number and squad status he has there",
      "He leaves every team of his own club, and the loan ends",
      "The game's transfer history does not list it",
      "Listed under Changes as a transfer, where one undo puts the loan back",
    ],
    /** The fee, filled in from the loan's option to buy. */
    optionFee: (money: string) => `Filled in from the loan's option to buy: ${money}`,
    /** Nothing changes in the game until Make permanent. */
    hint: "Nothing changes in the game until you press Make permanent.",
    confirm: "Make permanent",
    confirming: "Making it permanent…",
    cancel: "Cancel",
  },

  /** Recalling a player from his loan: the dialog the Recall button of the Loan part of his profile opens. */
  recall: {
    title: "Recall from loan",
    /** The club he is on loan at, and the one he goes back to. */
    from: "On loan at",
    to: "Goes back to",
    doesHeading: "What the recall does",
    /** One line each; `parent` is the club he goes back to. */
    does: (parent: string) => [
      "Today becomes the last day of the loan: when the day is over, the game ends the loan itself",
      `Continue one day in the game and he is back at ${parent}`,
      "Until then it is listed under Changes, where an undo puts the loan's old end back",
    ],
    /**
     * What the loan's terms would not allow in the game, when it would not let his club recall him or end the loan
     * early; `parent` is his club. The recall here moves the loan's last day all the same.
     */
    termsHeading: "In the game",
    notRecallable: (parent: string) => `The loan does not let ${parent} recall him`,
    notTerminable: "The loan cannot be ended early",
    worksAnyway: "The recall here works all the same: it does not go through the game's recall, it moves the loan's last day",
    /**
     * A line of what the recall does, for a loan with an option to buy: `club` is the club he is on loan at. When a loan
     * with one ends, the game may let that club sign him for it.
     */
    dropsOption: (club: string, amount: string) =>
      `${club}'s option to buy him for ${amount} is taken away: else, when the loan ends, the game may sell him to ${club}`,
    /** Nothing changes in the game until Recall. */
    hint: "Nothing changes in the game until you press Recall.",
    confirm: "Recall",
    confirming: "Recalling…",
    cancel: "Cancel",
  },

  /** Batch traits: the dialog of a club's Squad tab that adds or removes traits for every player of a team. */
  batchTraits: {
    title: "Batch team traits",
    addMode: "+ Add to squad",
    removeMode: "- Remove from squad",
    addHint: "Applies selected traits to players in this team who don't have them. Existing traits are preserved.",
    removeHint: "Removes selected traits from players in this team who have them. Other traits are left untouched.",
    noneSelected: "No traits selected in this mode",
    selectedCount: (count: number) => (count === 1 ? "1 trait selected" : `${format(count)} traits selected`),
    deselectAll: "Deselect all",
    oppositeModeNote: "Selected in opposite mode",
    applyNote: (players: number) => `Applies to ${format(players)} players · Can be undone in 1 click`,
    emptySquad: (players: number) => `Squad of ${format(players)} players`,
    cancel: "Cancel",
    apply: "Apply",
    applying: "Applying…",
  },

  /**
   * A club's squad: the tab of the club profile that lists the players of each of its teams, with the actions on a
   * whole team and the captains.
   */
  squad: {
    // The switch between the club's teams
    /** The name of the switch for assistive technology. */
    teamsLabel: "Team",
    /**
     * The names of the teams (see `teamLabel` in labels.ts): the first team, a B team, a team with an age limit, and
     * any other, which is named by its place in the club's list (`place` counts from 1, the first team being the
     * first).
     */
    teams: {
      first: "First team",
      b: "B team",
      age: (limit: number) => `U${limit}`,
      other: (place: number) => `Team ${place}`,
    },
    /** When the game lists no team for the club. */
    noTeams: "This club has no teams.",
    loading: "Reading the squad…",
    /** The message under an empty table. */
    empty: "No players in this team.",

    // Above the table
    players: (count: number) => (count === 1 ? "1 player" : `${format(count)} players`),
    /** `age` is written out already, with one decimal. */
    averageAge: (age: string) => `average age ${age}`,
    /** `captain` and `viceCaptain` are names, or `profile.none` for nobody. */
    captains: (captain: string, viceCaptain: string) => `Captain: ${captain} · Vice-captain: ${viceCaptain}`,

    // The actions on the whole team
    /** The name of the group of buttons for assistive technology. */
    actionsLabel: "Actions on the whole team",
    /** `injured` is how many of the team's players have an injury. */
    healAll: (injured: number) => (injured === 0 ? "Heal all" : `Heal all (${format(injured)} injured)`),
    healAllTitle: "Heal every injury of every player in this team",
    /** Hover text of Heal all while nobody in the team is injured. */
    healNone: "Nobody in this team is injured",
    /** `banned` is how many of the team's players have a ban. */
    liftAll: (banned: number) => (banned === 0 ? "Lift bans" : `Lift bans (${format(banned)} banned)`),
    liftAllTitle: "Lift every ban of every player in this team",
    /** Hover text of Lift bans while nobody in the team is banned. */
    liftNone: "Nobody in this team is banned",
    inspireAll: "Inspire all",
    inspireAllTitle: "Set every player's morale to 20, the highest, and remove their reasons to be unhappy",
    maxCohesion: "Max cohesion",
    maxCohesionTitle:
      "Set every player's cohesion with the club to 100, the highest; the game shows it once it moves on",
    /** Hover text of Max cohesion while no player's cohesion with the club can be read. */
    cohesionNone: "Cannot be read: this game version is not checked for it, or no player has an entry for the club",
    /** After Max cohesion: how many players of the team have no entry for the club yet, and were left out. */
    cohesionWithout: (count: number) =>
      count === 1
        ? "1 player has no cohesion with the club yet"
        : `${format(count)} players have no cohesion with the club yet`,
    maxTactics: "Max tactics",
    maxTacticsTitle:
      "Have every player know the team's tactic at its best; it fades after some six weeks, as training does",
    /** Hover text of Max tactics while no player's familiarity with the team's tactic can be read. */
    tacticsNone: "Cannot be read: this game version is not checked for it, or the team does not play a tactic you pick",
    /** After Max tactics: how many players of the team do not train, whose history of training was left as it is. */
    tacticsUntrained: (count: number) =>
      count === 1
        ? "1 player does not train (as when injured): his history of training stays as it is"
        : `${format(count)} players do not train (as when injured): their history of training stays as it is`,
    refreshAll: "Refresh all",
    refreshAllTitle: "Set every player's energy and match sharpness to 100%, and rest them fully (jadedness -500)",
    batchTraits: "Batch traits",
    batchTraitsTitle: "Add or remove preferred moves for players in this team",
    maxAll: "Max attributes",
    maxAllTitle: "Set every attribute of every player to its best: 20, and 1 for injury proneness and dirtiness",
    atItsBest: "Team at its best",
    atItsBestTitle:
      "Heal all, Inspire all, Refresh all, Max cohesion and Max tactics in one press; one Undo takes it back",
    /** After Team at its best or Destroy: a step it left out, by its name, and why. */
    atItsBestSkipped: (step: string, reason: string) => `${step} skipped: ${reason}`,
    /** The red button that takes the team to its worst, after asking (see `destroyDialog`). */
    destroy: "Destroy",
    destroyTitle: "Take every player's morale, fitness, cohesion and tactic knowledge to their worst; it asks first",
    /** The names of Destroy's steps, for one it left out (see `atItsBestSkipped`). */
    destroySteps: {
      demoralize: "Morale and happiness",
      exhaust: "Energy and sharpness",
      minCohesion: "Cohesion",
      minTactics: "Tactics",
    },
    /** The menu with the actions on the whole team one at a time: Heal all to Max tactics. */
    moreActions: "More actions",
    moreActionsTitle: "The actions on the whole team, one at a time",
    /** Destroy's question, asked before anything is written. */
    destroyDialog: {
      title: "Destroy this team?",
      doesHeading: "For every player in the list, those out on loan too",
      does: [
        "Morale to 1, the lowest; happiness and playing time happiness to -100",
        "Energy to 0%, match sharpness to 35% and jadedness to 1000",
        "Cohesion with the club to 1, for those who have it",
        "How well he knows the tactic to its least, where you pick the team's tactic",
      ],
      keeps: "No value is made better than it is. Attributes, injuries and bans stay as they are.",
      /** When a manager of the user's runs the club. */
      ownClub: "This is a team of your own club.",
      hint: "One Undo takes it all back, before the game moves on.",
      cancel: "Cancel",
    },
    /** Beside the buttons: whom they cover, and where undoing is. */
    hint: "The actions cover every player in the list, those out on loan too. Undo is in the Changes view as well.",

    // Freezing the whole team, under the actions
    /** The name of the group of boxes for assistive technology. */
    freezeLabel: "Freeze the whole team",
    freezeAttributes: "Freeze attributes",
    freezeAttributesTitle:
      "The attributes of every player in this team do not get worse while the app is open and connected",
    freezeFitness: "Freeze energy and sharpness",
    freezeFitnessTitle:
      "Every player's energy and match sharpness stay up while the app is connected; Refresh all first for 100%",
    freezePositions: "Freeze positions",
    freezePositionsTitle:
      "The position ratings of every player in this team stay as they are while the app is open and connected",
    /** After a box: how many of the team's `total` players are frozen that way, while some are and some are not. */
    frozenCount: (frozen: number, total: number) => `${format(frozen)} of ${format(total)}`,
    /** Beside the boxes: whom freezing covers, and for how long. */
    freezeHint:
      "Freezing covers every player in the list and stays with each one wherever he goes. The app remembers it for " +
      "this save.",
    /** What a box did, in the line under the buttons; `count` is how many players it froze or unfroze now. */
    frozeAttributes: (count: number) =>
      count === 0 ? "Their attributes were frozen already" : `Froze the attributes of ${playerCount(count)}`,
    unfrozeAttributes: (count: number) => `Unfroze the attributes of ${playerCount(count)}`,
    frozeFitness: (count: number) =>
      count === 0
        ? "Their energy and sharpness were frozen already"
        : `Froze the energy and sharpness of ${playerCount(count)}`,
    unfrozeFitness: (count: number) => `Unfroze the energy and sharpness of ${playerCount(count)}`,
    frozePositions: (count: number) =>
      count === 0 ? "Their positions were frozen already" : `Froze the positions of ${playerCount(count)}`,
    unfrozePositions: (count: number) => `Unfroze the positions of ${playerCount(count)}`,

    // What an action did, under the buttons
    /** `count` is how many values were written. */
    written: (count: number) => `${changeCount(count)} written`,
    /** A change the game refused: `name` is the player's, `reason` the game's answer (it names the value). */
    refused: (name: string, reason: string) => `${name}: ${reason}`,
    /** Takes back what the line beside it says was written. */
    undo: "Undo",
    undoTitle: "Write the old values of these changes back to the game",

    // Captains
    /** The badges after the name of the captain and of the vice-captain; their hover texts are the roles' names. */
    captainShort: "C",
    viceCaptainShort: "VC",
    /** The menu button at the end of a row: its name for assistive technology (`name` is the player's), hover text. */
    menuLabel: (name: string) => `Captaincy of ${name}`,
    menuTitle: "Captaincy",
    makeCaptain: "Make captain",
    makeViceCaptain: "Make vice-captain",
    /** Who holds a role now: said after a change, and in the Changes view under a captaincy that moved the other. */
    nowCaptain: (name: string) => `${name} is now captain`,
    nowViceCaptain: (name: string) => `${name} is now vice-captain`,
    /** The same when there was nobody to take the role the new holder left, so that it stands empty. */
    noCaptain: "Nobody is captain now",
    noViceCaptain: "Nobody is vice-captain now",

    // The table
    /** The table's name for assistive technology; `team` is the name of the team. */
    tableLabel: (team: string) => `Players of ${team}`,
    /** Hover text of a player's name, which opens his profile in the player list. */
    openProfile: "Open the player's profile",
    columns: {
      name: "Name",
      position: "Pos",
      age: "Age",
      currentAbility: "CA",
      potentialAbility: "PA",
      condition: "Energy",
      matchSharpness: "Sharpness",
      jadedness: "Jaded.",
      morale: "Morale",
      cohesion: "Cohesion",
      tactics: "Tactics",
      /** The last column has no heading but this one, for assistive technology: it holds the captaincy menus. */
      actions: "Captaincy",
    } satisfies Record<SquadSort | "actions", string>,
    /** Hover text of a column header that sorts the table; `by` is a name from `sortNames`. */
    sortBy: (by: string) => `Sort by ${by}`,
    sortNames: {
      name: "name",
      position: "position",
      age: "age",
      currentAbility: "current ability",
      potentialAbility: "potential ability",
      condition: "energy",
      matchSharpness: "match sharpness",
      jadedness: "jadedness",
      morale: "morale",
      cohesion: "cohesion",
      tactics: "tactical familiarity",
    } satisfies Record<SquadSort, string>,

    // The tags after a name, with what each means as hover text
    injured: "Injured",
    /** `count` is how many injuries he has. */
    injuredTitle: (count: number) => (count === 1 ? "1 injury" : `${format(count)} injuries`),
    banned: "Banned",
    /** `count` is how many bans he has. */
    bannedTitle: (count: number) => (count === 1 ? "1 ban" : `${format(count)} bans`),
    /** A player his teammates hold reasons to be unhappy about; `count` is how many of them do. */
    unrest: "Unrest",
    unrestTitle: (count: number) =>
      count === 1
        ? "1 teammate is unhappy about him; Remove all, in his profile, settles it once the game moves on"
        : `${format(count)} teammates are unhappy about him; Remove all, in his profile, settles it once the game moves on`,
    onLoan: "On loan",
    onLoanTitle: "Out on loan to another club",
    loanee: "Loanee",
    loaneeTitle: "Here on loan from another club",
    elsewhere: "Elsewhere",
    elsewhereTitle: "Plays for another team of the club",
    frozen: "Frozen",
    /** Hover text of Frozen: what is frozen, one of them at least. */
    frozenTitle: (attributes: boolean, fitness: boolean, positions: boolean): string => {
      const frozen = [
        ...(attributes ? ["attributes"] : []),
        ...(fitness ? ["energy", "match sharpness"] : []),
        ...(positions ? ["positions"] : []),
      ];
      const last = frozen.pop() ?? "";
      const listed = frozen.length > 0 ? `${frozen.join(", ")} and ${last}` : last;
      return `His ${listed} are frozen`;
    },
  },

  /** The game, as `describeGame` in `format.ts` names it. */
  game: {
    /** The game's name when its edition is not known: "FM27" otherwise. */
    name: "Football Manager",
    storefronts: {
      gamePass: "Game Pass",
      steam: "Steam",
      epic: "Epic Games",
      unknown: "Unknown store",
    } satisfies Record<Storefront, string>,
    /** Steam's build id of the install, e.g. `"build 26227640`". */
    steamBuild: (id: string) => `build ${id}`,
  },

  /** The Scouting tab: an assistant scout who advises on signings, the squad's depth and who could go. */
  scouting: {
    nav: "Scouting",
    reading: "Reading your club…",
    refresh: "Refresh",
    refreshTitle: "Read the club from the game again",
    searching: "Searching…",
    none: "—",
    perWeek: "/wk",
    openProfile: "Open the profile",
    freeAgent: "Free agent",
    loan: "Loan",
    header: {
      transferBudget: "Transfer budget",
      wageRoom: "Wage room",
      wageBudget: "Wage budget",
      squad: "Squad",
      averageAge: "Average age",
      players: (count: number) => (count === 1 ? "1 player" : `${format(count)} players`),
    },
    tabs: {
      label: "Scouting sections",
      recommend: "Transfer advice",
      opportunities: "Opportunities",
      similar: "Similar players",
      depth: "Squad depth",
      departures: "Players to let go",
      youth: "Youth intake",
    },
    /** The depth statuses: the dots on the pitch and the badges of the cards. */
    status: {
      missing: "Missing",
      thin: "Thin",
      fine: "Fine",
      crowded: "Crowded",
    },
    /** The lines of the formation that roles belong to: the groups of the role selects. */
    lines: {
      goalkeeper: "Goalkeeper",
      centreBack: "Centre-back",
      fullBack: "Full-back",
      wingBack: "Wing-back",
      defensiveMidfield: "Defensive midfield",
      centralMidfield: "Central midfield",
      attackingMidfield: "Attacking midfield",
      wide: "Wide",
      striker: "Striker",
    },
    /** The squad lines, by key. */
    depthLines: {
      gk: "Goalkeepers",
      dc: "Centre-backs",
      rightBack: "Right-backs",
      leftBack: "Left-backs",
      dm: "Defensive midfielders",
      mc: "Central midfielders",
      rightWing: "Right wingers",
      leftWing: "Left wingers",
      amc: "Attacking midfielders",
      st: "Strikers",
    } as Record<string, string>,
    /** The hover of a position on the pitch: "Right-backs: 2 in the squad (usually 2) — Fine". */
    positionTip: (line: string, count: number, target: number, status: string) =>
      `${line}: ${format(count)} in the squad (usually ${format(target)}) — ${status}`,
    brief: {
      heading: "What are you looking for?",
      pitch: "Position",
      legend: "The dots show how the squad stands in each line.",
      inPossession: "In possession",
      outOfPossession: "Out of possession",
      anyRole: "Any — best role for each player",
      purpose: "For",
      filters: "Filters",
      minAge: "Min age",
      maxAge: "Max age",
      maxFee: "Max fee",
      minProbability: "Probability",
      anyProbability: "Any",
      noFreeAgents: "No free agents",
    },
    purposes: {
      firstTeam: "First team",
      rotation: "Rotation",
      future: "Future",
      any: "All",
    },
    purposeTips: {
      firstTeam: "Better than your best player in this position",
      rotation: "As good as your second choice, at a sensible price",
      future: "21 or younger, with room to grow",
      any: "Everyone who fits",
    },
    /** The sentence above the advice: before the position, and after it; `roles` and `purpose` follow a dot. */
    ask: {
      before: "Advice for ",
      after: "",
      anyRole: "best role per player",
    },
    own: {
      heading: "In your squad",
      empty: "Nobody in your squad plays here.",
      position: "Position",
    },
    summary: (candidates: number, eligible: number, shown: number, purpose: string) =>
      `${format(candidates)} players can play here · ${format(eligible)} match ${purpose} · ${format(shown)} recommended`,
    how: {
      label: "How is this list made?",
      note: (rule: string, count: string) =>
        `Players rated 10 or more at this position (not yours or other human managers') who ${rule}. The best ${count} are shown by fit (70%) and probability (30%); Rotation weighs both alike, Future counts potential too. Click a column title to sort.`,
    },
    purposeRules: {
      firstTeam: "fit the position better than your best player there",
      rotation: "fit at least as well as your second choice",
      future: "are 21 or younger with room to grow (potential at least 15 above ability)",
      any: "fit at all",
    },
    sortBy: (by: string) => `Sort by ${by}`,
    sortNames: {
      rank: "the scout's order",
      name: "name",
      age: "age",
      ca: "current ability",
      pa: "potential ability",
      fit: "fit",
      probability: "probability",
      fee: "fee",
      similarity: "similarity",
    },
    backToScoutOrder: "Back to the scout's order",
    showMore: (count: number) => `Show ${format(count)} more`,
    /** Under a player whose contract is with another club: the club he plays for, on loan or in its second team. */
    playsFor: (club: string) => `plays for ${club}`,
    empty: "No advice for this position with these settings. Try the purpose All or looser filters.",
    columns: {
      rank: "#",
      ca: "CA",
      pa: "PA",
      player: "Player",
      age: "Age",
      fit: "Fit",
      role: "Role",
      probability: "Probability",
      fee: "Est. fee",
      wage: "Wage",
      note: "Scout's note",
      money: "Fee",
      value: "Value",
    },
    probabilityInfo:
      "How likely the player is to join your club — an estimate from his value, contract, club and reputation.",
    probabilityInfoLabel: "What is probability?",
    /** The hover of a fit: his attributes for each role (1–20) and how well he plays the position. */
    fitTitle: (inPossession: string | null, outOfPossession: string | null, position: string) =>
      [
        inPossession !== null && `In possession: ${inPossession}`,
        outOfPossession !== null && `Out of possession: ${outOfPossession}`,
        `Position: ${position}`,
      ]
        .filter(Boolean)
        .join("\n"),
    note: "Fit uses the editor's own attribute weights for each role; fees, wages and probabilities are estimates.",
    depth: {
      summary: (size: number, age: string | null, level: string) =>
        `${format(size)} players${age === null ? "" : ` · average age ${age}`} · best eleven average ability ${level}`,
      weak: "Below squad level",
      ageing: "Ageing",
      cover: (names: string) => `Can also play here: ${names}`,
      advice: "Get advice",
      adviceTitle: "Transfer advice for this line",
      empty: "Nobody",
      ability: "Current ability",
      more: (count: number) => `+${format(count)} more`,
      columns: {
        line: "Line",
        status: "Status",
        count: "Players",
        players: "Best first (ability)",
        cover: "Can also play here",
        age: "Avg age",
      },
      countTitle: (count: number, target: number) =>
        `${format(count)} players whose best position is in this line; a squad usually carries ${format(target)}`,
      statusHelp: {
        missing: "Nobody plays here.",
        thin: "Fewer than a squad usually carries; players who can cover count as half.",
        fine: "About what a squad usually carries.",
        crowded: "Two or more players beyond what a squad usually carries.",
      },
      attention: "Needs a look:",
      allFine: "Every line looks balanced.",
      /** The switch between the pitch and the table. */
      views: { label: "Show the squad as", pitch: "Pitch", table: "Table" },
      pitchLabel: "The squad on the pitch, line by line",
      /** Under a line on the pitch: how many players of other lines can play there. */
      coverCount: (count: number) => `${format(count)} can cover`,
      /** The button under a line picked on the pitch. */
      adviceFor: (position: string) => `Transfer advice for ${position}`,
    },
    departures: {
      intro: "Players your scout would let go, most pressing first.",
      filter: "Advice",
      all: "All",
      empty: "Your scout would not let anyone go right now.",
      sortNames: {
        rank: "the scout's order",
        name: "name",
        age: "age",
        ca: "current ability",
        pa: "potential ability",
        value: "value",
        wage: "wage",
        contract: "contract end",
      },
      columns: {
        player: "Player",
        age: "Age",
        ability: "Ability",
        value: "Value",
        wage: "Wage",
        contract: "Contract until",
        advice: "Advice",
        reasons: "Reasons",
      },
      actions: { sell: "Sell", loan: "Loan out", release: "Release" },
      /** "3rd" in a line. */
      rank: (line: string, rank: number) => {
        const tens = rank % 100;
        const suffix = (tens >= 11 && tens <= 13) || rank % 10 > 3 ? "th" : ["th", "st", "nd", "rd"][rank % 10];
        return `${line} · ${rank}${suffix}`;
      },
    },
    /** The actions at the end of a row of players the scout found, and on a player he would let go. */
    actions: {
      column: "Actions",
      compare: "Compare with your squad",
      compareLabel: (name: string) => `Compare ${name} with your squad`,
      similar: "Find similar players",
      similarLabel: (name: string) => `Find players like ${name}`,
      report: "Scout report",
      reportLabel: (name: string) => `Scout report on ${name}`,
      replacement: "Find a replacement",
      replacementLabel: (name: string) => `Find a replacement for ${name}`,
      replacementTitle: "Players like him, who could take his place",
    },
    /**
     * What makes a player an opportunity, by code: `value` is the reason's value as text (days, an amount, a count,
     * a potential), `against` his value for a release clause (null when he is not for sale).
     */
    why: {
      freeAgent: () => "Free agent",
      expiring: (value: string) => `Contract ends in ${value} days`,
      releaseClause: (value: string, against: string | null) =>
        against === null ? `Release clause ${value}` : `Release clause ${value} (value ${against})`,
      unhappy: (value: string) => (value === "1" ? "Unhappy at his club" : `Unhappy at his club (${value} reasons)`),
      inTheRed: (value: string) => `His club is in the red (${value})`,
      listed: () => "Transfer listed",
      loanListed: () => "Available for loan",
      wonderkid: (value: string) => `Potential ${value}`,
    } as Record<string, (value: string, against: string | null) => string>,
    /** How a player the scout found compares with the club's best player at his position. */
    verdicts: {
      better: "Better than your no. 1",
      close: "Close to your no. 1",
      below: "Below your no. 1",
      none: "Nobody in your squad plays here",
    },
    /** How likely a player is to join, in words, by the probability: 70% and above, 50% and above, below. */
    chances: { likely: "Likely to join", possible: "Could join", hard: "Hard to sign" },
    opportunities: {
      kindsLabel: "Lists of opportunities",
      kinds: {
        bosman: "Bosman",
        releaseClause: "Release clauses",
        unhappy: "Unhappy",
        inTheRed: "Clubs in the red",
        listed: "Transfer list",
        loanListed: "Loan list",
        wonderkid: "Wonderkids",
      } satisfies Record<OpportunityKind, string>,
      hints: {
        bosman: "Free agents, and contracts that end within six months",
        releaseClause: "A release clause below his value",
        unhappy: "Unhappy at his club",
        inTheRed: "His club needs the money",
        listed: "His club would sell him",
        loanListed: "His club would lend him out",
        wonderkid: "19 or younger, with a great future",
      } satisfies Record<OpportunityKind, string>,
      countLabel: "Players on this list",
      /** "34", or "300+" for a list that holds more. */
      count: (count: number, more: boolean) => (more ? `${format(count)}+` : format(count)),
      position: "Position",
      anyPosition: "Any position",
      maxAge: "Max age",
      maxFee: "Max fee",
      betterOnly: "Better than my no. 1",
      betterOnlyTitle: "Only players who fit their position better than your best player there",
      summary: (kind: string, lowest: string, highest: string, pool: string) =>
        `${kind} · players of ability ${lowest}–${highest}, around your squad's level · ${pool} looked at`,
      how: {
        label: "How are these lists made?",
        note: "Players near your best eleven's level (30 below to 45 above), not yours or other human managers', each measured at his best position or the one you pick. Each list is sorted by fit and probability together.",
      },
      empty: "Nobody on this list with these filters.",
      emptyWonderkids: "No wonderkids with these filters.",
      better: "Better than your no. 1 here",
      columns: { position: "Pos", why: "Why" },
    },
    similar: {
      intro: "Pick a player to find others like him: their attributes are compared where his position needs them.",
      search: "Player to compare with",
      searchPlaceholder: "Search a player by name…",
      noMatch: "No player by that name.",
      quickPicks: "Or start from one of your players:",
      change: "Choose another player",
      reference: "Players like",
      position: "Compare at",
      cheaper: "Cheaper",
      cheaperTitle: "Only players worth less than him",
      younger: "Younger",
      youngerTitle: "Only players younger than him",
      maxFee: "Max fee",
      value: "Value",
      notForSale: "Not for sale",
      doesNotPlay: (position: string) => `He does not play ${position}: only his attributes are compared.`,
      summary: (candidates: string, shown: string, position: string) =>
        `${candidates} players play ${position} · the ${shown} most alike`,
      how: {
        label: "How is similarity measured?",
        note: "The scout compares the attributes the position's roles rely on, the key ones most. Where a player is strong and where he is weak counts more than his level, so a cheaper or younger player can still be very alike.",
      },
      empty: "Nobody alike with these settings.",
      columns: { similarity: "Alike", value: "Value" },
      similarityTitle: (value: number) => `${format(value)}% alike`,
    },
    compare: {
      title: "Compare with your squad",
      hint: (position: string, name: string) =>
        `Against ${name}, your best player at ${position}. The role's key attributes come first.`,
      noStarter: "Nobody in your squad plays this position.",
      starter: "Your no. 1",
      candidate: "Candidate",
      inPossession: "In possession",
      outOfPossession: "Out of possession",
      add: "Add a player",
      addNone: "Pick from the list…",
      remove: (name: string) => `Take ${name} out of the comparison`,
      removeShort: "Remove",
      scoutView: "Scout's view",
      rows: {
        fit: "Fit",
        position: (position: string) => `At ${position}`,
        roleRating: (role: string) => `As ${role}`,
        probability: "Probability",
        fee: "Est. fee",
        wage: "Wage",
        contract: "Contract until",
        verdict: "Verdict",
      },
      ownPlayer: "Your player",
      roleAttributes: (roles: string) => `The role's attributes: ${roles}`,
      keyAttribute: "A key attribute of the role",
      versus: (difference: string) => `${difference} against your no. 1`,
      best: "the best",
      age: (age: number) => `Age ${format(age)}`,
      allAttributes: "All attributes",
      loading: "Reading the players…",
      close: "Close",
    },
    report: {
      title: (name: string) => `Scout report: ${name}`,
      hint: "Save it as a picture or copy it to share.",
      making: "Writing the report…",
      failed: (reason: string) => `Could not make the report: ${reason}`,
      alt: (name: string) => `The scout report on ${name}`,
      save: "Save as image",
      savePdf: "Save as PDF",
      saving: "Saving…",
      copy: "Copy image",
      copied: "Copied to the clipboard.",
      copyFailed: (reason: string) => `Could not copy the image: ${reason}`,
      similar: "Find similar players",
      saved: (file: string) => `Saved as ${file}.`,
      open: "Open",
      show: "Show in folder",
      close: "Close",
      /** The texts on the picture itself. */
      heading: "Scout report",
      age: (age: number) => `Age ${format(age)}`,
      freeAgent: "Free agent",
      contract: "contract until",
      fit: "Fit",
      probability: "Probability",
      fee: "Est. fee",
      abilities: "CA / PA",
      value: "Value",
      role: "Role",
      strengths: "Strengths",
      weaknesses: "Weaknesses",
      profile: "Character",
      note: "Scout's note",
      similarity: (value: number) => `${format(value)}% alike`,
      footer: "FMLibreEditor scout report · fees, wages and probabilities are estimates",
      traits: {
        consistent: "Consistent",
        inconsistent: "Inconsistent",
        bigGames: "Big-game player",
        nervous: "Nervous in big games",
        injuryProne: "Injury prone",
        robust: "Rarely injured",
        versatile: "Versatile",
        professional: "Model professional",
        ambitious: "Ambitious",
        loyal: "Loyal",
        hotHeaded: "Hot-headed",
      },
    },
    /** "Youth intake": the players the game made at a club's youth intakes, by the day they joined it, and their edits. */
    youth: {
      intro: "The players the game made at the club's youth intakes who are still there, by the day they joined it.",
      otherClub: "Look at another club",
      searchLabel: "Club to look at",
      mine: "Back to my club",
      intakesLabel: "Youth intakes",
      /** A day nothing says. */
      noDay: "Day not known",
      /** `best` is a name and the potential in brackets. */
      summary: (count: number, average: string, best: string) =>
        `${count === 1 ? "1 player" : `${format(count)} players`} · average potential ${average} · best: ${best}`,
      lent: (count: number) => (count === 1 ? "1 out on loan" : `${format(count)} out on loan`),
      how: {
        label: "How is this list made?",
        note: "Players the game made who joined this club at 17 or younger and were trained at no other club, by the day they joined. Those out on loan are listed; those sold or let go are not.",
      },
      unmarked:
        "The editor does not know how this version of the game marks the players it makes: the club's own young players from the game's database are listed too.",
      empty: (club: string) => `${club} has no youth intake players at the moment.`,
      emptyHint: "An intake's players show here for as long as they are at the club. Look at another club to see its youth intake.",
      columns: {
        player: "Player",
        position: "Pos",
        born: "Born",
        nation: "Nationality",
        city: "City of birth",
        ca: "CA",
        pa: "PA",
        actions: "Edit",
      },
      age: (age: number) => `age ${format(age)}`,
      joinedAt: (age: number) => `joined at ${format(age)}`,
      onLoan: (club: string) => `On loan at ${club}`,
      youthContract: "Youth contract",
      edit: (name: string) => `Edit ${name}`,
      editor: {
        label: (name: string) => `Editing ${name}`,
        reading: "Reading his values…",
        dateOfBirth: "Date of birth",
        nation: "Nationality",
        city: "City of birth",
        /** The city select of a player without a city: the game keeps none for him, and the editor sets none. */
        noCity: "None in the game",
        /** Above the cities of the nation picked: they are the ones people of the save were born in. */
        cityHint: "Cities people of this save were born in",
        ca: "Current ability",
        pa: "Potential ability",
        save: "Save",
        saving: "Saving…",
        cancel: "Cancel",
        profile: "Full profile",
        profileTitle: "Positions, attributes and the rest, in the player's profile",
        nothing: "Nothing to save: no value was changed.",
        saved: (count: number) => (count === 1 ? "1 change saved." : `${format(count)} changes saved.`),
        failed: (field: string, reason: string) => `${field}: ${reason}`,
        invalid: (field: string) => `${field}: not a value it can take.`,
      },
      loading: "Reading the youth intakes…",
      failed: (reason: string) => `Could not read the youth intakes: ${reason}`,
    },
    roles: {
      bgk: "Ball-Playing Goalkeeper",
      ngk: "No-Nonsense Goalkeeper",
      sk: "Sweeper Keeper",
      lhk: "Line-Holding Keeper",
      cb: "Centre-Back",
      bcb: "Ball-Playing Centre-Back",
      ncb: "No-Nonsense Centre-Back",
      acb: "Advanced Centre-Back",
      ocb: "Overlapping Centre-Back",
      scb: "Stopping Centre-Back",
      ccb: "Covering Centre-Back",
      wcb: "Wide Centre-Back",
      fb: "Full-Back",
      ifb: "Inverted Full-Back",
      pfb: "Pressing Full-Back",
      hfb: "Holding Full-Back",
      wb: "Wing-Back",
      iwb: "Inverted Wing-Back",
      pwb: "Playmaking Wing-Back",
      awb: "Advanced Wing-Back",
      hwb: "Holding Wing-Back",
      dm: "Defensive Midfielder",
      hb: "Half-Back",
      ddm: "Dropping Defensive Midfielder",
      pdm: "Pressing Defensive Midfielder",
      bbm: "Box-to-Box Midfielder",
      bbp: "Box-to-Box Playmaker",
      cm: "Central Midfielder",
      pcm: "Pressing Central Midfielder",
      scm: "Screening Central Midfielder",
      chm: "Channel Midfielder",
      wcm: "Wide Central Midfielder",
      ap: "Attacking Playmaker",
      am: "Attacking Midfielder",
      oam: "Outlet Attacking Midfielder",
      w: "Winger",
      if: "Inside Forward",
      pw: "Playmaking Winger",
      wfd: "Wide Forward",
      tw: "Tracking Winger",
      iow: "Inside Outlet Winger",
      cfd: "Centre Forward",
      dlf: "Deep-Lying Forward",
      p: "Poacher",
      tcf: "Tracking Centre Forward",
      ocf: "Outlet Centre Forward",
    } as Record<string, string>,
    reasons: {
      listed: () => "Transfer listed",
      freeAgent: () => "Free agent",
      expiring: (value: string) => `Contract ends in ${value} days`,
      releaseClause: (value: string) => `Release clause ${value}`,
      fringe: () => "Not a regular at his club",
      keyPlayer: () => "Key player at his club",
      unwanted: () => "Surplus to requirements at his club",
      overBudget: (value: string) => `${value} over your budget`,
      stretch: (value: string) => `Just over budget (+${value})`,
      wageHigh: (value: string) => `Wage ${value}/wk above your room`,
      biggerClub: () => "Plays for a bigger club",
      smallerClub: () => "Plays for a smaller club",
      reputationGap: () => "Too big a name for your club",
      ambitious: () => "Ambitious: would welcome the step up",
      notForSale: () => "Not for sale",
    } as Record<string, (value: string) => string>,
    /** Why a player could go, by code; `value` is the reason's value as text. */
    departureReasons: {
      surplus: (value: string) => `Crowded line (${value} players)`,
      belowLevel: () => "Below the squad's level",
      ageing: (value: string) => `Getting old (${value})`,
      expiring: (value: string) => `Contract ends in ${value} days`,
      highWage: (value: string) => `High wage for his role (${value}/wk)`,
      unhappy: () => "Unhappy",
      lowMorale: () => "Low morale",
      blocked: () => "Needs games to grow",
      unwanted: () => "Squad status: surplus to requirements",
      listed: () => "Already transfer listed",
    } as Record<string, (value: string) => string>,
  },

  /** "My club" (`MyClub`): the page the app opens on, about the club the user manages in the save. */
  home: {
    /** The tab's name. */
    nav: "My club",
    loading: "Looking for your club…",
    failed: (reason: string) => `Could not look for your club: ${reason}`,
    /** Under the club's name: who manages it, or that it is a club picked to follow. */
    manager: (name: string) => `Manager: ${name}`,
    following: "A club you follow",
    /** The name of the switch between the clubs, in a save with several managers of the user's. */
    clubsLabel: "Your clubs",
    /** The button that opens the club in the Clubs tab, and its hover text. */
    openProfile: "Club profile",
    openProfileTitle: "Open this club in the Clubs tab: facilities, finances, stadium and more",
    /** When the user's manager has no club: a club can be picked to follow instead. */
    noClubTitle: "You manage no club in this save",
    noClubText: "Pick a club to follow here instead: its squad, who needs a look, and the actions on a whole team.",
    chooseAnother: "Choose another club",
    /** The name of the search that picks the club to follow. */
    searchLabel: "Club to follow",
    /** The name of the page's squad part. */
    squad: "Squad",
    /** The cards over the squad: who in the shown team needs a look. Injured, Banned and Unrest take the squad's tags. */
    cards: {
      label: "Who needs a look",
      lowMorale: "Low morale",
      tired: "Tired",
      contracts: "Contracts ending",
      /** The hover texts of the cards' titles: what each one counts. `below` is a morale or a percentage as shown. */
      injuredHint: "Players with an injury",
      bannedHint: "Players with a ban",
      lowMoraleHint: (below: string) => `Players whose morale is below ${below}`,
      tiredHint: (below: string) => `Players whose energy is below ${below}`,
      unrestHint: "Players some of their teammates are unhappy about",
      contractsHint: (months: number) => `Players whose contracts end within ${months} months`,
      /** In a card that counts nobody. */
      none: "None",
      /** After the first few names. */
      more: (count: number) => `and ${format(count)} more`,
    },
  },

  /**
   * Recipes (`RecipeMenu`): ready-made sets of changes to one player or one club. The Recipes button opens a menu of
   * them; the dialog of the one picked lists what it would write, like the preview of a mass edit, whose words for
   * Apply, the columns and the outcome it shares.
   */
  recipes: {
    /** The button beside Max attributes in a player's profile, and in the header of a club's. */
    button: "Recipes",
    buttonTitle: "Ready-made sets of changes, previewed first",
    /** The recipes by key, as the menu and the title of the dialog name them. */
    names: {
      wonderkid: "Make a wonderkid",
      injuryProof: "Injury-proof",
      longCareer: "Extend his career",
      richClub: "Make the club rich",
      topFacilities: "Top facilities",
    },
    /** What each one does, kept short: the note beside its menu item, and the line under the dialog's title. */
    notes: {
      wonderkid:
        "21 or younger: potential ability at least 180, ability and attributes to suit his age. Higher values " +
        "stay.",
      injuryProof: "Injury proneness 1, natural fitness 20, stamina at least 15, injuries healed.",
      longCareer:
        "No planned retirement, three more years of contract, natural fitness 20, professionalism at least 18.",
      richClub: "Balance, transfer budget and wage budgets up to the level of the richest clubs.",
      topFacilities: "All five facilities to 20.",
    },
    /** The note of a recipe that is dimmed: the player is older than `oldest`, or his age is not known. */
    tooOld: (oldest: number) => `For players of ${oldest} or younger`,
    /** A recipe as the command palette lists it for the profile on show. */
    command: (recipe: string) => `Recipe: ${recipe}`,
    /** In the dialog while the recipe is worked out. */
    working: "Working out the changes…",
    /** "14 changes · 30 values as good already · 2 values left alone". */
    summary: (changes: number, kept: number, left: number) =>
      [
        changeCount(changes),
        kept > 0 && (kept === 1 ? "1 value as good already" : `${format(kept)} values as good already`),
        left > 0 && valuesLeftAlone(left),
      ]
        .filter(Boolean)
        .join(" · "),
    tableLabel: "Changes the recipe would make",
    /** The line that opens the list of the values that stay because they are as good already, or better. */
    keptHeading: (count: number) =>
      count === 1 ? "1 value stays as it is: as good already" : `${format(count)} values stay as they are: as good already`,
    keptLabel: "Values that are as good already",
    /** The head of the column of those values. */
    valueColumn: "Value",
    leftLabel: "What the recipe leaves alone",
    undo: "Undo this recipe",
    undoTitle: "Write everything this recipe changed back to the game",
  },

  /**
   * A player's development, from the records the app keeps of a career (`PlayerProgress`): the Development tab of his
   * profile, the note under his abilities in its header, and the change beside an ability in a squad's table.
   */
  progress: {
    /** The name of the profile's tabs, and the two tabs. */
    tabsLabel: "Sections of the player's profile",
    tabs: { overview: "Profile", progress: "Development" },
    /** Hover text of the Development tab while the player is edited. */
    lockedWhileEdited: "Finish editing to open this tab",
    /** Hover text of the note under the abilities, under what changed. */
    openTab: "Open the Development tab",
    loading: "Reading the records…",
    failed: (reason: string) => `Could not read the records: ${reason}`,
    /** After a change: "+6 since 1 Jul 2026". `date` is a date as the language writes it. */
    since: (date: string) => `since ${date}`,
    /** A change in words, for hover texts and screen readers: "120 → 126 since 1 Jul 2026". */
    change: (from: string, to: string, date: string) => `${from} → ${to} since ${date}`,
    /** The periods to look back over, where the records reach back far enough for a choice. */
    rangeLabel: "Period",
    ranges: { quarter: "3 months", year: "1 year", all: "All" },
    /** How many records there are of the player, and the date of the first. */
    recorded: (count: number, first: string) => `Records: ${count} · first on ${first}`,
    /** The headings: current and potential ability over time, the transfer value, and the attributes. */
    abilityTitle: "Ability",
    valueTitle: "Value",
    attributesTitle: "Attributes that changed",
    noAttributeChanges: (date: string) => `No attribute has changed since ${date}.`,
    /** With no record before today's: how the records come about. */
    emptyTitle: "Nothing to compare with yet",
    emptyText:
      "The app notes every player's abilities, value and attributes about once a week of the game's time, whenever it reads the game's data. Play on, read the data again, and how this player develops shows here.",
    /** Where the app keeps no records: a save without a manager of the user's, or data that fails the checks. */
    offTitle: "No records for this save",
    offText:
      "The app keeps records for a save with a manager of yours, on a version of the game whose data passes its checks.",
  },

  /**
   * The command palette (`CommandPalette`): one box that finds players, staff, clubs and the app's commands. The
   * keyboard shortcuts (`shortcuts.ts`) take their key names from here.
   */
  palette: {
    /** The button in the masthead that opens it. */
    button: "Search",
    /** The button's hover text, and the name of the box. */
    title: "Search or run a command",
    /** In the box while connected, and while not: then it finds commands only. */
    placeholder: "Search players, staff, clubs and commands",
    placeholderCommands: "Search commands",
    /** The heading over the commands; the names of the lists head the people and the clubs found. */
    commands: "Commands",
    /** The command that shows one of the app's lists; `list` is the name of its tab. */
    goTo: (list: string) => `Go to ${list}`,
    /** The command that puts the caret in the search box of the list on show. */
    searchList: "Search this list",
    /** The commands for the profile on show: they press its Edit button (to start, and to end) and its Apply button. */
    editProfile: "Edit this profile",
    doneEditing: "Finish editing this profile",
    applyChanges: "Apply the changes to this profile",
    /** Under the people or the clubs found, when the list has more: opens that list with the same search. */
    showAll: (count: number, list: string) => `Show all ${format(count)} in ${list}`,
    searching: "Searching…",
    /** When nothing matches what is typed. */
    empty: (query: string) => `Nothing matches “${query}”.`,
    /** Under the commands while not connected. */
    notConnected: "Connect to the game to search its players, staff and clubs.",
    failed: (reason: string) => `The search failed: ${reason}`,
    /** The foot of the box: what the arrow keys, Enter and Escape do. */
    hintMove: "Move",
    hintOpen: "Open",
    hintClose: "Close",
    /** The names of the keys as Windows keyboards have them ("Ctrl+K"); macOS shows the keys' signs instead. */
    keys: { ctrl: "Ctrl", shift: "Shift", enter: "Enter", escape: "Esc" },
  },

  /**
   * What's new (`WhatsNewDialog`): what a version brings. It opens by itself the first time the app starts after an
   * update, and from the foot of the window or the palette when asked.
   */
  whatsNew: {
    title: (version: string) => `What's new in ${version}`,
    /** Under the title when the dialog opened by itself. */
    updated: "FMLibreEditor has been updated.",
    /** Over each version's list, when the dialog tells about more than one. */
    version: (version: string) => `Version ${version}`,
    /** `names` is a list the language's own way ("a, b and c"). */
    thanks: (names: string) => `Thanks to ${names}.`,
    /** Opens the release's notes on GitHub. */
    allChanges: "All changes",
    allChangesTitle: "Open this version's notes in full on GitHub",
    /** Closes the dialog, which does not open by itself again for this version. */
    close: "Got it",
    /** The link at the foot of the window that opens it again, and the palette's command. */
    link: "What's new",
    command: "What's new in this version",
    /**
     * What each version brings, newest first: a few words in bold, then a sentence. Where a language lacks a version,
     * the dialog shows it in English. A release adds its version here (see docs/DEVELOPING.md).
     */
    versions: {
      "0.5.5": [
        {
          title: "FM 27.1.1.",
          text: "The update of 24 November is known on Game Pass, Steam and Mac, and everything works on it as before. When a future update comes out, the app keeps reading club finances and the tactic in use until a version that knows it follows.",
        },
        {
          title: "Competitions tab.",
          text: "See and change each competition's squad rules, such as how many foreign players a squad may register, for this season and the next apart. On Windows and Apple silicon Macs.",
        },
        {
          title: "Loans.",
          text: "The Transfer dialog's new Loan arranges a loan for the game's next day, in a transfer window or out of one. You set its last day, the share of his wage the other club pays, a monthly fee and, if you like, an option to buy. On Windows and Apple silicon Macs.",
        },
        {
          title: "Recipes.",
          text: "Ready-made sets of changes for a player or a club: Make a wonderkid, Injury-proof, Extend his career, Make the club rich and Top facilities. Each shows what it will change before anything is written, and one Undo takes it back.",
        },
        {
          title: "Development.",
          text: "The app keeps a weekly record of every player as it reads the game, and a player's profile shows it in a new Development tab: his ability, potential, value and attributes over your career.",
        },
        {
          title: "B teams.",
          text: "A club's Squad tab shows its B teams after its own teams, such as Castilla for Real Madrid, and the team actions work on them too.",
        },
        {
          title: "Shorter notes.",
          text: "The notes on buttons are a line each, in a small box instead of a long strip across the window.",
        },
      ],
      "0.5.4": [
        {
          title: "Transfers in the player's history.",
          text: "Transfer, now the first choice when you move a player, arranges the move for the game's next day. The game makes it as one of its own: it pays the fee and keeps the move in his career history, with this season's matches at his old club in a row of their own. Move now still moves him at once.",
        },
        {
          title: "Team at its best, and Destroy.",
          text: "In a club's Squad tab, one press heals, inspires and refreshes the whole team and takes its cohesion and tactic to the top; Destroy, after a question, does the opposite. One Undo takes either back, and the single actions are under More actions.",
        },
        {
          title: "Batch traits.",
          text: "Under More actions in a club's Squad tab, Batch traits gives every player of the team the traits you pick, or takes them away, and leaves the rest of their traits as they are. One Undo takes it back.",
        },
        {
          title: "Move all staff.",
          text: "A club's Staff tab moves its whole staff to another club at once, each in the same job, and one Undo brings them all back.",
        },
        {
          title: "National teams.",
          text: "A national team's senior squad gets Heal all, Inspire all and Refresh all, and its table shows energy, sharpness and morale.",
        },
        {
          title: "Sponsorship deals.",
          text: "A club's finances list its sponsorship deals, read only: what each pays per season and in all, its term, and what a relegation changes. On Game Pass 0.9.2524.0 so far.",
        },
        {
          title: "Fix.",
          text: "On some careers the staff check failed although the staff read right, which left staff read-only and refused healing, Max cohesion and Max tactics. It now passes.",
        },
      ],
      "0.5.3": [
        {
          title: "FM27's update of 17 November.",
          text: "On Windows and macOS, Game Pass 0.9.2524.0 and Steam build 26620374 are known builds, and the clubs' finances and the tactic your team plays are read again where the update moved them.",
        },
        {
          title: "National teams.",
          text: "The switch over the club list shows every nation's men's and women's teams: a team's squad, its youth teams (Under 21, Under 20 and the others) with theirs, and the reputation of each, which you can edit.",
        },
        {
          title: "League prize money.",
          text: "A club's overview shows what its league pays this season, by final position and per match, and the amounts can be changed for every club in the league until the season ends.",
        },
        {
          title: "Fix.",
          text: "A save whose youth players were born after 2020 no longer fails the check the editor makes before it writes.",
        },
      ],
      "0.5.2": [
        {
          title: "My club.",
          text: "The app opens on the club you manage: who needs a look, its money and the squad's actions, in one place. Without a club of your own, you can follow one.",
        },
        {
          title: "Command palette.",
          text: "Ctrl+K (⌘K on a Mac) finds a player, a member of staff, a club or a command, and shortcuts move between the tabs.",
        },
        {
          title: "Scouting.",
          text: "Opportunities in the market, players like one you would let go, a comparison with your no. 1 at his position, scout reports to save as a picture or a PDF, the squad on a pitch and the youth intakes.",
        },
        {
          title: "Rename a player.",
          text: "First, last, common and full name. The game keeps the new name in its saves.",
        },
        {
          title: "Contracts and staff.",
          text: "Extend a contract by five years in one click, or add years to many in a mass edit. Release a member of staff, or a club's whole staff, and bring them back with one Undo.",
        },
        {
          title: "Max tactics.",
          text: "In a club's Squad tab, it brings the team's tactical familiarity to the top. Reasons to be unhappy are now worded as the game words them.",
        },
        {
          title: "Your changes, kept.",
          text: "Each career's changes stay in the Changes tab after a restart, and you can search, filter and export them.",
        },
        {
          title: "Club filters.",
          text: "Nation, league and reputation; Mass edit and Export take the clubs the list shows.",
        },
        {
          title: "Russian and Japanese.",
          text: "Two more languages. Steam's update of 12 November is a known build too.",
        },
      ],
    } as Record<string, { title: string; text: string }[]>,
  },

  errors,
};

