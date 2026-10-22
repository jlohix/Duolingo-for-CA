function qc(prompt, a, b, c, answer, why) {
  return { prompt, options: { a, b, c }, answer, why };
}

export const BASICS = {
  steps: [
    {
      id: "one-port",
      view: "one-port",
      highlight: "all",
      title: "Start with one port",
      body: "A port is a pair of terminals treated as one external connection. The port condition: the current entering one terminal of the port equals the current leaving the other terminal.",
      points: [
        "A resistor, capacitor or inductor is a one-port.",
        "A complicated internal circuit can also be treated as one port if only its terminal $V$–$I$ relationship matters.",
      ],
      check: qc(
        "What is the port condition?",
        "The two terminal voltages must both be zero.",
        "The current entering one terminal equals the current leaving the other.",
        "Both terminal currents must enter the network.",
        "b",
        "A port is one current path into and out of a pair of terminals."
      ),
    },
    {
      id: "two-port",
      view: "two-port",
      highlight: "all",
      title: "A two-port has two terminal pairs",
      body: "A two-port network is a linear network with two ports: an input-side port and an output-side port. Each pair must satisfy the port condition.",
      points: [
        "$I_1$ enters the upper left terminal.",
        "$I_2$ enters the upper right terminal.",
        "$V_1$ and $V_2$ are positive at the upper terminals.",
      ],
      check: qc(
        "How many external terminals does a general two-port have?",
        "$2$.",
        "$3$.",
        "$4$.",
        "c",
        "A two-port has two pairs of terminals, so a general two-port has four external terminals."
      ),
    },
    {
      id: "common-ground",
      view: "common-ground",
      highlight: "all",
      title: "Common-ground two-ports",
      body: "A general two-port has four external terminals. In a common-ground two-port the two ports share one terminal, so only three external terminals appear.",
      points: [
        "General two-port: four terminals, two independent ports.",
        "Common-ground two-port: the lower terminals are tied together.",
        "Later series and parallel interconnection rules in this lecture are stated for the common-ground arrangement.",
      ],
      check: qc(
        "How many external terminals does a common-ground two-port have?",
        "$2$.",
        "$3$.",
        "$4$.",
        "b",
        "The two ports share one terminal, so a common-ground two-port has three external terminals."
      ),
    },
    {
      id: "port-variables",
      view: "port-variables",
      highlight: "all",
      title: "The four port variables",
      body: "The point of two-port analysis is that we can ignore much of the internal detail and write relationships among these four external variables.",
      points: [
        "Port 1 variables: $V_1$ and $I_1$.",
        "Port 2 variables: $V_2$ and $I_2$.",
        "For Y, Z and h parameters, the lecture takes $I_1$ and $I_2$ as entering the network.",
      ],
      eq: "$$V_1,\\; I_1,\\; V_2,\\; I_2$$",
      check: qc(
        "In the standard Y/Z/h reference diagram, how are $I_1$ and $I_2$ drawn?",
        "Both enter the network.",
        "Both leave the network.",
        "$I_1$ leaves while $I_2$ enters.",
        "a",
        "The Week 9 Y, Z and h definitions use currents entering both ports."
      ),
    },
    {
      id: "parameter-families",
      view: "parameter-families",
      highlight: "all",
      title: "Four ways to describe the same two-port",
      body: "They all describe the same two-port; they simply choose different independent variables. For the parameter definitions used here, the lecture assumes no internal independent sources and zero initial conditions.",
      eq: [
        "$$\\begin{bmatrix}I_1\\\\ I_2\\end{bmatrix}=\\begin{bmatrix}y_{11}&y_{12}\\\\ y_{21}&y_{22}\\end{bmatrix}\\begin{bmatrix}V_1\\\\ V_2\\end{bmatrix}$$",
        "$$\\begin{bmatrix}V_1\\\\ V_2\\end{bmatrix}=\\begin{bmatrix}z_{11}&z_{12}\\\\ z_{21}&z_{22}\\end{bmatrix}\\begin{bmatrix}I_1\\\\ I_2\\end{bmatrix}$$",
        "$$\\begin{bmatrix}V_1\\\\ I_2\\end{bmatrix}=\\begin{bmatrix}h_{11}&h_{12}\\\\ h_{21}&h_{22}\\end{bmatrix}\\begin{bmatrix}I_1\\\\ V_2\\end{bmatrix}$$",
        "$$\\begin{bmatrix}V_1\\\\ I_1\\end{bmatrix}=\\begin{bmatrix}A&B\\\\ C&D\\end{bmatrix}\\begin{bmatrix}V_2\\\\-I_2\\end{bmatrix}$$",
      ],
      check: qc(
        "Which parameter family directly expresses port voltages in terms of port currents?",
        "Y parameters.",
        "Z parameters.",
        "h parameters.",
        "b",
        "Z parameters use $[V]=[Z][I]$."
      ),
    },
    {
      id: "open-short",
      view: "open-short",
      highlight: "all",
      title: "Open and short tests are the key",
      body: "Most parameter definitions become simple ratios when one port is opened or shorted. This single distinction explains why Z parameters use open-circuit tests and Y parameters use short-circuit tests.",
      eq: [
        "$$\\text{open circuit: }I=0$$",
        "$$\\text{short circuit: }V=0$$",
      ],
      check: qc(
        "If port 2 is short-circuited, which condition is true?",
        "$I_2=0$.",
        "$V_1=0$.",
        "$V_2=0$.",
        "c",
        "A short circuit forces the voltage across that port to zero."
      ),
    },
  ],
};

