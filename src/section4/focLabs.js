// AUTO-GENERATED from csv/foc1.csv (jing-yi branch). Do not edit by hand.
// Three First-order-circuit quiz packs: easy / average / challenging.
// Shaped for the Lesson component (pack mode): progress bar + leave prompt.

export const FOC_EASY = {
  key: "walk-foc-easy",
  topicName: "First order circuit",
  difficultyName: "Easy",
  familyId: "201",
  questions: [
    {
      id: "201-1",
      mainQuestion: "A capacitor has an initial voltage of 18 V. At \\(t=0\\), the switch is closed and the capacitor discharges through a \\(15\\,k\\Omega\\) resistor.\n\nFind:\n\n(a) The capacitor voltage \\(v_C(t)\\) for \\(t\\geq0\\).\n\n(b) The time constant \\(\\tau\\).\n\n(c) The voltage across the capacitor at \\(t=\\tau\\).\n\n(d) The energy stored in the capacitor at \\(t=2\\tau\\).",
      question: "Find the capacitor voltage $v_C(t)$ for $t \\geq 0$ given an initial voltage of $18\\text{ V}$, $R = 15\\text{ k}\\Omega$, and $C = 20\\text{ }\\mu\\text{F}$.",
      image: "/question-bank/foc/foc1.png",
      options: {
        a: "$v_C(t) = 15e^{-t/0.3}\\text{ V}$",
        b: "$v_C(t) = 18e^{-3.36t}\\text{ V}$",
        c: "$v_C(t) = 18e^{-t/0.3}\\text{ V}$",
        d: "$v_C(t) = 20e^{-t/0.3}\\text{ V}$",
      },
      answer: "c",
      explanation: "For a source-free $RC$ circuit, the voltage response is given by $v_C(t) = v_C(0)e^{-t/\\tau}$, where $\\tau = RC = (15 \\times 10^3 \\ \\Omega)(20 \\times 10^{-6}\\text{ F}) = 0.3\\text{ s}$. Substituting the initial voltage $v_C(0) = 18\\text{ V}$, we get $v_C(t) = 18e^{-t/0.3}\\text{ V}$.",
    },
    {
      id: "201-2",
      mainQuestion: "A capacitor has an initial voltage of 18 V. At \\(t=0\\), the switch is closed and the capacitor discharges through a \\(15\\,k\\Omega\\) resistor.\n\nFind:\n\n(a) The capacitor voltage \\(v_C(t)\\) for \\(t\\geq0\\).\n\n(b) The time constant \\(\\tau\\).\n\n(c) The voltage across the capacitor at \\(t=\\tau\\).\n\n(d) The energy stored in the capacitor at \\(t=2\\tau\\).",
      question: "Calculate the time constant $\\tau$ for the $RC$ circuit where $R = 15\\text{ k}\\Omega$ and $C = 20\\text{ }\\mu\\text{F}$.",
      image: "/question-bank/foc/foc1.png",
      options: {
        a: "$\\tau = 0.15\\text{ s}$",
        b: "$\\tau = 3.0\\text{ s}$",
        c: "$\\tau = 1.5\\text{ s}$",
        d: "$\\tau = 0.3\\text{ s}$",
      },
      answer: "d",
      explanation: "The time constant $\\tau$ of an $RC$ circuit is calculated as $\\tau = R \\times C$. Substituting the given values: $\\tau = (15 \\times 10^3\\text{ }\\Omega)(20 \\times 10^{-6}\\text{ F}) = 0.3\\text{ s}$.",
    },
    {
      id: "201-3",
      mainQuestion: "A capacitor has an initial voltage of 18 V. At \\(t=0\\), the switch is closed and the capacitor discharges through a \\(15\\,k\\Omega\\) resistor.\n\nFind:\n\n(a) The capacitor voltage \\(v_C(t)\\) for \\(t\\geq0\\).\n\n(b) The time constant \\(\\tau\\).\n\n(c) The voltage across the capacitor at \\(t=\\tau\\).\n\n(d) The energy stored in the capacitor at \\(t=2\\tau\\).",
      question: "Find the voltage across the capacitor at $t = \\tau$.",
      image: "/question-bank/foc/foc1.png",
      options: {
        a: "$v_C(\\tau) \\approx 11.37\\text{ V}$",
        b: "$v_C(\\tau) \\approx 3.32\\text{ V}$",
        c: "$v_C(\\tau) \\approx 2.44\\text{ V}$",
        d: "$v_C(\\tau) \\approx 6.62\\text{ V}$",
      },
      answer: "d",
      explanation: "Substitute $t = \\tau$ into the voltage equation: $v_C(\\tau) = 18e^{-\\tau/\\tau} = 18e^{-1} \\approx 18 \\times 0.367879 \\approx 6.62\\text{ V}$.",
    },
    {
      id: "201-4",
      mainQuestion: "A capacitor has an initial voltage of 18 V. At \\(t=0\\), the switch is closed and the capacitor discharges through a \\(15\\,k\\Omega\\) resistor.\n\nFind:\n\n(a) The capacitor voltage \\(v_C(t)\\) for \\(t\\geq0\\).\n\n(b) The time constant \\(\\tau\\).\n\n(c) The voltage across the capacitor at \\(t=\\tau\\).\n\n(d) The energy stored in the capacitor at \\(t=2\\tau\\).",
      question: "Find the energy stored in the capacitor at $t = 2\\tau$.",
      image: "/question-bank/foc/foc1.png",
      options: {
        a: "$w_C \\approx 245.1\\text{ }\\mu\\text{J}$",
        b: "$w_C \\approx 59.3\\text{ }\\mu\\text{J}$",
        c: "$w_C \\approx 30.5\\text{ }\\mu\\text{J}$",
        d: "$w_C \\approx 118.6\\text{ }\\mu\\text{J}$",
      },
      answer: "b",
      explanation: "First, find the voltage at $t = 2\\tau$: $v_C(2\\tau) = 18e^{-2} \\approx 2.436\\text{ V}$. Then, use the energy stored formula for a capacitor: $w_C = \\frac{1}{2}Cv_C^2 = \\frac{1}{2}(20 \\times 10^{-6}\\text{ F})(2.436\\text{ V})^2 \\approx 59.3\\text{ }\\mu\\text{J}$.",
    },
  ],
};

