function qc(prompt, a, b, c, answer, why) {
  return { prompt, options: { a, b, c }, answer, why };
}

export const BASICS = {
  steps: [
    {
      id: "why-laplace",
      view: "map",
      highlight: "all",
      title: "Why move to the s-domain?",
      boardHint: "s is a generalized complex frequency.",
      body: "We normally describe a circuit with signals such as $v(t)$ and $i(t)$. Laplace transform maps the time-domain function $f(t)$ to an s-domain function $F(s)$.",
      points: [
        "Differential and integral equations become algebraic equations.",
        "Initial conditions can be carried into the calculation.",
        "Natural and forced response can be handled in one calculation.",
      ],
      eq: "$$f(t)\\;\\Longleftrightarrow\\;F(s),\\qquad s=\\sigma+j\\omega$$",
      check: qc(
        "What is the main advantage of moving a circuit problem into the s-domain?",
        "Differential equations can be handled as algebraic equations.",
        "All initial conditions become zero automatically.",
        "Every capacitor and inductor can be deleted.",
        "a",
        "Laplace turns derivatives and integrals into algebraic s-terms. Initial conditions are included rather than erased."
      ),
    },
    {
      id: "unilateral",
      view: "unilateral",
      highlight: "map",
      title: "The unilateral Laplace transform",
      boardHint: "Negative-time history is not integrated. 0⁻ is just before t = 0.",
      body: "EE2101 uses the one-sided (unilateral) Laplace transform. The lower limit $0^-$ means a time just before $t=0$, so switching effects and initial conditions at the origin can be included.",
      eq: "$$F(s)=\\displaystyle\\int_{0^{-}}^{\\infty} f(t)\\,e^{-st}\\,dt$$",
      points: [
        "$f(t)$ for $t<0$ is not part of the transformed waveform.",
        "A known pair $f(t)\\Longleftrightarrow F(s)$ is usually matched from a table instead of re-integrating every time.",
      ],
      check: qc(
        "Why does the unilateral transform use a lower limit written as $0^-$?",
        "To force $s$ to be purely real.",
        "To include jumps and initial-condition information at $t=0$.",
        "To integrate the entire negative-time waveform.",
        "b",
        "$0^-$ means just before the switching instant. It captures what is needed at the origin without turning the transform into a negative-time integral."
      ),
    },
    {
      id: "core-pairs",
      view: "pairs",
      highlight: "all",
      title: "Core transform pairs",
      boardHint: "Match the time shape to a table entry instead of integrating.",
      body: "Start by recognizing common shapes. These are the pairs used repeatedly in the lecture examples.",
      eq: [
        "$$\\delta(t)\\;\\Longleftrightarrow\\;1$$",
        "$$u(t)\\;\\Longleftrightarrow\\;\\dfrac{1}{s}$$",
        "$$e^{-at}u(t)\\;\\Longleftrightarrow\\;\\dfrac{1}{s+a}$$",
        "$$t\\,u(t)\\;\\Longleftrightarrow\\;\\dfrac{1}{s^2}$$",
      ],
      check: qc(
        "What is $\\mathcal{L}\\{e^{-3t}u(t)\\}$?",
        "$1/s^3$.",
        "$1/(s-3)$.",
        "$1/(s+3)$.",
        "c",
        "$e^{-at}u(t)\\Longleftrightarrow1/(s+a)$. Here $a=3$."
      ),
    },
    {
      id: "trig-pairs",
      view: "trig-pairs",
      highlight: "all",
      title: "Sine and cosine pairs",
      boardHint: "Cosine keeps s in the numerator. Sine keeps ω.",
      body: "Sine and cosine are also standard table entries. A useful memory cue is that cosine keeps an $s$ in the numerator, while sine keeps $\\omega$.",
      eq: [
        "$$\\sin(\\omega t)u(t)\\;\\Longleftrightarrow\\;\\dfrac{\\omega}{s^2+\\omega^2}$$",
        "$$\\cos(\\omega t)u(t)\\;\\Longleftrightarrow\\;\\dfrac{s}{s^2+\\omega^2}$$",
      ],
      check: qc(
        "Which s-domain expression corresponds to $\\cos(4t)u(t)$?",
        "$4/(s^2+16)$.",
        "$s/(s^2+16)$.",
        "$1/(s+4)$.",
        "b",
        "Cosine has $s$ in the numerator. $4/(s^2+16)$ is the sine pair."
      ),
    },
    {
      id: "shifts",
      view: "shifts",
      highlight: "all",
      title: "Do not mix up the two shifts",
      boardHint: "Delay multiplies by e^{-as}. e^{-at}f(t) replaces s by s+a.",
      body: "Time shift and frequency shift look similar but do different things.",
      eq: [
        "$$f(t-a)u(t-a)\\;\\Longleftrightarrow\\;e^{-as}F(s)$$",
        "$$e^{-at}f(t)u(t)\\;\\Longleftrightarrow\\;F(s+a)$$",
      ],
      points: [
        "Time shift: the waveform waits until $t=a$.",
        "Frequency shift: multiplying the time function by $e^{-at}$ replaces $s$ by $s+a$.",
      ],
      check: qc(
        "If $f(t)\\Longleftrightarrow F(s)$, what is the transform of $f(t-2)u(t-2)$?",
        "$e^{-2s}F(s)$.",
        "$F(s+2)$.",
        "$2F(s)$.",
        "a",
        "A delay in time multiplies the transform by $e^{-as}$. Replacing $s$ by $s+a$ is frequency shift instead."
      ),
    },
    {
      id: "derivatives",
      view: "derivative",
      highlight: "all",
      title: "Derivatives carry initial conditions",
      boardHint: "Differentiation becomes ×s, minus the starting value.",
      body: "This is the property that makes Laplace especially useful for circuits. Differentiation becomes multiplication by $s$, plus explicit initial-condition terms.",
      eq: [
        "$$\\mathcal{L}\\{f'(t)\\}=sF(s)-f(0^-)$$",
        "$$\\mathcal{L}\\{f''(t)\\}=s^2F(s)-s f(0^-)-f'(0^-)$$",
        "$$\\mathcal{L}\\left\\{\\displaystyle\\int_{0}^{t} f(\\tau)\\,d\\tau\\right\\}=\\dfrac{F(s)}{s}$$",
      ],
      check: qc(
        "If $f(0^-)=2$, then $\\mathcal{L}\\{f'(t)\\}$ is",
        "$F(s)/s$.",
        "$sF(s)+2$.",
        "$sF(s)-2$.",
        "c",
        "Use $\\mathcal{L}\\{f'\\}=sF-f(0^-)$. The initial value is subtracted."
      ),
    },
    {
      id: "initial-final",
      view: "initial-final",
      highlight: "all",
      title: "Initial and final values from F(s)",
      boardHint: "Final-value theorem only when a finite final limit exists.",
      body: "Sometimes you can read the endpoints without performing the full inverse transform. Use the final-value theorem only when the time function actually settles to a finite final value.",
      eq: [
        "$$f(0^+)=\\displaystyle\\lim_{s\\to\\infty}sF(s)$$",
        "$$f(\\infty)=\\displaystyle\\lim_{s\\to 0}sF(s)$$",
      ],
      check: qc(
        "For $F(s)=5/(s+5)$, what are the initial and final values?",
        "$f(0^+)=5$ and $f(\\infty)=0$.",
        "$f(0^+)=0$ and $f(\\infty)=5$.",
        "$f(0^+)=1$ and $f(\\infty)=1$.",
        "a",
        "$\\lim_{s\\to\\infty}5s/(s+5)=5$, while $\\lim_{s\\to0}5s/(s+5)=0$."
      ),
    },
    {
      id: "inverse-pfe",
      view: "pfe",
      highlight: "all",
      title: "Inverse Laplace: split into table terms",
      boardHint: "PFE, then match each simple fraction to a pair.",
      body: [
        "For rational $F(s)$, partial-fraction expansion turns one complicated fraction into a sum of transform-table entries. If the numerator degree is not smaller than the denominator degree, long-divide first.",
        "$$F(s)=\\dfrac{3}{(s+1)(s+2)}=\\dfrac{3}{s+1}-\\dfrac{3}{s+2}$$",
        "$$f(t)=3\\left(e^{-t}-e^{-2t}\\right)u(t)$$",
      ],
      check: qc(
        "For $3/[(s+1)(s+2)]$, what is the coefficient of $1/(s+1)$?",
        "$1$.",
        "$3$.",
        "$-3$.",
        "b",
        "Cover the $(s+1)$ factor and evaluate the rest at $s=-1$: $3/(s+2)|_{s=-1}=3$."
      ),
    },
    {
      id: "inverse-shapes",
      view: "inverse-shapes",
      highlight: "all",
      title: "Repeated and complex denominator shapes",
      boardHint: "Match the denominator shape to the table. Poles come next.",
      body: [
        "You do not need a new method for every inverse. Match the denominator shape to the transform table.",
        "These shapes will later connect naturally to pole locations.",
      ],
      eq: [
        "$$\\dfrac{1}{(s+a)^2}\\;\\Longleftrightarrow\\;t e^{-at}u(t)$$",
        "$$\\dfrac{s+a}{(s+a)^2+\\omega^2}\\;\\Longleftrightarrow\\;e^{-at}\\cos(\\omega t)u(t)$$",
        "$$\\dfrac{\\omega}{(s+a)^2+\\omega^2}\\;\\Longleftrightarrow\\;e^{-at}\\sin(\\omega t)u(t)$$",
      ],
      check: qc(
        "What is $\\mathcal{L}^{-1}\\{1/(s+2)^2\\}$?",
        "$2e^{-2t}u(t)$.",
        "$e^{-2t}u(t)$.",
        "$t e^{-2t}u(t)$.",
        "c",
        "A repeated factor $(s+a)^2$ produces the extra factor of $t$."
      ),
    },
  ],
};