export const Y = {
  steps: [
    {
      id: "y-definition",
      view: "y-definition",
      highlight: "all",
      title: "Y parameters: currents from voltages",
      body: "All $y_{ij}$ values have units of Siemens.",
      eq: [
        "$$I_1=y_{11}V_1+y_{12}V_2$$",
        "$$I_2=y_{21}V_1+y_{22}V_2$$",
        "$$\\begin{bmatrix}I_1\\\\ I_2\\end{bmatrix}=\\begin{bmatrix}y_{11}&y_{12}\\\\ y_{21}&y_{22}\\end{bmatrix}\\begin{bmatrix}V_1\\\\ V_2\\end{bmatrix}$$",
      ],
      check: qc(
        "What are the units of every Y parameter?",
        "Siemens.",
        "Ohms.",
        "Seconds.",
        "a",
        "Y parameters are admittance quantities, so their units are Siemens."
      ),
    },
    {
      id: "y-short-port2",
      view: "y-short2",
      highlight: "all",
      title: "Short port 2 to get $y_{11}$ and $y_{21}$",
      body: "Set $V_2=0$ by shorting port 2. Drive port 1 with $V_1$.",
      eq: [
        "$$y_{11}=\\left.\\dfrac{I_1}{V_1}\\right|_{V_2=0}$$",
        "$$y_{21}=\\left.\\dfrac{I_2}{V_1}\\right|_{V_2=0}$$",
      ],
      check: qc(
        "With port 2 shorted, which ratio gives $y_{21}$?",
        "$V_2/I_1$.",
        "$I_1/V_1$.",
        "$I_2/V_1$.",
        "c",
        "With $V_2=0$, the second Y equation becomes $I_2=y_{21}V_1$."
      ),
    },
    {
      id: "y-short-port1",
      view: "y-short1",
      highlight: "all",
      title: "Short port 1 to get $y_{12}$ and $y_{22}$",
      body: "Set $V_1=0$ by shorting port 1. Drive port 2 with $V_2$.",
      eq: [
        "$$y_{12}=\\left.\\dfrac{I_1}{V_2}\\right|_{V_1=0}$$",
        "$$y_{22}=\\left.\\dfrac{I_2}{V_2}\\right|_{V_1=0}$$",
      ],
      check: qc(
        "With port 1 shorted, which ratio gives $y_{12}$?",
        "$I_2/V_1$.",
        "$I_1/V_2$.",
        "$V_1/I_2$.",
        "b",
        "With $V_1=0$, the first equation becomes $I_1=y_{12}V_2$."
      ),
    },
    {
      id: "y-meaning",
      view: "y-meaning",
      highlight: "all",
      title: "What the four Y parameters mean",
      points: [
        "$y_{11}$ = short-circuit input admittance",
        "$y_{21}$ = short-circuit forward transfer admittance",
        "$y_{12}$ = short-circuit reverse transfer admittance",
        "$y_{22}$ = short-circuit output admittance",
      ],
      check: qc(
        "Which term is the short-circuit forward transfer admittance?",
        "$y_{21}$.",
        "$y_{12}$.",
        "$y_{22}$.",
        "a",
        "$y_{21}$ measures the port-2 current response due to a port-1 voltage with port 2 shorted."
      ),
    },
    {
      id: "y-pi-worked",
      view: "y-pi",
      highlight: "all",
      title: "Worked Y example: use KCL",
      body: "Pi resistor network: $2\\,\\Omega$ from each top node to ground, and $2\\,\\Omega$ between the two top nodes. Port currents $I_1$ and $I_2$ enter the network.",
      eq: [
        "$$I_1=\\dfrac{V_1}{2}+\\dfrac{V_1-V_2}{2}=V_1-\\dfrac{1}{2}V_2$$",
        "$$I_2=\\dfrac{V_2}{2}+\\dfrac{V_2-V_1}{2}=-\\dfrac{1}{2}V_1+V_2$$",
      ],
      check: qc(
        "For this network, what is the expression for $I_1$?",
        "$I_1=V_1+V_2$.",
        "$I_1=\\frac12 V_1-V_2$.",
        "$I_1=V_1-\\frac12 V_2$.",
        "c",
        "$I_1$ is the sum of the current through the $2\\,\\Omega$ shunt and the $2\\,\\Omega$ bridge."
      ),
    },
    {
      id: "y-pi-matrix",
      view: "y-matrix",
      highlight: "all",
      title: "Read the Y matrix from the equations",
      body: "Once the port equations are written in standard form, the matrix entries can be read directly from the coefficients.",
      eq: "$$[Y]=\\begin{bmatrix}1&-\\frac12\\\\-\\frac12&1\\end{bmatrix}\\;\\mathrm{S}$$",
      check: qc(
        "What is $y_{12}$ for this worked network?",
        "$1\\,\\mathrm{S}$.",
        "$-0.5\\,\\mathrm{S}$.",
        "$+0.5\\,\\mathrm{S}$.",
        "b",
        "$y_{12}$ is the coefficient multiplying $V_2$ in the $I_1$ equation."
      ),
    },
  ],
};