export const FOC_AVERAGE = {
  key: "walk-foc-average",
  topicName: "First order circuit",
  difficultyName: "Average",
  familyId: "202",
  questions: [
    {
      id: "202-1",
      mainQuestion: "An inductor has an initial current of 0.25 A. At \\(t=0\\), the switch is closed and the inductor discharges through a \\(40\\,\\Omega\\) resistor.\n\nFind:\n\n(a) The time constant.\n\n(b) The inductor current \\(i_L(t)\\).\n\n(c) The inductor current at \\(t=3\\tau\\).\n\n(d) The initial voltage across the inductor, using the passive sign convention.",
      question: "what is The time constant for the source-free RL circuit given an inductance $L = 0.8\\text{ H}$ and resistance $R = 40\\;\\Omega$?",
      image: "/question-bank/foc/foc3.jpg",
      options: {
        a: "$32\\text{ ms}$",
        b: "$20\\text{ ms}$",
        c: "$50\\text{ ms}$",
        d: "$10\\text{ ms}$",
      },
      answer: "b",
      explanation: "For a source-free RL circuit, the time constant $\\tau$ is given by $\\tau = \\frac{L}{R}$. Substituting $L = 0.8\\text{ H}$ and $R = 40\\;\\Omega$, we get $\\tau = \\frac{0.8}{40} = 0.020\\text{ s} = 20\\text{ ms}$.",
    },
    {
      id: "202-2",
      mainQuestion: "An inductor has an initial current of 0.25 A. At \\(t=0\\), the switch is closed and the inductor discharges through a \\(40\\,\\Omega\\) resistor.\n\nFind:\n\n(a) The time constant.\n\n(b) The inductor current \\(i_L(t)\\).\n\n(c) The inductor current at \\(t=3\\tau\\).\n\n(d) The initial voltage across the inductor, using the passive sign convention.",
      question: "what is The inductor current $i_L(t)$ given an initial current $i_L(0) = 0.25\\text{ A}$ and time constant $\\tau = 0.020\\text{ s}$?",
      image: "/question-bank/foc/foc3.jpg",
      options: {
        a: "$0.25e^{-20t}\\text{ A}$",
        b: "$2.0e^{-50t}\\text{ A}$",
        c: "$0.50e^{-20t}\\text{ A}$",
        d: "$0.25e^{-50t}\\text{ A}$",
      },
      answer: "d",
      explanation: "The natural response of an RL circuit is given by $i_L(t) = i_L(0)e^{-t/\\tau}$. Substituting $i_L(0) = 0.25\\text{ A}$ and $\\tau = 0.020\\text{ s}$, we obtain $i_L(t) = 0.25e^{-t/0.020} = 0.25e^{-50t}\\text{ A}$.",
    },
    {
      id: "202-3",
      mainQuestion: "An inductor has an initial current of 0.25 A. At \\(t=0\\), the switch is closed and the inductor discharges through a \\(40\\,\\Omega\\) resistor.\n\nFind:\n\n(a) The time constant.\n\n(b) The inductor current \\(i_L(t)\\).\n\n(c) The inductor current at \\(t=3\\tau\\).\n\n(d) The initial voltage across the inductor, using the passive sign convention.",
      question: "what is The inductor current at $t = 3\\tau$, given $i_L(t) = 0.25e^{-50t}\\text{ A}$?",
      image: "/question-bank/foc/foc3.jpg",
      options: {
        a: "$12.45\\text{ mA}$",
        b: "$124.5\\text{ mA}$",
        c: "$1.245\\text{ mA}$",
        d: "$50.2\\text{ mA}$",
      },
      answer: "a",
      explanation: "Substituting $t = 3\\tau$ into the current equation gives $i_L(3\\tau) = 0.25e^{-3}\\text{ A}$. Calculating this value yields $0.25 \\times 0.049787 \\approx 0.01245\\text{ A}$, which is approximately $12.45\\text{ mA}$.",
    },
    {
      id: "202-4",
      mainQuestion: "An inductor has an initial current of 0.25 A. At \\(t=0\\), the switch is closed and the inductor discharges through a \\(40\\,\\Omega\\) resistor.\n\nFind:\n\n(a) The time constant.\n\n(b) The inductor current \\(i_L(t)\\).\n\n(c) The inductor current at \\(t=3\\tau\\).\n\n(d) The initial voltage across the inductor, using the passive sign convention.",
      question: "what is The initial voltage across the inductor, using the passive sign convention, given $L = 0.8\\text{ H}$ and $i_L(t) = 0.25e^{-50t}\\text{ A}$?",
      image: "/question-bank/foc/foc3.jpg",
      options: {
        a: "-10 V",
        b: "$0\\text{ V}$",
        c: "$+10\\text{ V}$",
        d: "$-5\\text{ V}$",
      },
      answer: "a",
      explanation: "The inductor voltage is given by $v_L = L\\frac{di_L}{dt}$. Taking the derivative of $i_L(t) = 0.25e^{-50t}$ gives $\\frac{di_L}{dt} = -12.5e^{-50t}$. Multiplying by $L = 0.8\\text{ H}$ yields $v_L = -10e^{-50t}\\text{ V}$. At $t = 0^+$, the initial voltage is $v_L(0^+) = -10\\text{ V}$.",
    },
  ],
};

