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

fetch('data/start/projekte.json')
    .then(function (response) {
        if (!response.ok) {
            throw new Error('Projektdatei konnte nicht geladen werden: ' + response.status);
        }
        return response.json();
    })
    .then(function (projects) {
        document.getElementById('g').innerHTML = projects.map(function (p) {
            var image = p.Foto
                ? '<img src="' + escapeHtml(p.Foto) + '" alt="' + escapeHtml(p.Titel) + '">'
                : '';
            return '<figure>' + image + '<figcaption><b>' + escapeHtml(p.Titel) + '</b><span>' + escapeHtml(p.Beschreibung) + '</span></figcaption></figure>';
        }).join('');
    })
    .catch(function (error) {
        console.error('Projekte konnten nicht geladen werden.', error);
    });