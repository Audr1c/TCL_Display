document.addEventListener('DOMContentLoaded', () => {
    const departuresContainer = document.getElementById('departures-container');
    const apiUrl = 'https://data.grandlyon.com/fr/datapusher/ws/rdata/tcl_sytral.tclpassagearret/all.json?maxfeatures=-1&filename=prochains-passages-reseau-transports-commun-lyonnais-rhonexpress-disponibilites-temps-reel&start=1';
    const stopId = '48189';
    const line = 'C8'; // We will check for C8A and C8B
    const direction = 'Vaulx-Résistance';

    async function fetchDepartures() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const filteredDepartures = data.values.filter(departure =>
                departure.id.startsWith(stopId) &&
                (departure.ligne === 'C8A' || departure.ligne === 'C8B') &&
                departure.direction === direction
            );

            displayDepartures(filteredDepartures);
        } catch (error) {
            console.error('Error fetching departures:', error);
            departuresContainer.innerHTML = `<p style="color: #ffcc00;">Erreur lors de la récupération des données.</p>`;
        }
    }

    function displayDepartures(departures) {
        departuresContainer.innerHTML = '';

        if (departures.length === 0) {
            departuresContainer.innerHTML = '<p>Aucun prochain départ pour cette sélection.</p>';
            return;
        }

        departures.sort((a, b) => {
            const timeA = parseInt(a.delaipassage.split(' ')[0]);
            const timeB = parseInt(b.delaipassage.split(' ')[0]);
            return timeA - timeB;
        });

        departures.slice(0, 5).forEach(departure => {
            const departureElement = document.createElement('div');
            departureElement.classList.add('departure');

            const lineInfo = document.createElement('div');
            lineInfo.classList.add('line-info');

            const lineLogo = document.createElement('div');
            lineLogo.classList.add('line-logo');
            lineLogo.textContent = departure.ligne.replace('A', '').replace('B', ''); // C8A/C8B -> C8

            lineInfo.appendChild(lineLogo);

            const directionElement = document.createElement('div');
            directionElement.classList.add('direction');
            directionElement.textContent = departure.direction;

            const timeElement = document.createElement('div');
            timeElement.classList.add('time');
            timeElement.textContent = departure.delaipassage;

            departureElement.appendChild(lineInfo);
            departureElement.appendChild(directionElement);
            departureElement.appendChild(timeElement);

            departuresContainer.appendChild(departureElement);
        });
    }

    fetchDepartures();
    setInterval(fetchDepartures, 30000); // Refresh every 30 seconds
});
