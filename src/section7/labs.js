function qc(prompt, a, b, c, answer, why) {
  return { prompt, options: { a, b, c }, answer, why };
}

export const TYPES = {
  steps: [
    {
      id: "network-function",
      view: "network-function",
      highlight: "all",
      title: "From transfer function to network function",
      body: "You already know the zero-initial-condition transfer function $H(s)=Y(s)/X(s)$. In this lecture, that input-output relationship is called a network function.",
      points: [
        "Choose one input.",
        "Choose the response you care about.",
        "The network function relates their Laplace transforms.",
        "The definition assumes zero initial conditions.",
      ],
      eq: "$$H(s)=\\dfrac{Y(s)}{X(s)}$$",
      check: qc(
        "If $Y(s)=\\dfrac{3}{s+4}X(s)$, what is the network function?",
        "$\\dfrac{s+4}{3}$.",
        "$\\dfrac{3}{s+4}$.",
        "$3$.",
        "b",
        "$H(s)=Y(s)/X(s)$, so the factor multiplying $X(s)$ is the network function."
      ),
    },
    {
      id: "same-network-many-functions",
      view: "same-network",
      highlight: "all",
      title: "One circuit can have several network functions",
      body: "The circuit does not have only one possible network function. Changing the response of interest changes the input-output relationship.",
      points: [
        "Same circuit. Same input. Different output $\\rightarrow$ different network function.",
      ],
      eq: [
        "$$\\dfrac{V_C(s)}{V_{in}(s)}=\\dfrac{1}{sRC+1}$$",
        "$$\\dfrac{I(s)}{V_{in}(s)}=\\dfrac{sC}{sRC+1}$$",
      ],
      check: qc(
        "If the circuit and input stay the same but the chosen output changes, what happens to the network function?",
        "It must stay identical because the circuit is unchanged.",
        "It changes only if $R$ or $C$ changes.",
        "It can change because the defined output variable changed.",
        "c",
        "A network function is defined by both the chosen input and the chosen response."
      ),
    },
    {
      id: "driving-vs-transfer",
      view: "driving-transfer",
      highlight: "all",
      title: "Driving-point versus transfer functions",
      body: "If the response is observed at the same port where the circuit is driven, the lecture calls it a driving-point function. If input and response are at different locations, it is a transfer function.",
      points: [
        "Driving-point impedance: voltage/current at the same port.",
        "Driving-point admittance: current/voltage at the same port.",
        "Transfer functions relate variables at different places or ports.",
      ],
      eq: [
        "$$Z(s)=\\dfrac{V(s)}{I(s)}$$",
        "$$Y(s)=\\dfrac{I(s)}{V(s)}=\\dfrac{1}{Z(s)}$$",
      ],
      check: qc(
        "$V_1(s)/I_1(s)$ measured at the same port is",
        "a transfer impedance.",
        "a driving-point impedance.",
        "a voltage transfer ratio.",
        "b",
        "Driving-point means the network is excited and observed at the same port."
      ),
    },
    {
      id: "function-types",
      view: "function-types",
      highlight: "all",
      title: "Common transfer-function types",
      body: "Week 8 names four useful transfer functions. Voltage and current ratios are dimensionless; $V/I$ and $I/V$ carry Ohms or Siemens.",
      eq: [
        "$$H_{21}(s)=\\dfrac{V_2(s)}{V_1(s)}\\quad\\text{voltage transfer ratio}$$",
        "$$\\alpha_{12}(s)=\\dfrac{I_1(s)}{I_2(s)}\\quad\\text{current transfer ratio}$$",
        "$$Z_{21}(s)=\\dfrac{V_2(s)}{I_1(s)}\\quad\\text{transfer impedance}$$",
        "$$Y_{21}(s)=\\dfrac{I_2(s)}{V_1(s)}\\quad\\text{transfer admittance}$$",
      ],
      check: qc(
        "Which network function has units of Ohms?",
        "$V_2/V_1$.",
        "$I_2/V_1$.",
        "$V_2/I_1$.",
        "c",
        "Voltage divided by current has units of impedance, so $V_2/I_1$ is a transfer impedance."
      ),
    },
    {
      id: "lecture-example-transform",
      view: "lc-transform",
      highlight: "all",
      title: "Worked example: transform the network",
      body: "Week 8 Example 4: a $5\\,\\mathrm{H}$ inductor in series with a $2\\,\\mathrm{F}$ capacitor. $V_1$ is the input across the series pair; $V_2$ is the capacitor voltage. Zero initial conditions.",
      points: [
        "$5\\,\\mathrm{H}\\rightarrow 5s$",
        "$2\\,\\mathrm{F}\\rightarrow 1/(2s)$",
      ],
      eq: [
        "$$V_1(s)=\\left(5s+\\dfrac{1}{2s}\\right)I_1(s)$$",
        "$$V_2(s)=\\dfrac{1}{2s}I_1(s)$$",
      ],
      check: qc(
        "What is the s-domain impedance of the $2\\,\\mathrm{F}$ capacitor?",
        "$2s$.",
        "$\\dfrac{1}{2s}$.",
        "$\\dfrac{s}{2}$.",
        "b",
        "$Z_C=1/(sC)$, so with $C=2\\,\\mathrm{F}$, $Z_C=1/(2s)$."
      ),
    },
    {
      id: "lecture-example-transfer",
      view: "lc-transfer",
      highlight: "all",
      title: "Same circuit: two transfer functions",
      body: "From the transformed LC network, the voltage transfer ratio and the transfer impedance use different output/input pairs.",
      eq: [
        "$$H_{21}(s)=\\dfrac{V_2(s)}{V_1(s)}=\\dfrac{1/(2s)}{5s+1/(2s)}=\\dfrac{1}{10s^2+1}$$",
        "$$Z_{21}(s)=\\dfrac{V_2(s)}{I_1(s)}=\\dfrac{1}{2s}$$",
      ],
      check: qc(
        "What is the voltage transfer ratio $H_{21}(s)=V_2/V_1$ for this network?",
        "$\\dfrac{1}{10s^2+1}$.",
        "$\\dfrac{1}{2s}$.",
        "$\\dfrac{10s^2+1}{2s}$.",
        "a",
        "Divide the capacitor impedance by the total series impedance: $(1/2s)/(5s+1/2s)=1/(10s^2+1)$."
      ),
    },
    {
      id: "lecture-example-driving",
      view: "lc-driving",
      highlight: "all",
      title: "Same circuit: driving-point functions",
      body: "This is the same physical circuit as the previous two steps. The function name changes because the chosen input/response pair changes.",
      eq: [
        "$$Z_{11}(s)=\\dfrac{V_1(s)}{I_1(s)}=5s+\\dfrac{1}{2s}=\\dfrac{10s^2+1}{2s}$$",
        "$$Y_{11}(s)=\\dfrac{1}{Z_{11}(s)}=\\dfrac{2s}{10s^2+1}$$",
      ],
      check: qc(
        "How are the driving-point admittance and impedance at the same port related?",
        "$Y_{11}=Z_{11}$.",
        "$Y_{11}=1/Z_{11}$.",
        "$Y_{11}=sZ_{11}$.",
        "b",
        "Driving-point admittance is the reciprocal of driving-point impedance."
      ),
    },
  ],
};

