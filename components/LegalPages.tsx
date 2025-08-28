import React from 'react';

interface LegalPagesProps {
  currentPage: string;
}

export default function LegalPages({ currentPage }: LegalPagesProps) {
  if (currentPage === 'impressum') {
    return (
      <section className="page active">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Impressum</h1>
            <p className="page-description">Rechtliche Informationen und Angaben zur Verantwortlichkeit</p>
          </div>
          
          <div className="legal-content">
            <div className="legal-section">
              <h2>Angaben gemÃ¤ÃŸ Â§ 5 TMG</h2>
              <p><strong>Samuel von Pufendorf Gymnasium FlÃ¶ha</strong></p>
              <p>TurnerstraÃŸe 16<br/>
                09557 FlÃ¶ha<br/>
                Deutschland</p>
            </div>
            
            <div className="legal-section">
              <h2>Vertreten durch</h2>
              <p>Schulleitung: Frau Noack<br/>
                Fachbereich Geologie: Herr Sommer</p>
            </div>
            
            <div className="legal-section">
              <h2>Kontakt</h2>
              <p>Telefon: 03726 58160<br/>
                E-Mail: gymnasium-floeha@landkreis-mittelsachsen.de<br/>
                Internet: www.gymnasium-floeha.de</p>
            </div>
            
            <div className="legal-section">
              <h2>Haftung fÃ¼r Inhalte</h2>
              <p>Als Diensteanbieter sind wir gemÃ¤ÃŸ Â§ 7 Abs.1 TMG fÃ¼r eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Die Inhalte unserer Seiten wurden mit grÃ¶ÃŸter Sorgfalt erstellt. FÃ¼r die Richtigkeit, VollstÃ¤ndigkeit und AktualitÃ¤t der Inhalte kÃ¶nnen wir jedoch keine GewÃ¤hr Ã¼bernehmen.</p>
            </div>
            
            <div className="legal-section">
              <h2>Datenschutz</h2>
              <p>Diese Website verwendet keine Cookies und sammelt keine personenbezogenen Daten. Die Mineraliensammlung dient ausschlieÃŸlich wissenschaftlichen und pÃ¤dagogischen Zwecken.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (currentPage === 'quellen') {
    return (
      <section className="page active">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Quellen & Literatur</h1>
            <p className="page-description">Wissenschaftliche Grundlagen und Referenzen</p>
          </div>
          
          <div className="sources-content">
            <div className="sources-section">
              <h2>ðŸ“š Hauptliteratur</h2>
              <ul className="sources-list">
                <li>Klein, C. & Dutrow, B. (2007). Manual of Mineral Science. 23rd Edition. John Wiley & Sons.</li>
                <li>Deer, W.A., Howie, R.A. & Zussman, J. (2013). An Introduction to the Rock-Forming Minerals. 3rd Edition. Mineralogical Society.</li>
                <li>Strunz, H. & Nickel, E.H. (2001). Strunz Mineralogical Tables. 9th Edition. E. Schweizerbart'sche Verlagsbuchhandlung.</li>
              </ul>
            </div>
            
            <div className="sources-section">
              <h2>ðŸŒ Online-Ressourcen</h2>
              <ul className="sources-list">
                <li><a href="https://www.mindat.org" target="_blank" rel="noopener noreferrer">Mindat.org - Mineraldatenbank</a></li>
                <li><a href="https://rruff.info" target="_blank" rel="noopener noreferrer">RRUFF Project - Mineraldatenbank</a></li>
                <li><a href="https://webmineral.com" target="_blank" rel="noopener noreferrer">Webmineral - Mineralogische Datenbank</a></li>
              </ul>
            </div>
            
            <div className="sources-section">
              <h2>ðŸ”¬ Technische Ausstattung</h2>
              <ul className="sources-list">
                <li>Stereo-Mikroskop Leica EZ4 HD fÃ¼r Detailaufnahmen</li>
                <li>Digitalkamera Nikon D7500 fÃ¼r Ãœbersichtsbilder</li>
                <li>Mineralbestimmung mit MohshÃ¤rte-Skala und Strichtafel</li>
              </ul>
            </div>
            
            <div className="sources-section">
              <h2>ðŸŽ“ Mitwirkende Personen</h2>
              <ul className="sources-list">
                <li><strong>Dr. Schmidt</strong> - Projektleitung, geologische Expertise</li>
                <li><strong>Sarah MÃ¼ller</strong> - Digitalisierung und Fotografie</li>
                <li><strong>Tom Weber</strong> - Webentwicklung und Datenbank</li>
                <li><strong>SchÃ¼ler der Klassen 9-12</strong> - Katalogisierung und Beschreibung</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (currentPage === 'kontakt') {
    return (
      <section className="page active">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Kontakt & Support</h1>
            <p className="page-description">Haben Sie Fragen zur Sammlung oder benÃ¶tigen Sie UnterstÃ¼tzung?</p>
          </div>
          
          <div className="contact-content">
            <div className="contact-grid">
              <div className="contact-card">
                <h3>ðŸ« Schuladresse</h3>
                <p><strong>Samuel von Pufendorf Gymnasium FlÃ¶ha</strong></p>
                <p>TurnerstraÃŸe 16<br/>
                  09557 FlÃ¶ha<br/>
                  Deutschland</p>
                <p>ðŸ“ž <strong>03726 58160</strong></p>
              </div>
              
              <div className="contact-card">
                <h3>ðŸ‘¤ Ansprechpartner</h3>
                <p><strong>Frau Barthel</strong><br/>
                  Fachbereich Geologie</p>
                <p>ðŸ“§ manuela-barthel@gymnasium-floeha.lernsax.de</p>
                <p>ðŸ•’ Sprechzeiten: Mo-Fr 8:00-15:00</p>
              </div>
              
              <div className="contact-card">
                <h3>ðŸ’» Technischer Support</h3>
                <p><strong>Marius Schmieder</strong><br/>
                  SchÃ¼ler Klasse 10c</p>
                <p>ðŸ“§ marius-schmieder@gymnasium-floeha.lernsax.de</p>
                <p>ðŸ“§ Bei technischen Problemen mit der Website</p>
              </div>
              
              <div className="contact-card">
                <h3>ðŸŒ Online</h3>
                <p><strong>Website:</strong><br/>
                  <a href="https://gymnasium-floeha.de" target="_blank" rel="noopener noreferrer">
                    gymnasium-floeha.de
                  </a></p>
                <p><strong>Sammlung:</strong><br/>
                  Diese Webanwendung</p>
              </div>
            </div>
            
            <div className="contact-info">
              <h2>â„¹ï¸ Wichtige Informationen</h2>
              <div className="info-grid">
                <div className="info-item">
                  <h4>ðŸ” Besichtigungen</h4>
                  <p>Besichtigungen der physischen Sammlung sind nach Voranmeldung mÃ¶glich. Bitte kontaktieren Sie Dr. Schmidt mindestens eine Woche im Voraus.</p>
                </div>
                <div className="info-item">
                  <h4>ðŸ“– Bildungsnutzung</h4>
                  <p>Diese Sammlung steht fÃ¼r Bildungszwecke zur VerfÃ¼gung. Schulklassen und Interessierte sind herzlich willkommen.</p>
                </div>
                <div className="info-item">
                  <h4>ðŸ¤ Kooperationen</h4>
                  <p>Wir freuen uns Ã¼ber Kooperationen mit anderen Schulen, UniversitÃ¤ten und geologischen Vereinen.</p>
                </div>
                <div className="info-item">
                  <h4>ðŸŽ Spenden</h4>
                  <p>Mineralspenden zur Erweiterung der Sammlung werden gerne entgegengenommen. Bitte vorher Kontakt aufnehmen.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}