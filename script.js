document.addEventListener('DOMContentLoaded', () => {
    const laurentBonnevayContainer = document.getElementById('laurent-bonnevay-departures');
    const entpeContainer = document.getElementById('entpe-departures');
    const apiUrl = 'https://data.grandlyon.com/fr/datapusher/ws/rdata/tcl_sytral.tclpassagearret/all.json?maxfeatures=-1&filename=prochains-passages-reseau-transports-commun-lyonnais-rhonexpress-disponibilites-temps-reel&start=1';

    const stations = [
        {
            name: 'Laurent Bonnevay',
            container: laurentBonnevayContainer,
            lines: [
                { stopId: 'S5101', line: 'C8', direction: 'Vaulx-Résistance' },
                { stopId: 'S5101', line: '57', direction: 'Laurent Bonnevay' },
                { stopId: 'S5101', line: 'C3', direction: 'Laurent Bonnevay' }
            ]
        },
        {
            name: 'ENTPE',
            container: entpeContainer,
            lines: [
                { stopId: 'S34560', line: 'C8', direction: 'Grange Blanche' },
                { stopId: 'S33665', line: '57', direction: 'Laurent Bonnevay' },
                { stopId: 'S11435', line: 'C3', direction: 'Laurent Bonnevay' }
            ]
        }
    ];

    async function fetchDepartures() {
        try {
            // In a real browser environment, the cookies would be sent automatically.
            // For the purpose of this script, we assume the user is logged in on their browser.
            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            stations.forEach(station => {
                displayStationDepartures(station, data.values);
            });

        } catch (error) {
            console.error('Error fetching departures:', error);
            laurentBonnevayContainer.innerHTML = `<p style="color: #ffcc00;">Erreur lors de la récupération des données.</p>`;
            entpeContainer.innerHTML = `<p style="color: #ffcc00;">Erreur lors de la récupération des données.</p>`;
        }
    }

    function displayStationDepartures(station, allDepartures) {
        station.container.innerHTML = '';

        station.lines.forEach(lineInfo => {
            const lineDepartures = allDepartures.filter(departure =>
                departure.id.startsWith(lineInfo.stopId.replace('S','')) &&
                (departure.ligne === lineInfo.line || departure.ligne === `${lineInfo.line}A` || departure.ligne === `${lineInfo.line}B`) &&
                departure.direction === lineInfo.direction
            );

            const lineDeparturesContainer = document.createElement('div');
            lineDeparturesContainer.classList.add('line-departures');

            if (lineDepartures.length > 0) {
                lineDepartures.sort((a, b) => {
                    const timeA = parseInt(a.delaipassage.split(' ')[0]);
                    const timeB = parseInt(b.delaipassage.split(' ')[0]);
                    return timeA - timeB;
                });

                lineDepartures.slice(0, 2).forEach(departure => {
                    const departureElement = document.createElement('div');
                    departureElement.classList.add('departure');

                    const lineInfoDiv = document.createElement('div');
                    lineInfoDiv.classList.add('line-info');

                    const lineLogo = document.createElement('div');
                    lineLogo.classList.add('line-logo', lineInfo.line);
                    lineLogo.textContent = lineInfo.line;

                    lineInfoDiv.appendChild(lineLogo);

                    const directionElement = document.createElement('div');
                    directionElement.classList.add('direction');
                    directionElement.textContent = departure.direction;

                    const departureDetails = document.createElement('div');
                    departureDetails.classList.add('departure-details');

                    const departureTime = document.createElement('div');
                    departureTime.classList.add('departure-time');
                    departureTime.textContent = departure.heurepassage.split(' ')[1].substring(0, 5);

                    const waitTime = document.createElement('div');
                    waitTime.classList.add('wait-time');

                    const timeText = document.createElement('span');
                    timeText.textContent = departure.delaipassage;

                    const typeSymbol = document.createElement('span');
                    typeSymbol.classList.add('type-symbol');
                    typeSymbol.textContent = departure.type === 'E' ? 'E' : 'T';

                    waitTime.appendChild(timeText);
                    waitTime.appendChild(typeSymbol);

                    departureDetails.appendChild(departureTime);
                    departureDetails.appendChild(waitTime);

                    departureElement.appendChild(lineInfoDiv);
                    departureElement.appendChild(directionElement);
                    departureElement.appendChild(departureDetails);

                    lineDeparturesContainer.appendChild(departureElement);
                });
            } else {
                lineDeparturesContainer.innerHTML = `<p>Pas de départ pour la ligne ${lineInfo.line}.</p>`;
            }
            station.container.appendChild(lineDeparturesContainer);
        });
    }

    fetchDepartures();
    setInterval(fetchDepartures, 30000);
});
