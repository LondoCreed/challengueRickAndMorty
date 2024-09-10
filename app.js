// Creación de la aplicación Vue
const app = Vue.createApp({
    // Definición de los datos reactivos de la aplicación
    data() {
        return {
            characters: [],
            searchText: '',
            filterAlive: false,
            totalCharacters: 0,
            currentPage: 'home',
            selectedCharacter: null,
            favorites: [],
            isLoading: false,
            hasMore: true,
            currentApiPage: 1,
            topLocations: [],
            allLocations: [],
            episodes: [],
            selectedSeason: null,
            totalSeasons: 5,
            filteredEpisodes: [],
            currentEpisodePage: 1,
            totalEpisodePages: 0,
            episodeSearchText: '',
            locations: [],
            currentLocationPage: 1,
            types: [],
            totalLocationPages: 0,
            selectedType: null,
            filteredLocations: [],
            locationSearchText: '',
            statusCount: {},
            speciesCount: {},
            genderCount: {},
        }
    },

    // Propiedades computadas
    computed: {
        filteredCharacters() {
            return this.characters.filter(character => {
                const matchesSearch = character.name.toLowerCase().includes(this.searchText.toLowerCase());
                const matchesFilter = !this.filterAlive || character.status === 'Alive';
                return matchesSearch && matchesFilter;
            });
        },
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
        filteredEpisodeList() {
            let filtered = this.episodes;

            if (this.episodeSearchText) {
                const searchText = this.episodeSearchText.toLowerCase();
                filtered = filtered.filter(episode =>
                    episode.name.toLowerCase().includes(searchText) ||
                    episode.episode.toLowerCase().includes(searchText)
                );
            }

            if (this.selectedSeason) {
                filtered = filtered.filter(episode => {
                    const seasonNumber = episode.episode.split('S')[1]?.split('E')[0];
                    return seasonNumber == this.selectedSeason;
                });
            }

            return filtered;
        },
        filteredLocationList() {
            let filtered = this.locations;

            if (this.locationSearchText) {
                const searchText = this.locationSearchText.toLowerCase();
                filtered = filtered.filter(location =>
                    location.name.toLowerCase().includes(searchText) ||
                    location.type.toLowerCase().includes(searchText) ||
                    location.dimension.toLowerCase().includes(searchText)
                );
            }

            if (this.selectedType) {
                filtered = filtered.filter(location => location.type === this.selectedType);
            }

            return filtered;
        },
    },

    // Métodos de la aplicación
    methods: {
        loadMore() {
            if (this.hasMore) {
                this.fetchCharacters(this.currentApiPage + 1); // Llamar a la siguiente página
            }
        },
        loadLess() {
            if (this.currentApiPage > 1) {
                this.characters.splice(-20); // Remueve el último lote de personajes (asumiendo que se cargan 20 por página)
                this.currentApiPage--;
                this.hasMore = true; // Permite volver a cargar más personajes
            }
        },
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Esto añade un desplazamiento suave
            });
        },
        async fetchCharacters(page = 1) {
            try {
                this.isLoading = true; // Mostrar indicador de carga
        
                let hasResults = false;
        
                // Verificar si tenemos un total de páginas ya definido, si no, definirlo al obtener la primera página
                if (!this.totalPages) {
                    const firstPageResponse = await fetch(`https://rickandmortyapi.com/api/character?page=1`);
                    const firstPageData = await firstPageResponse.json();
                    this.totalPages = firstPageData.info.pages;
                }
        
                // Continuar buscando mientras no haya resultados y no se supere el número máximo de páginas
                while (!hasResults && page <= this.totalPages) {
                    const url = `https://rickandmortyapi.com/api/character?page=${page}`;
                    const response = await fetch(url);
                    const data = await response.json();
        
                    // Verificar si la página tiene resultados
                    if (data.results && data.results.length > 0) {
                        // Si la página tiene resultados, los añadimos a la lista
                        this.characters = [...this.characters, ...data.results];
                        hasResults = true; // Marcar que encontramos una página con resultados
                        this.currentApiPage = page; // Actualizar la página actual
                    } else {
                        // Si la página está vacía, pasar a la siguiente
                        page++;
                    }
                }
        
                // Actualizar si hay más páginas por cargar
                this.hasMore = this.currentApiPage < this.totalPages;
                this.isLoading = false; // Ocultar indicador de carga
            } catch (error) {
                console.error('Error fetching characters:', error);
                this.isLoading = false; // Asegurar de ocultar el indicador en caso de error
            }
        
        },
        async fetchAllCharacters() {
            try {
                const allCharacters = [];
                let page = 1;
                let totalPages;

                do {
                    const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`);
                    const data = await response.json();
                    allCharacters.push(...data.results);
                    totalPages = data.info.pages;
                    page++;
                } while (page <= totalPages);

                this.allCharacters = allCharacters;
                this.totalCharacters = allCharacters.length;

                this.calculateStats();
            } catch (error) {
                console.error('Error fetching characters:', error);
            }
        },
        loadMore() {
            this.fetchCharacters(this.currentApiPage + 1);
        },
        resetCharacters() {
            this.characters = [];
            this.currentApiPage = 1;
            this.hasMore = true;
            this.fetchCharacters();
        },
        async loadLocations(page = 1) {
            try {
                const url = `https://rickandmortyapi.com/api/location?page=${page}`;
                const response = await fetch(url);
                const data = await response.json();

                this.locations = data.results;
                this.totalLocationPages = data.info.pages;
                this.currentLocationPage = page;
                this.types = [...new Set(this.locations.map(location => location.type))];
                this.updateFilteredLocations();
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        },
        filterLocationsByType(type) {
            this.selectedType = type === this.selectedType ? null : type;
            this.updateFilteredLocations();
        },
        updateFilteredLocations() {
            this.filteredLocations = this.filteredLocationList;
        },
        goToLocationPage(page) {
            if (page >= 1 && page <= this.totalLocationPages) {
                this.loadLocations(page);
            }
        },
        filterEpisodesBySeason(season) {
            this.selectedSeason = season === this.selectedSeason ? null : season;
            this.updateFilteredEpisodes();
        },
        updateFilteredEpisodes() {
            this.filteredEpisodes = this.filteredEpisodeList;
        },
        async loadEpisodes(page = 1) {
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/episode?page=${page}`);
                const data = await response.json();
                this.episodes = this.episodes.concat(data.results);
                this.totalEpisodePages = data.info.pages;
                this.currentEpisodePage = page;

                if (page < this.totalEpisodePages) {
                    await this.loadEpisodes(page + 1);
                } else {
                    this.updateFilteredEpisodes();
                }
            } catch (error) {
                console.error('Error fetching episodes:', error);
            }
        },
        calculateStats() {
            if (!this.allCharacters.length) {
                console.log('No characters available to calculate stats.');
                return;
            }

            const locationCount = this.allCharacters.reduce((acc, char) => {
                acc[char.location.name] = (acc[char.location.name] || 0) + 1;
                return acc;
            }, {});

            this.allLocations = Object.entries(locationCount)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => ({ name, count }));

            this.topLocations = this.allLocations.slice(0, 5);

            this.statusCount = this.allCharacters.reduce((acc, char) => {
                acc[char.status] = (acc[char.status] || 0) + 1;
                return acc;
            }, {});
            
            // Convierte el objeto en un array de pares [estado, conteo]
            const sortedStatusCountArray = Object.entries(this.statusCount)
                .sort((a, b) => b[1] - a[1]); // Ordena de mayor a menor
            
            // Convierte el array de nuevo en un objeto
            this.statusCount = Object.fromEntries(sortedStatusCountArray);

            this.speciesCount = Object.entries(this.allCharacters.reduce((acc, char) => {
                acc[char.species] = (acc[char.species] || 0) + 1;
                return acc;
            }, {}))
            .sort(([, countA], [, countB]) => countB - countA) 
            .slice(0, 3) 
            .reduce((acc, [species, count]) => {
                acc[species] = count;
                return acc;
            }, {});

            this.genderCount = this.allCharacters.reduce((acc, char) => {
                acc[char.gender] = (acc[char.gender] || 0) + 1;
                return acc;
            }, {});

            console.log('Status count:', this.statusCount);
            console.log('Species count:', this.speciesCount);
            console.log('Top locations:', this.topLocations);
            console.log('Gender count:', this.genderCount);
        },
    
        showDetails(character) {
            this.selectedCharacter = character;
            this.currentPage = 'details';
        },
        isFavorite(character) {
            return this.favorites.some(fav => fav.id === character.id);
        },
        toggleFavorite(character) {
            if (this.isFavorite(character)) {
                this.removeFromFavorites(character);
            } else {
                this.addToFavorites(character);
            }
        },
        addToFavorites(character) {
            if (!this.isFavorite(character)) {
                this.favorites.push(character);
                this.saveFavorites();
            }
        },
        removeFromFavorites(character) {
            this.favorites = this.favorites.filter(fav => fav.id !== character.id);
            this.saveFavorites();
        },
        saveFavorites() {
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
        },
        openFavoritesModal() {
            const modal = new bootstrap.Modal(document.getElementById('favoritesModal'));
            modal.show();
        },
        changePage(page) {
            this.currentPage = page;
            if (page === 'episodes') {
                this.loadEpisodes(1);
            } else if (page === 'home') {
                this.resetCharacters();
            } else if (page === 'stats') {
                this.fetchAllCharacters();
            } else if (page === 'locations') {
                this.loadLocations(1);
            }
        },
        goToEpisodePage(page) {
            if (page >= 1 && page <= this.totalEpisodePages) {
                this.currentEpisodePage = page;
                this.updateFilteredEpisodes();
            }
        },
    },

    mounted() {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page');

        if (page === 'episodes') {
            this.currentPage = 'episodes';
            this.loadEpisodes(1);
        } else if (page === 'locations') {
            this.currentPage = 'locations';
            this.loadLocations(1);
        } else if (page === 'stats') {
            this.currentPage = 'stats';
            this.fetchAllCharacters();
        } else {
            this.currentPage = 'home';
            this.fetchCharacters();
        }

        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
            this.favorites = JSON.parse(storedFavorites);
        }
        this.fetchAllCharacters();
    },

    watch: {
        searchText() {
            this.resetCharacters();
        },
        filterAlive() {
            this.resetCharacters();
        },
        currentPage(newValue) {
            if (newValue === 'episodes') {
                this.loadEpisodes(1);
            } else if (newValue === 'locations') {
                this.loadLocations(1);
            }
        },
        episodeSearchText() {
            this.updateFilteredEpisodes();
        },
        locationSearchText() {
            this.updateFilteredLocations();
        }
    }
});

app.mount('#app');