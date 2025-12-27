
import InicioSection from "./HomeComponents/InicioSection";
import DescripcionSection from "./HomeComponents/DescripcionSection";
import ProcessSection from "./HomeComponents/ProcessSection";
import CamposSection from "./HomeComponents/CamposSection";
import ContactoSection from "./footer/Contacto";
import SEOSection from "./HomeComponents/SEOSection";

const HomePage = () => {

  // Sección informativa alternada con más temas


  return (
    <div>
      <InicioSection/>
      <DescripcionSection/>
      <ProcessSection/>
      <CamposSection/>
      <SEOSection/>
      <ContactoSection/>

    </div>
  );
};

export default HomePage;
