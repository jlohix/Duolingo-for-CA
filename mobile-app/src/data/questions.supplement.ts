import type { Question, OptionKey } from '../types';

const QB = 'https://raw.githubusercontent.com/jlohix/Duolingo-for-CA/main/question-bank';

// Hand-authored questions for topics that have image banks in the repo but no CSV.
// Images reference the repo's real question-bank folders (thevenin, norton, maxp, nmanalysis, supernode).
type Row = [
  string, number, string, string, string, string, string,
  OptionKey, string, string, number, string?
];

const ROWS: Row[] = [
  // ───────────── NETWORK THEOREMS (topic 3): Thevenin / Norton / Max Power ─────────────
  ['th-1', 3, 'To find the Thevenin equivalent at terminals a-b, the independent sources are:',
    'All opened', 'All shorted', 'Voltage sources shorted, current sources opened', 'Left active', 'optionC',
    `${QB}/thevenin/thq1.png`,
    'For $R_{th}$, deactivate independent sources: replace voltage sources with a short circuit and current sources with an open circuit.',
    1, 'custom'],
  ['th-2', 3, 'The Thevenin voltage $V_{th}$ is defined as the voltage measured at terminals a-b when they are:',
    'Short-circuited', 'Open-circuited', 'Connected to $R_L$', 'Grounded', 'optionB',
    `${QB}/thevenin/thq2.png`,
    '$V_{th}$ is the open-circuit voltage across the terminals with the load removed.',
    1, 'custom'],
  ['th-3', 3, 'A circuit contains a dependent source. How is $R_{th}$ best found?',
    'Series/parallel reduction', 'Apply a test source: $R_{th}=V_T/I_T$', 'Short every source', 'It cannot be found', 'optionB',
    `${QB}/thevenin/thq3.png`,
    'With dependent sources present, deactivate the independent sources, apply a 1 V (or 1 A) test source at the terminals, and compute $R_{th}=V_T/I_T$.',
    2, 'custom'],
  ['nt-1', 3, 'The Norton current $I_N$ is the current through the terminals when they are:',
    'Open', 'Short-circuited', 'Loaded with $R_N$', 'Left floating', 'optionB',
    `${QB}/norton/ntq1.png`,
    '$I_N$ is the short-circuit current at the terminals; the Norton equivalent is $I_N$ in parallel with $R_N=R_{th}$.',
    1, 'custom'],
  ['nt-2', 3, 'For $3\\,\\Omega\\parallel 6\\,\\Omega$ in series with $10\\,\\Omega$, the Norton resistance is:',
    '$12\\,\\Omega$', '$2\\,\\Omega$', '$15\\,\\Omega$', '$19\\,\\Omega$', 'optionA',
    `${QB}/norton/ntq2.png`,
    '$3\\parallel 6 = \\tfrac{18}{9}=2\\,\\Omega$; in series with $10\\,\\Omega$ gives $R_N = 12\\,\\Omega$.',
    1, 'custom'],
  ['mp-1', 3, 'Maximum power is delivered to a load $R_L$ when:',
    '$R_L = 0$', '$R_L = R_{th}$', '$R_L \\to \\infty$', '$R_L = 2R_{th}$', 'optionB',
    `${QB}/maxp/maxpq1.png`,
    'The maximum power transfer theorem: power is maximised when $R_L = R_{th}$.',
    1, 'custom'],
  ['mp-2', 3, 'With $V_{th}=22\\,$V and $R_{th}=9\\,\\Omega$, the maximum power to the load is:',
    '13.44 W', '15.00 W', '26.9 W', '10.44 W', 'optionA',
    `${QB}/maxp/maxpq1.png`,
    '$P_{max}=\\dfrac{V_{th}^2}{4R_{th}}=\\dfrac{22^2}{36}\\approx 13.44\\,$W.',
    2, 'custom'],

  // ───────────── NODAL & MESH (topic 4) ─────────────
  ['nm-1', 4, 'Nodal analysis applies which law at each non-reference node?',
    'KVL', 'KCL', "Ohm's law only", "Faraday's law", 'optionB',
    `${QB}/nmanalysis/nmanalysis1.png`,
    'Nodal analysis writes KCL (sum of currents = 0) at each essential node except the chosen reference (ground).',
    1, 'custom'],
  ['nm-2', 4, 'Mesh analysis writes equations using:',
    'KCL at nodes', 'KVL around loops', 'Superposition', 'Source transformation', 'optionB',
    `${QB}/nmanalysis/nmanalysis2.png`,
    'Mesh analysis applies KVL around each independent loop, solving for mesh currents.',
    1, 'custom'],
  ['sn-1', 4, 'A supernode is required when:',
    'A resistor joins two nodes', 'A voltage source connects two non-reference nodes', 'A current source is present', 'Two meshes share a resistor', 'optionB',
    `${QB}/supernode/supernode1.png`,
    'When a voltage source sits between two non-reference nodes, enclose both nodes in a supernode and add the source voltage as a constraint equation.',
    2, 'custom'],
  ['nm-3', 4, 'For a planar network with $b$ branches and $n$ nodes, the number of independent mesh equations is:',
    '$n-1$', '$b-n+1$', '$b+n$', '$b-1$', 'optionB',
    `${QB}/nmanalysis/nmanalysis3.png`,
    'Independent loops (mesh equations) $= b-n+1$; independent node equations $= n-1$.',
    3, 'custom'],
];

export const SUPPLEMENT: Question[] = ROWS.map((r) => ({
  id: r[0],
  topicId: r[1],
  question: r[2],
  optionA: r[3],
  optionB: r[4],
  optionC: r[5],
  optionD: r[6],
  answer: r[7],
  image: r[8] || undefined,
  explanation: r[9],
  difficulty: r[10],
  walkthroughTag: r[11] || undefined,
}));