export const Z = {
  steps: [
    {
      id: "z-definition",
      view: "z-definition",
      highlight: "all",
      title: "Z parameters: voltages from currents",
      body: "All $z_{ij}$ values have units of Ohms.",
      eq: [
        "$$V_1=z_{11}I_1+z_{12}I_2$$",
        "$$V_2=z_{21}I_1+z_{22}I_2$$",
        "$$\\begin{bmatrix}V_1\\\\ V_2\\end{bmatrix}=\\begin{bmatrix}z_{11}&z_{12}\\\\ z_{21}&z_{22}\\end{bmatrix}\\begin{bmatrix}I_1\\\\ I_2\\end{bmatrix}$$",
      ],
      check: qc(
        "What are the units of every Z parameter?",
        "Siemens.",
        "Ohms.",
        "Henries.",
        "b",
        "Z parameters are impedance quantities."
      ),
    },
    {
      id: "z-open-port2",
      view: "z-open2",
      highlight: "all",
      title: "Open port 2 to get $z_{11}$ and $z_{21}$",
      body: "Set $I_2=0$ by leaving port 2 open. Drive port 1 with $I_1$.",
      eq: [
        "$$z_{11}=\\left.\\dfrac{V_1}{I_1}\\right|_{I_2=0}$$",
        "$$z_{21}=\\left.\\dfrac{V_2}{I_1}\\right|_{I_2=0}$$",
      ],
      check: qc(
        "With port 2 open, which ratio gives $z_{21}$?",
        "$V_2/I_1$.",
        "$I_2/V_1$.",
        "$V_1/I_2$.",
        "a",
        "With $I_2=0$, the second Z equation becomes $V_2=z_{21}I_1$."
      ),
    },
    {
      id: "z-open-port1",
      view: "z-open1",
      highlight: "all",
      title: "Open port 1 to get $z_{12}$ and $z_{22}$",
      body: "Set $I_1=0$ by leaving port 1 open. Drive port 2 with $I_2$.",
      eq: [
        "$$z_{12}=\\left.\\dfrac{V_1}{I_2}\\right|_{I_1=0}$$",
        "$$z_{22}=\\left.\\dfrac{V_2}{I_2}\\right|_{I_1=0}$$",
      ],
      check: qc(
        "With port 1 open, which ratio gives $z_{12}$?",
        "$V_2/I_1$.",
        "$I_1/V_2$.",
        "$V_1/I_2$.",
        "c",
        "With $I_1=0$, the first equation becomes $V_1=z_{12}I_2$."
      ),
    },
    {
      id: "z-meaning",
      view: "z-meaning",
      highlight: "all",
      title: "What the four Z parameters mean",
      points: [
        "$z_{11}$ = open-circuit input impedance",
        "$z_{21}$ = open-circuit forward transfer impedance",
        "$z_{12}$ = open-circuit reverse transfer impedance",
        "$z_{22}$ = open-circuit output impedance",
      ],
      check: qc(
        "Which term is the open-circuit forward transfer impedance?",
        "$z_{11}$.",
        "$z_{21}$.",
        "$z_{12}$.",
        "b",
        "$z_{21}$ relates the output voltage $V_2$ to the input current $I_1$ when port 2 is open."
      ),
    },
    {
      id: "z-t-worked",
      view: "z-t",
      highlight: "all",
      title: "Worked Z example: use KVL",
      body: "T resistor network: $2\\,\\Omega$ from port 1 to the centre, $4\\,\\Omega$ from port 2 to the centre, $3\\,\\Omega$ shunt to ground. $I_1$ and $I_2$ both enter the network.",
      eq: [
        "$$I_{\\mathrm{shunt}}=I_1+I_2$$",
        "$$V_x=3(I_1+I_2)$$",
        "$$V_1=2I_1+V_x=5I_1+3I_2$$",
        "$$V_2=4I_2+V_x=3I_1+7I_2$$",
      ],
      check: qc(
        "What current flows through the $3\\,\\Omega$ shunt resistor?",
        "$I_1+I_2$.",
        "$I_1-I_2$.",
        "$I_2-I_1$.",
        "a",
        "Both port currents enter the central node, so they combine and flow through the shunt."
      ),
    },
    {
      id: "z-t-matrix",
      view: "z-matrix",
      highlight: "all",
      title: "Read the Z matrix from the equations",
      eq: "$$[Z]=\\begin{bmatrix}5&3\\\\3&7\\end{bmatrix}\\;\\Omega$$",
      check: qc(
        "Which is the correct Z matrix for the worked T network?",
        "$\\begin{bmatrix}2&3\\\\3&4\\end{bmatrix}\\Omega$.",
        "$\\begin{bmatrix}5&7\\\\3&3\\end{bmatrix}\\Omega$.",
        "$\\begin{bmatrix}5&3\\\\3&7\\end{bmatrix}\\Omega$.",
        "c",
        "The coefficients of $I_1$ and $I_2$ in the two voltage equations give the matrix entries directly."
      ),
    },
  ],
};

