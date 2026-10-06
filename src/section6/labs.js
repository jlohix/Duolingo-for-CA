function qc(prompt, a, b, c, answer, why) {
  return { prompt, options: { a, b, c }, answer, why };
}

export const POLES = {
  steps: [
    {
      id: "definitions",
      view: "pz-fraction",
      highlight: "all",
      title: "Zeros and poles",
      boardHint: "After cancelling common factors: N(s)=0 zeros, D(s)=0 poles.",
      body: [
        "For a rational function, identify roots of the numerator and denominator after simplifying any common factors.",
        "Example: $H(s)=\\dfrac{s+2}{(s+1)(s+4)}$ has a zero at $s=-2$ and poles at $s=-1$ and $s=-4$.",
      ],
      eq: [
        "$$H(s)=\\dfrac{N(s)}{D(s)}$$",
        "$$\\text{zeros: }N(s)=0$$",
        "$$\\text{poles: }D(s)=0$$",
      ],
      check: qc(
        "For $H(s)=(s+3)/[(s+1)(s+5)]$, which values are the poles?",
        "$s=1$ and $s=5$.",
        "$s=-1$ and $s=-5$.",
        "$s=-3$ only.",
        "b",
        "Poles are roots of the denominator. The numerator root $s=-3$ is a zero."
      ),
    },
    {
      id: "s-plane",
      view: "pz-plane",
      highlight: "all",
      title: "Plot them on the s-plane",
      boardHint: "Horizontal = Real / σ. Vertical = Imaginary / jω. × pole, ○ zero.",
      body: "The horizontal coordinate is the real part $\\sigma$. The vertical coordinate is the imaginary part $\\omega$.",
      eq: "$$s=\\sigma+j\\omega$$",
      points: [
        "Pole: cross (x).",
        "Zero: circle (o).",
        "Real-axis points have $\\omega=0$.",
        "For real-coefficient circuits, non-real poles and zeros occur as complex-conjugate pairs.",
      ],
      check: qc(
        "Where is the point $s=-2+j3$?",
        "3 units left and 2 units down.",
        "2 units right and 3 units up.",
        "2 units left and 3 units up.",
        "c",
        "The real part is -2 and the imaginary part is +3."
      ),
    },
    {
      id: "pole-time",
      view: "pole-time",
      highlight: "all",
      title: "A pole tells you the exponential behavior",
      boardHint: "A pole at s = −a matches e^{−at}.",
      body: "Recall the basic pair $e^{-at}u(t)\\Longleftrightarrow1/(s+a)$. A pole at $s=-a$ therefore corresponds to an exponential $e^{-at}$.",
      points: [
        "Pole at -2 -> $e^{-2t}$ -> decays.",
        "Pole at +2 -> $e^{+2t}$ -> grows.",
        "Pair $-\\alpha\\pm j\\beta$ -> decaying oscillation when $\\alpha>0$.",
      ],
      eq: "$$e^{(-\\alpha+j\\beta)t}=e^{-\\alpha t}e^{j\\beta t}$$",
      check: qc(
        "What time behavior is associated with a pole at $s=-4$?",
        "A decaying factor $e^{-4t}$.",
        "A growing factor $e^{4t}$.",
        "A constant with no exponential.",
        "a",
        "$1/(s+4)$ inverts to $e^{-4t}u(t)$."
      ),
    },
    {
      id: "stability",
      view: "stability",
      highlight: "all",
      title: "Left half plane vs right half plane",
      boardHint: "Real part of the pole sets decay, growth, or the boundary.",
      body: "The lecture uses the pole locations of $H(s)$ to judge stability.",
      points: [
        "LHP pole: negative real part -> exponential decays.",
        "RHP pole: positive real part -> exponential grows -> unstable.",
        "A pole on the $j\\omega$ axis has zero real part, so it does not decay and sits on the stability boundary.",
      ],
      check: qc(
        "A system has a pole at $s=+1-j2$. What does the positive real part imply?",
        "The pole is a zero because it is complex.",
        "The corresponding exponential grows, so the system is unstable.",
        "The response decays because the imaginary part is negative.",
        "b",
        "The real part controls the exponential envelope. A positive real part gives growth."
      ),
    },
    {
      id: "stability-example",
      view: "mu-stability",
      highlight: "all",
      title: "Parameter example from the lecture",
      boardHint: "Real part of the pair is μ − 3.",
      body: [
        "Consider the denominator $D(s)=s^2+(6-2\\mu)s+5$.",
        "The real part of the pair is $-(6-2\\mu)/2=\\mu-3$.",
      ],
      eq: "$$s_{1,2}=\\dfrac{-(6-2\\mu)\\pm\\sqrt{(6-2\\mu)^{2}-20}}{2}$$",
      points: [
        "If $\\mu=2$: poles are $-1\\pm j2$ -> LHP -> stable.",
        "If $\\mu=3$: poles are $\\pm j\\sqrt5$ -> on the boundary.",
        "If $\\mu=4$: poles are $1\\pm j2$ -> RHP -> unstable.",
        "If the course parameter is restricted to $\\mu>0$, the stable range is $0<\\mu<3$.",
      ],
      check: qc(
        "For the denominator above, what happens at $\\mu=4$?",
        "Both poles become zeros at the origin.",
        "The poles are $-1\\pm j2$, so the system is stable.",
        "The poles are $1\\pm j2$, so they are in the RHP and the system is unstable.",
        "c",
        "At $\\mu=4$, the real part is $\\mu-3=1>0$."
      ),
    },
    {
      id: "zeros-vs-poles",
      view: "zeros-vs-poles",
      highlight: "all",
      title: "Zeros shape the response; poles decide the natural modes",
      boardHint: "Stability is read from the remaining poles of simplified H(s).",
      body: "The denominator is the part the lecture emphasizes for stability. Zeros still matter because they can suppress or reshape the input-output response.",
      points: [
        "Poles determine the exponential modes present in the simplified transfer function.",
        "Zeros are frequencies/values of $s$ where the numerator becomes zero.",
        "When checking the simplified $H(s)$ used here, judge stability from its remaining poles.",
      ],
      check: qc(
        "Which part of $H(s)=N(s)/D(s)$ is checked first for the pole locations that control stability?",
        "$D(s)$.",
        "$N(s)$.",
        "Only the numerical gain in front.",
        "a",
        "Poles are roots of the denominator, and the lecture explicitly ties the denominator of H(s) to stability."
      ),
    },
  ],
};