export const RESPONSES = {
  steps: [
    {
      id: "impulse-link",
      view: "impulse-link",
      highlight: "all",
      title: "H(s) is the transform of the impulse response",
      body: "For a unit impulse input, $x(t)=\\delta(t)$ and $X(s)=1$. Therefore the output transform is simply the transfer function.",
      eq: [
        "$$Y(s)=H(s)X(s)$$",
        "$$X(s)=1\\quad\\Rightarrow\\quad Y(s)=H(s)$$",
        "$$h(t)=\\mathcal{L}^{-1}\\{H(s)\\}$$",
      ],
      check: qc(
        "If $H(s)=5/(s+5)$, what is the impulse response?",
        "$5e^{-5t}u(t)$.",
        "$e^{-5t}u(t)$.",
        "$5(1-e^{-5t})u(t)$.",
        "a",
        "The impulse response is the inverse Laplace transform of $H(s)$."
      ),
    },
    {
      id: "impulse-worked",
      view: "impulse-worked",
      highlight: "all",
      title: "Worked impulse response",
      body: "Week 8 RLC example. Partial fractions, then invert as seen in Section 5.",
      eq: [
        "$$H(s)=\\dfrac{2}{(s+1)(s+2)}=\\dfrac{2}{s+1}-\\dfrac{2}{s+2}$$",
        "$$h(t)=\\left(2e^{-t}-2e^{-2t}\\right)u(t)$$",
      ],
      check: qc(
        "Which time-domain expression matches this $H(s)$?",
        "$2e^{-t}+2e^{-2t}$.",
        "$2(1-e^{-t})$.",
        "$2e^{-t}-2e^{-2t}$.",
        "c",
        "$2/(s+1)$ gives $2e^{-t}$ and $-2/(s+2)$ gives $-2e^{-2t}$."
      ),
    },
    {
      id: "natural-forced",
      view: "natural-forced",
      highlight: "all",
      title: "Natural poles and forced poles",
      body: "For a general input, the response is $Y(s)=H(s)X(s)$. Week 8 separates the time response into natural and forced parts. Section 6 already explained what pole locations mean in time.",
      points: [
        "Poles contributed by $H(s)$ produce the network's natural response.",
        "Poles contributed by $X(s)$ produce the forced response.",
      ],
      eq: "$$Y(s)=H(s)X(s)$$",
      check: qc(
        "A unit step has $X(s)=1/s$. Which forced pole does that input contribute?",
        "$s=-1$.",
        "$s=0$.",
        "$s=+1$.",
        "b",
        "$1/s$ has a pole at the origin, so a step input contributes a forced pole at $s=0$."
      ),
    },
    {
      id: "step-link",
      view: "step-link",
      highlight: "all",
      title: "Step response",
      body: "For a step input $A u(t)$, the input transform is $A/s$.",
      eq: [
        "$$X(s)=\\dfrac{A}{s}$$",
        "$$Y(s)=H(s)X(s)=\\dfrac{A H(s)}{s}$$",
        "$$y(t)=\\mathcal{L}^{-1}\\left\\{\\dfrac{A H(s)}{s}\\right\\}$$",
      ],
      check: qc(
        "For a unit step input, which transform should be multiplied by $H(s)$?",
        "$1$.",
        "$s$.",
        "$1/s$.",
        "c",
        "$u(t)\\Longleftrightarrow 1/s$."
      ),
    },
    {
      id: "step-worked",
      view: "step-worked",
      highlight: "all",
      title: "Worked unit-step response",
      body: "Use the same $H(s)$. For $x(t)=u(t)$ the lecture also writes $y(t)=u(t)-(2e^{-t}-e^{-2t})u(t)$.",
      eq: [
        "$$Y(s)=\\dfrac{2}{s(s+1)(s+2)}=\\dfrac{1}{s}-\\dfrac{2}{s+1}+\\dfrac{1}{s+2}$$",
        "$$y(t)=\\left(1-2e^{-t}+e^{-2t}\\right)u(t)$$",
      ],
      check: qc(
        "What value does this stable unit-step response approach as $t\\to\\infty$?",
        "$0$.",
        "$1$.",
        "$2$.",
        "b",
        "The exponential natural terms decay, leaving the constant forced term $1$."
      ),
    },
    {
      id: "stable-split",
      view: "stable-split",
      highlight: "all",
      title: "When the circuit is stable, the natural part disappears",
      body: "Section 6 taught that LHP poles decay. Therefore, for a stable network, the natural exponentials produced by the network poles vanish with time and the forced part remains. If the network is unstable, a finite steady-state response may never be reached.",
      eq: "$$y(t)=\\underbrace{K u(t)}_{\\text{forced}}+\\underbrace{\\sum_i K_i e^{-p_i t}u(t)}_{\\text{natural}}$$",
      check: qc(
        "In a stable step response, which part decays away with time?",
        "The natural exponential terms.",
        "The step's constant forced term.",
        "The input frequency.",
        "a",
        "The natural terms come from stable LHP network poles, so their exponentials decay."
      ),
    },
  ],
};

