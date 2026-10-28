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

function renderHomeFeatures(features) {
    if (!Array.isArray(features)) {
        throw new Error('Die Feature-Liste der Startseite hat ein ungültiges Format.');
    }

    document.getElementById('home-features').innerHTML = features.map(function (feature) {
        return '<div><b>' + escapeHtml(feature.title) + '</b><span>' +
            escapeHtml(feature.description) + '</span></div>';
    }).join('');
}

var homepageContentPromise = loadCmsContent('data/start/startseite.json')
    .then(function (content) {
        renderHomeFeatures(content.features);
        return content;
    })
    .catch(function (error) {
        console.error('Die Inhalte der Startseite konnten nicht geladen werden.', error);
        return null;
    });

var projectsPromise = fetch('data/start/projekte.json')
    .then(function (response) {
        if (!response.ok) {
            throw new Error('Projektdatei konnte nicht geladen werden: ' + response.status);
        }
        return response.json();
    });

Promise.all([homepageContentPromise, projectsPromise])
    .then(function (results) {
        var homepageContent = results[0];
        var data = results[1];
        if (!data.Projekte || !Array.isArray(data.Projekte)) {
            throw new Error('Die Projektliste hat ein ungültiges Format.');
        }

        if (data.Projekte.length === 0) {
            document.getElementById('projects-status').textContent =
                homepageContent ? homepageContent.projects.emptyText : 'Unsere Projekte werden in Kürze vorgestellt.';
            document.getElementById('projects-status').hidden = false;
            return;
        }

        document.getElementById('g').innerHTML = data.Projekte.map(function (p) {
            var image = p.Foto
                ? '<img src="' + escapeHtml(p.Foto) + '" alt="' + escapeHtml(p.Titel) + '">'
                : '';
            return '<figure>' + image + '<figcaption><b>' + escapeHtml(p.Titel) + '</b><span>' + escapeHtml(p.Beschreibung) + '</span></figcaption></figure>';
        }).join('');
    })
    .catch(function (error) {
        var status = document.getElementById('projects-status');
        homepageContentPromise.then(function (homepageContent) {
            status.textContent = homepageContent
                ? homepageContent.projects.errorText
                : 'Die Projekte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.';
            status.hidden = false;
        });
        console.error('Projekte konnten nicht geladen werden.', error);
    });