export const HABCD = {
  steps: [
    {
      id: "h-definition",
      view: "h-definition",
      highlight: "all",
      title: "Hybrid h parameters",
      body: "The h parameters mix voltage and current variables, which is why they are called hybrid parameters.",
      points: [
        "$h_{11}$ in Ohms",
        "$h_{12}$ dimensionless",
        "$h_{21}$ dimensionless",
        "$h_{22}$ in Siemens",
      ],
      eq: [
        "$$V_1=h_{11}I_1+h_{12}V_2$$",
        "$$I_2=h_{21}I_1+h_{22}V_2$$",
        "$$\\begin{bmatrix}V_1\\\\ I_2\\end{bmatrix}=\\begin{bmatrix}h_{11}&h_{12}\\\\ h_{21}&h_{22}\\end{bmatrix}\\begin{bmatrix}I_1\\\\ V_2\\end{bmatrix}$$",
      ],
      check: qc(
        "What are the units of $h_{11}$?",
        "Siemens.",
        "Ohms.",
        "Dimensionless.",
        "b",
        "$h_{11}$ multiplies current to produce voltage, so it is an impedance."
      ),
    },
    {
      id: "h-short-port2",
      view: "h-short2",
      highlight: "all",
      title: "Short port 2 for $h_{11}$ and $h_{21}$",
      body: "Set $V_2=0$.",
      eq: [
        "$$h_{11}=\\left.\\dfrac{V_1}{I_1}\\right|_{V_2=0}$$",
        "$$h_{21}=\\left.\\dfrac{I_2}{I_1}\\right|_{V_2=0}$$",
      ],
      check: qc(
        "With port 2 shorted, which ratio gives $h_{21}$?",
        "$V_1/I_1$.",
        "$V_1/V_2$.",
        "$I_2/I_1$.",
        "c",
        "With $V_2=0$, the second h equation becomes $I_2=h_{21}I_1$."
      ),
    },
    {
      id: "h-open-port1",
      view: "h-open1",
      highlight: "all",
      title: "Open port 1 for $h_{12}$ and $h_{22}$",
      body: "Set $I_1=0$.",
      eq: [
        "$$h_{12}=\\left.\\dfrac{V_1}{V_2}\\right|_{I_1=0}$$",
        "$$h_{22}=\\left.\\dfrac{I_2}{V_2}\\right|_{I_1=0}$$",
      ],
      check: qc(
        "With port 1 open, which ratio gives $h_{12}$?",
        "$V_1/V_2$.",
        "$I_2/V_2$.",
        "$I_2/I_1$.",
        "a",
        "With $I_1=0$, the first h equation becomes $V_1=h_{12}V_2$."
      ),
    },
    {
      id: "abcd-convention",
      view: "abcd-convention",
      highlight: "all",
      title: "ABCD uses the output current in the transmission direction",
      body: "The transmission parameters use port-2 voltage and the current flowing OUT of the network at port 2. The standard $I_2$ reference enters the network, so the transmission current is $-I_2$.",
      eq: [
        "$$V_1=AV_2-BI_2$$",
        "$$I_1=CV_2-DI_2$$",
      ],
      check: qc(
        "Why does the ABCD matrix use $-I_2$?",
        "Because $V_2$ is always negative.",
        "Because the transmission convention uses the port-2 current flowing out of the network.",
        "Because $I_2$ is zero for every two-port.",
        "b",
        "The standard $I_2$ reference enters port 2, so the outward transmission current is $-I_2$."
      ),
    },
    {
      id: "abcd-definition",
      view: "abcd-definition",
      highlight: "all",
      title: "ABCD equations and units",
      points: [
        "$A$ dimensionless",
        "$B$ Ohm",
        "$C$ Siemens",
        "$D$ dimensionless",
      ],
      eq: "$$\\begin{bmatrix}V_1\\\\ I_1\\end{bmatrix}=\\begin{bmatrix}A&B\\\\ C&D\\end{bmatrix}\\begin{bmatrix}V_2\\\\-I_2\\end{bmatrix}$$",
      check: qc(
        "Which ABCD parameters carry electrical units?",
        "$A$ and $D$ only.",
        "All four.",
        "$B$ is in Ohms and $C$ is in Siemens.",
        "c",
        "$A$ and $D$ are ratios, while $B$ is an impedance-type quantity and $C$ is an admittance-type quantity."
      ),
    },
    {
      id: "abcd-open",
      view: "abcd-open",
      highlight: "all",
      title: "Open port 2 for $A$ and $C$",
      body: "Open port 2: $I_2=0$.",
      eq: [
        "$$A=\\left.\\dfrac{V_1}{V_2}\\right|_{I_2=0}$$",
        "$$C=\\left.\\dfrac{I_1}{V_2}\\right|_{I_2=0}$$",
      ],
      check: qc(
        "With port 2 open, which pair is obtained?",
        "$A$ and $C$.",
        "$B$ and $D$.",
        "$h_{11}$ and $h_{21}$.",
        "a",
        "Setting $I_2=0$ removes the $B$ and $D$ terms from the ABCD equations."
      ),
    },
    {
      id: "abcd-short",
      view: "abcd-short",
      highlight: "all",
      title: "Short port 2 for $B$ and $D$",
      body: "Short port 2: $V_2=0$.",
      eq: [
        "$$B=\\left.\\dfrac{V_1}{-I_2}\\right|_{V_2=0}$$",
        "$$D=\\left.\\dfrac{I_1}{-I_2}\\right|_{V_2=0}$$",
      ],
      check: qc(
        "With port 2 shorted, which ratios define $B$ and $D$?",
        "$B=V_2/I_1$ and $D=I_2/V_1$.",
        "$B=V_1/(-I_2)$ and $D=I_1/(-I_2)$.",
        "$B=I_1/V_2$ and $D=V_1/V_2$.",
        "b",
        "With $V_2=0$, only the $-BI_2$ and $-DI_2$ terms remain."
      ),
    },
    {
      id: "abcd-series-example",
      view: "abcd-series",
      highlight: "all",
      title: "Simple ABCD example: a series impedance",
      body: "A single $4\\,\\Omega$ series resistor between input and output ports. This simple result will make cascade connections easy later.",
      eq: [
        "$$I_1=-I_2$$",
        "$$V_1=V_2+4I_1=V_2-4I_2$$",
        "$$[T]=\\begin{bmatrix}1&4\\\\0&1\\end{bmatrix}$$",
      ],
      check: qc(
        "For the $4\\,\\Omega$ series element, what is $B$?",
        "$0$.",
        "$1$.",
        "$4\\,\\Omega$.",
        "c",
        "$V_1=V_2-4I_2$, so the coefficient $B$ is $4\\,\\Omega$."
      ),
    },
  ],
};