export const STEADY = {
  steps: [
    {
      id: "dc-rule",
      view: "dc-rule",
      highlight: "all",
      title: "DC steady state from H(0)",
      body: "For a stable circuit driven by a step $A u(t)$, the natural response decays and the DC steady-state amplitude is $A H(0)$.",
      points: [
        "Evaluate $H(s)$ at $s=0$.",
        "Multiply by the step amplitude $A$.",
        "This finite steady state requires a stable circuit.",
      ],
      eq: "$$y_{ss}=A H(0)$$",
      check: qc(
        "A stable circuit has $H(0)=0.5$ and is driven by a $6\\,\\mathrm{V}$ step. What is the DC steady-state output?",
        "$12\\,\\mathrm{V}$.",
        "$0.5\\,\\mathrm{V}$.",
        "$3\\,\\mathrm{V}$.",
        "c",
        "$A H(0)=6(0.5)=3\\,\\mathrm{V}$."
      ),
    },
    {
      id: "dc-worked",
      view: "dc-worked",
      highlight: "all",
      title: "Worked DC steady-state example",
      body: "You do not need the full inverse Laplace transform if only the stable final DC value is requested.",
      eq: [
        "$$H(s)=\\dfrac{2}{(s+1)(s+2)}\\quad\\Rightarrow\\quad H(0)=1$$",
        "$$y_{ss}=4H(0)=4$$",
      ],
      check: qc(
        "For this $H(s)$, what is the final response to a $4$-unit step?",
        "$4$.",
        "$2$.",
        "$1$.",
        "a",
        "$H(0)=1$, so the steady-state amplitude is $4(1)=4$."
      ),
    },
    {
      id: "ac-rule",
      view: "ac-rule",
      highlight: "all",
      title: "Sinusoidal steady state: evaluate $H(j\\omega)$",
      body: "For a stable circuit driven by $A\\cos(\\omega t+\\phi)$, evaluate the same transfer function on the $j\\omega$ axis.",
      points: [
        "Output frequency = input frequency.",
        "Output amplitude = input amplitude $\\times |H(j\\omega)|$.",
        "Output phase = input phase $+\\angle H(j\\omega)$.",
      ],
      eq: [
        "$$H(j\\omega)=H(s)|_{s=j\\omega}=|H(j\\omega)|\\angle H(j\\omega)$$",
        "$$y_{ss}(t)=A|H(j\\omega)|\\cos\\left(\\omega t+\\phi+\\angle H(j\\omega)\\right)$$",
      ],
      check: qc(
        "For a sinusoidal steady-state response of an LTI circuit, what happens to the frequency?",
        "It doubles.",
        "It stays the same as the input frequency.",
        "It becomes the phase angle.",
        "b",
        "$H(j\\omega)$ changes amplitude and phase, not the sinusoidal frequency."
      ),
    },
    {
      id: "ac-worked",
      view: "ac-worked",
      highlight: "all",
      title: "Worked AC steady-state example",
      body: "Tutorial 8: $v_g(t)=10\\cos(2000t)$ so $\\omega=2000\\,\\mathrm{rad/s}$ and $s=j2000$. Then $H(j2000)=j=1\\angle 90^{\\circ}$.",
      eq: [
        "$$H(s)=\\dfrac{s^2}{s^2+2000s+4\\times10^6}$$",
        "$$H(j2000)=j=1\\angle 90^{\\circ}$$",
        "$$v_o(t)=10\\cos(2000t+90^{\\circ})$$",
      ],
      check: qc(
        "What is the steady-state output for this example?",
        "$5\\cos(2000t)$.",
        "$10\\cos(90t+2000^{\\circ})$.",
        "$10\\cos(2000t+90^{\\circ})$.",
        "c",
        "$|H|=1$ keeps the amplitude at $10$, while $\\angle H=+90^{\\circ}$ adds a $90$-degree phase lead."
      ),
    },
    {
      id: "dc-zero",
      view: "dc-zero",
      highlight: "all",
      title: "The same $H(s)$ can reject DC",
      body: "This is a useful reminder: the value of the network function depends on where you evaluate it. DC uses $s=0$; a sinusoid uses $s=j\\omega$.",
      eq: [
        "$$H(0)=0$$",
        "$$y_{ss}=5H(0)=0$$",
      ],
      check: qc(
        "What is the DC steady-state output for a $5\\,\\mathrm{V}$ input when $H(0)=0$?",
        "$0\\,\\mathrm{V}$.",
        "$5\\,\\mathrm{V}$.",
        "$10\\,\\mathrm{V}$.",
        "a",
        "The stable DC steady-state output is $A H(0)=5(0)=0$."
      ),
    },
  ],
};