export const CIRCUIT = {
  steps: [
    {
      id: "circuit-workflow",
      view: "workflow",
      highlight: "all",
      title: "The circuit workflow",
      boardHint: "Same circuit laws, different element models.",
      points: [
        "Transform the time-domain circuit into the s-domain.",
        "Solve the s-domain circuit using the same circuit-analysis tools you already know.",
        "Take the inverse Laplace transform to return to the time domain.",
      ],
      body: "Nodal analysis, mesh analysis, source transformation, superposition and the other circuit relationships still work in the s-domain.",
      eq: "$$\\text{time circuit}\\xrightarrow{\\mathcal L}\\text{s-domain algebra}\\xrightarrow{\\mathcal L^{-1}}\\text{time response}$$",
      check: qc(
        "After transforming a circuit to the s-domain, which analysis methods are still valid?",
        "Nodal, mesh, source transformation and superposition.",
        "Only Ohm's law; KCL and KVL stop working.",
        "None; the circuit must be solved from the Laplace integral.",
        "a",
        "The element models change, but the circuit laws and theorems still apply."
      ),
    },
    {
      id: "zero-ic-elements",
      view: "elements",
      highlight: "all",
      title: "R, L and C with zero initial conditions",
      boardHint: "Zero IC: treat each element as an s-domain impedance.",
      body: "When the capacitor voltage and inductor current start at zero, each element can be treated like an s-domain impedance.",
      eq: [
        "$$Z_R=R$$",
        "$$Z_L=sL$$",
        "$$Z_C=\\dfrac{1}{sC}$$",
        "$$V(s)=I(s)Z(s)$$",
      ],
      check: qc(
        "With zero initial conditions, what impedance represents a capacitor?",
        "$sL$.",
        "$1/(sC)$.",
        "$sC$.",
        "b",
        "$1/(sC)$ is the capacitor impedance. $sC$ is its admittance."
      ),
    },
    {
      id: "inductor-ic",
      view: "inductor-ic",
      highlight: "all",
      title: "Inductor with a non-zero initial current",
      boardHint: "V = sL I − L i(0⁻). Plus of the IC source is on the current-exit side.",
      body: "Because $v=L\\,di/dt$, the derivative rule carries $i_L(0^-)$ into the s-domain equation.",
      eq: [
        "$$V_L(s)=L[sI(s)-i_L(0^-)]$$",
        "$$V_L(s)=sL I(s)-L i_L(0^-)$$",
      ],
      check: qc(
        "If $L=2\\,H$ and $i_L(0^-)=3\\,A$, which term appears in $V_L(s)=sLI-\\text{?}$?",
        "$2s$.",
        "$3/s$.",
        "$6$.",
        "c",
        "The initial-condition term is $L i_L(0^-)=2\\times3=6$."
      ),
    },
    {
      id: "capacitor-ic",
      view: "capacitor-ic",
      highlight: "all",
      title: "Capacitor with a non-zero initial voltage",
      boardHint: "Series model: V = I/(sC) + v_C(0⁻)/s, same polarity as v_C.",
      body: "The capacitor derivative relation does the same thing for the starting voltage.",
      eq: [
        "$$I_C(s)=sC V(s)-C v_C(0^-)$$",
        "$$V_C(s)=\\dfrac{I(s)}{sC}+\\dfrac{v_C(0^-)}{s}$$",
      ],
      check: qc(
        "With $v_C(0^-)=4\\,V$, which source term appears in the series s-domain capacitor model?",
        "$4/s$.",
        "$4s$.",
        "$C/4$.",
        "a",
        "The series-form capacitor equation is $V=I/(sC)+v_C(0^-)/s$."
      ),
    },
    {
      id: "find-initial",
      view: "initial-dc",
      highlight: "all",
      title: "If the initial condition is not given",
      boardHint: "DC just before switching: C open, L short.",
      body: "Find it from the circuit just before switching.",
      points: [
        "For DC steady state at $t=0^-$: capacitor -> open circuit.",
        "For DC steady state at $t=0^-$: inductor -> short circuit.",
        "Find $v_C(0^-)$ and $i_L(0^-)$.",
        "Then build the $t>0$ s-domain circuit using those values.",
      ],
      check: qc(
        "At long-time DC just before switching, how do you find the initial conditions?",
        "Set both capacitor voltage and inductor current to zero.",
        "Treat C as open and L as short.",
        "Treat C as short and L as open.",
        "b",
        "That is the same DC steady-state behavior used in the earlier transient walkthroughs."
      ),
    },
    {
      id: "worked-rc",
      view: "rc-worked",
      highlight: "all",
      title: "Worked example: RC step in the s-domain",
      boardHint: "10u(t) V, R = 2 Ω, C = 0.5 F, v_C(0⁻) = 0.",
      body: "Transform each part first.",
      eq: [
        "$$V_s(s)=\\dfrac{10}{s}$$",
        "$$Z_C=\\dfrac{1}{sC}=\\dfrac{2}{s}$$",
        "$$V_C(s)=\\dfrac{10}{s}\\,\\dfrac{2/s}{2+2/s}=\\dfrac{10}{s(s+1)}$$",
      ],
      check: qc(
        "For this circuit, which expression is $V_C(s)$?",
        "$10s/(s+1)$.",
        "$10/(s+1)$.",
        "$10/[s(s+1)]$.",
        "c",
        "The step source contributes $1/s$, and the RC divider contributes the additional $(s+1)$ factor."
      ),
    },
    {
      id: "worked-rc-inverse",
      view: "rc-response",
      highlight: "all",
      title: "Return to the time domain",
      boardHint: "τ = RC = 1 s. The curve is near 6.32 V at t = 1 s.",
      body: "This is the same first-order charging result you already know. Here $\\tau=RC=(2)(0.5)=1$ s.",
      eq: [
        "$$\\dfrac{10}{s(s+1)}=\\dfrac{10}{s}-\\dfrac{10}{s+1}$$",
        "$$v_C(t)=10(1-e^{-t})u(t)\\;\\text{V}$$",
      ],
      check: qc(
        "What final value does the s-domain result predict?",
        "$10\\,V$.",
        "$0\\,V$.",
        "$1\\,V$.",
        "a",
        "$10(1-e^{-t})$ approaches $10$ V as $t\\to\\infty$, matching the DC steady-state circuit."
      ),
    },
    {
      id: "worked-rl-ic",
      view: "rl-worked",
      highlight: "all",
      title: "Worked example: RL with a non-zero initial current",
      boardHint: "6u(t) V, R = 2 Ω, L = 1 H, i_L(0⁻) = 1 A.",
      body: "KVL in s: $\\dfrac{6}{s}=2I(s)+[sI(s)-1]$.",
      eq: [
        "$$I(s)=\\dfrac{s+6}{s(s+2)}=\\dfrac{3}{s}-\\dfrac{2}{s+2}$$",
        "$$i_L(t)=\\left(3-2e^{-2t}\\right)u(t)\\;\\text{A}$$",
      ],
      points: [
        "$i_L(0^+)=1$ A.",
        "$i_L(\\infty)=6/2=3$ A.",
        "The s-domain answer agrees with the first-order RL result.",
      ],
      check: qc(
        "What are the initial and final currents in this example?",
        "$3\\,A$ initially and $1\\,A$ finally.",
        "$1\\,A$ initially and $3\\,A$ finally.",
        "$0\\,A$ initially and $3\\,A$ finally.",
        "b",
        "Inductor current is continuous at the switch, so it starts at 1 A. At final DC the inductor is a short, leaving $6/2=3$ A."
      ),
    },
  ],
};