export const FOC_CHALLENGING = {
  key: "walk-foc-challenging",
  topicName: "First order circuit",
  difficultyName: "Challenging",
  familyId: "203",
  questions: [
    {
      id: "203-1",
      mainQuestion: "An initially uncharged capacitor is connected to a 10 V DC source through a \\(12\\,k\\Omega\\) resistor at \\(t=0\\).\n\nFind:\n\n(a) The time constant.\n\n(b) The capacitor voltage \\(v_C(t)\\).\n\n(c) The charging current \\(i(t)\\).\n\n(d) The capacitor voltage at \\(t=\\tau\\).\n\n(e) How long does it take for the capacitor voltage to reach \\(90\\%\\) of its final value?",
      question: "How do we calculate the time constant $\\tau$ of the RC circuit given a resistance $R = 12\\text{ k}\\Omega$ and capacitance $C = 25\\, \\mu\\text{F}$?",
      image: "/question-bank/foc/foc3.jpg",
      options: {
        a: "$\\tau = \\frac{1}{RC} = 3.33\\text{ s}$",
        b: "$\\tau = R \\times C = 0.30\\text{ s}$",
        c: "$\\tau = \\frac{R}{C} = 0.48\\text{ s}$",
        d: "$\\tau = R + C = 12.025\\text{ s}$",
      },
      answer: "b",
      explanation: "The time constant $\\tau$ for a series RC circuit is given by the product of resistance and capacitance: $\\tau = RC$. Substituting the given values: $\\tau = (12 \\times 10^3\\ \\Omega)(25 \\times 10^{-6}\\text{ F}) = 0.30\\text{ s}$.",
    },
    {
      id: "203-2",
      mainQuestion: "An initially uncharged capacitor is connected to a 10 V DC source through a \\(12\\,k\\Omega\\) resistor at \\(t=0\\).\n\nFind:\n\n(a) The time constant.\n\n(b) The capacitor voltage \\(v_C(t)\\).\n\n(c) The charging current \\(i(t)\\).\n\n(d) The capacitor voltage at \\(t=\\tau\\).\n\n(e) How long does it take for the capacitor voltage to reach \\(90\\%\\) of its final value?",
      question: "What are the initial $v_C(0)$ and final $v_C(\\infty)$ values of the capacitor voltage when the switch closes at $t = 0$ in a circuit connected to a $10\\text{ V}$ DC source and initially uncharged?",
      image: "/question-bank/foc/foc3.jpg",
      options: {
        a: "$v_C(0) = 0\\text{ V}, \\ v_C(\\infty) = 0\\text{ V}$",
        b: "$v_C(0) = 10\\text{ V}, \\ v_C(\\infty) = 0\\text{ V}$",
        c: "$v_C(0) = 5\\text{ V}, \\ v_C(\\infty) = 5\\text{ V}$",
        d: "$v_C(0) = 0\\text{ V}, \\ v_C(\\infty) = 10\\text{ V}$",
      },
      answer: "d",
      explanation: "Since the capacitor is initially uncharged, the initial voltage is $v_C(0) = 0\\text{ V}$. As $t \\to \\infty$, the capacitor becomes fully charged to the DC source voltage, so the final steady-state voltage is $v_C(\\infty) = 10\\text{ V}$.",
    },
    {
      id: "203-3",
      mainQuestion: "An initially uncharged capacitor is connected to a 10 V DC source through a \\(12\\,k\\Omega\\) resistor at \\(t=0\\).\n\nFind:\n\n(a) The time constant.\n\n(b) The capacitor voltage \\(v_C(t)\\).\n\n(c) The charging current \\(i(t)\\).\n\n(d) The capacitor voltage at \\(t=\\tau\\).\n\n(e) How long does it take for the capacitor voltage to reach \\(90\\%\\) of its final value?",
      question: "How can we use the general step response formula $v_C(t) = v_C(\\infty) + [v_C(0) - v_C(\\infty)]e^{-t/\\tau}$ to express the capacitor voltage $v_C(t)$?",
      image: "/question-bank/foc/foc3.jpg",
      options: {
        a: "$v_C(t) = 10(1 + e^{-t/0.30})\\text{ V}$",
        b: "$v_C(t) = 5(1 - e^{-t/0.30})\\text{ V}$",
        c: "$v_C(t) = 10e^{-t/0.30}\\text{ V}$",
        d: "$v_C(t) = 10(1 - e^{-t/0.30})\\text{ V}$",
      },
      answer: "d",
      explanation: "Substituting $v_C(0) = 0$, $v_C(\\infty) = 10\\text{ V}$, and $\\tau = 0.30\\text{ s}$ into the general formula gives: $v_C(t) = 10 + (0 - 10)e^{-t/0.30} = 10(1 - e^{-t/0.30})\\text{ V}$.",
    },
    {
      id: "203-4",
      mainQuestion: "An initially uncharged capacitor is connected to a 10 V DC source through a \\(12\\,k\\Omega\\) resistor at \\(t=0\\).\n\nFind:\n\n(a) The time constant.\n\n(b) The capacitor voltage \\(v_C(t)\\).\n\n(c) The charging current \\(i(t)\\).\n\n(d) The capacitor voltage at \\(t=\\tau\\).\n\n(e) How long does it take for the capacitor voltage to reach \\(90\\%\\) of its final value?",
      question: "Using Ohm's law and the capacitor voltage equation, how do we determine the charging current $i(t)$ through the circuit?",
      image: "/question-bank/foc/foc3.jpg",
      options: {
        a: "$i(t) = \\frac{v_C(t) - 10}{R}$",
        b: "$i(t) = \\frac{10 - v_C(t)}{R}$",
        c: "$i(t) = \\frac{10}{R}e^{t/\\tau}$",
        d: "$i(t) = \\frac{v_C(t)}{R}$",
      },
      answer: "b",
      explanation: "The current flowing through the resistor from the $10\\text{ V}$ source to the capacitor is given by Ohm's law using the voltage drop across the resistor: $i(t) = \\frac{10 - v_C(t)}{12\\text{ k}\\Omega}$. Substituting $v_C(t)$ yields $i(t) = 0.833e^{-t/0.30}\\text{ mA}$.",
    },
    {
      id: "203-5",
      mainQuestion: "An initially uncharged capacitor is connected to a 10 V DC source through a \\(12\\,k\\Omega\\) resistor at \\(t=0\\).\n\nFind:\n\n(a) The time constant.\n\n(b) The capacitor voltage \\(v_C(t)\\).\n\n(c) The charging current \\(i(t)\\).\n\n(d) The capacitor voltage at \\(t=\\tau\\).\n\n(e) How long does it take for the capacitor voltage to reach \\(90\\%\\) of its final value?",
      question: "How do we set up an equation to find the exact time it takes for the capacitor voltage to reach $90\\%$ of its final value ($10\\text{ V}$)?",
      image: "/question-bank/foc/foc3.jpg",
      options: {
        a: "$0.9 = 10(1 - e^{-t/0.30})$",
        b: "$1 = 10(1 - e^{-t/0.30})$",
        c: "$9 = 10e^{-t/0.30}$",
        d: "$9 = 10(1 - e^{-t/0.30})$",
      },
      answer: "d",
      explanation: "$90\\%$ of the final value of $10\\text{ V}$ is $9\\text{ V}$. Setting $v_C(t) = 9$ in the voltage equation gives $9 = 10(1 - e^{-t/0.30})$. Solving this yields $t = -0.30\\ln(0.1) \\approx 0.691\\text{ s}$.",
    },
  ],
};

