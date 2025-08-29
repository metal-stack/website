import React from 'react';
import Layout from '@theme/Layout';
import Container from "../components/Container";
import Row from "../components/Row";

export default function Imprint() {
  return (
    <Layout title="Imprint" description="Imprint of metal-stack.io">
        <Row className="bg-white dark:bg-neutral-950 border-b-neutral-100 dark:border-b-neutral-800 border-b-2 pt-42 pb-42">
            <Container>
                <h1 className='text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-amber-600'>Imprint</h1>
            </Container>
        </Row>
      <Row className="dark:bg-neutral-900">
        <Container>
            <div className="pt-16 sm:pt-24 pb-20 sm:flex items-end gap-8 relative isolate">
              <div className="w-full">
                <h2>Information pursuant to § 5 German Digital Services Act (DDG)</h2>
                <p>
                    x-cellent technologies GmbH<br />
                    Rosenkavalierplatz 10<br />
                    81925 M&uuml;nchen
                </p>

                <p>
                    Commercial Register: HRB 121329<br />
                    Registration court: Amtsgericht M&uuml;nchen
                </p>

                <p>
                    <span className="font-bold">Represented by:</span><br />
                    Markus Fensterer
                </p>

                <h2>Contact</h2>
                <p>
                    Phone: +49899292740<br />
                    E-mail: info@metal-stack.io
                </p>

                <h2>VAT ID</h2>
                <p>
                    Sales tax identification number according to Sect. 27 a of the Sales Tax Law:<br />
                    DE197111444
                </p>

                <h2>Person responsible for editorial</h2>
                <p>
                    Markus Fensterer<br />
                    x-cellent technologies GmbH<br />
                    Rosenkavalierplatz 10<br />
                    81925 M&uuml;nchen
                </p>

                <h2>Dispute resolution proceedings in front of a consumer arbitration board</h2>
                <p>
                    We are not willing or obliged to participate in dispute resolution proceedings in front of
                    a consumer arbitration board.
                </p>
              </div>
          </div>
        </Container>
      </Row>
    </Layout>
  );
}
