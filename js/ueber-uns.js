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

var teamList = document.getElementById('team-list');

var teamContentPromise = loadCmsContent('data/ueber-uns/seite.json')
    .catch(function (error) {
        console.error('Die Inhalte der Über-uns-Seite konnten nicht geladen werden.', error);
        return null;
    });

var teamPromise = fetch('data/ueber-uns/arbeiter.json')
    .then(function (response) {
        if (!response.ok) {
            throw new Error('Mitarbeiterdatei konnte nicht geladen werden: ' + response.status);
        }
        return response.json();
    });

Promise.all([teamContentPromise, teamPromise])
    .then(function (results) {
        var teamContent = results[0];
        var data = results[1];
        if (!data.Mitarbeiter || !Array.isArray(data.Mitarbeiter)) {
            throw new Error('Die Mitarbeiterliste hat ein ungültiges Format.');
        }

        if (data.Mitarbeiter.length === 0) {
            var emptyStatus = document.createElement('p');
            emptyStatus.className = 'team__status';
            emptyStatus.textContent = teamContent
                ? teamContent.team.emptyText
                : 'Unser Team stellt sich bald vor.';
            teamList.replaceChildren(emptyStatus);
            return;
        }

        teamList.innerHTML = data.Mitarbeiter.map(function (employee) {
            var image = employee.Foto
                ? '<img src="' + escapeHtml(employee.Foto) + '" alt="' +
                    escapeHtml(teamContent ? teamContent.team.portraitAltPrefix : 'Porträt von') + ' ' +
                    escapeHtml(employee.Name) + '">'
                : '';
            var role = employee.Funktion
                ? '<p class="team__role">' + escapeHtml(employee.Funktion) + '</p>'
                : '';
            var description = employee.Beschreibung
                ? '<p>' + escapeHtml(employee.Beschreibung) + '</p>'
                : '';

            return '<article class="team__card">' + image +
                '<div class="team__card-content"><h3>' + escapeHtml(employee.Name) + '</h3>' +
                role + description + '</div></article>';
        }).join('');
    })
    .catch(function (error) {
        teamContentPromise.then(function (teamContent) {
            var errorStatus = document.createElement('p');
            errorStatus.className = 'team__status';
            errorStatus.textContent = teamContent
                ? teamContent.team.errorText
                : 'Das Team konnte nicht geladen werden. Bitte versuchen Sie es später erneut.';
            teamList.replaceChildren(errorStatus);
        });
        console.error('Mitarbeiter konnten nicht geladen werden.', error);
    });
