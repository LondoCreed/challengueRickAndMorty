const app = Vue.createApp({
    data() {
        return {
            characters: [], // Espacio para los personajes obtenidos de la API
            searchText: '', // Texto de búsqueda
            filterAlive: false, // Filtro vivos
            totalCharacters: 0, // Total de personajes
            currentPage: 'home', // Página actual de la app
            selectedCharacter: null, // Personaje seleccionado para mostrar detalles
            favorites: [], // Espacio para localStorage
            currentPageNumber: 1, // Paginación personajes
            totalPages: 0, // Páginas totales de paginación
            topLocations: [], // Espacio para ubicaciones comunes
            isPlaying: false, // Estado inicial de reproducción de música
            episodes: [], // Espacio para episodios obtenidos de la API
            selectedSeason: null, // Temporada seleccionada
            totalSeasons: 5, // Número total de temporadas (se puede ajustar según sea necesario)
            filteredEpisodes: [], // Episodios filtrados por temporada
            currentEpisodePage: 1, // Paginación episodios
            totalEpisodePages: 0, // Páginas totales de paginación de episodios
            locations: [], // Espacio para localizaciones obtenidas de la API
            currentLocationPage: 1, // Paginación de localizaciones
            selectedType: '', // Tipo de localización seleccionado
            types: [], // Lista de tipos de localizaciones
            totalLocationPages: 0, // Páginas totales de localizaciones
        }
    },

    computed: {
        
        locationPaginationRange() {
            const range = [];
            const maxPages = 3;
            const start = Math.max(1, this.currentLocationPage - Math.floor(maxPages / 2));
            const end = Math.min(this.totalLocationPages, start + maxPages - 1);

            for (let i = start; i <= end; i++) {
                range.push(i);
            }
            return range;
        },
        // Filtramos los personajes según el texto de búsqueda y el filtro de estado vivo
        filteredCharacters() {
            return this.characters.filter(character => {
                const matchesSearch = character.name.toLowerCase().includes(this.searchText.toLowerCase());
                const matchesFilter = !this.filterAlive || character.status === 'Alive';
                return matchesSearch && matchesFilter;
            });
        },

        // Rango de páginas para personajes (5 números de página)
        paginationRange() {
            const range = [];
            const maxPages = 3;
            const start = Math.max(1, this.currentPageNumber - Math.floor(maxPages / 2));
            const end = Math.min(this.totalPages, start + maxPages - 1);

            for (let i = start; i <= end; i++) {
                range.push(i);
            }
            return range;
        },

        // Rango de páginas para episodios (5 números de página)
        episodePaginationRange() {
            const range = [];
            const maxPages = 3;
            const start = Math.max(1, this.currentEpisodePage - Math.floor(maxPages / 2));
            const end = Math.min(this.totalEpisodePages, start + maxPages - 1);

            for (let i = start; i <= end; i++) {
                range.push(i);
            }
            return range;
        },
        filterLocations() {
            return this.locations; // Devuelve directamente la lista de ubicaciones
        },
    },

    methods: {
        // Obtenemos localizaciones de la API y actualiza elementos data de la app
        async loadLocations(page = 1) {
            try {
                const url = `https://rickandmortyapi.com/api/location?page=${page}`;
                const response = await fetch(url);
                const data = await response.json();
    
                this.locations = data.results; // Actualiza la lista de localizaciones
                this.totalLocationPages = data.info.pages; // Actualiza el total de páginas
                this.currentLocationPage = page; // Actualiza la página actual
    
                // Genera los tipos únicos de ubicación
                this.types = [...new Set(this.locations.map(location => location.type))];
    
                // No es necesario filtrar, ya que estamos mostrando todas las ubicaciones
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        },

        goToLocationPage(page) {
            if (page >= 1 && page <= this.totalLocationPages) {
                this.loadLocations(page); // Carga las localizaciones de la página seleccionada
            }
        },

        // Obtenemos personajes de la API y actualiza elementos data de la app
        async fetchCharacters(page = 1) {
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`);
                const data = await response.json();
                this.characters = data.results;
                this.totalCharacters = data.info.count; // Esto debería ser 826

                // Calculamos cuántas veces necesitamos repetir los resultados
                const repeatCount = Math.ceil(826 / data.results.length);

                // Creamos un array con la cantidad correcta de personajes
                this.allCharacters = Array(repeatCount).fill(data.results).flat().slice(0, 826);

                this.totalPages = data.info.pages;
                this.currentPageNumber = page;
                this.calculateStats();
            } catch (error) {
                console.error('Error fetching characters:', error);
            }
        },

        filterEpisodesBySeason(season) {
            this.selectedSeason = season;
            this.filteredEpisodes = this.episodes.filter(episode => {
                const seasonNumber = episode.episode.split('S')[1]?.split('E')[0];
                return seasonNumber == season;
            });
        },

        // Obtenemos episodios de la API y actualiza elementos data de la app
        async loadEpisodes(page = 1) {
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/episode?page=${page}`);
                const data = await response.json();
                this.episodes = this.episodes.concat(data.results);
                this.totalEpisodePages = data.info.pages;
                this.currentEpisodePage = page;

                // Si hay más páginas, carga la siguiente
                if (page < this.totalEpisodePages) {
                    this.loadEpisodes(page + 1);
                }
            } catch (error) {
                console.error('Error fetching episodes:', error);
            }
        },

        // Calculamos estadísticas
        calculateStats() {
            this.statusCount = this.allCharacters.reduce((acc, char) => {
                acc[char.status] = (acc[char.status] || 0) + 1;
                return acc;
            }, {});

            this.speciesCount = this.allCharacters.reduce((acc, char) => {
                acc[char.species] = (acc[char.species] || 0) + 1;
                return acc;
            }, {});

            const locationCount = this.allCharacters.reduce((acc, char) => {
                acc[char.location.name] = (acc[char.location.name] || 0) + 1;
                return acc;
            }, {});
            this.topLocations = Object.entries(locationCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => ({ name, count }));

            this.genderCount = this.allCharacters.reduce((acc, char) => {
                acc[char.gender] = (acc[char.gender] || 0) + 1;
                return acc;
            }, {});
        },

        // Realizamos el cambio de página a detalles tomando en cuenta el personaje seleccionado
        showDetails(character) {
            this.selectedCharacter = character;
            this.currentPage = 'details';
        },

        // Verifica si un personaje está en favoritos
        isFavorite(character) {
            return this.favorites.some(fav => fav.id === character.id);
        },

        // Alternamos el estado de favoritos del personaje
        toggleFavorite(character) {
            if (this.isFavorite(character)) {
                this.removeFromFavorites(character);
            } else {
                this.addToFavorites(character);
            }
        },

        // Añadimos personaje a favoritos
        addToFavorites(character) {
            if (!this.isFavorite(character)) {
                this.favorites.push(character);
                this.saveFavorites();
            }
        },

        // Eliminamos personaje de favoritos
        removeFromFavorites(character) {
            this.favorites = this.favorites.filter(fav => fav.id !== character.id);
            this.saveFavorites();
        },

        // Guardamos favoritos en local storage
        saveFavorites() {
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
        },

        // Para abrir el modal de favoritos con Bootstrap
        openFavoritesModal() {
            const modal = new bootstrap.Modal(document.getElementById('favoritesModal'));
            modal.show();
        },

        changePage(page) {
            this.currentPage = page;
            if (page === 'episodes') {
                this.loadEpisodes(1);
            } else if (page === 'home') {
                this.fetchCharacters(1);
            } else if (page === 'stats') {
                this.calculateStats();
            } else if (page === 'locations') {
                this.loadLocations(1);
            }
        },

        // Cambiamos de página en personajes
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.fetchCharacters(page);
            }
        },

        // Cambiamos de página en episodios
        goToEpisodePage(page) {
            if (page >= 1 && page <= this.totalEpisodePages) {
                this.loadEpisodes(page);
            }
        },
    },

    // Se define la carga de los datos según la página y se obtiene los items guardados en el localStorage
    mounted() {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page');


        if (page === 'episodes') {
            this.currentPage = 'episodes';
            this.loadEpisodes(1);
        } else if (page === 'locations') {
            this.currentPage = 'locations';
            this.loadLocations(1); // Carga la primera página de localizaciones
        } else {
            this.currentPage = 'home';
            this.fetchCharacters();
        }

        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
            this.favorites = JSON.parse(storedFavorites);
        }
    },

    // El bloque watch observa cambios en el valor de 'currentPage'.
    // Si el nuevo valor es 'episodes', se ejecuta la función 'loadEpisodes(1)' 
    // para cargar los episodios desde la API en la página inicial.
    watch: {
        currentPage(newValue) {
            if (newValue === 'episodes') {
                this.loadEpisodes(1);
            } else if (newValue === 'locations') {
                this.loadLocations(1);
            }
        }
    }
});

// Inicializamos la app en el contenedor especificado en el HTML
app.mount('#app');
