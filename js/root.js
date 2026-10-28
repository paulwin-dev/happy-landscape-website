function getCmsValue(content, path) {
    return path.split('.').reduce(function (value, key) {
        return value && value[key];
    }, content);
}

function applyCmsContent(content, root) {
    var scope = root || document;

    scope.querySelectorAll('[data-cms-text]').forEach(function (element) {
        var value = getCmsValue(content, element.getAttribute('data-cms-text'));
        if (typeof value === 'string' || typeof value === 'number') {
            element.textContent = value;
            if (element.hasAttribute('data-cms-lines') || (element.tagName === 'P' && value.includes('\n'))) {
                element.style.whiteSpace = 'pre-line';
            }
        }
    });

    scope.querySelectorAll('[data-cms-href]').forEach(function (element) {
        var value = getCmsValue(content, element.getAttribute('data-cms-href'));
        if (typeof value === 'string') {
            element.setAttribute('href', value);
        }
    });

    scope.querySelectorAll('[data-cms-value]').forEach(function (element) {
        var value = getCmsValue(content, element.getAttribute('data-cms-value'));
        if (typeof value === 'string') {
            element.value = value;
        }
    });

    scope.querySelectorAll('[data-cms-description]').forEach(function (element) {
        var value = getCmsValue(content, element.getAttribute('data-cms-description'));
        if (typeof value === 'string') {
            element.setAttribute('content', value);
        }
    });
}

var siteContentPromise;

function loadSiteContent() {
    if (!siteContentPromise) {
        siteContentPromise = fetch('data/generell/website.json')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Die Website-Inhalte konnten nicht geladen werden: ' + response.status);
                }
                return response.json();
            });
    }
    return siteContentPromise;
}

window.loadCmsContent = function (url) {
    return fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Die Inhaltsdatei ' + url + ' konnte nicht geladen werden: ' + response.status);
            }
            return response.json();
        })
        .then(function (content) {
            applyCmsContent(content);
            return content;
        });
};

class SiteHeader extends HTMLElement {
    connectedCallback() {
        const isUeberUns = window.location.pathname.endsWith('ueber-uns.html');
        const ueberUnsCurrent = isUeberUns ? ' aria-current="page"' : '';
        const isLeistungen = window.location.pathname.endsWith('leistungen.html');
        const leistungenCurrent = isLeistungen ? ' aria-current="page"' : '';
        const isKontakt = window.location.pathname.endsWith('kontakt.html');
        const kontaktCurrent = isKontakt ? ' aria-current="page"' : '';

        this.innerHTML = `
            <header>
                <a href="./"><img class="logo" src="data/generell/logo.png" alt="Happy Landscape" data-cms-alt="company.logoAlt"></a>
                <nav aria-label="Hauptmenü" data-cms-aria-label="navigation.ariaLabel">
                    <a href="ueber-uns.html"${ueberUnsCurrent} data-site-label="navigation.about">Über Uns</a>
                    <a href="leistungen.html"${leistungenCurrent} data-site-label="navigation.services">Leistungen</a>
                    <a href="kontakt.html"${kontaktCurrent} data-site-label="navigation.contact">Kontakt</a>
                </nav>
            </header>
        `;
        loadSiteContent().then(function (content) {
            this.querySelectorAll('[data-site-label]').forEach(function (link) {
                link.textContent = getCmsValue(content, link.getAttribute('data-site-label'));
            });
            this.querySelectorAll('[data-cms-alt]').forEach(function (image) {
                image.setAttribute('alt', getCmsValue(content, image.getAttribute('data-cms-alt')));
            });
            this.querySelectorAll('[data-cms-aria-label]').forEach(function (element) {
                element.setAttribute('aria-label', getCmsValue(content, element.getAttribute('data-cms-aria-label')));
            });
        }.bind(this)).catch(function (error) {
            console.error('Die Navigation konnte nicht konfiguriert werden.', error);
        });
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
                        <div class="logo" data-footer="company.brandName">happy landscape</div>
                        <div class="s" data-footer="company.tagline">Garten- &amp; Landschaftsplanung</div>
                        <p><span data-footer="company.name">Happy Landscape GmbH</span><br><span data-footer="company.address"></span></p>
                    </div>
                </div>
                <div class="bar"><span data-footer="footer.copyright">© 2026 Happy Landscape GmbH</span>
                    <nav aria-label="Rechtliches" data-cms-aria-label="footer.legalNavigationLabel"><a href="impressum.html"${impressumCurrent} data-footer="footer.imprintLabel">Impressum</a><a href="datenschutz.html"${datenschutzCurrent} data-footer="footer.privacyLabel">Datenschutz</a></nav>
                </div>
            </footer>
        `;
        loadSiteContent().then(function (content) {
            this.querySelectorAll('[data-footer]').forEach(function (element) {
                var value = getCmsValue(content, element.getAttribute('data-footer'));
                element.textContent = value;
                if (element.getAttribute('data-footer') === 'company.address') {
                    element.style.whiteSpace = 'pre-line';
                }
            });
            var footerGrid = this.querySelector('.fg');
            [content.company.primaryContact, content.company.secondaryContact].forEach(function (contact) {
                var card = document.createElement('div');
                var heading = document.createElement('h3');
                heading.textContent = contact.name;

                var details = document.createElement('p');
                var phone = document.createElement('a');
                phone.href = contact.phoneHref;
                phone.textContent = content.footer.phoneLabel + ' ' + contact.phone;
                var mobile = document.createElement('a');
                mobile.href = contact.mobileHref;
                mobile.textContent = content.footer.mobileLabel + ' ' + contact.mobile;
                details.append(phone, document.createElement('br'), mobile, document.createElement('br'));

                var email = document.createElement('a');
                email.href = contact.emailHref;
                email.textContent = contact.email;
                details.appendChild(email);
                card.append(heading, details);
                footerGrid.appendChild(card);
            });
            this.querySelectorAll('[data-cms-aria-label]').forEach(function (element) {
                element.setAttribute('aria-label', getCmsValue(content, element.getAttribute('data-cms-aria-label')));
            });
        }.bind(this)).catch(function (error) {
            console.error('Der Seitenfuß konnte nicht konfiguriert werden.', error);
        });
    }
}

customElements.define('site-footer', SiteFooter);

var pageContentFile = document.body.getAttribute('data-cms-content-file');
if (pageContentFile) {
    loadCmsContent(pageContentFile).catch(function (error) {
        console.error('Die Seiteninhalte konnten nicht geladen werden.', error);
    });
}