export const PHASE = {
  steps: [
    {
      id: "complex-vector",
      view: "complex-vector",
      highlight: "all",
      title: "A complex number is also a vector",
      boardHint: "2 + j sits at (2, 1). Magnitude √5, angle about 26.6°.",
      body: [
        "Write a complex value as $z=a+jb$. On the complex plane, $a$ is the horizontal (real) coordinate and $b$ is the vertical (imaginary) coordinate.",
        "Worked example: $2+j=\\sqrt5\\angle 26.6^\\circ$.",
      ],
      eq: [
        "$$|z|=\\sqrt{a^{2}+b^{2}}$$",
        "$$\\angle z=\\operatorname{atan2}(b,a)$$",
      ],
      check: qc(
        "What is the magnitude of $2+j$?",
        "$1$.",
        "$3$.",
        "$\\sqrt5$.",
        "c",
        "$|2+j|=\\sqrt{2^2+1^2}=\\sqrt5$."
      ),
    },
    {
      id: "times-j",
      view: "j-rotation",
      highlight: "all",
      title: "Multiplying by j rotates by 90 degrees",
      boardHint: "Each ×j is a 90° counter-clockwise turn.",
      body: "Multiplication by $j$ rotates a complex vector counter-clockwise by $90^\\circ$.",
      eq: [
        "$$1\\xrightarrow{\\times j}j\\xrightarrow{\\times j}-1\\xrightarrow{\\times j}-j\\xrightarrow{\\times j}1$$",
        "$$j^2=-1$$",
      ],
      check: qc(
        "What is $j\\times j$?",
        "$-1$.",
        "$+1$.",
        "$-j$.",
        "a",
        "Two 90-degree rotations give 180 degrees, and algebraically $j^2=-1$."
      ),
    },
    {
      id: "euler",
      view: "euler",
      highlight: "all",
      title: "Euler connects rotation to sine and cosine",
      boardHint: "e^{jθ} is the unit-circle point at angle θ.",
      body: "This is why complex exponentials are useful for oscillations and phase.",
      eq: [
        "$$e^{j\\theta}=\\cos\\theta+j\\sin\\theta$$",
        "$$e^{j\\pi}= -1$$",
        "$$e^{j\\pi/2}=j$$",
        "$$e^{j2\\pi}=1$$",
      ],
      check: qc(
        "What is $e^{j\\pi/2}$?",
        "$1$.",
        "$j$.",
        "$-1$.",
        "b",
        "At $90^\\circ$, cosine is 0 and sine is 1: $e^{j\\pi/2}=0+j$."
      ),
    },
    {
      id: "s-meaning",
      view: "s-components",
      highlight: "all",
      title: "What s = sigma + j omega means",
      boardHint: "A pole at −2 + j5 decays as e^{−2t} and oscillates at 5 rad/s.",
      body: "A pole at $s=-2+j5$ has an envelope $e^{-2t}$ and oscillates at $5$ rad/s.",
      eq: "$$e^{st}=e^{(\\sigma+j\\omega)t}=e^{\\sigma t}e^{j\\omega t}$$",
      points: [
        "$\\sigma$ controls exponential growth or decay.",
        "$\\omega$ controls oscillation in rad/s.",
        "That is why a complex pole contains both a decay/growth rate and an oscillation frequency.",
      ],
      check: qc(
        "For a pole at $s=-2+j5$, which statement is correct?",
        "There is no oscillation because the real part is negative.",
        "The envelope grows like $e^{5t}$ and oscillates at 2 rad/s.",
        "The envelope decays like $e^{-2t}$ and the oscillation is at 5 rad/s.",
        "c",
        "The real part sets the exponential envelope; the imaginary part sets the angular frequency."
      ),
    },
    {
      id: "steady-state",
      view: "jw-axis",
      highlight: "all",
      title: "Sinusoidal steady state lives on s = j omega",
      boardHint: "σ = 0 on this axis. H(jω) is one complex number.",
      body: [
        "In sinusoidal steady state the exponential envelope is not growing or decaying, so set $\\sigma=0$.",
        "Evaluating the transfer function at $s=j\\omega$ gives a complex number with a magnitude and phase.",
      ],
      eq: [
        "$$s=j\\omega$$",
        "$$H(j\\omega)=|H(j\\omega)|\\angle\\phi$$",
      ],
    },
    {
      id: "magnitude-phase",
      view: "magnitude-phase",
      highlight: "all",
      title: "Magnitude scales; angle shifts phase",
      boardHint: "Same ω. Amplitude × M. Phase + φ.",
      body: "For a sinusoidal input to a stable linear circuit, the steady-state output at the same frequency is scaled by the magnitude of $H(j\\omega)$ and shifted by its angle.",
      eq: [
        "$$v_i(t)=A\\cos(\\omega t)$$",
        "$$H(j\\omega)=M\\angle\\phi$$",
        "$$v_o(t)=AM\\cos(\\omega t+\\phi)$$",
      ],
      check: qc(
        "$v_i(t)=8\\cos(100t)$ and $H(j100)=0.5\\angle(-30^\\circ)$. What is the steady-state output?",
        "$4\\cos(100t-30^\\circ)$.",
        "$8\\cos(50t-30^\\circ)$.",
        "$16\\cos(100t+30^\\circ)$.",
        "a",
        "The magnitude multiplies the amplitude: $8(0.5)=4$. The transfer-function angle adds to the input phase, giving -30 degrees."
      ),
    },
    {
      id: "lecture-phase-example",
      view: "phase-example",
      highlight: "all",
      title: "Lecture example: evaluate H on the j omega axis",
      boardHint: "H(j2000) = j = 1∠90°. Frequency stays 2000 rad/s.",
      body: [
        "Given $H(s)=\\dfrac{s^2}{s^2+2000s+4\\times10^6}$ and $v_g(t)=10\\cos(2000t)$.",
        "Then $\\omega=2000$ rad/s and $s=j2000$. Substituting gives $H(j2000)=j=1\\angle90^\\circ$, so $v_o(t)=10\\cos(2000t+90^\\circ)$.",
      ],
      eq: "$$H(j2000)=\\dfrac{(j2000)^2}{(j2000)^2+2000(j2000)+4\\times10^6}=j$$",
      check: qc(
        "In this example, what does $H(j2000)=1\\angle90^\\circ$ do to the input?",
        "Changes the frequency from 2000 rad/s to 90 rad/s.",
        "Keeps the amplitude at 10 and adds a +90 degree phase shift.",
        "Doubles the amplitude and removes the phase.",
        "b",
        "The magnitude is 1, so amplitude is unchanged. The angle is +90 degrees, so the output leads by 90 degrees. The sinusoidal frequency stays 2000 rad/s."
      ),
    },
  ],
};
