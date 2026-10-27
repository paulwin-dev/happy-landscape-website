class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header>
                <a href="./"><img class="logo" src="data/generell/logo.png" alt="Happy Landscape"></a>
                <nav aria-label="Hauptmenü">
                    <a href="ueber-uns">Über Uns</a>
                    <a href="projekte">Leistungen</a>
                    <a href="kontakt">Kontakt</a>
                </nav>
            </header>
        `;
    }
}

customElements.define('site-header', SiteHeader);

class SiteFooter extends HTMLElement {
    connectedCallback() {
        const isImpressum = window.location.pathname.endsWith('impressum.html');
        const isDatenschutz = window.location.pathname.endsWith('datenschutz.html');
        const impressumCurrent = isImpressum ? ' aria-current="page"' : '';
        const datenschutzCurrent = isDatenschutz ? ' aria-current="page"' : '';

        this.innerHTML = `
            <footer id="kontakt">
                <div class="fg">
                    <div>
                        <div class="logo">happy landscape</div>
                        <div class="s">Garten- &amp; Landschaftsplanung</div>
                        <p>Happy Landscape GmbH<br>Herweghstraße 2<br>15859 Storkow/Mark</p>
                    </div>
                    <div>
                        <h3>Dipl.-Ing. Maria Sader</h3>
                        <p>Tel. +49 33678 / 72 75 3<br>Mobil +49 179 / 977 25 70<br><a
                            href="mailto:m.sader@happy-landscape.de">m.sader@happy-landscape.de</a></p>
                    </div>
                    <div>
                        <h3>Dipl.-Ing. Philipp Nenninger</h3>
                        <p>Tel. +49 30 / 48 09 80 33<br>Mobil +49 173 / 241 51 06<br><a
                            href="mailto:p.nenninger@happy-landscape.de">p.nenninger@happy-landscape.de</a></p>
                    </div>
                </div>
                <div class="bar"><span>© 2026 Happy Landscape GmbH</span>
                    <nav aria-label="Rechtliches"><a href="impressum.html"${impressumCurrent}>Impressum</a><a href="datenschutz.html"${datenschutzCurrent}>Datenschutz</a></nav>
                </div>
            </footer>
        `;
    }
}

customElements.define('site-footer', SiteFooter);