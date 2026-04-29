import { axes } from "../../../lib/landing-content";
import { SectionContainer } from "../shared/SectionContainer";
import { SectionHeading } from "../shared/SectionHeading";
import { AxisCard } from "./AxisCard";

export function Axes() {
  return (
    <SectionContainer id="ejes" spacing="lg">
      <SectionHeading
        badge="Estructura del proyecto"
        title="Tres fases articuladas en cinco años"
        subtitle="El proyecto se estructura en tres objetivos específicos secuenciales: la captura y análisis de datos alimenta los procesos de bioeconomía y, en paralelo, los métodos analíticos del centro de referencia."
      />

      <ul
        role="list"
        className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
      >
        {axes.map((axis) => (
          <li key={axis.code}>
            <AxisCard axis={axis} />
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}
