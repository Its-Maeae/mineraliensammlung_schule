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
              <h2>Angaben gemäß § 5 TMG</h2>
              <p><strong>Samuel von Pufendorf Gymnasium Flöha</strong></p>
              <p>Turnerstraße 16<br/>
                09557 Flöha<br/>
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
              <h2>Haftung für Inhalte</h2>
              <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und AktualitÃ¤t der Inhalte können wir jedoch keine Gewähr Übernehmen.</p>
            </div>
            
            <div className="legal-section">
              <h2>Datenschutz</h2>
              <p>Diese Website verwendet keine Cookies und sammelt keine personenbezogenen Daten. Die Mineraliensammlung dient ausschließlich wissenschaftlichen und pädagogischen Zwecken.</p>
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
              <h2>📚 Hauptliteratur</h2>
              <ul className="sources-list">
                <li>Klein, C. & Dutrow, B. (2007). Manual of Mineral Science. 23rd Edition. John Wiley & Sons.</li>
                <li>Deer, W.A., Howie, R.A. & Zussman, J. (2013). An Introduction to the Rock-Forming Minerals. 3rd Edition. Mineralogical Society.</li>
                <li>Strunz, H. & Nickel, E.H. (2001). Strunz Mineralogical Tables. 9th Edition. E. Schweizerbart'sche Verlagsbuchhandlung.</li>
              </ul>
            </div>
            
            <div className="sources-section">
              <h2>🌐 Online-Ressourcen</h2>
              <ul className="sources-list">
                <li><a href="https://www.mindat.org" target="_blank" rel="noopener noreferrer">Mindat.org - Mineraldatenbank</a></li>
                <li><a href="https://rruff.info" target="_blank" rel="noopener noreferrer">RRUFF Project - Mineraldatenbank</a></li>
                <li><a href="https://webmineral.com" target="_blank" rel="noopener noreferrer">Webmineral - Mineralogische Datenbank</a></li>
              </ul>
            </div>
            
            <div className="sources-section">
              <h2>🔬 Technische Ausstattung</h2>
              <ul className="sources-list">
                <li>Stereo-Mikroskop Leica EZ4 HD für Detailaufnahmen</li>
                <li>Digitalkamera Nikon D7500 für Übersichtsbilder</li>
                <li>Mineralbestimmung mit Mohshärte-Skala und Strichtafel</li>
              </ul>
            </div>
            
            <div className="sources-section">
              <h2>🎓 Mitwirkende Personen</h2>
              <ul className="sources-list">
                <li><strong>Dr. Schmidt</strong> - Projektleitung, geologische Expertise</li>
                <li><strong>Sarah Müller</strong> - Digitalisierung und Fotografie</li>
                <li><strong>Tom Weber</strong> - Webentwicklung und Datenbank</li>
                <li><strong>Schüler der Klassen 9-12</strong> - Katalogisierung und Beschreibung</li>
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
            <p className="page-description">Haben Sie Fragen zur Sammlung oder benötigen Sie Unterstützung?</p>
          </div>
          
          <div className="contact-content">
            <div className="contact-grid">
              <div className="contact-card">
                <h3>🏫 Schuladresse</h3>
                <p><strong>Samuel von Pufendorf Gymnasium Flöha</strong></p>
                <p>Turnerstraße 16<br/>
                  09557 Flöha<br/>
                  Deutschland</p>
                <p>📞 <strong>03726 58160</strong></p>
              </div>
              
              <div className="contact-card">
                <h3>👤 Ansprechpartner</h3>
                <p><strong>Frau Barthel</strong><br/>
                  Fachbereich Geologie</p>
                <p>📧 manuela-barthel@gymnasium-floeha.lernsax.de</p>
                <p>🕒 Sprechzeiten: Mo-Fr 8:00-15:00</p>
              </div>
              
              <div className="contact-card">
                <h3>💻 Technischer Support</h3>
                <p><strong>Marius Schmieder</strong><br/>
                  Schüler Klasse 10c</p>
                <p>📧 marius-schmieder@gymnasium-floeha.lernsax.de</p>
                <p>🔧 Bei technischen Problemen mit der Website</p>
              </div>
              
              <div className="contact-card">
                <h3>🌐 Online</h3>
                <p><strong>Website:</strong><br/>
                  <a href="https://gymnasium-floeha.de" target="_blank" rel="noopener noreferrer">
                    gymnasium-floeha.de
                  </a></p>
                <p><strong>Sammlung:</strong><br/>
                  Diese Webanwendung</p>
              </div>
            </div>
            
            <div className="contact-info">
              <h2>ℹ️ Wichtige Informationen</h2>
              <div className="info-grid">
                <div className="info-item">
                  <h4>🔍 Besichtigungen</h4>
                  <p>Besichtigungen der physischen Sammlung sind nach Voranmeldung möglich. Bitte kontaktieren Sie Dr. Schmidt mindestens eine Woche im Voraus.</p>
                </div>
                <div className="info-item">
                  <h4>📖 Bildungsnutzung</h4>
                  <p>Diese Sammlung steht für Bildungszwecke zur Verfügung. Schulklassen und Interessierte sind herzlich willkommen.</p>
                </div>
                <div className="info-item">
                  <h4>🤝 Kooperationen</h4>
                  <p>Wir freuen uns über Kooperationen mit anderen Schulen, Universitäten und geologischen Vereinen.</p>
                </div>
                <div className="info-item">
                  <h4>💝 Spenden</h4>
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