export const RELATIONS = {
  steps: [
    {
      id: "parameter-relations",
      view: "parameter-relations",
      highlight: "all",
      title: "All four parameter sets describe the same two-port",
      body: "Y, Z, h and ABCD are different algebraic descriptions of the same external two-port behavior. If one complete set is known, another can be obtained by rearranging the equations. The large conversion table exists, but there is no need to memorise it. For a $2\\times 2$ $Z$ matrix, this inverse exists only if $\\Delta_z=z_{11}z_{22}-z_{12}z_{21}\\neq 0$.",
      eq: [
        "$$[Y]=[Z]^{-1}$$",
        "$$\\Delta_z=z_{11}z_{22}-z_{12}z_{21}\\neq 0$$",
      ],
      check: qc(
        "How are the complete Y and Z matrices related when the inverse exists?",
        "$[Y]=[Z]$.",
        "$[Y]=[Z]^{-1}$.",
        "$[Y]=-[Z]$.",
        "b",
        "Z maps currents to voltages; inverting that relationship maps voltages back to currents."
      ),
    },
    {
      id: "z-to-y-worked",
      view: "z-to-y",
      highlight: "all",
      title: "Worked conversion: Z to Y",
      body: "Use the earlier worked Z matrix.",
      eq: [
        "$$[Z]=\\begin{bmatrix}5&3\\\\3&7\\end{bmatrix}\\Omega$$",
        "$$\\Delta_Z=5(7)-3(3)=26$$",
        "$$[Y]=[Z]^{-1}=\\dfrac{1}{26}\\begin{bmatrix}7&-3\\\\-3&5\\end{bmatrix}\\mathrm{S}$$",
      ],
      check: qc(
        "What is the determinant of the worked Z matrix?",
        "$35$.",
        "$9$.",
        "$26$.",
        "c",
        "$5(7)-3(3)=35-9=26$."
      ),
    },
    {
      id: "reciprocity",
      view: "reciprocity",
      highlight: "all",
      title: "Reciprocity",
      body: "A reciprocal network behaves the same in the forward and reverse transfer sense described in the lecture. The lecture notes that networks made only from R, L, C and transformers, with no dependent or independent sources, are reciprocal.",
      eq: [
        "$$z_{12}=z_{21}$$",
        "$$y_{12}=y_{21}$$",
        "$$h_{12}=-h_{21}$$",
        "$$AD-BC=1$$",
      ],
      check: qc(
        "Which condition tests reciprocity using Z parameters?",
        "$z_{12}=z_{21}$.",
        "$z_{11}=z_{22}$.",
        "$z_{11}z_{22}=0$.",
        "a",
        "Equal transfer impedances $z_{12}$ and $z_{21}$ are the Z-parameter reciprocity condition."
      ),
    },
    {
      id: "symmetry",
      view: "symmetry",
      highlight: "all",
      title: "Symmetry is different from reciprocity",
      body: "A symmetrical network is electrically unchanged when port 1 and port 2 are interchanged.",
      eq: [
        "$$z_{11}=z_{22}$$",
        "$$y_{11}=y_{22}$$",
        "$$h_{11}h_{22}-h_{12}h_{21}=1$$",
        "$$A=D$$",
      ],
      check: qc(
        "Which condition indicates symmetry using ABCD parameters?",
        "$B=C$.",
        "$AD-BC=1$.",
        "$A=D$.",
        "c",
        "$A=D$ is the Week 9 symmetry condition for ABCD parameters."
      ),
    },
    {
      id: "classify-z",
      view: "classify-z",
      highlight: "all",
      title: "A network can be reciprocal without being symmetrical",
      body: "Reciprocal, but not symmetrical.",
      eq: [
        "$$[Z]=\\begin{bmatrix}5&3\\\\3&7\\end{bmatrix}\\Omega$$",
        "$$z_{12}=z_{21}=3\\quad\\checkmark$$",
        "$$z_{11}=5\\neq 7=z_{22}\\quad\\times$$",
      ],
      check: qc(
        "How should this Z matrix be classified?",
        "Symmetrical but not reciprocal.",
        "Reciprocal but not symmetrical.",
        "Neither reciprocal nor symmetrical.",
        "b",
        "The off-diagonal terms are equal, but the two diagonal terms are not."
      ),
    },
    {
      id: "symmetric-example",
      view: "symmetric-example",
      highlight: "all",
      title: "When both conditions hold",
      body: "Lecture-style symmetric T: $3\\,\\Omega$ left series, $3\\,\\Omega$ right series, $2\\,\\Omega$ shunt. Reciprocal because $z_{12}=z_{21}$. Symmetrical because $z_{11}=z_{22}$.",
      eq: [
        "$$V_1=5I_1+2I_2$$",
        "$$V_2=2I_1+5I_2$$",
        "$$[Z]=\\begin{bmatrix}5&2\\\\2&5\\end{bmatrix}\\Omega$$",
      ],
      check: qc(
        "A passive RLC network with no independent or dependent sources is, according to the lecture, generally",
        "reciprocal.",
        "always unstable.",
        "always asymmetrical.",
        "a",
        "The lecture states that R/L/C/transformer networks without sources are reciprocal."
      ),
    },
  ],
};

