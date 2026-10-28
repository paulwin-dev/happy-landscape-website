function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[character];
    });
}

var servicesGrid = document.getElementById('services-grid');

function renderConsultationAreas(areas) {
    if (!Array.isArray(areas)) {
        throw new Error('Die Auswahl der Wohnbereiche hat ein ungültiges Format.');
    }

    var choices = document.getElementById('consultation-areas');
    choices.replaceChildren();
    areas.forEach(function (area) {
        var label = document.createElement('label');
        var input = document.createElement('input');
        input.type = 'radio';
        input.name = 'Wohnbereich';
        input.value = area.value;
        input.required = true;
        label.append(input, document.createTextNode(' ' + area.label));
        choices.appendChild(label);
    });
}

var servicesContentPromise = loadCmsContent('data/leistungen/seite.json')
    .then(function (content) {
        renderConsultationAreas(content.form.areas);
        return content;
    })
    .catch(function (error) {
        console.error('Die Inhalte der Leistungsseite konnten nicht geladen werden.', error);
        return null;
    });

var servicesPromise = fetch('data/leistungen/leistungen.json')
    .then(function (response) {
        if (!response.ok) {
            throw new Error('Leistungsdatei konnte nicht geladen werden: ' + response.status);
        }
        return response.json();
    });

Promise.all([servicesContentPromise, servicesPromise])
    .then(function (results) {
        var servicesContent = results[0];
        var data = results[1];
        if (!data.Leistungen || !Array.isArray(data.Leistungen)) {
            throw new Error('Die Leistungsliste hat ein ungültiges Format.');
        }

        if (data.Leistungen.length === 0) {
            var emptyStatus = document.createElement('p');
            emptyStatus.className = 'services-status';
            emptyStatus.textContent = servicesContent
                ? servicesContent.services.emptyText
                : 'Unsere Leistungen werden in Kürze vorgestellt.';
            servicesGrid.replaceChildren(emptyStatus);
            return;
        }

        servicesGrid.innerHTML = data.Leistungen.map(function (service, index) {
            var image = service.Foto
                ? '<img src="' + escapeHtml(service.Foto) + '" alt="' + escapeHtml(service.Titel) + '" loading="lazy">'
                : '';

            return '<article class="service-card">' +
                '<div class="service-card__image">' + image + '</div>' +
                '<div class="service-card__content">' +
                '<span class="service-card__number">' + String(index + 1).padStart(2, '0') + ' / ' +
                String(data.Leistungen.length).padStart(2, '0') + '</span>' +
                '<h3>' + escapeHtml(service.Titel) + '</h3>' +
                '<p>' + escapeHtml(service.Beschreibung) + '</p>' +
                '<a class="service-card__link" href="kontakt.html">' +
                escapeHtml(servicesContent ? servicesContent.services.cardCta : 'Projekt besprechen') +
                ' <span aria-hidden="true">→</span></a>' +
                '</div></article>';
        }).join('');
    })
    .catch(function (error) {
        var errorStatus = document.createElement('p');
        errorStatus.className = 'services-status';
        servicesContentPromise.then(function (servicesContent) {
            errorStatus.textContent = servicesContent
                ? servicesContent.services.errorText
                : 'Die Leistungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.';
            servicesGrid.replaceChildren(errorStatus);
        });
        console.error('Leistungen konnten nicht geladen werden.', error);
    });
