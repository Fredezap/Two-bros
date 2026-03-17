import { SectionContainer } from '../../common/CommonModals';
import { MashingVesselIcon, KettleIcon } from '../../common/Icons';
import { Beer } from 'lucide-react';

const MashingSection = (props) => {
  // ...lógica y renderizado de la sección de maceración...
  return (
    <SectionContainer title="Maceración" icon={<MashingVesselIcon className="w-5 h-5"/>}>
      {/* Aquí va el contenido de la sección de maceración */}
    </SectionContainer>
  );
};

const BoilSection = (props) => {
  // ...lógica y renderizado de la sección de cocción...
  return (
    <SectionContainer title="Cocción / Lúpulos" icon={<KettleIcon className="w-5 h-5"/>}>
      {/* Aquí va el contenido de la sección de cocción */}
    </SectionContainer>
  );
};

const FermentationSection = (props) => {
  // ...lógica y renderizado de la sección de fermentación...
  return (
    <SectionContainer title="Fermentación y Otros" icon={<Beer className="w-5 h-5"/>}>
      {/* Aquí va el contenido de la sección de fermentación */}
    </SectionContainer>
  );
};

export { MashingSection, BoilSection, FermentationSection };
