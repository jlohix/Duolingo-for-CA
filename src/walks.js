import Section2Lesson, { SECTION2_LABS } from "./section2/index.jsx";
import Section3Lesson, { SECTION3_LABS } from "./section3/index.jsx";
import Section4Lesson, { SECTION4_LABS } from "./section4/index.jsx";
import Section5Lesson, { SECTION5_LABS } from "./section5/index.jsx";
import Section6Lesson, { SECTION6_LABS } from "./section6/index.jsx";
import Section7Lesson, { SECTION7_LABS } from "./section7/index.jsx";
import Section8Lesson, { SECTION8_LABS } from "./section8/index.jsx";

export const SECTION_WALKS = {
  2: { Lesson: Section2Lesson, labs: SECTION2_LABS },
  3: { Lesson: Section3Lesson, labs: SECTION3_LABS },
  4: { Lesson: Section4Lesson, labs: SECTION4_LABS },
  5: { Lesson: Section5Lesson, labs: SECTION5_LABS },
  6: { Lesson: Section6Lesson, labs: SECTION6_LABS },
  7: { Lesson: Section7Lesson, labs: SECTION7_LABS },
  8: { Lesson: Section8Lesson, labs: SECTION8_LABS },
};