export const TRANSFER = {
  steps: [
    {
      id: "definition",
      view: "tf-block",
      highlight: "all",
      title: "What is a transfer function?",
      boardHint: "H(s) is defined with zero initial energy.",
      body: "A transfer function describes how a circuit maps an input to an output in the s-domain, assuming zero initial energy.",
      eq: "$$H(s)=\\dfrac{Y(s)}{X(s)}$$",
      points: [
        "Input: $X(s)$.",
        "System/circuit: $H(s)$.",
        "Output: $Y(s)$.",
        "Transfer functions are defined using zero initial conditions.",
      ],
      check: qc(
        "When defining a circuit transfer function $H(s)$, the initial stored energy is",
        "included as an extra input but still called part of $H(s)$.",
        "always maximum.",
        "zero.",
        "c",
        "$H(s)$ is a property of the circuit itself, so it is defined with zero initial conditions."
      ),
    },
    {
      id: "types",
      view: "tf-types",
      highlight: "all",
      title: "The ratio depends on what you call input and output",
      boardHint: "Units follow the chosen input and output.",
      body: "They are all input/output relationships. The units can therefore differ.",
      eq: [
        "$$\\text{Voltage gain: }\\dfrac{V_o(s)}{V_i(s)}$$",
        "$$\\text{Current gain: }\\dfrac{I_o(s)}{I_i(s)}$$",
        "$$\\text{Impedance: }\\dfrac{V(s)}{I(s)}$$",
        "$$\\text{Admittance: }\\dfrac{I(s)}{V(s)}$$",
      ],
      check: qc(
        "If the output is voltage and the input is current, $Y(s)/X(s)$ has the form of",
        "impedance.",
        "admittance.",
        "current gain.",
        "a",
        "Voltage divided by current is impedance."
      ),
    },
    {
      id: "derive-rc",
      view: "tf-rc",
      highlight: "all",
      title: "Example: RC low-pass transfer function",
      boardHint: "Voltage division with Z_C = 1/(sC).",
      body: "Nothing new happened to voltage division. We simply used the s-domain impedance of C.",
      eq: [
        "$$Z_C=\\dfrac{1}{sC}$$",
        "$$H(s)=\\dfrac{V_o(s)}{V_i(s)}=\\dfrac{Z_C}{R+Z_C}=\\dfrac{1}{1+sRC}$$",
      ],
      check: qc(
        "For this RC circuit, what is the DC value $H(0)$?",
        "$\\infty$.",
        "$1$.",
        "$0$.",
        "b",
        "At DC the capacitor is open, so the output reaches the input. Substituting $s=0$ into $1/(1+sRC)$ also gives 1."
      ),
    },
    {
      id: "impulse-response",
      view: "impulse-response",
      highlight: "all",
      title: "H(s) and the impulse response",
      boardHint: "h(t) is the inverse Laplace transform of H(s).",
      body: "The inverse Laplace transform of the transfer function is the unit impulse response $h(t)$.",
      eq: [
        "$$h(t)=\\mathcal{L}^{-1}\\{H(s)\\}$$",
        "$$\\dfrac{1}{1+sRC}=\\dfrac{1/RC}{s+1/RC}$$",
        "$$h(t)=\\dfrac{1}{RC}e^{-t/RC}u(t)$$",
      ],
      check: qc(
        "If $H(s)=5/(s+5)$, what is $h(t)$?",
        "$5(1-e^{-5t})u(t)$.",
        "$e^{-5t}u(t)$.",
        "$5e^{-5t}u(t)$.",
        "c",
        "$h(t)$ is the inverse LT of H(s), and $1/(s+5)\\Longleftrightarrow e^{-5t}u(t)$."
      ),
    },
    {
      id: "input-output",
      view: "tf-output",
      highlight: "all",
      title: "Input times H(s) gives output",
      boardHint: "Multiply in s. Convolution in time.",
      body: [
        "Multiplication in the s-domain corresponds to convolution in time. For circuit work, multiplying $H(s)$ by the transformed input is usually the easier route.",
        "For the RC transfer function with a unit step, $X(s)=1/s$, so $Y(s)=\\dfrac{1}{s(1+sRC)}$ and $y(t)=\\left(1-e^{-t/RC}\\right)u(t)$.",
      ],
      eq: [
        "$$Y(s)=H(s)X(s)$$",
        "$$y(t)=h(t)*x(t)$$",
      ],
      check: qc(
        "What is the s-domain input for a unit step?",
        "$1/s$.",
        "$1$.",
        "$s$.",
        "a",
        "$u(t)\\Longleftrightarrow1/s$. Therefore a step response is obtained from $Y(s)=H(s)/s$."
      ),
    },
    {
      id: "bridge-next",
      view: "tf-bridge",
      highlight: "all",
      title: "What H(s) tells us next",
      boardHint: "Numerator roots are zeros. Denominator roots are poles.",
      body: [
        "A transfer function is usually a rational function of $s$. The roots of its numerator and denominator reveal important behavior.",
        "The next section focuses on those ideas.",
      ],
      eq: "$$H(s)=\\dfrac{N(s)}{D(s)}$$",
      points: [
        "Roots of $N(s)$ are zeros.",
        "Roots of $D(s)$ are poles.",
        "The pole locations are closely tied to stability.",
        "For sinusoidal steady state, the later frequency-domain view evaluates the same $H(s)$ on the line $s=j\\omega$.",
      ],
    },
  ],
};