export const INTERCONNECT = {
  steps: [
    {
      id: "interconnection-condition",
      view: "interconnection-condition",
      highlight: "all",
      title: "Before combining blocks, check the port condition",
      body: "Two-port blocks may be connected in series, parallel or cascade, but the connection must preserve the port condition.",
      points: [
        "Series formula: valid for the common-ground arrangement shown in the lecture.",
        "Parallel formula: valid for the common-ground arrangement shown.",
        "Cascade formula: valid whether or not the component two-ports are common-ground.",
      ],
      check: qc(
        "Which connection rule does the lecture state works whether or not the component two-ports are common-ground?",
        "Series.",
        "Parallel.",
        "Cascade.",
        "c",
        "The cascade relationship does not require the common-ground restriction used by the shown series and parallel connections."
      ),
    },
    {
      id: "series-connection",
      view: "series-connection",
      highlight: "all",
      title: "Series connection: add Z matrices",
      body: "In a series connection the corresponding port currents are the same and the port voltages add. Z parameters therefore combine directly.",
      eq: "$$[Z]=[Z_1]+[Z_2]$$",
      check: qc(
        "Which parameter set is most convenient for a valid series connection?",
        "Z parameters.",
        "Y parameters.",
        "ABCD parameters.",
        "a",
        "Series port voltages add for the same port currents, matching the Z-parameter form."
      ),
    },
    {
      id: "parallel-connection",
      view: "parallel-connection",
      highlight: "all",
      title: "Parallel connection: add Y matrices",
      body: "In parallel, the port voltages are common while the port currents add. Y parameters therefore combine directly.",
      eq: "$$[Y]=[Y_1]+[Y_2]$$",
      check: qc(
        "Which parameter set adds directly for a valid parallel connection?",
        "Z.",
        "Y.",
        "h.",
        "b",
        "Parallel currents add at common port voltages, which matches the Y-parameter equations."
      ),
    },
    {
      id: "cascade-connection",
      view: "cascade-connection",
      highlight: "all",
      title: "Cascade connection: multiply ABCD matrices",
      body: "In cascade, the output of the first block feeds the input of the second. Transmission parameters are designed for this. Matrix multiplication is taken in physical order.",
      eq: [
        "$$[T]=[T_1][T_2]$$",
        "$$[T_1][T_2]\\neq[T_2][T_1]\\quad\\text{in general}$$",
      ],
      check: qc(
        "Two blocks $T_1$ then $T_2$ are cascaded. What is the overall matrix?",
        "$[T_1]+[T_2]$.",
        "$[T_2][T_1]$.",
        "$[T_1][T_2]$.",
        "c",
        "ABCD matrices multiply in the same order as the cascade."
      ),
    },
    {
      id: "series-parallel-worked",
      view: "series-parallel-worked",
      highlight: "all",
      title: "Quick matrix examples",
      eq: [
        "$$[Z_1]=\\begin{bmatrix}2&1\\\\1&3\\end{bmatrix},\\quad [Z_2]=\\begin{bmatrix}1&\\frac12\\\\ \\frac12&2\\end{bmatrix}$$",
        "$$[Z]=\\begin{bmatrix}3&\\frac32\\\\ \\frac32&5\\end{bmatrix}$$",
        "$$[Y]=2[Y_1]=\\begin{bmatrix}2&-1\\\\-1&2\\end{bmatrix}\\mathrm{S}$$",
      ],
      check: qc(
        "If two identical parallel two-ports each have matrix $[Y_1]$, what is the total Y matrix?",
        "$[Y_1]^{-1}$.",
        "$2[Y_1]$.",
        "$[Y_1]/2$.",
        "b",
        "Parallel two-port admittance matrices add."
      ),
    },
    {
      id: "cascade-worked",
      view: "cascade-worked",
      highlight: "all",
      title: "Worked cascade example",
      body: "This makes physical sense: cascading a $2\\,\\Omega$ and a $3\\,\\Omega$ series impedance produces a total series impedance of $5\\,\\Omega$.",
      eq: [
        "$$[T_1]=\\begin{bmatrix}1&2\\\\0&1\\end{bmatrix},\\qquad [T_2]=\\begin{bmatrix}1&3\\\\0&1\\end{bmatrix}$$",
        "$$[T]=[T_1][T_2]=\\begin{bmatrix}1&5\\\\0&1\\end{bmatrix}$$",
      ],
      check: qc(
        "What is the overall ABCD matrix?",
        "$\\begin{bmatrix}1&5\\\\0&1\\end{bmatrix}$.",
        "$\\begin{bmatrix}2&3\\\\0&1\\end{bmatrix}$.",
        "$\\begin{bmatrix}1&6\\\\0&1\\end{bmatrix}$.",
        "a",
        "Multiply the two matrices in order; the $B$ terms add for these simple series-impedance blocks."
      ),
    },
  ],
};
