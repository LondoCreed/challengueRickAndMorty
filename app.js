const app = Vue.createApp({
    data() {
        return {
            characters: [], // Espacio para los personajes obtenidos de la data(API)
            searchText: '', // Texto de búsqueda
            filterAlive: false, // Filtro vivos
            totalCharacters: 0, // Total de personajes
            currentPage: 'home', // Página actual de la app
            selectedCharacter: null, // Personaje tarjetado para mostrar detalles
            favorites: [], // Espacio para localStorage
            currentPageNumber: 1, // Paginación personajes
            totalPages: 0, // Páginas totales de paginación
            episodes: [], // Espacio para episodios obtenidos de la data(API)
            currentEpisodePage: 1, // Paginación episodios
            totalEpisodePages: 0, // Páginas totales de paginación de episodios
            topLocations: [], // Espacio para ubicaciones comunes
            statusCount: {}, // Contador de estados
            speciesCount: {}, // Contador de especies
            genderCount: {} // Contador de géneros
        }
    },

    computed: {
        // Filtramos los personajes según el texto de búsqueda y el filtro de estado vivo
        filteredCharacters() {
            return this.characters.filter(character => {
                const matchesSearch = character.name.toLowerCase().includes(this.searchText.toLowerCase())
                const matchesFilter = !this.filterAlive || character.status === 'Alive'
                return matchesSearch && matchesFilter
            })
        },

        // Rango de páginas para personajes (5 números de página)
        paginationRange() {
            const range = []
            const maxPages = 5
            const start = Math.max(1, this.currentPageNumber - Math.floor(maxPages / 2))
            const end = Math.min(this.totalPages, start + maxPages - 1)
            
            for (let i = start; i <= end; i++) {
                range.push(i)
            }
            return range
        },

        // Rango de páginas para episodios (5 números de página)
        episodePaginationRange() {
            const range = []
            const maxPages = 5
            const start = Math.max(1, this.currentEpisodePage - Math.floor(maxPages / 2))
            const end = Math.min(this.totalEpisodePages, start + maxPages - 1)
            
            for (let i = start; i <= end; i++) {
                range.push(i)
            }
            return range
        }
    },

    methods: {
        // Obtenemos personajes de la API y actualiza elementos data de la app
        async fetchCharacters(page = 1) {
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`)
                const data = await response.json()
                this.characters = data.results
                this.totalCharacters = data.info.count
                this.totalPages = data.info.pages
                this.currentPageNumber = page
                this.calculateStats()
            } catch (error) {
                console.error('Error fetching characters:', error)
            }
        },

        // Obtenemos episodios de la API y actualiza elementos data de la app
        async loadEpisodes(page = 1) {
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/episode?page=${page}`)
                const data = await response.json()
                this.episodes = data.results
                this.totalEpisodePages = data.info.pages
                this.currentEpisodePage = page
            } catch (error) {
                console.error('Error fetching episodes:', error)
            }
        },

        // Calculamos estadísticas
        calculateStats() {
            this.statusCount = this.characters.reduce((acc, char) => {
                acc[char.status] = (acc[char.status] || 0) + 1
                return acc
            }, {})

            this.speciesCount = this.characters.reduce((acc, char) => {
                acc[char.species] = (acc[char.species] || 0) + 1
                return acc
            }, {})

            const locationCount = this.characters.reduce((acc, char) => {
                acc[char.location.name] = (acc[char.location.name] || 0) + 1
                return acc
            }, {})
            this.topLocations = Object.entries(locationCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => ({ name, count }))

            this.genderCount = this.characters.reduce((acc, char) => {
                acc[char.gender] = (acc[char.gender] || 0) + 1
                return acc
            }, {})
        },

        // Realizamos el cambio de página a detalles tomando en cuenta el personaje seleccionado
        showDetails(character) {
            this.selectedCharacter = character
            this.currentPage = 'details'
        },

        // Verifica si un personaje está en favoritos
        isFavorite(character) {
            return this.favorites.some(fav => fav.id === character.id)
        },

        // Alternamos el estado de favoritos del personaje
        toggleFavorite(character) {
            if (this.isFavorite(character)) {
                this.removeFromFavorites(character)
            } else {
                this.addToFavorites(character)
            }
        },

        // Añadimos personaje a favoritos
        addToFavorites(character) {
            if (!this.isFavorite(character)) {
                this.favorites.push(character)
                this.saveFavorites()
            }
        },

        // Eliminamos personaje de favoritos
        removeFromFavorites(character) {
            this.favorites = this.favorites.filter(fav => fav.id !== character.id)
            this.saveFavorites()
        },

        // Guardamos favoritos en local storage
        saveFavorites() {
            localStorage.setItem('favorites', JSON.stringify(this.favorites))
        },

        // Para abrir el modal de favoritos con Bootstrap
        openFavoritesModal() {
            const modal = new bootstrap.Modal(document.getElementById('favoritesModal'))
            modal.show()
        },

        // Cambiamos de página en personajes
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.fetchCharacters(page)
            }
        },

        // Cambiamos de página en episodios
        goToEpisodePage(page) {
            if (page >= 1 && page <= this.totalEpisodePages) {
                this.loadEpisodes(page)
            }
        }
    },

    mounted() {
        const urlParams = new URLSearchParams(window.location.search)
        const page = urlParams.get('page')

        if (page === 'episodes') {
            this.currentPage = 'episodes'
            this.loadEpisodes(1)
        } else {
            this.fetchCharacters()
        }

        const storedFavorites = localStorage.getItem('favorites')
        if (storedFavorites) {
            this.favorites = JSON.parse(storedFavorites)
        }
    },

    watch: {
        currentPage(newValue) {
            if (newValue === 'episodes') {
                this.loadEpisodes(1)
            }
        }
    }
})

// Inicializamos la app en el contenedor especificado en el HTML
app.mount('#app')
